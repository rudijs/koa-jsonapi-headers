koa-jsonapi-headers
===================

KoaJS Validate JSON-API Request Headers Middleware

[![Build Status](https://travis-ci.org/rudijs/koa-jsonapi-headers.svg?branch=master)](https://travis-ci.org/rudijs/koa-jsonapi-headers)  
[![Coverage Status](https://coveralls.io/repos/rudijs/koa-jsonapi-headers/badge.png?branch=master)](https://coveralls.io/r/rudijs/koa-jsonapi-headers?branch=master)  
[![NPM version](https://badge.fury.io/js/koa-jsonapi-headers.svg)](http://badge.fury.io/js/koa-jsonapi-headers)  

## Overview

KoaJS middleware to validate required HTTP request headers for [JSON API](http://jsonapi.org/format/) spec.

This middleware will validate *all* requests have this header set:

    Accept: application/vnd.api+json

This middleware will validate POST, PUT and PATCH requests have this header set:

    Content-type: application/vnd.api+json

Validation failure will return HTTP `400 Bad Request` with the response text of a collection of objects keyed by "errors" (pretty printed here):

    {
      "errors": [
        {
          "code": "invalid_request",
          "title": "API requires header \"Content-type application/vnd.api+json\" for exchanging data."
        }
      ]
    }

Code review, suggestions and pull requests very much welcome - thanks!

## Install

`npm install koa-jsonapi-headers`

## Usage

This middleware will throw a nested object in the application error like so:

      this.throw(400, {
        message: {
          errors: [
            {
              code: 'invalid_request',
              title: 'API requires header "Content-type application/vnd.api+json" for exchanging data.'
            }
          ]
        }
      });

It's designed this way so that the application logging will log the entire JSON response and then rethrow the JSON error message.

Therefore you need to use some application logging like [koa-json-logger](https://github.com/rudijs/koa-json-logger) or catch and rethrow the error yourself.

Here's an example using koa-json-logger:

	var koaJsonLogger = require('koa-json-logger');
	var koaJsonApiHeaders = require('koa-jsonapi-headers')

	app.use(koaJsonLogger({jsonapi: true}));
	app.use(koaJsonApiHeaders());

Here's an example of manual catch and re-throw:

    var koaJsonApiHeaders = require('koa-jsonapi-headers')

	app.use(function *catchJsonApiErrors(next) {
	try {
	  yield next;
	}
	catch (err) {

	  // Response properties
	  this.status = err.status || 500;
	  this.body = err.message;
	}
	this.response.type = 'application/vnd.api+json';
	});

    app.use(koaJsonApiHeaders());

*Exclude List*

If you have an API endpoint that you do not want to enforce JSON API headers you can exclude it from the header validations.

There are two methods for excluding:

- Add jsonapiexclude=true to the URL query string.

Example: http://localhost:3000/signin/google?jsonapiexclude=true

If the URL query string key 'jsonapiexclude' exists (any value) the JSON API headers validation will be skipped.

- Pass in an exclude list of URL regular expression patterns when you use `app.use()'

Example:

    app.use(koaJsonApiHeaders({excludeList: [
        'signin\/google',
        'auth\/google\\?code'
    ]}));

*Note:

- No start or end '/'
- The escaping of the '/' and the double escaping of the '?' as these are regular expression characters.

## Tests with code coverage report in `test/coverage`

Note: Requires nodes at least v0.11.13 (earlier v0.11 versions may work, have not checked for this).

git clone the full repo: `git clone git@github.com:rudijs/koa-jsonapi-headers.git`

`cd koa-jsonapi-headers`

`npm install`

`npm test`

## Code Linting

`./node_modules/jshint/bin/jshint lib/*.js`

`./node_modules/jshint/bin/jshint test/*.spec.js`
