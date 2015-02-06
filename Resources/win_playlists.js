function PlaylistsWindow(data) {

	var self = this;
	var myParent;
	var myPath = [];

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
	var padding = isIos7() ? 8 : 4;
	var templateForFolder = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 42,
					font : {
						fontSize : 20,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12,
				}
			}
		]
	};
	addTextColorToTemplates(template, [0]);
	addTextColorToTemplates(templateForFolder, [0]);
    addMoreMenuToTemplate(template, function optionsMenu(item) {
    	listView.getSearchView().blur();
		var itemProps = item.properties;
		var menuItems = [L("common.option.download"), L("common.option.shuffle")];
		if (itemProps.canRefresh === true) {
			menuItems.push(L("playlists.option.refresh"));
		}
		menuItems.push(L("common.option.rc"));
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
	            } else if (selectedButton === L("common.option.rc")) {
	            	remoteControlMenu(win, item.main.text, {playlist:itemProps.itemId});
			    }
	        } finally {
	            enableIdleTimer();
	            mediaControlsView.remove(busyView);
	        }
		}).show();
	});

	var listView = createCommonListViewWithTemplates({"default":template,"folder":templateForFolder}, false);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener("click", function() {
		if (myPath.length > 0) {
			myPath.pop();
			createListView();
		} else {
			myParent.open();
		    win.close();
		}
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("playlists.title"), buttonBack, undefined));	
	mediaControlsView.add(listView);
	
	function createListView() {
		var currentLevel = [];
		var currentContainer = myPath.length === 0 ? undefined : myPath[myPath.length - 1];
		for (var i = 0; i < data.length; i++) {
			if (data[i].containerId === currentContainer) {
				currentLevel.push(data[i]);
			}
		}
		setListDataAndIndex(
		        listView,
		        currentLevel,
		        function(item, index) {
		        	return {
		        		main : {
		        			text : getDisplayName(item.name)
		        		},
		        		properties : {
			        		accessoryType : item.type === "ITunesFolder" ? Titanium.UI.LIST_ACCESSORY_TYPE_DISCLOSURE : Titanium.UI.LIST_ACCESSORY_TYPE_NONE,
		        			tracksUri : item.tracksUri,
		        			trackCount : item.trackCount,
		        			name : getDisplayName(item.name),
		        			canRefresh : (item.type === "MyTunesSmart" && item.owner === connectedUsername),
		        			searchableText : item.name,
		        			isFolder : item.type === "ITunesFolder",
		        			itemId : item.id
		        		},
		        		template : item.type === "ITunesFolder" ? "folder" : "default"

		        	};
		        },
		        function(item) {
		            return item.name;
		        });
	}
	
    listView.addEventListener("itemclick", function(e) {
		if (suppressItemClick) {
			suppressItemClick = false;
		} else {
	    	var itemProps = e.section.getItemAt(e.itemIndex).properties;
	    	if (itemProps.isFolder) {
	    		myPath.push(itemProps.itemId);
	    		createListView();
	    	} else {
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
    	}
    });

	createListView();
		
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
