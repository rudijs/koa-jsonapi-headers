'use strict';

var should = require('chai').should(),
  request = require('supertest'),
  koa = require('koa');

var koaJsonApiHeaders = require('../lib/koa-jsonapi-headers'),
  app;

describe('JSON API Headers Middleware', function () {

  beforeEach(function (done) {
    app = koa();
    done();
  });

  //describe('accept', function () {
  //
  //  it('should log request and response', function (done) {
  //
  //    app.use(koaJsonLogger());
  //
  //    // default route for test
  //    app.use(function *route1(next) {
  //      this.body = 'Test Response is OK.';
  //      yield next;
  //    });
  //
  //    request(app.listen())
  //      .get('/')
  //      .expect(200)
  //      .end(function (err, res) {
  //        if (err) {
  //          should.not.exist(err);
  //          return done(err);
  //        }
  //
  //        // test http response
  //        res.text.should.equal('Test Response is OK.');
  //
  //        // read in log file entry
  //        fs.readFile('log/app.log', function (err, data) {
  //          if (err) {
  //            throw err;
  //          }
  //
  //          // test JSON parsed log entry
  //          var logEntry = JSON.parse(data.toString());
  //
  //          // bunyan property logging
  //          logEntry.name.should.equal('app');
  //          should.exist(logEntry.uid);
  //          logEntry.uid.should.match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
  //
  //          // request logging
  //          logEntry.req.method.should.equal('GET');
  //          logEntry.req.url.should.equal('/');
  //          should.exist(logEntry.req.headers);
  //
  //          // response logging
  //          logEntry.res.statusCode.should.equal(200);
  //          should.exist(logEntry.res.responseTime);
  //          logEntry.res.headers['x-powered-by'].should.equal('koa');
  //
  //          done();
  //        });
  //
  //      });
  //
  //  });
  //
  //});

  describe('reject', function () {

    it('missing Content-type header', function (done) {

      app.use(function *catchJsonApiErrors(next) {
        try {
          yield next;
        }
        catch (err) {

          // Response properties
          this.status = err.status || 500;
          this.body = err.message;
        }
      });

      app.use(koaJsonApiHeaders());

      // default route
      app.use(function *route1(next) {
        yield next;
      });

      request(app.listen())
        .get('/')
        .expect(400)
        .end(function (err, res) {
          if (err) {
            should.not.exist(err);
            return done(err);
          }
          res.text.should.equal('{"status":400,"title":"Bad Request","detail":"API requires header \\"Content-type application/vnd.api+json\\" for exchanging data."}');
          done();
        });

    });

    it('missing Accept header', function (done) {

      app.use(function *catchJsonApiErrors(next) {
        try {
          yield next;
        }
        catch (err) {

          // Response properties
          this.status = err.status || 500;
          this.body = err.message;
        }
      });

      app.use(koaJsonApiHeaders());

      // default route
      app.use(function *route1(next) {
        yield next;
      });

      request(app.listen())
        .get('/')
        .set('Content-type', 'application/vnd.api+json')
        .expect(400)
        .end(function (err, res) {
          if (err) {
            should.not.exist(err);
            return done(err);
          }
          res.text.should.equal('{"status":400,"title":"Bad Request","detail":"API requires header \\"Accept application/vnd.api+json\\" for exchanging data."}');
          done();
        });

    });

  });

  describe('accept', function () {

    it('valid headers', function (done) {

      app.use(koaJsonApiHeaders());

      // default route
      app.use(function *route1(next) {
        this.body = 'Corrent headers found';
        yield next;
      });

      request(app.listen())
        .get('/')
        .set('Content-type', 'application/vnd.api+json')
        .set('Accept', 'application/vnd.api+json')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            should.not.exist(err);
            return done(err);
          }
          res.text.should.equal('Corrent headers found');
          done();
        });

    });

  });

});
