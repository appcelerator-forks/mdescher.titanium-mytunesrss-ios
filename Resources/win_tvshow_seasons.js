function TvShowSeasonsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 6 : 4,
					right : Titanium.Platform.osname === "ipad" ? 691 : 270,
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : Titanium.Platform.osname === "ipad" ? 12 : 8,
					font : {
						fontSize : 16,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "sub",
				properties : {
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			}
		]
	};

	var listView = GUI.createListView(tryGetAdSpacingStyle({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:"default"}));
	var buttonBack = GUI.createButton({title:L("tvshow.seasons.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tvshow.seasons.title"), buttonBack, undefined));
	win.add(listView);
	tryAddAd(win);
	
	listView.addEventListener("itemclick", function(e) {
		var busyView = createBusyView();
		win.add(busyView);
		Titanium.App.setIdleTimerDisabled(true);
        try {
            var itemProps = e.section.getItemAt(e.itemIndex).properties;
    	    loadAndDisplayTracks(self, itemProps.episodesUri);
        } finally {
        	Titanium.App.setIdleTimerDisabled(false);
	        win.remove(busyView);
        }
	});
	
	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		pic : {
	        			image : item.imageHash != undefined ? "http://localhost:" + HTTP_SERVER_PORT + "/image/" + item.imageHash + "/" + encodeURIComponent(item.imageUri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64)) : "appicon.png",
	        		},
	        		main : {
	        			text : "Season " + item.name)
	        		},
	        		sub : {
	        			text : String.format(L("tvshow.seasons.info"), item.episodeCount)
	        		},
	        		properties : {
	        			episodesUri : item.episodesUri;
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the tv show seasons window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}

}
