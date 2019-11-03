const Koa = require('koa');
const static = require('koa-static');
const mount = require('koa-mount');
const Router = require('koa-router');
const path = require('path');
const LRU = require('lru-cache');
const { createBundleRenderer } = require('vue-server-renderer');
const setupDevServer = require('../build/setup-dev-server');

const app = new Koa();

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler());

// 缓存
const microCache = new LRU({
  max: 100,
  maxAge: 1000 * 60 // 缓存1秒后过期。
});

const isCacheAble = ctx => {
  // 可进行缓存的逻辑
  return true;
};

const router = new Router();
const templatePath = path.resolve(__dirname, '../src/index.html');
let renderer;
if (process.env.NODE_ENV === 'production') {
  const serverBundle = require('../dist/vue-ssr-server-bundle.json');
  const clientManifest = require('../dist/vue-ssr-client-manifest.json');

  renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template: fs.readFileSync(templatePath, 'utf-8'),
    clientManifest,
  });
} else {

  setupDevServer(app, templatePath, (bundle, options) => {
      console.log('重新bundle~~~~~')
      const option = Object.assign({
        runInNewContext: false
      }, options);
      renderer = createBundleRenderer(bundle, option)
    }
  );
}

const render = async (ctx, next) => {
  ctx.set('Content-Type', 'text/html')

  const context = {
    url: ctx.url
  }

  // 判断是否可缓存，可缓存并且缓存中有则直接返回
  const cacheAble = isCacheAble(ctx)
  if (cacheAble) {
    const hit = microCache.get(ctx.url)
    if (hit) {
      return ctx.body = hit
    }
  }

  const html = await renderer.renderToString(context)
  ctx.body = html
  if (cacheAble) {
    microCache.set(ctx.url, html)
  }
}

router.get('*', render);
app.use(router.routes()).use(router.allowedMethods());

app.use(async (ctx, next) => {
  await next();
  if (!ctx.path.startsWith('/static/')) {
    ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    ctx.set('Pragma', 'no-cache');
    ctx.set('Expires', 0);
  }
});

app.use(
  mount(
    '/static/',
    static(path.join(__dirname, '../public'), {
      maxAge: 30 * 86400 * 1000
    })
  )
);

app.listen(7001);