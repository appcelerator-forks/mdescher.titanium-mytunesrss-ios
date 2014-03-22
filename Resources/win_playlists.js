function PlaylistsWindow(data) {

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
					right : offlineMode ? 10 : 42,
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
		var itemProps = item.properties;
		var menuItems = [L("common.option.download"), L("common.option.shuffle")];
		if (itemProps.canRefresh === true) {
			menuItems.push(L("playlists.option.refresh"));
		}
		menuItems.push(L("common.option.cancel"));
		new MenuView(win, itemProps.name, menuItems, function(selectedButton) {
			var busyView = createBusyView();
	        mediaControlsView.add(busyView);
	        disableIdleTimer();
	        try {
			    if (selectedButton === L("common.option.download")) {
			        downloadTracksForUri(mediaControlsView, itemProps.tracksUri, item.main.text, "download.playlist");
			    } else if (selectedButton === L("common.option.shuffle")) {
			    	onlineShuffleSession = removeUnsupportedAndNonAudioTracks(loadTracks(itemProps.tracksUri));
			    	if (onlineShuffleSession.length > 0) {
				    	shuffleArray(onlineShuffleSession);
					    jukebox.setPlaylist(onlineShuffleSession, 0, true, false);
					    jukebox.open(self);
		        	} else {
		        		showError({message:L("tracks.online.noneFound"),buttonNames:['Ok']});
		        	}
			    } else if (selectedButton === L("playlists.option.refresh")) {
			    	refreshSmartPlaylist(itemProps.tracksUri.substring(0, itemProps.tracksUri.lastIndexOf("/tracks")));
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
	
	mediaControlsView.add(GUI.createTopToolbar(L("playlists.title"), buttonBack, undefined));	
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
	    		loadAndDisplayTracks(self, itemProps.tracksUri);
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
	        			tracksUri : item.tracksUri,
	        			trackCount : item.trackCount,
	        			name : getDisplayName(item.name),
	        			canRefresh : (item.type === "MyTunesSmart" && item.owner === connectedUsername),
	        			searchableText : item.name
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
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
