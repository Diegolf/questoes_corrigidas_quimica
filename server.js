var express = require('express');
var nunjucks = require('nunjucks');
var fs = require('fs');
var app = express();
var path = __dirname + "/";

app.set('view engine', 'html');
nunjucks.configure((path+'views'), {
	autoescape: true,
	express: app
});

app.use(express.static(__dirname + '/public'))

app.get(['/index.html','/'], function (req, res) {
	res.render('index.html');
});

app.post('/teste', function(req, res){
	req.on('data', function(data){
		let dt = JSON.parse(String(data));
		try{
			fs.readFile(path+"public/static/data/"+dt.dados,"utf8", function(err,data){
	        	if (!err){
	        		res.end(JSON.stringify({"erro":false,"data":data}));
	        	}else{
	        		console.log('Erro na leitura do arquivo: '+path+"public/static/data/"+dt.dados);
	        		res.end(JSON.stringify({"erro":true}));
	        	}
	    	});
		}catch(e){
			res.render('index.html');
		}
	});
});

var server = app.listen(8000, "127.0.0.1", function () {

	let host = server.address().address
	let port = server.address().port

	console.log("Servidor escutando em: http://%s:%s", host, port)

});