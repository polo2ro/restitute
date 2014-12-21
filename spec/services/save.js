'use strict';

exports = module.exports = function(services, app) {

    var service = new services.save(app);

    /**
     * @param {Object} params
     *
     * @return {Promise}
     */
    service.call = function(params) {

        service.resolveSuccess({ name: 'TEST' }, 'Saved');

        return service.deferred.promise;
    };


    return service;
};
