const Koa = require("koa");
// const favicon = require("koa-favicon");
const static = require("koa-static");
const mount = require("koa-mount");
// const koaBody = require("koa-body");
const path = require("path");
const router = require('./routers');

const app = new Koa();

router(app);

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

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler());

app.listen(7001);