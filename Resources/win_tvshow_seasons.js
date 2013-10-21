function TvShowSeasonsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var padding = isIos7() ? 8 : 4;
	
	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : padding,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : padding,
					left : Titanium.Platform.osname === "ipad" ? 6 : padding,
					right : Titanium.Platform.osname === "ipad" ? 691 : (isIos7() ? 274 : 270),
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : padding,
					left : Titanium.Platform.osname === "ipad" ? 78 : (isIos7() ? 56 : 52),
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : Titanium.Platform.osname === "ipad" ? 6 : padding,
					font : {
						fontSize : 16,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "sub",
				properties : {
					bottom : Titanium.Platform.osname === "ipad" ? 6 : padding,
					left : Titanium.Platform.osname === "ipad" ? 78 : (isIos7() ? 56 : 52),
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : Titanium.Platform.osname === "ipad" ? 6 : padding,
					font : {
						fontSize : 12,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [1, 2]);

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tvshow.seasons.title"), buttonBack, undefined));
	win.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
		var busyView = createBusyView();
		win.add(busyView);
		disableIdleTimer();
        try {
            var itemProps = e.section.getItemAt(e.itemIndex).properties;
    	    loadAndDisplayTracks(self, itemProps.episodesUri);
        } finally {
        	enableIdleTimer();
	        win.remove(busyView);
        }
	});
	
	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		pic : {
	        			image : item.imageHash != undefined ? "http://localhost:" + HTTP_SERVER_PORT + "/image/" + item.imageHash + "_" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64) + "/" + encodeURIComponent(item.imageUri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64)) : "appicon.png",
	        		},
	        		main : {
	        			text : "Season " + item.name
	        		},
	        		sub : {
	        			text : String.format(L("tvshow.seasons.info"), item.episodeCount)
	        		},
	        		properties : {
	        			episodesUri : item.episodesUri
	        		}
	        	};
	        },
	        function(item) {
	            return String.format(L("tvshow.seasons.itemName"), item.name);
	        });

	/**
	 * Open the tv show seasons window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};

}
