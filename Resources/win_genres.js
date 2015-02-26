function GenresWindow(data) {

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
    addMoreMenuToTemplate(template, function optionsMenu(item) {
    	listView.getSearchView().blur();
		var itemProps = item.properties;
		var buttons = [];
		if (offlineMode) {
        	buttons.push(L("common.option.localdelete"));
        	buttons.push(L("common.option.cancel"));
		} else {
			if (isDownloadPermission()) {
				buttons.push(L("common.option.download"));
			}
			buttons.push(L("common.option.shuffle"));
			if (isRemoteControlPermission()) {
				buttons.push(L("common.option.rc"));
			}
			buttons.push(L("common.option.cancel"));
		}
		new MenuView(win, itemProps.genreName, buttons, function(selectedButton) {
			var busyView = createBusyView();
	        mediaControlsView.add(busyView);
	        disableIdleTimer();
	        try {
	        	if (selectedButton === L("common.option.download")) {
	        		downloadTracksForUri(mediaControlsView, itemProps.tracksUri, item.main.text, "download.genre");
	            } else if (selectedButton === L("common.option.localdelete")) {
	                deleteLocalTracks(win, loadOfflineGenreTracks(itemProps.genreName), "localdelete.genre");
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
	            	remoteControlMenu(win, item.main.text, {genre:itemProps.genreName});
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
	
	mediaControlsView.add(GUI.createTopToolbar(L("genres.title"), buttonBack, undefined));
	mediaControlsView.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
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
		        	loadAndDisplayOfflineAlbums(self, undefined, itemProps.genreName);
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
						genreName : item.name,
						searchableText : item.name						
	        		}
	        	};
	        },
	        function(item) {
	            return item.naturalSortName != undefined ? item.naturalSortName : item.name;
	        });

	/**
	 * Open the genres window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
	};

}
