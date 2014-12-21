'use strict';
var restitute = require('../src/index');


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



exports = module.exports = {
    list: listTestController,
    get: getTestController,
    delete: deleteTestController,
    save: saveTestController
};
