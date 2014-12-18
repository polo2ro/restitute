'use strict';

exports = module.exports = function(services, app) {

    var service = new services.list(app);

    /**
     * @param {Object} params
     * @param {function} [paginate]  Optional parameter to paginate the results
     *
     * @return {Promise}
     */
    service.call = function(params, paginate) {

        service.deferred.resolve([]);

        return service.deferred.promise;
    };


    return service;
};




