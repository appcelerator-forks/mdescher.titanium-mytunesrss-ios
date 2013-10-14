function ArtistsWindow(data) {
	
	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	
	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : offlineMode ? 10 : 52,
					font : {
						fontSize : 20,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [0]);
    addMoreMenuToTemplate(template);

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("artists.title"), buttonBack, undefined));
	win.add(listView);
	
	listView.addEventListener('itemclick', function(e) {
    	if (e.bindId === "optionsMenu") {
    		optionsMenu(e);
    	} else {
    		var itemProps = e.section.getItemAt(e.itemIndex).properties;
			var busyView = createBusyView();
	        win.add(busyView);
	        Titanium.App.setIdleTimerDisabled(true);
			try {
		        if (!offlineMode) {
		        	loadAndDisplayAlbums(self, itemProps.albumsUri);
		        } else {
		        	loadAndDisplayOfflineAlbums(self, itemProps.artistName, undefined);
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
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
	        		properties : {
	        			albumsUri : item.albumsUri,
	        			tracksUri : item.tracksUri,
						artistName : item.name
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the artists window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};

	function optionsMenu(ice) {
		var itemProps = ice.section.getItemAt(ice.itemIndex).properties;
		new MenuView(win, itemProps.artistName, [L("playlists.option.download"), L("playlists.option.shuffle"), L("common.option.cancel")], function(index) {
			var busyView = createBusyView();
	        win.add(busyView);
	        Titanium.App.setIdleTimerDisabled(true);
	        try {
	        	if (index === 0) {
	        		syncTracks(win, itemProps.tracksUri, ice.section.getItemAt(ice.itemIndex).main.text, "download.artist", false);
	        	} else if (index === 1) {
			    	onlineShuffleSession = loadTracks(itemProps.tracksUri);
			    	removeUnsupportedAndNonAudioTracks(onlineShuffleSession);
			    	if (onlineShuffleSession.length > 0) {
				    	shuffleArray(onlineShuffleSession);
					    jukebox.setPlaylist(onlineShuffleSession, 0, true, false);
					    jukebox.open(self);
		        	} else {
		        		showError({message:L("tracks.online.noneFound"),buttonNames:['Ok']});
		        	}
			    }
	        } finally {
	            Titanium.App.setIdleTimerDisabled(false);
	            win.remove(busyView);
	        }
		}).show();
	}

}
