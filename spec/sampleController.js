'use strict';
var restitute = require('../src/index');


function listTestController() {
    restitute.controller.list.call(this, '/rest/listTestController');

    this.controllerAction = function() {
        this.jsonService(this.service('services/list'));
    };
}
listTestController.prototype = new restitute.controller.list();
