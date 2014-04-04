importScripts('../libs/javascript.util.js', '../libs/jsts.js', '../libs/clipper.js'); 
var disjoints = [];
var reader = new jsts.io.GeoJSONReader();
var parser =  new jsts.io.GeoJSONParser();
var scale = 1000000000.0;
var convertPath = function (c, from, scale) {
        if(Array.isArray(c[0])) {
            var e = [];
            for(var i = 0; i<c.length;i++) {
                e.push(convertPath(c[i], from, scale));
            }
         }
         else {
            if(!from) {
                for(var i = 0; i<c.length;i++) {
                    var p = [c[i].X/scale, c[i].Y/scale];
                    c[i] = p;

                }

            }
            return from ? {X: c[0], Y: c[1]} : c;
         }

        return e;
    };

function mergePolygons(first, second) {
        
        var scale = 1000000000;
        ClipperLib.JS.ScaleUpPaths(first, scale);
        ClipperLib.JS.ScaleUpPaths(second, scale);
        var cpr = new ClipperLib.Clipper();
        cpr.AddPaths(first, ClipperLib.PolyType.ptSubject, true);
        cpr.AddPaths(second, ClipperLib.PolyType.ptClip, true);
        var fillType = ClipperLib.PolyFillType.pftNonZero;
        var result = new ClipperLib.Paths();
        var r = cpr.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
        return result;
        
    }
onmessage = function(evt) {
  var geojson = evt.data.geojson;
  /*if( !geojson.features[0].properties["kugisCreated"] && geojson.features[0].type.indexOf('olygon') > 0 ) {
    for(var i = 0; i<geojson.features.length;i++) {

      var f2 = reader.read(geojson.features[i]);
      f2.geometry = f2.geometry.buffer(0.0000000001); // This fixes a lot of errors with this process
      geojson.features[i].geometry = parser.write(f2.geometry); 
    }
  }*/
  while(geojson.features.length >0) {
    var f1 = geojson.features.shift();
    disjoint = true;
    var g1 = reader.read(f1.geometry);
    for (var i = 0; i<geojson.features.length;i++) {
      var f2 = geojson.features[i];
      var g2 = reader.read(f2.geometry);
    
      if(true) {
        geojson.features.splice(i,1);
        var p1 = convertPath(f1.geometry.coordinates, true);
        var p2 = convertPath(f2.geometry.coordinates, true);

        union = mergePolygons(p1,p2);
        disjoint = false;
        break;
      }
    
    }
    if(disjoint)
      disjoints.push(g1);
    else {
      f1.geometry.coordinates = convertPath(union,false,scale);
      geojson.features.push(f1);
    }
    postMessage({msg: "update"});
  }
  var fc = {type: "FeatureCollection", features: [], properties: { kugis: true } };
  for(var i =0;i<disjoints.length;i++) {
    var feature = { type: "Feature", geometry: parser.write(disjoints[i]), properties: {} };
    fc.features.push(feature);
  }
  postMessage({geojson: fc, disjoints: disjoints});

}