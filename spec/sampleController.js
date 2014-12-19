'use strict';
var restitute = require('../src/index');


function listTestController() {
    restitute.controller.list.call(this, '/rest/listTestController');

    this.controllerAction = function() {
        return this.jsonService(this.service('list'));
    };
}
listTestController.prototype = new restitute.controller.list();



exports = module.exports = {
    list: listTestController
};
