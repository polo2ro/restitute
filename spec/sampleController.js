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


exports = module.exports = {
    list: listTestController,
    get: getTestController
};
