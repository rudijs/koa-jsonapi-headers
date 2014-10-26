'use strict';

var should = require('chai').should(),
  request = require('supertest'),
  assert = require('chai').assert,
  koa = require('koa');

var koaJsonApiHeaders = require('../lib/koa-jsonapi-headers'),
  app;

describe('JSON API Headers Middleware', function () {

  beforeEach(function (done) {
    app = koa();
    done();
  });

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

          // Test: response is a collection of objects keyed by "errors"
          res.text.should.match(/{"errors":\[{.*}/);

          // Parse response test
          var jsonResponse = JSON.parse(res.text);

          should.exist(jsonResponse.errors);
          assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

          jsonResponse.errors[0].code.should.equal('invalid_request');
          jsonResponse.errors[0].title.should.equal('API requires header "Content-type application/vnd.api+json" for exchanging data.');

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

          // Test: response is a collection of objects keyed by "errors"
          res.text.should.match(/{"errors":\[{.*}/);

          // Parse response test
          var jsonResponse = JSON.parse(res.text);

          should.exist(jsonResponse.errors);
          assert.isArray(jsonResponse.errors, 'Top level response property should be an Array');

          jsonResponse.errors[0].code.should.equal('invalid_request');
          jsonResponse.errors[0].title.should.equal('API requires header "Accept application/vnd.api+json" for exchanging data.');

          done();
        });

    });

  });

  describe('accept', function () {

    it('valid headers', function (done) {

      app.use(koaJsonApiHeaders());

      // default route
      app.use(function *route1(next) {
        this.body = 'Corret headers found';
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
          res.text.should.equal('Corret headers found');
          done();
        });

    });

    it('should permit exclusions via URL query', function (done) {

      app.use(koaJsonApiHeaders());

      // default route
      app.use(function *route1(next) {
        this.body = 'Excluded headers request OK';
        yield next;
      });

      request(app.listen())
        .get('/?jsonapiexclude=true')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            should.not.exist(err);
            return done(err);
          }
          res.text.should.equal('Excluded headers request OK');
          done();
        });

    });

    it('should permit exclusions via regex list', function (done) {

      app.use(koaJsonApiHeaders({excludeList: [
        'resource\/path',
        'excluded\/endpoint\\?id'
      ]}));

      // default route
      app.use(function *route1(next) {
        this.body = 'Excluded headers request OK';
        yield next;
      });

      request(app.listen())
        .get('/excluded/endpoint?id=1')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            should.not.exist(err);
            return done(err);
          }
          res.text.should.equal('Excluded headers request OK');
          done();
        });

    });

  });

});
