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
  maxAge: 1000 * 60 // 重要提示：条目在 1 秒后过期。
});

const isCacheAble = ctx => {
  // 实现逻辑为，检查请求是否是用户特定(user-specific)。
  // 只有非用户特定(non-user-specific)页面才会缓存
  console.log(ctx.url)
  if (ctx.url === '/b') {
    return true
  }
  return false
};

const router = new Router();
const templatePath = path.resolve(__dirname, '../src/index.html');
let renderer;
// 第 2步：根据环境变量生成不同BundleRenderer实例
if (process.env.NODE_ENV === 'production') {
  // 获取客户端、服务器端打包生成的json文件
  const serverBundle = require('../dist/vue-ssr-server-bundle.json');
  const clientManifest = require('../dist/vue-ssr-client-manifest.json');
  // 赋值
  renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false,
    template: fs.readFileSync(templatePath, 'utf-8'),
    clientManifest,
  });
} else {
  // 开发环境
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
      console.log('从缓存中取', hit)
      return ctx.body = hit
    }
  }

  const html = await renderer.renderToString(context)
  ctx.body = html
  if (cacheAble) {
    console.log('设置缓存: ', ctx.url)
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