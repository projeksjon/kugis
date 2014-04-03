importScripts('../libs/javascript.util.js', '../libs/jsts.js'); 
var disjoints = [];
var reader = new jsts.io.GeoJSONReader();
var parser =  new jsts.io.GeoJSONParser();
function mergePolygons(first, second) {
        var first_path = latLngs2Path(first),
            second_path = latLngs2Path(second);
        var scale = 10000;
        ClipperLib.JS.ScaleUpPaths(first_path, scale);
        ClipperLib.JS.ScaleUpPaths(second_path, scale);
        var cpr = new ClipperLib.Clipper();
        cpr.AddPaths(first_path, ClipperLib.PolyType.ptSubject, true);
        cpr.AddPaths(second_path, ClipperLib.PolyType.ptClip, true);
        var fillType = ClipperLib.PolyFillType.pftNonZero;
        var result = new ClipperLib.Paths();
        cpr.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
        return path2LatLngs(result);

        function latLngs2Path(latlngs) {
            return convert(latlngs, true);
        }
        function path2LatLngs(path) {
            return convert(path, false);
        }
        function convert(coords, from) {
            var paths = [];
            for (var i=0; i<coords.length; i++) {
                var poly = coords[i],
                    subpath = [];
                for (var j=0; j<poly.length; j++) {
                    var latlng = poly[j],
                        coord = from ? {X: latlng.lng, Y: latlng.lat} :
                                       [latlng.Y / scale, latlng.X / scale];
                    subpath.push(coord);
                }
                paths.push(subpath);
            }
            return paths;
        }
    }
onmessage = function(evt) {
  var geojson = evt.data.geojson;
  if( !geojson.features[0].properties["kugisCreated"] && geojson.features[0].type.indexOf('olygon') > 0 ) {
    for(var i = 0; i<geojson.features.length;i++) {

      var f2 = reader.read(geojson.features[i]);
      f2.geometry = f2.geometry.buffer(0.0000000001); // This fixes a lot of errors with this process
      geojson.features[i].geometry = parser.write(f2.geometry); 
    }
  }
  while(geojson.features.length >0) {
    var f1 = reader.read(geojson.features.shift());
    disjoint = true;
    var g1 = f1.geometry;
    for (var i = 0; i<geojson.features.length;i++) {
      var f2 = reader.read(geojson.features[i]);
      var g2 = f2.geometry;
    
      if(g1.intersects(g2)) {
        geojson.features.splice(i,1);
        union = g1.union(g2);
        disjoint = false;
        break;
      }
    
    }
    if(disjoint)
      disjoints.push(g1);
    else {
      f1.geometry = parser.write(union);
      geojson.features.push(f1);
    }
    postMessage({msg: "update"});
  }
  var fc = {type: "FeatureCollection", features: [], properties: { kugis: true } };
  for(var i =0;i<disjoints.length;i++) {
    var feature = { type: "Feature", geometry: parser.write(disjoints[i]), properties: {} };
    feature.properties["kugisCreated"] = "true";
    fc.features.push(feature);
  }
  postMessage({geojson: fc, disjoints: disjoints});

}