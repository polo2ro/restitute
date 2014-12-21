'use strict';

exports = module.exports = function(services, app) {

    var service = new services.delete(app);

    /**
     * @param {Object} params
     *
     * @return {Promise}
     */
    service.call = function(params) {

        service.resolveSuccess({ name: 'TEST' }, 'Deleted');

        return service.deferred.promise;
    };


    return service;
};
