Sidebar.Tool.AddNVDB = Sidebar.Tool.extend({
	title: "NVDBAdder",
	_droppableText: "Drop a layer here to buffer!",
	afterDrop: function (event, context) {
		

	},
	execute: function (kommunenummer) {
		var fylke = parseInt(kommunenummer.substring(0,2));
		var kommune = parseInt(kommunenummer.substring(2,2));
		var url = "http://vegnett.vegdata.no/nvdb/api/vegnett/"+fylke+"/"+kommune+".json";
		$.ajax({
		  url: url,
		  success: function (data) { console.log(data) },
		});
		
	},
	createToolOptions: function () {
		element = L.DomUtil.create("div", "tool-options");
		element.appendChild(document.createTextNode("Kommunenummer: "));
		this._kommunenummer = L.DomUtil.create("input", "kommunenummer");
		
		L.DomEvent.addListener(this._kommunenummer, "click", L.DomEvent.stopPropagation);
		element.appendChild(this._kommunenummer);
		var button = L.DomUtil.create("button", "");
		button.innerHTML = "Legg til data";
		var con = this;
		button.onClick = function (e) {
			con.execute(con._kommunenummer);
		}
	
		return element;
		
	}
});