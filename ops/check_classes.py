#!/usr/bin/env python3
"""Class-ecosystem check: every Tailwind-looking class token used in .vue
files (and in the locale HTML strings) must exist in the built CSS.

Local gate — run after `bun run build:hub`:
    python3 ops/check_classes.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
css_files = sorted((ROOT / 'dist-hub/assets').glob('*.css'))
if not css_files:
    print('no built CSS found in dist-hub/assets — run `bun run build:hub` first')
    sys.exit(2)
CSS = ''.join(p.read_text(encoding='utf-8') for p in css_files)

# All quoted strings in .vue sources + locale JSON, split into tokens.
candidates = set()
STRING_RE = re.compile(r'"([^"]*)"|\'([^\']*)\'')
for path in list(ROOT.glob('src/**/*.vue')) + list(ROOT.glob('src/locales/*.json')):
    text = path.read_text(encoding='utf-8')
    for m in STRING_RE.finditer(text):
        s = m.group(1) if m.group(1) is not None else m.group(2)
        for tok in s.split():
            candidates.add(tok)

# Tailwind-ish shape: optional variants (dark:, hover:, md:...), core name,
# optional arbitrary value / opacity suffix.
SHAPE = re.compile(
    r'^(?:[a-z][a-z0-9]*:)+[a-z][a-zA-Z0-9\-]*$'          # variant:utility
    r'|^[a-z][a-zA-Z0-9\-]*(?:[\[/][^\s"\']*)?$'           # utility (+ suffix)
    r'|^[a-z][a-zA-Z0-9\-]*/\d+$'                          # utility/opacity
)

# Prose / JS identifiers that appear inside quoted strings but aren't classes.
ALLOW = {
    'amp-family', 'asal-asalan', 'benar-benar', 'browser-based',
    'class-variance-authority',
    'di-hosting', 'di-upgrade', 'end-game', 'first-gen', 'first-generation',
    'full-SMD', 'hands-on', 'hand-made', 'high-', 'high-performance', 'high-voltage',
    'hybrid-architecture', 'language-dependent',
    'low-impedance', 'low-voltage', 'masing-masing', 'on-prem', 'op-amp',
    'power-efficient', 'projectLinks[id]', 'real-time', 'resistor-ladder',
    'sehari-hari', 'self-hosted', 'sideClasses[side],', 'single-ended',
    'skillIcons[skill.id]', 'step-up', 'string[]', 'string[])', 'tiba-tiba',
    'update:open', 'vue-i18n',
    'vue-router',
    # Intl locale identifiers (DashboardPage server clock)
    'en-GB', 'en-US', 'id-ID',
    # Main-landing section ids (HTML ids, not classes)
    'main-hero', 'main-about', 'main-gateways', 'main-featured',
}

def in_css(tok: str) -> bool:
    # In CSS selectors, special characters are backslash-escaped:
    # md:flex -> .md\:flex, bg-foreground/5 -> .bg-foreground\/5
    selector_form = re.sub(r'([:./#\[\](),%])', r'\\\1', tok)
    return re.search(re.escape(selector_form), CSS) is not None

missing = []
checked = 0
for tok in sorted(candidates):
    if tok in ALLOW:
        continue
    if not SHAPE.match(tok):
        continue
    # Only check tokens that are plausibly utility classes (have a dash, a
    # variant prefix, or are known plain-word utilities).
    if ':' not in tok and '-' not in tok and '/' not in tok and '[' not in tok:
        if tok not in {
            'flex', 'grid', 'hidden', 'block', 'inline', 'inline-flex', 'absolute',
            'relative', 'fixed', 'sticky', 'rounded', 'underline', 'uppercase',
            'transition', 'transition-colors', 'antialiased', 'blur', 'backdrop',
            'grow', 'shrink', 'truncate', 'group', 'hover', 'dark',
        }:
            continue
    checked += 1
    if not in_css(tok):
        missing.append(tok)

print(f'checked {checked} class tokens against built CSS')
if missing:
    print(f'\nMISSING ({len(missing)}):')
    for t in missing:
        print('  ', t)
    sys.exit(1)
print('all used classes present in built CSS')
