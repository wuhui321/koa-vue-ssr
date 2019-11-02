module.exports = () => {
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.status === 404) {
        ctx.body = 'not found';
      }
    } catch (err) {
      switch (err.status) {
        //执行错误
        case 2:
          if (ctx.headers.accept.indexOf('application/json') !== -1) {
            ctx.body = {
              status: 2,
              message: err.message,
            };
          } else {
            ctx.body = '页面出错';
          }
          break;
        case 500:
          ctx.status = 200;
          ctx.body = {
            status: 500,
            error: err.error
          };
        default:
          console.log(err);
          break;
      }
    }
  };
};
