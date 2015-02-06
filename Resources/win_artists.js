function ArtistsWindow(data) {
	
	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);

	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 52,
					font : {
						fontSize : 20,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [0]);
    addMoreMenuToTemplate(template, function(item) {
    	listView.getSearchView().blur();
		var itemProps = item.properties;
		var buttons = offlineMode ? [L("common.option.localdelete"), L("common.option.cancel")] : [L("common.option.download"), L("common.option.shuffle"), L("common.option.rc"), L("common.option.cancel")];
		new MenuView(win, itemProps.artistName, buttons, function(selectedButton) {
			var busyView = createBusyView();
	        mediaControlsView.add(busyView);
	        disableIdleTimer();
	        try {
	        	if (selectedButton === L("common.option.download")) {
	        		downloadTracksForUri(mediaControlsView, itemProps.tracksUri, item.main.text, "download.artist");
	            } else if (selectedButton === L("common.option.localdelete")) {
	                deleteLocalTracks(win, loadOfflineArtistsTracks(itemProps.artistName), "localdelete.artist");
	            	myParent.open();
	            	win.close();
	        	} else if (selectedButton === L("common.option.shuffle")) {
			    	onlineShuffleSession = removeUnsupportedAndNonAudioTracks(loadTracks(itemProps.tracksUri));
			    	if (onlineShuffleSession.length > 0) {
				    	shuffleArray(onlineShuffleSession);
					    jukebox.setPlaylist(onlineShuffleSession, 0, true, false);
					    jukebox.open(self);
		        	} else {
		        		showError({message:L("tracks.online.noneFound"),buttonNames:['Ok']});
		        	}
	            } else if (selectedButton === L("common.option.rc")) {
	            	remoteControlMenu(win, item.main.text, {artist:itemProps.artistName});
			    }
	        } finally {
	            enableIdleTimer();
	            mediaControlsView.remove(busyView);
	        }
		}).show();
	});

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("artists.title"), buttonBack, undefined));
	mediaControlsView.add(listView);
	
	listView.addEventListener('itemclick', function(e) {
		if (suppressItemClick) {
			suppressItemClick = false;
		} else {
			var itemProps = e.section.getItemAt(e.itemIndex).properties;
			var busyView = createBusyView();
	        mediaControlsView.add(busyView);
	        disableIdleTimer();
			try {
		        if (!offlineMode) {
		        	loadAndDisplayAlbums(self, itemProps.albumsUri);
		        } else {
		        	loadAndDisplayOfflineAlbums(self, itemProps.artistName, undefined);
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
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
	        		properties : {
	        			albumsUri : item.albumsUri,
	        			tracksUri : item.tracksUri,
						artistName : item.name,
						searchableText : item.name
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
		mediaControlsView.becomeFirstResponder();
	};

}
