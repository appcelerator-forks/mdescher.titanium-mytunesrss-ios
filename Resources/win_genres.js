function GenresWindow(data) {

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
					right : 52,
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
	
	buttonBack.addEventListener("click", function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("genres.title"), buttonBack, undefined));
	win.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
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
		        	loadAndDisplayOfflineAlbums(self, undefined, itemProps.genreName);
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
						genreName : item.name						
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
	};

	function optionsMenu(ice) {
		var itemProps = ice.section.getItemAt(ice.itemIndex).properties;
		var buttons = offlineMode ? [L("common.option.localdelete"), L("common.option.cancel")] : [L("common.option.download"), L("common.option.shuffle"), L("common.option.cancel")];
		new MenuView(win, itemProps.genreName, buttons, function(selectedButton) {
			var busyView = createBusyView();
	        win.add(busyView);
	        Titanium.App.setIdleTimerDisabled(true);
	        try {
	        	if (selectedButton === L("common.option.download")) {
	        		syncTracks(win, itemProps.tracksUri, ice.section.getItemAt(ice.itemIndex).main.text, "download.genre", false);
	            } else if (selectedButton === L("common.option.localdelete")) {
	                deleteLocalTracks(win, loadOfflineGenreTracks(itemProps.genreName), "localdelete.genre");
	            	myParent.open();
	            	win.close();
	        	} else if (selectedButton === L("common.option.shuffle")) {
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
