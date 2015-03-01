[![Build Status](https://travis-ci.org/polo2ro/restitute.svg?branch=master)](https://travis-ci.org/polo2ro/restitute)


restitute
=========

a nodejs controller library to create a JSON REST service



Services
========

Services should be created one file per service with this kind of folder structure :

    - service
    \_ users
    | \_ delete.js
    | \_ get.js
    | \_ list.js
    | \_ save.js
    \_ articles
      \_ delete.js
      \_ get.js
      \_ list.js
      \_ save.js

Where "users" and "articles" are services names. each file contain a class inherrited from one of the base classes


Methods
-------

Methods to use within a service

**apiService.forbidden(message)**

set httpstatus and outcome object
resolve the service promise with the outcome object

**apiService.notFound(message)**

set httpstatus and outcome object
resolve the service promise with the outcome object

**apiService.success(message)**

set httpstatus and outcome object
resolve the service promise with the outcome object

**apiService.resolveSuccess(document, message)**

resolve the service promise with the document parameter in the document property og the outcome object. 
the message will be set as a success message in the outcome object.

**apiService.handleMongoError(err)**

this method accept a mongoose error as parameter, the error message will be converted to the outcome object format

**apiService.hasErrors()**

test if the service contain errors in the outcome object


restitute.service.list
----------------------

Class used to create a service, eventually paginated
the service input will be an object of parameters, the output will be an array of objects

file content for the list service :
```javascript
    'use strict';
    exports = module.exports = function(services, app) {
        var service = new services.list(app);
        service.getResultPromise = function(params, paginate) {
            service.deferred.resolve([]);
            return service.deferred.promise;
        };
        return service;
    };
```
This service example output an empty array

service.deferred is the deferred object from the Q class, it can be resolved or rejected asynchronously after a database interogation


Other methods from the restitute.service.list object :

**listItemsService.mongOutcome**

Can be used a callback in a mongoose query, forward mongoose errors to service error, resolve the list of documents to the service promise on success

**listItemsService.resolveQuery**

Resolve a mongoose query to a paginated result into the service promise.


restitute.service.get
---------------------

Class used to create a service
the service input will be an object of parameters, the output will be an object


restitute.service.save
----------------------

Class used to create a service to create or update a database record
the service input will be an object of parameters


restitute.service.delete
------------------------

Class used to create a service to delete a database record

Exemple with the delete.js file of the "articles" service :
```javascript
    'use strict';

    exports = module.exports = function(services, app) {
        var service = new services.delete(app);

        service.getResultPromise = function(params) {
        
            getArticle(params.id, function(article) {
                article.delete();
                service.resolveSuccess(article, 'Article has been deleted');
            });
            
            return service.deferred.promise;
        };

        return service;
    };
```


Controllers
===========

controller objects must used with [express.js](http://http://expressjs.com/), [body-parser](https://github.com/expressjs/body-parser) middleware, [method-override](https://github.com/expressjs/method-override) middleware



Methods
-------

Methods to use within a controller

**restController.onRequest(req, res)**

Method called when the controller route path is fired by the app


**restController.accessDenied(message)**

Output a 401 access denied error


**restController.notFound(message)**

Output a 404 not found error


**restController.service(path, forceParams)**

Get a service object from path, the forceParams object can be used to force parameters into the service for security reasons.
2 controllers can use the same service with differents forceParams value. One controller can be restrained to a subset of the service resultset


**restController.jsonService(service)**

Output the result of a service in JSON format


restitute.controller.list
-------------------------

Base class to create a controller linked to a list service, additional forced parameters can be added to the service parameters.


restitute.controller.get
------------------------

Base class to create a controller linked to a get service


restitute.controller.create
---------------------------

Base class to create a controller linked to a save service


restitute.controller.update
---------------------------

Base class to create a controller linked to a save service

restitute.controller.delete
---------------------------

Base class to create a controller linked to a delete service


