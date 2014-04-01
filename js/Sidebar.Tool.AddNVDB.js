Sidebar.Tool.AddNVDB = Sidebar.Tool.extend({
	title: "NVDBAdder",
	_droppableText: "Drop a layer here to buffer!",
	afterDrop: function (event, context) {
		

	},
	execute: function (kommunenummer) {
		var fylke = parseInt(kommunenummer.substring(0,2));
		console.log(kommunenummer.substring(1,2));
		var kommune = parseInt(kommunenummer.substring(2,4));
		var url = encodeURIComponent("http://vegnett.vegdata.no/nvdb/api/vegnett/"+fylke+"/"+kommune+".json");
		$.ajax({
		  url: "http://folk.ntnu.no/torbjvi/nvdbproxy.php?url="+url,
		  success: function (data) { 
		  	cons
		  	var color = "black";
		  	var name = "Vegnett_"+kommunenummer;

		  	layerlist.addLayer( name, JSON.parse(data), color); 
			},
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
		button.onclick = function (e) {
			console.log("Clicked");
			con.execute(con._kommunenummer.value);
		}
		element.appendChild(button);
		return element;
		
	}
});