'use strict';
var restitute = require('../src/index');


// Simple controllers

function listTestController() {
    restitute.controller.list.call(this, '/rest/listTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('list'));
    };
}
listTestController.prototype = new restitute.controller.list();



function getTestController() {
    restitute.controller.get.call(this, '/rest/getTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('get'));
    };
}
getTestController.prototype = new restitute.controller.get();




function deleteTestController() {
    restitute.controller.get.call(this, '/rest/deleteTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('delete'));
    };
}
deleteTestController.prototype = new restitute.controller.get();




function saveTestController() {
    restitute.controller.get.call(this, '/rest/saveTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('save'));
    };
}
saveTestController.prototype = new restitute.controller.get();


// controllers with orverwritten parameter



function listParamTestController() {
    restitute.controller.list.call(this, '/rest/listParamTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('list'), { readonly: 1 });
    };
}
listParamTestController.prototype = new restitute.controller.list();



function getParamTestController() {
    restitute.controller.get.call(this, '/rest/getParamTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('get'), { readonly: 1 });
    };
}
getParamTestController.prototype = new restitute.controller.get();




function deleteParamTestController() {
    restitute.controller.get.call(this, '/rest/deleteParamTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('delete'), { readonly: 1 });
    };
}
deleteParamTestController.prototype = new restitute.controller.get();




function saveParamTestController() {
    restitute.controller.get.call(this, '/rest/saveParamTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('save'), { readonly: 1 });
    };
}
saveParamTestController.prototype = new restitute.controller.get();








exports = module.exports = {
    list: listTestController,
    get: getTestController,
    delete: deleteTestController,
    save: saveTestController
};
