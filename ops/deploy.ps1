# Deploys the projects hub + main site (project.nyaahibi.web.id and the
# apex nyaahibi.web.id) to the served directory on the homeserver. Run
# manually or from Task Scheduler (gates must pass before anything
# reaches the live folders).
#
# The portfolio (ulilhibi.my.id) deployed from its own repository
# (C:\srv\repos\ulilhibi, its own ops\deploy.ps1 → C:\srv\sites\hibi).
#
# Layout:
#   C:\srv\repos\hibi         git clone of this repo (public — no token needed)
#   C:\srv\repos\projects\*   git clones of live project sites (optional;
#                             an older box may name the folder `project`)
#   C:\srv\sites\projects     served hub: landing (index.html) + site folders
#
# CRITICAL ORDER: the hub landing is mirrored with /MIR (replaces the whole
# root), so it must run BEFORE the per-site folder mirrors. Those mirrors then
# reset every folder to the old live site, so the hub detail-page overlay
# (index.html onto each live site folder) must run LAST.
#
# The root /MIR excludes `dash` and every live slug folder: the first would
# be deleted (it is not in dist-hub), the others carry legacy site content
# (dsp.html, downloads, images) that /MIR would wipe. The overlay in step 5
# writes each detail page's index.html directly, so they need no mirroring.

$ErrorActionPreference = 'Stop'

$repos = 'C:\srv\repos'
$sites = 'C:\srv\sites'

Write-Host '[1/5] Updating hub repo...'
git -C "$repos\hibi" pull --ff-only
if ($LASTEXITCODE -ne 0) { throw 'git pull failed — is the working tree clean?' }

Push-Location "$repos\hibi"
try {
    Write-Host '[2/5] Building hub (landing + main site + dashboard)...'
    bun install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw 'bun install failed — aborting deploy.' }
    bun run build:hub        # vue-tsc gate + vite build --config vite.hub.config.ts
    if ($LASTEXITCODE -ne 0) { throw 'hub build failed — aborting deploy.' }

    # Live slugs — derived from hubSites (one source of truth). Needed by the
    # root mirror exclusions (step 4) and the overlay (step 5), so fail early.
    $liveOut = & bun -e "const { hubSites } = await import('./src/data/projects'); console.log(hubSites.filter((s) => s.status === 'live').map((s) => s.slug).join(' '))"
    if ($LASTEXITCODE -ne 0) { throw 'could not derive live slugs from hubSites' }
    $liveSlugs = ($liveOut -join ' ').Trim() -split '\s+'
    if (-not $liveSlugs -or -not $liveSlugs[0]) { throw 'derived live slug list is empty' }

    Write-Host '[3/5] Running SSR render gate...'
    bunx vite build --ssr test/hub.render.test.ts --outDir node_modules\.tmp\ssr-hub
    if ($LASTEXITCODE -ne 0) { throw 'hub SSR test build failed — aborting deploy.' }
    node node_modules\.tmp\ssr-hub\hub.render.test.js
    if ($LASTEXITCODE -ne 0) { throw 'hub SSR test failed — aborting deploy.' }
}
finally {
    Pop-Location
}

Write-Host '[4/5] Mirroring hub landing -> sites\projects (first — /MIR resets root)...'
# The build emits hub.html; the site is served as index.html at the root.
Copy-Item "$repos\hibi\dist-hub\hub.html" "$repos\hibi\dist-hub\index.html" -Force
Remove-Item "$repos\hibi\dist-hub\hub.html"
# dist-hub\projects ships WITH the hub — detail pages load images + GLB
# models from it (/<slug>/ pages), so it must never be stripped here.
$xdArgs = @('/XD', '.git', 'node_modules', 'dash') + $liveSlugs
robocopy "$repos\hibi\dist-hub" "$sites\projects" /MIR @xdArgs /NFL /NDL /NJH
if ($LASTEXITCODE -ge 8) { throw "robocopy (hub landing) failed ($LASTEXITCODE)" }
$global:LASTEXITCODE = 0   # robocopy 0-7 = success

# Mirror each cloned live site into the hub folder (folder name = URL path).
# Accepts both `projects` and the older `project` folder name on the box.
foreach ($projRoot in @("$repos\projects", "$repos\project")) {
    if (-not (Test-Path $projRoot)) { continue }
    Get-ChildItem $projRoot -Directory | ForEach-Object {
        Write-Host "      mirroring $($_.FullName)"
        robocopy $_.FullName "$sites\projects\$($_.Name)" /MIR /XD .git node_modules /NFL /NDL /NJH
        if ($LASTEXITCODE -ge 8) { throw "robocopy failed for $($_.Name) ($LASTEXITCODE)" }
        $global:LASTEXITCODE = 0   # robocopy 0-7 = success
    }
}

# The per-site mirrors just restored each old live site with its ORIGINAL
# index.html. Point every live slug at the hub app instead — HubApp reads
# window.location and renders the matching detail page; everything else in
# the folder (dsp.html, images, legacy pages) stays untouched (whatever the
# per-site mirror does NOT carry is in the site's git clone — keep it there).
Write-Host '[5/5] Overlaying hub detail pages onto live site folders...'
foreach ($slug in $liveSlugs) {
    $src = "$repos\hibi\dist-hub\$slug\index.html"
    $dst = "$sites\projects\$slug"
    if ((Test-Path $src) -and (Test-Path $dst)) {
        Copy-Item $src "$dst\index.html" -Force
        Write-Host "      $slug <- hub detail page"
    } else {
        Write-Warning "      $slug skipped — source index.html or target folder missing"
    }
}

# The dashboard page gets the same treatment: dist-hub/dash/index.html on
# top of the box's dash/ folder. Only index.html is replaced — the GLB
# models, profile photo, and comingsoon.html stay box-side (protected by
# the root mirror's /XD dash).
$dashSrc = "$repos\hibi\dist-hub\dash\index.html"
$dashDst = "$sites\projects\dash"
if ((Test-Path $dashSrc) -and (Test-Path $dashDst)) {
    Copy-Item $dashSrc "$dashDst\index.html" -Force
    Write-Host '      dash <- hub dashboard page'
} else {
    Write-Warning '      dash skipped — source index.html or dash folder missing'
}

Write-Host 'Deploy complete.'
