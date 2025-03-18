
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 493, hash: 'abb0ef14ac138ba2b1caccd47714a5b74d51e6e818d90d838a818491dae51cee', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1006, hash: '64bca7fa6becef02bbd04da1d9515e84aa9fdaa7434bed6bac311d764c8ed242', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 2297, hash: 'a5b218752d0dfcb80bc9d1fb2f05e3f8351613b968cc3fcde0bff16db60b1ce1', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
