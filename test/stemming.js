var test = require("tap").test;
var fs = require("fs");
var stream = require("stream");
var stemmer = require("latin-stemming");
var split = require("split");

test("uncategorized samples",function(t){
  var samples = fs.createReadStream("samples.txt").pipe(split());
  
  samples.on('data', function (line) {
    var vals = line.split(/\s+/), word = vals[0], stem1 = vals[1], stem2 = vals[2] || stem1, results = stemmer.stem(word);
    
    t.ok(results.indexOf(stem1)>-1,"expected noun stem for "+word+" is "+stem1+", found "+JSON.stringify(results));
    t.ok(results.indexOf(stem2)>-1,"expected verb stem for "+word+" is "+stem2+", found "+JSON.stringify(results));
  });
  samples.on('end', function(){
    t.end();
  });
});