function AlbumsWindow(data) {

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
					right : (offlineMode ? 0 : 42) + (Titanium.Platform.osname === "ipad" ? 12 : 8),
					font : {
						fontSize : 16,
						fontWeight : "bold"
					},
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
					right : (offlineMode ? 0 : 42) + (Titanium.Platform.osname === "ipad" ? 12 : 8),
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [1, 2]);
    addMoreMenuToTemplate(template);

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener("click", function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("albums.title"), buttonBack, undefined));
	win.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
		if (e.bindId === "optionsMenu") {
    		optionsMenu(e);
    	} else {
        	var itemProps = e.section.getItemAt(e.itemIndex).properties;
			var busyView = createBusyView();
		    Titanium.App.setIdleTimerDisabled(true);
		    win.add(busyView);
            try {
		        if (!offlineMode) {
		            loadAndDisplayTracks(self, itemProps.tracksUri);
		        } else {
			        loadAndDisplayOfflineTracks(self, itemProps.albumName, itemProps.albumArtist);
		        }
            } finally {
            	Titanium.App.setIdleTimerDisabled(false);
        	    win.remove(busyView);
            }
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
	        			text : getDisplayName(item.name)
	        		},
	        		sub : {
	        			text : getDisplayName(item.artist)
	        		},
	        		properties : {
	        			tracksUri : item.tracksUri,
						albumArtist : item.artist,
						albumName : item.name
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the albums window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};

    function optionsMenu(ice) {
        var itemProps = ice.section.getItemAt(ice.itemIndex).properties;
        new MenuView(win, itemProps.albumName, [L("albums.option.download"), L("common.option.cancel")], function(index) {
        var busyView = createBusyView();
        win.add(busyView);
        Titanium.App.setIdleTimerDisabled(true);
        try {
            if (index === 0) {
                syncTracks(win, itemProps.tracksUri, ice.section.getItemAt(ice.itemIndex).main.text, "download.album", false);
            }
        } finally {
            Titanium.App.setIdleTimerDisabled(false);
            win.remove(busyView);
        }
        }).show();
    }

}
