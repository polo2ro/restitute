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





    function retrieveTest(path, next)
    {
        http.get('http://localhost:3000'+path+'?readonly=2&modifiable=1', function(response) {
			expect(response.statusCode).toBe(200);

            var output = '';

            response.setEncoding('utf8');
            response.on('data', function (chunk) {

                output += chunk;


            });

            response.on('end', function() {

                var json = JSON.parse(output);
                next(json);
            });
		});
    }

    

    function submitTest(method, path, expectedReadonlyParam, next)
    {

        var input = JSON.stringify({ readonly: '2', modifiable: '1' });
        var output = '';


        var req = http.request({
                host: 'localhost',
                port: 3000,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': input.length
                }}, function(response) {
			expect(response.statusCode).toBe(200);


            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                output += chunk;

            });

            response.on('end', function() {

                var json = JSON.parse(output);
                expect(json.name).toBe('TEST');
                expect(json.readonly).toBe(expectedReadonlyParam);

                next();
            });
		});

        req.write(input);
        req.end();
    }


    it('receive an array from a list controller', function (done){
        retrieveTest('/rest/listTestController', function(result) {
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('TEST');
            expect(result[0].readonly).toBe('2');
            done();
        });
	});


    // test with request parameters forwared to the service


    it('receive an object from a get controller', function (done){
        retrieveTest('/rest/getTestController', function(result) {
            expect(result.name).toBe('TEST');
            expect(result.readonly).toBe('2');
            done();
        });
	});


    it('receive an object from a delete controller', function (done){
        submitTest('DELETE', '/rest/deleteTestController', '2', done);
    });


    it('receive an object from a save controller via PUT (edit)', function (done){
		submitTest('PUT', '/rest/saveTestController', '2', done);
	});


    it('receive an object from a save controller via POST (create)', function (done){
		submitTest('POST', '/rest/saveTestController', '2', done);
	});


    // test with parameter overloaded by the controller


    it('receive an array from a list controller', function (done){
        retrieveTest('/rest/listParamTestController', function(result) {
            expect(result.length).toBe(1)
            && expect(result[0].name).toBe('TEST')
            && expect(result[0].readonly).toBe(1);
            done();
        });
	});



    it('receive an object from a get controller', function (done){
        retrieveTest('/rest/getParamTestController', function(result) {
            expect(result.name).toBe('TEST');
            expect(result.readonly).toBe(1);
            done();
        });
	});


    it('receive an object from a delete controller', function (done){
        submitTest('DELETE', '/rest/deleteParamTestController', 1, done);
    });


    it('receive an object from a save controller via PUT (edit)', function (done){
		submitTest('PUT', '/rest/saveParamTestController', 1, done);
	});


    it('receive an object from a save controller via POST (create)', function (done){
		submitTest('POST', '/rest/saveParamTestController', 1, done);
	});



    it('Test server should close', function (done){
		server.close(done);
	});


});
