[![Build Status](https://travis-ci.org/polo2ro/restitute.svg?branch=master)](https://travis-ci.org/polo2ro/restitute)


restitute
=========

a nodejs controller libraray to create a JSON REST service



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


restitute.service.list
----------------------

Class used to create a service, eventually paginated
the service input will be an object of parameters, the output will be an array of objects

file content for the list service :

    'use strict';
    exports = module.exports = function(services, app) {
        var service = new services.list(app);
        service.getResultPromise = function(params, paginate) {
            service.deferred.resolve([]);
            return service.deferred.promise;
        };
        return service;
    };

service.deferred is the deferred object from the Q class, it can be resolved or rejected asynchronously after a database interogation


Other methods from the restitute.service.list object :

**mongOutcome**

Can be used a callback in a mongoose query, forward mongoose errors to service error, resolve the list of documents to the service promise on success

**resolveQuery**

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



Controllers
===========

Controllers classes :

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


Using with express
==================

