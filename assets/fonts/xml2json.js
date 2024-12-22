var fs 	   = require('fs'),
	eyes   = require('eyes'),
	xml2js = require('xml2js'),
	parser = new xml2js.Parser({ explicitRoot: false, mergeAttrs: true, explicitArray: false });

parser.on('end', function(result) {
	result.char = result.chars.char;
	delete result.chars;

	var json = JSON.stringify(result);

	fs.writeFile(__dirname + "/munro.json", json, function (err) {
    	if (err) {
        	console.log(err);
    	}
    	else {
        	console.log("The file was saved!");
    	}
    });
});

fs.readFile(__dirname + '/munro.xml', function (err, data) {
	parser.parseString(data); 
});