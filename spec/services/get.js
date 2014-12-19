'use strict';

exports = module.exports = function(services, app) {

    var service = new services.get(app);

    /**
     * @param {Object} params
     *
     * @return {Promise}
     */
    service.call = function(params) {

        service.deferred.resolve({ name: 'TEST' });

        return service.deferred.promise;
    };


    return service;
};
