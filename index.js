var Bing = require('node-bing-api')({accKey: "5a47106fa32643898f98f5737f8a7b25"})
var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/search/', function(req, res) {
	var searchQuery = req.query.q;
	var offsetQuery = Number(req.query.offset);
	if (isNaN(offsetQuery)) offsetQuery = 0;

	Bing.images(searchQuery, {top : offsetQuery + 5}, function(err, response, body) {
		if (err) console.log(err);
		else {
			var results = [];
			var bingResults = body.value;
			for (var i = offsetQuery; i < bingResults.length; i++) {
				results.push({imageUrl: bingResults[i].contentUrl, imageAlt: bingResults[i].name, pageUrl: bingResults[i].hostPageDisplayUrl});
			}
			res.send(results);

			var data = JSON.parse(fs.readFileSync('recentSearches.json', 'utf8'));
			var dataArr = [];
			for(var i = 0; i < data.length; i++) {
				dataArr.push(data[i]);
			}
			if (dataArr.length == 5) dataArr.shift();
			dataArr.push({"recentSearch" : searchQuery});
			fs.writeFileSync('recentSearches.json', JSON.stringify(dataArr));
		}
	});
});

app.get('/recent/', function(req, res) {
	var data = JSON.parse(fs.readFileSync('recentSearches.json', 'utf8'));
	var recentSearchArr = [];
	for (var i in data) recentSearchArr.push(data[i].recentSearch);
	res.send(recentSearchArr);
});

app.listen(3000, function(err, data) {
	if (err) console.log(err)
	else console.log("Listening on port 3000");
});