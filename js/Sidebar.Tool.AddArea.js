Sidebar.Tool.AddArea = Sidebar.Tool.extend({
title: "AddArea",
_droppableText: "Instruction text",
afterDrop: function (event, context) {
	var layer = event.draggable[0].this._layer;
	var reproj
	var layers = layer.getLayers();
	var i = 0;

	WktUtils.reprojectGeoJson(layer.toGeoJson();, "EPSG:4326",  "EPSG:32632", 3, callback);
	
},		
});
