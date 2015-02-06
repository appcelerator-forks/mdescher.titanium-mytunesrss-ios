function AlbumsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);

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
					right : 42 + (Titanium.Platform.osname === "ipad" ? 12 : 8),
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
					right : 42 + (Titanium.Platform.osname === "ipad" ? 12 : 8),
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
    addMoreMenuToTemplate(template, function(item) {
        listView.getSearchView().blur();
        var itemProps = item.properties;
        var buttons = offlineMode ? [L("common.option.localdelete"), L("common.option.cancel")] : [L("common.option.download"), L("common.option.rc"), L("common.option.cancel")];
        new MenuView(win, itemProps.albumName, buttons, function(selectedButton) {
	        var busyView = createBusyView();
	        mediaControlsView.add(busyView);
	        disableIdleTimer();
	        try {
	            if (selectedButton === L("common.option.download")) {
	                downloadTracksForUri(mediaControlsView, itemProps.tracksUri, item.main.text, "download.album");
	            } else if (selectedButton === L("common.option.localdelete")) {
	                deleteLocalTracks(win, loadOfflineAlbumTracks(itemProps.albumName, itemProps.albumArtist), "localdelete.album");
	            	myParent.open();
	            	win.close();
	            } else if (selectedButton === L("common.option.rc")) {
	            	remoteControlMenu(win, item.main.text, {album:itemProps.albumName,albumArtist:itemProps.albumArtist});
	            }
	        } finally {
	            enableIdleTimer();
	            mediaControlsView.remove(busyView);
	        }
        }).show();
	});

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener("click", function() {
		myParent.open();
	    win.close();
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("albums.title"), buttonBack, undefined));
	mediaControlsView.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
		if (suppressItemClick) {
			suppressItemClick = false;
		} else {
	    	var itemProps = e.section.getItemAt(e.itemIndex).properties;
			var busyView = createBusyView();
		    disableIdleTimer();
		    mediaControlsView.add(busyView);
	        try {
		        if (!offlineMode) {
		            loadAndDisplayTracks(self, itemProps.tracksUri);
		        } else {
			        loadAndDisplayOfflineTracks(self, itemProps.albumName, itemProps.albumArtist);
		        }
	        } finally {
	        	enableIdleTimer();
	    	    mediaControlsView.remove(busyView);
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
						albumName : item.name,
						searchableText : item.name
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
		mediaControlsView.becomeFirstResponder();
	};

}
