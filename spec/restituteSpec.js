'use strict';
var http = require('http');
var url = require('url');
var restitute = require('../src/index');
var sampleController = require('./sampleController');



var app = function(req, res) {

    req.app = app;
	var path = url.parse(req.url).pathname;


    function forwardToController(controller)
    {

        if (path === controller.path) {
            // this is the matching route

            controller.onRequest(req, res).then(function() {
                req.connection.destroy();
            });

            return true;
        }

        return false;
    }


    // search matching route

    for(var method in sampleController) {

        var controller = new sampleController[method]();

        if (forwardToController(controller)) {
            return;
        }
    }


    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'No matching query' }));
    req.connection.destroy();
};


app.getService = function(path) {
    var apiservice = require('../src/service');
    var serviceLoader = require('./services/'+path);
    return serviceLoader(apiservice, app);
};


var server = http.createServer(app);
server.listen(3000);






describe('restitute', function RestituteTestSuite() {

	it('receive an array from a list controller', function (done){
		http.get('http://localhost:3000/rest/listTestController?readonly=2&modifiable=1', function(response) {
			expect(response.statusCode).toBe(200);


            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                var json = JSON.parse(chunk);
                expect(json.length).toBe(1);
                expect(json[0].name).toBe('TEST');
                expect(json.readonly).toBe('2');
            });

            response.on('end', function() {
                done();
            });
		});
	});



    it('receive an object from a get controller', function (done){
		http.get('http://localhost:3000/rest/getTestController?readonly=2&modifiable=1', function(response) {
			expect(response.statusCode).toBe(200);


            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                var json = JSON.parse(chunk);
                expect(json.name).toBe('TEST');
                expect(json.readonly).toBe('2');
            });

            response.on('end', function() {
                done();
            });
		});
	});
    


    
    
    it('receive an object from a delete controller', function (done){
		var req = http.request({
                host: 'localhost',
                port: 3000,
                path: '/rest/deleteTestController',
                method: 'DELETE' }, function(response) {
			expect(response.statusCode).toBe(200);


            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                var json = JSON.parse(chunk);
                expect(json.name).toBe('TEST');
                expect(json.readonly).toBe('2');
            });

            response.on('end', function() {
                done();
            });
		});

        req.write('{ readonly: 2, modifiable: 1 }\n');
        req.end();
	});
    
    
    

    function saveTest(method, next) {
        var req = http.request({
                host: 'localhost',
                port: 3000,
                path: '/rest/saveTestController',
                method: method }, function(response) {
			expect(response.statusCode).toBe(200);


            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                var json = JSON.parse(chunk);
                expect(json.name).toBe('TEST');
                expect(json.readonly).toBe('2');
            });

            response.on('end', next);
		});

        req.write('{ readonly: 2, modifiable: 1 }\n');
        req.end();
    }



    it('receive an object from a save controller via PUT (edit)', function (done){
		saveTest('PUT', done);
	});


    it('receive an object from a save controller via POST (create)', function (done){
		saveTest('POST', done);
	});


    it('Test server should close', function (done){
		server.close(done);
	});


});
