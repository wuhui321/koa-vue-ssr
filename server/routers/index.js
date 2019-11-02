const router = require('koa-router')();

module.exports = app => {
  router.get('/', app.controller.platform.index);

  app.use(router.routes()).use(router.allowedMethods());
};
