'use strict';
var http = require('http');
var url = require('url');
var restitute = require('../src/index');
var sampleController = require('./sampleController');




var server = http.createServer(function(req, res) {

	var path = url.parse(req.url).pathname;

    // search matching route

    for(var method in sampleController) {

        var controller = sampleController[method]();
        if (path === controller.path) {
            // this is the matching route

            controller.onRequest(req, res);
        }
    }

	req.connection.destroy();
});
server.listen(3000);






describe('restitute', function RestituteTestSuite() {

	it('receive an array from a list controller', function (done){
		http.get('http://localhost:3000/rest/listTestController', function(response) {
			expect(response.statusCode).toBe(200);
			done();
		});
	});


    it('Test server should close', function (done){
		server.close(done);
	});


});
