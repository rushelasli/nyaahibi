import { createApp } from 'vue'
import '@/style.css'
import HubApp from './HubApp.vue'
import i18n from '@/i18n'

// The hub has no router: detail pages are plain static folders served at
// /<slug>/, so the current path selects the view (see HubApp's detailPages).
// The entry HTML declares which site variant it is: main.html (the apex
// nyaahibi.web.id interface) renders the explanatory landing at the root,
// hub.html the projects landing.
const site =
  document.querySelector<HTMLMetaElement>('meta[name="site"]')?.content === 'main' ? 'main' : 'hub'

createApp(HubApp, { initialPath: window.location.pathname, site })
  .use(i18n)
  .mount('#app')
