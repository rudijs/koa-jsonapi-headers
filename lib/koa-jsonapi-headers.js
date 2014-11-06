'use strict';

module.exports = function koaJsonApiHeaders(options) {

  if (!options) {
    options = {};
  }

  if (!options.excludeList) {
    options.excludeList = [];
  }

  function validateJsonApiHeaders(ctx) {

    // Accept: application/vnd.api+json
    // All requests must have json-api HTTP accept header
    if (!ctx.header.accept || !/application\/vnd\.api\+json/.test(ctx.header.accept)) {
      ctx.throw(400, {
        message: {
          errors: [
            {
              code: 'invalid_request',
              title: 'API requires header "Accept application/vnd.api+json" for exchanging data.'
            }
          ]
        }
      });
    }

    // Content-type: application/vnd.api+json
    // POST PUT and PATCH must have json-api HTTP content-type header
    if (/^(POST|PUT|PATCH)$/.test(ctx.method)) {
      if (!ctx.header['content-type'] || !/application\/vnd\.api\+json/.test(ctx.header['content-type'])) {
        ctx.throw(400, {
          message: {
            errors: [
              {
                code: 'invalid_request',
                title: 'API requires header "Content-type application/vnd.api+json" for exchanging data.'
              }
            ]
          }
        });
      }
    }

  }

  return function *jsonApiHeaders(next) {

    var ctx = this;

    /*
     Check for URL query value 'jsonapiexclude=true'
     If it exists skip jsaonapi header validation for this request
     */
    var jsonApiExclude = ctx.query.jsonapiexclude || false;

    /*
     Check if this request is in the excludeList to not validate
     If match is found jsonApiExclude to true and skip jsaonapi header validation for this request
     */
    options.excludeList.forEach(function (regex) {
      var r = new RegExp(regex);
      if (r.test(ctx.url)) {
        jsonApiExclude = true;
      }
    });

    if (jsonApiExclude === false) {
      validateJsonApiHeaders(ctx);
    }

    yield next;

  };

};
