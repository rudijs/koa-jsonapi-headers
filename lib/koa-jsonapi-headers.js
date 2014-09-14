'use strict';

module.exports = function koaJsonApiHeaders() {

  return function *jsonApiHeaders(next) {

    /*
     Check for URL query value 'jsonapiexclude=true'
     If it exists skip jsaonapi header validation
     */
    var jsonApiExclude = this.query.jsonapiexclude || false;

    if (jsonApiExclude === false) {

      // Content-type: application/vnd.api+json
      if (!this.header['content-type'] || !/application\/vnd\.api\+json/.test(this.header['content-type'])) {
        this.throw(400, {
          message: {
            status: 400,
            title: 'Bad Request',
            detail: 'API requires header "Content-type application/vnd.api+json" for exchanging data.'
          }
        });
      }

      // Accept: application/vnd.api+json
      if (!this.header.accept || !/application\/vnd\.api\+json/.test(this.header.accept)) {
        this.throw(400, {
          message: {
            status: 400,
            title: 'Bad Request',
            detail: 'API requires header "Accept application/vnd.api+json" for exchanging data.'
          }
        });
      }

    }

    yield next;

  };

};
