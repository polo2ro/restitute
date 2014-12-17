'use strict';


/**
 * Base class for a controller
 *
 * @constructor
 *
 * @param {string} method         HTTP request method
 * @param {string} path           route path
 */
function restController(method, path) {
    this.method = method;
    this.path = path;
    this.controllerAction = null;

    /**
     * Parameters given to service (cannot be overloaded with query params)
     */
    this.forcedParameters = {};

    var ctrl = this;


    /**
     * Method called when the controller route path is fired by the app
     * the controllerAction() method will be called at the end
     * to process the controller specific action
     *
     * @param {Request} req
     * @param {Response} res
     */
    this.onRequest = function(req, res) {
        ctrl.req = req;
        ctrl.res = res;

        var workflow = require('./workflow');
        ctrl.workflow = workflow(req, res);



        if (typeof req.app.checkPathOnRequest == 'function') {

            /**
             * If the method exists on application use it to verify the path validity
             * this method can use ctrl.accessDenied to output an error message in outcome
             * and the return false to cancel the controller defaut action
             */
            if (!req.app.checkPathOnRequest(ctrl)) {
                return;
            }
        }


        /**
         * Declare a new method to get the service object
         * @param {string} path          relative path from the services folder
         * @param {object} forceParams   Parameters given to service (cannot be overloaded with query params)
         * @return {apiService}
         */
        ctrl.service = function(path, forceParams) {
            var srv = require('./service').load(ctrl.req.app, path);

            ctrl.forcedParameters = forceParams;

            return srv;
        };

        ctrl.controllerAction();
    };



    /**
     * Return on object with parameters to give to the service
     * this method merge the client parameters and the forced server parameters
     *
     * @param {object} queryParams client input
     *
     * @return {object}
     */
    this.getServiceParameters = function(queryParams) {
        var params = queryParams;

        for(var name in this.forcedParameters) {
            if (queryParams.hasOwnProperty(name)) {
                params[name] = this.forcedParameters[name];
            }
        }

        return params;
    };


    /**
     * Output a 401 http code
     * Emit wokflow exception with message
     * @param {String} message
     *
     */
    this.accessDenied = function(message) {
         ctrl.workflow.httpstatus = 401;
         ctrl.workflow.emit('exception', message);
    };

    /**
     * Output a 404 http code
     * Emit wokflow exception with message
     * @param {String} message
     *
     */
    this.notFound = function(message) {
         ctrl.workflow.httpstatus = 404;
         ctrl.workflow.emit('exception', message);
    };

    /**
     * Add the controller route the app
     * @param {Object} app
     */
    this.addRoute = function(app) {
        app[ctrl.method](ctrl.path, ctrl.onRequest);
    };

    /**
     * Controller use this method to output a service as a rest
     * service
     *
     * @param {apiService} service
     */
    this.jsonService = function(service) {
        throw new Error('not implemented');
    };
}


/**
 * GET request with optional parameters as filters
 * output json with the requested items
 *
 * @param {String} path
 */
function listItemsController(path) {
    restController.call(this, 'get', path);

    var ctrl = this;

    /**
     * Method to paginate a mongoose query
     * @param {Integer} total
     * @param {Query} query
     * @param {Integer} [itemsPerPage=50]
     *
     * @return {Query}
     */
    this.paginate = function(total, query, itemsPerPage) {


        var paginate = require('node-paginate-anything');
        var p = paginate(ctrl.req, ctrl.res, total, itemsPerPage || 50);

        if (!p) {
            return query;
        }

        query.limit(p.limit);
        query.skip(p.skip);

        return query;
    };


    /**
     * Controller use this method to output a service as a rest
     * service
     *
     * This default method is paginated
     *
     * @param {apiService} service
     */
    this.jsonService = function(service) {

        var params = ctrl.getServiceParameters(ctrl.req.query);

        service.call(params, ctrl.paginate).then(function(docs) {
            ctrl.res.status(service.httpstatus).json(docs);

        }).catch(function(err) {
            ctrl.res.status(service.httpstatus).json({ $outcome: service.outcome });
        });
    };
}

listItemsController.prototype = new restController();


/**
 * GET request with an id
 * output json with item data
 *
 * @param {String} path
 */
function getItemController(path) {
    restController.call(this, 'get', path);
    var ctrl = this;

    /**
     * Controller use this method to output a service as a rest
     * service
     * Output the document with the $outcome property
     *
     * @param {apiService} service
     */
    this.jsonService = function(service) {

        var params = ctrl.getServiceParameters(ctrl.req.params);

        service.call(params).then(function(document) {
            ctrl.res.status(service.httpstatus).json(document);

        }).catch(function(err) {
            ctrl.res.status(service.httpstatus).json({ $outcome: service.outcome });
        });
    };
}

getItemController.prototype = new restController();


/**
 * Base class for create or update an item
 *
 * @param {string} method   post|put
 * @param {string} path
 *
 *
 */
function saveItemController(method, path) {
    restController.call(this, method, path);
    var ctrl = this;

    /**
     * Controller use this method to output a service as a rest
     * service
     * Output the saved document with the $outcome property
     *
     * @param {apiService} service
     * @param {object} [moreparams] optional additional parameters to give to the service
     */
    this.jsonService = function(service, moreparams) {

        var params = ctrl.getServiceParameters(ctrl.req.body);


        // for ID in parameters if given by route
        if (ctrl.req.params.id) {
            params.id = ctrl.req.params.id;
        }

        if (moreparams) {
            params = require('connect.utils').merge(params, moreparams);
        }

        service.call(params).then(function(document) {
            ctrl.res.status(service.httpstatus).json(document);

        }).catch(function(err) {
            ctrl.res.status(service.httpstatus).json({ $outcome: service.outcome });
        });
    };
}

saveItemController.prototype = new restController();


/**
 * POST request
 * input json of the object to save
 * output json with the saved item data and outcome informations
 *
 * @param {String} path
 */
function createItemController(path) {
    saveItemController.call(this, 'post', path);
}

createItemController.prototype = new saveItemController();


/**
 * PUT request with an id
 * input json of the object to save
 * output json with the saved item data and outcome informations
 *
 * @param {String} path
 */
function updateItemController(path) {
    saveItemController.call(this, 'put', path);
}

updateItemController.prototype = new saveItemController();


/**
 * DELETE request with an id
 * output json with the deleted item data and outcome informations
 *
 * @param {String} path
 */
function deleteItemController(path) {
    restController.call(this, 'delete', path);
    var ctrl = this;

    /**
     * Controller use this method to output a service as a rest
     * service
     * Output the deleted document with the $outcome property
     *
     * @param {apiService} service
     */
    this.jsonService = function(service) {

        var params = ctrl.getServiceParameters(ctrl.req.params);

        service.call(params).then(function(document) {
            ctrl.res.status(service.httpstatus).json(document);

        }).catch(function(err) {
            ctrl.res.status(service.httpstatus).json({ $outcome: service.outcome });
        });
    };
}

deleteItemController.prototype = new restController();



exports = module.exports = {
    list: listItemsController,
    get: getItemController,
    create: createItemController,
    update: updateItemController,
    delete: deleteItemController
};
