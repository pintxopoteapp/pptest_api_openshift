// http://mongoosejs.com/docs/index.html

// connection
var GeoJSON = require('mongoose-geojson-schema');
var mongoose = require('mongoose');
var user = process.env.USER;
var password = process.env.PASSWORD;

// express
var express = require('express');
var app = express();

// database connection
// Mongolabs eguneratu egin dute 3.0 bertsiora eta ScramSHA1 encriptazio sistema erabiltzen dute...Konexioan aipatu egin behar da:
// https://github.com/controlacceso/control_acceso/issues/314
// mongoose.connect('mongodb://admin:admin@ds021701.mlab.com:21701/pintxopote', function(err){
//     if(err){
//         console.log(err);
//         console.log('esta mierda no v');
//     }else{
//         console.log('Connected to database.')
//     }
// });
mongoose.connect('mongodb://admin:admin@ds021701.mlab.com:21701/pintxopote');
//mongoose.connect('mongodb://'+user+':'+password+'@ds033400.mongolab.com:33400/zmwebdev-test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	console.log('Database connection OK!');
});

// schema
var barSchema = mongoose.Schema({
  "geometry": {
    "type": String,
    "coordinates": []
  },
  "properties": {
    "name": String,
    "street":String
     }
},{ collection : 'bars' });

var schema = new mongoose.Schema({
    any: mongoose.Schema.Types.GeoJSON,
    point: mongoose.Schema.Types.Point,
  multipoint: mongoose.Schema.Types.MultiPoint,
  linestring: mongoose.Schema.Types.LineString,
  multilinestring: mongoose.Schema.Types.MultiLineString,
  polygon: mongoose.Schema.Types.Polygon,
  multipolygon: mongoose.Schema.Types.MultiPolygon,
  geometry: mongoose.Schema.Types.Geometry,
  geometrycollection: mongoose.Schema.Types.GeometryCollection,
  feature: mongoose.Schema.Types.Feature,
  featurecollection: mongoose.Schema.Types.FeatureCollection
},{ collection : 'bars' });
//************************** Schema for searching point in a range*****************
var mongooseschema = new mongoose.Schema({
  point: {
    coordinates:[Number,Number]
  }},{ collection : 'bars' });
    //******   add a index to search in a sphere
mongooseschema.index({ point: '2dsphere' });
// "point": {
//         "coordinates": [
//             12.123456,
//             13.134578
//         ],
//         "type": "Point"
//     },
// object created with a schema
var A = mongoose.model('A', mongooseschema);
//*********************** END of Schema for searching point in a range*****************

// model
var Bar = mongoose.model('bar', barSchema);
var GeoBar=db.model('GeoJSON',schema);


// remove all bars
// http://mongoosejs.com/docs/api.html#query_Query-remove
app.get('/bar/removeall', function(req, res){
  // remove all documents
  Bar.remove({}, function (err, numberAffected) {
    if (err) {
      res.send('Error');
    } else {
      // removed!
      res.send(numberAffected + ' bars removed!');
    }
  });

});

//funciona
// remove one kitten
app.get('/bars/remove/:name', function(req, res){
  // remove all documents
  Bar.remove({name: req.params.name}, function (err) {
    if (err) {
      res.send('Error');
    } else {
      // removed!
      res.send(req.params.name + ' removed!');
    }
  });

});

// save: add documment
// http://mongoosejs.com/docs/api.html#model_Model-save
app.get('/bars/add/:name', function(req, res){
  var kitten = new Bar({ name: req.params.name });
  console.log(kitten.name); // 'Silence'

  kitten.save(function (err, kittenadded, numberAffected) {
    if (err) {
      console.error(err);
      res.send('Error');
    } else {
      console.log('bars created:');
      console.log(kittenadded);
      res.json(kittenadded);
    }
  });

});

app.get('/bars/add/:name/:street/:lat/:long', function(req, res){
  var kitten = new Bar({ properties:{ name: req.params.name, street: req.params.street} , geometry:{type:"Point",coordinates:[req.params.lat,req.params.long]}});
  var lat=req.params.lat;
  console.log(lat);
  // {
//   "type": "Feature",
//   "geometry": {
//     "type": "Point",
//     "coordinates": [125.6, 10.1]
//   },
//   "properties": {
//     "name": "Dinagat Islands"
//   }
// }
// var test=new GeoBar ({ point: {
//       type: "Point",
//       coordinates: [lat, 13.134578]
//     }});

db.on('open', function () {
  A.on('index', function (err) {
    if (err) return done(err);
    A.create({ loc: { type: 'Point', coordinates: [ 43.32402,-1.985839] }}, function (err) {
      if (err) return done(err);
      A.find({ loc: { $near: { type: 'Point', coordinates:[43.32402,-1.985839] }}}, function (err, docs) {
        if (err) return done(err);
        console.log(docs);
        done();
      })
    })
  })
});
function done (err) {
  if (err) console.error(err.stack);
  mongoose.connection.db.dropDatabase(function () {
    mongoose.connection.close();
  });
}


  console.log(kitten);
  //kitten.createIndex( {"loc" : "2dsphere" } )
 // test.save();
  // test.save(function (err, kittenadded, numberAffected) {
  //   if (err) {
  //     console.error(err);
  //     res.send('Error');
  //   } else {
  //     console.log('bars created:');
  //     console.log(kittenadded);
  //     res.json(kittenadded);
  //   }
  // });

});
//funciona
// find
// http://mongoosejs.com/docs/api.html#model_Model.find
app.get('/bars/findall', function(req, res){
    // find all
    console.log("findall");
    Bar.find({}, function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});
//funciona
app.get('/bars/find/:name', function(req, res){
    // find all
    var x=req.params.name;
  
    Bar.find({ name: req.params.name }, function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

app.get('/bars/findwithradius/:lat/:long/:radian', function(req, res){
     var _lat=parseFloat(req.params.lat);
   var _long=parseFloat(req.params.long);
    var _radian=req.params.radian;
//     var _R=6371;//radius of the earth 
//     console.log("lat :"+_lat);
//         console.log("lat :"+_long);
//     // Converts from degrees to radians.
// Math.radians = function(degrees) {
// return degrees * Math.PI / 180;
// };

// // Converts from radians to degrees.
// Math.degrees = function(radians) {
// return radians * 180 / Math.PI;
// };
// var maxLat = _lat + Math.degrees(_radian/_R);
// var minLat = _lat - Math.degrees(_radian/_R);
// var maxLon = _long + Math.degrees(Math.asin(_radian/_R) / Math.cos(Math.degrees(_lat)));
// var minLon = _long - Math.degrees(Math.asin(_radian/_R) / Math.cos(Math.degrees(_lat)));
//     console.log(maxLat,minLat,maxLon,minLon);
    
    A.find(
   { point:
      { $near : 
          {
            $geometry : {
               type : "Point" ,
               //coordinates : [43.319564, -1.983380] },
               coordinates:[_lat, _long]},
            $maxDistance : _radian
          }
      }
  }, function (err, kittens){
    if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find points:');
        console.log(kittens);
        res.json(kittens);
              }
      });

    });
app.get('/bars/findagelte/:val', function(req, res){
    // $lte selects the documents where the value of the field is less than or equal to (i.e. <=) the specified value.
    // https://docs.mongodb.org/manual/reference/operator/query/lte/#op._S_lte
    Bar.find({ age: { $lte : req.params.val } }, function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

app.get('/bars/findnamestartwith/:val', function(req, res){
    // https://docs.mongodb.org/manual/reference/operator/query/regex/
    Bar.find({ name: { $regex: ".b*." } }, function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

app.get('/bars/findAllName/', function(req, res){
    // find all
    Bar.find({ }, 'name', function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

app.get('/bars/findAllNamev2/', function(req, res){
    // find all
    Bar.find({ }, {'name':1}, function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

app.get('/bars/findAllNameNoId/', function(req, res){
    // find all
    Bar.find({ }, '-_id name', function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

app.get('/bars/findAllNameNoIdv2/', function(req, res){
    // find all
    Bar.find({ }, {'_id':0, 'name':1}, function (err, kittens) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('Find all bars:');
        console.log(kittens);
        res.json(kittens);
      }
    });

});

// update: http://mongoosejs.com/docs/api.html#model_Model.update
// http://docs.mongodb.org/manual/reference/method/db.collection.update/
app.get('/bars/update/:name/:age', function(req, res){
    // find all
    Bar.update({ name: req.params.name }, { $set: { street: req.params.age }}, {}, function (err, numberAffected, raw) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('numberAffected:');
        console.log(numberAffected);
        res.json(raw);
      }
    });

});

// update: http://mongoosejs.com/docs/api.html#model_Model.update
app.get('/bars/findoneandupdate/:name/:age', function(req, res){
    // find all
    Bar.findOneAndUpdate({ name: req.params.name }, { $set: { age: req.params.age }}, function (err, kitten) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('kitten:', kitten);
        res.json(kitten);
      }
    });

});

// AVG age
app.get('/bars/avg', function(req, res){
    // find all
    Bar.aggregate([{ $group: { _id: "$name", average: { $avg: "$age" } }}], function (err, kitten) {
      if (err) {
        console.error(err);
        res.send('Error');
      } else {
        console.log('kitten:', kitten);
        res.json(kitten);
      }
    });

});
//vv
//orginal
// var server = app.listen(process.env.PORT || 3000, function(){
//     console.log('Listening in port %d', server.address().port);
// });

//desde sunit
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1";

var server = app.listen(port, ip, function() {
    console.log('Listening in port %d', server.address().port);
});

///rhc ssh pptest
