

/**
 * Service base class
 * Return output usable in a REST service but also usable via js API
 *
 * @constructor
 *
 */
function apiService() {

    'use strict';

    var service = this;

    /**
     * HTTP status for service
     * will be used only by REST service
     */
    this.httpstatus = 200;


    /**
     * Service outcome
     * contain success boolean
     * a list of alert messages
     * errfor: errors associated to fields
     */
    this.outcome = {
        success: true,
        alert: [],
        errfor: {}
    };

    this.Q = require('q');

    /**
     * Defered service result
     */
    this.deferred = this.Q.defer();

    /**
     * Services instances must implement
     * this method to resolve or reject the service promise
     *
     * @param {Object} params
     *
     * @return {Promise}
     */
    this.getResultPromise = function(params) {
        console.log('Not implemented');

        return this.deferred.promise;
    }

    /**
     * Set application
     * @param {Object} app
     */
    this.setApp = function(app) {
        service.app = app;
    }

    /**
     * The server understood the request, but is refusing to fulfill it.
     * Authorization will not help and the request SHOULD NOT be repeated.
     * If the request method was not HEAD and the server wishes to make public
     * why the request has not been fulfilled, it SHOULD describe the reason for
     * the refusal in the entity. If the server does not wish to make this
     * information available to the client, the status code 404 (Not Found)
     * can be used instead.
     * @param {[[Type]]} message [[Description]]
     */
    this.forbidden = function(message) {
        service.httpstatus = 403;
        service.outcome.success = false;
        service.outcome.alert.push({ type:'danger' , message: message});

        service.deferred.reject(new Error(message));
    }


    /**
     * Ouput a 404 error
     * with an outcome message
     *
     * @param {String} message
     */
    this.notFound = function(message) {
         service.httpstatus = 404;
         service.outcome.success = false;

         if (typeof message === "object" && message.message) {
             message = message.message;
         }

         service.outcome.alert.push({ type:'danger' , message: message});

         service.deferred.reject(new Error(message));
    };

    /**
     * Set a success message into outcome
     * @param {String} message
     */
    this.success = function(message) {
        service.outcome.alert.push({
            type: 'success',
            message: message
        });
    }


    /**
     * output document and $outcome with a sucess message
     *
     * @param {Document} document           Mongoose document
     * @param {String} message              message for outcome
     */
    this.resolveSuccess = function(document, message) {

        service.outcome.success = true;
        service.success(message);

        var output;
        if (document.toObject) {
            output = document.toObject();
        } else {
            output = document;
        }
        output.$outcome = service.outcome;

        service.deferred.resolve(output);
    }





    /**
     * emit exception if parameter contain a mongoose error
     *
     * @param {Error|null} err - a mongoose error or no error
     *
     * @return {Boolean}
     */
    this.handleMongoError = function(err) {
        if (err) {

            console.trace(err);

            service.httpstatus = 400; // Bad Request

            if (err.errors) {
              for(var field in err.errors) {
                  var e = err.errors[field];
                  service.outcome.errfor[field] = e.type;
                  service.outcome.alert.push({ type:'danger' ,message: e.message});
              }
            }

            service.outcome.alert.push({ type:'danger' ,message: err.message});
            service.outcome.success = false;

            service.deferred.reject(new Error(err.message));
            return false;
        }

        return true;
    };



    /**
     * @return {Boolean}
     */
    this.hasErrors = function() {

        if (Object.keys(service.outcome.errfor).length !== 0) {
            return true;
        }

        for(var i=0; i<service.outcome.alert.length; i++) {
            if (service.outcome.alert[i].type === 'danger') {
                return true;
            }
        }

        return false;
    };


};


/**
 * Service to get a list of items
 * output a resultset
 *
 */
function listItemsService(app) {
    apiService.call(this);
    this.setApp(app);


    var service = this;


    this.getQueryResult = function(find, cols, sortkey, paginate) {

    };


    /**
     * Default function used to resolve a result set
     *
     * @param {Error} err  mongoose error
     * @param {Array} docs an array of mongoose documents or an array of objects
     */
    this.mongOutcome = function(err, docs) {
        if (service.handleMongoError(err))
        {
            service.outcome.success = true;
            service.deferred.resolve(docs);
        }
    };


    /**
     * Resolve a mongoose query, paginated or not
     * @param query find
     * @param string cols
     * @param string sortkey
     * @param function [paginate] (controller optional function to paginate result)
     * @param function [mongOutcome] optional function to customise resultset before resolving
     */
    this.resolveQuery = function(find, cols, sortkey, paginate, mongOutcome) {

        if (!mongOutcome) {
            mongOutcome = this.mongOutcome;
        }


        var q = find.select(cols).sort(sortkey);
        q.exec(function(err, docs) {
            if (!err && typeof paginate === 'function') {
                return paginate(docs.length, q).exec(mongOutcome);
            }

            return mongOutcome(err, docs);
        });
    }
}

listItemsService.prototype = new apiService();




/**
 * Service to get one item
 * output one object
 * @constructor
 *
 * @param {Object} app
 */
function getItemService(app) {
    apiService.call(this);
    this.setApp(app);
}

getItemService.prototype = new apiService();





/**
 * Service to create or update one item
 * output the saved object
 * @constructor
 *
 * @param {Object} app
 */
function saveItemService(app) {
    apiService.call(this);
    this.setApp(app);

    var service = this;

    /**
     * Test required fields in params
     * complete outcome and http status if a fields is empty
     *
     * @param {Object} params - parameters to save
     * @param {Array} list - list of fields to test
     *
     * @return {bool}
     */
    service.needRequiredFields = function(params, list) {

        for(var i=0; i<list.length; i++)
        {
            if (!params[list[i]]) {
                service.outcome.errfor[list[i]] = 'required';
                service.httpstatus = 400; // Bad Request
                service.outcome.success = false;
            }
        }

        if (service.hasErrors()) {
            service.deferred.reject(new Error('Missing mandatory fields'));
            return true;
        }

        return false;
    };
}

saveItemService.prototype = new apiService();


/**
 * Service to delete one item
 * output the deleted object
 * @constructor
 *
 * @param {Object} app
 */
function deleteItemService(app) {
    apiService.call(this);
    this.setApp(app);
}

deleteItemService.prototype = new apiService();




/**
 * Load a service object
 * @param {express|Object} app      Express app or headless app
 * @param {String} path
 *
 * @return {apiService}
 */
function loader(app, path) {
    return app.getService(path);
}




exports = module.exports = {
    list: listItemsService,
    get: getItemService,
    save: saveItemService,
    delete: deleteItemService,
    load: loader
};
