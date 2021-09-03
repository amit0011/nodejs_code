const fs = require('fs');
const path = require('path');
const _ = require('lodash');

module.exports = function(router) {

  if (process.env.NODE_ENV != 'test') {
    // router.use(function(req,res,next) {
    //     if(req.method === 'GET')
    //       res.cookie('XSRF-TOKEN', req.csrfToken(), { expires: new Date(Date.now() + 900000) } );
    //     next();
    // });
  }

  router.use((req, res, next) => {
    if (req.body) {
      req.body = _.omit(req.body, ['createdAt', 'updatedAt']);
    }
    next();
  });

  // Bootstrap controllers
  fs.readdirSync(path.normalize(__dirname + '/../') + '/app/controller').forEach(function(file) {
    if (~file.indexOf('.js'))
      require(path.normalize(__dirname + '/../') + '/app/controller/' + file).controller(router);
  });

  router.use(function(err, req, res, next) {
    // treat as 404
    if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);
    res.status(500).send({
      error: err.stack
    });

  });
  // assume 404 since no middleware responded
  router.use(function(req, res) {
    res.status(404).send({
      url: req.originalUrl,
      error: 'Not found',
      userMessage: 'Not found'
    });
  });

};
