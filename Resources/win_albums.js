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
					right : (offlineMode ? 0: 32) + Titanium.Platform.osname === "ipad" ? 12 : 8,
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
					right : (offlineMode ? 0: 32) + Titanium.Platform.osname === "ipad" ? 12 : 8,
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			}
		]
	};
    if (!isIos7()) {
        template.childTemplates[1].properties.color = "#CCCCCC";    
        template.childTemplates[2].properties.color = "#CCCCCC";    
    }
    if (!offlineMode) {
        template.childTemplates.push({
			type : "Titanium.UI.ImageView",
			bindId : "optionsMenu",
			properties : {
				width : 32,
                right : 10,
                image : "images/more.png",
                touchEnabled : false
			}
		});
    }

	var listView = isIos7() ? GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:"default"}) : GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:"default"});
    var buttonBackArgs = {title:L("albums.back")};
    if (!isIos7()) {
        buttonBackArgs.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
    }
	var buttonBack = GUI.createButton(buttonBackArgs);
	
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
		    Titanium.App.setIdleTimerDisabled(true);
		    win.add(busyView);
            try {
            	var itemProps = e.section.getItemAt(e.itemIndex).properties;
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
            new MenuView(win, itemProps.artistName, [L("albums.option.download"), L("common.option.cancel")], function(index) {
                    var busyView = createBusyView();
            win.add(busyView);
            Titanium.App.setIdleTimerDisabled(true);
            try {
                    if (index === 0) {
                            syncTracks(win, itemProps.tracksUri, ice.section.getItemAt(ice.itemIndex).main.text, "download.album", false);
                    } else if (index === 1) {
                            onlineShuffleSession = loadTracks(itemProps.tracksUri);
                            removeUnsupportedAndNonAudioTracks(onlineShuffleSession);
                            if (onlineShuffleSession.length > 0) {
                                    shuffleArray(onlineShuffleSession);
                                        jukebox.setPlaylist(onlineShuffleSession, 0, true, false);
                                        jukebox.open(self);
                            } else {
                                    showError({message:L("tracks.online.noneFound"),buttonNames:["Ok"]});
                            }
                        }
            } finally {
                Titanium.App.setIdleTimerDisabled(false);
                win.remove(busyView);
            }
            }).show();
    }

}
