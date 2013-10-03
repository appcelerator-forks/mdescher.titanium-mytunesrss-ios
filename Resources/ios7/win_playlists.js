function PlaylistsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var templateOffline = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 10,
					font : {
						fontSize : 20,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			}
		]
	};

    function syncTracks(tracksUri, displayName) {
	    var busyView = createBusyView();
	    win.add(busyView);
	    Titanium.App.setIdleTimerDisabled(true);
	    try {
		    var tracks = loadTracks(tracksUri);
        	removeObsoleteTracks(tracks);
	    } finally {
		    Titanium.App.setIdleTimerDisabled(false);
	        win.remove(busyView);
	    }
        if (tracks != undefined && tracks.length > 0) {
        	Titanium.Analytics.featureEvent("sync.playlist");
		    CANCEL_SYNC_AUDIO_TRACKS = false;
		    var busyWindow = new BusyWindow(L("playlists.busy.syncing"), displayName, function() {
			    CANCEL_SYNC_AUDIO_TRACKS = true;
		    });
		    busyWindow.open();
		    Titanium.App.setIdleTimerDisabled(true);
		    var syncProgress = function(e) {
			    busyWindow.setProgress(e.progress);
		    };
		    var syncDone = function() {
			    Titanium.App.setIdleTimerDisabled(false);
			    busyWindow.close();
			    Titanium.App.removeEventListener("mytunesrss_sync_progress", syncProgress);
			    Titanium.App.removeEventListener("mytunesrss_sync_done", syncDone);
		    };
		    Titanium.App.addEventListener("mytunesrss_sync_progress", syncProgress);
		    Titanium.App.addEventListener("mytunesrss_sync_done", syncDone);
		    Titanium.App.fireEvent("mytunesrss_sync", {data:tracks,index:0});
        }
    }

	var templateOnline = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 40,
					font : {
						fontSize : 20,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "syncIcon",
				properties : {
					width : 20,
                    right : 10,
                    image : "ios7/images/sync.png",
                    touchEnabled : false
				}
			}
		]
	};

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}),filterAttribute:"filter",top:45,templates:{"online":templateOnline,"offline":templateOffline},defaultItemTemplate:offlineMode ? "offline" : "online"});
	var buttonBack = GUI.createButton({title:L("playlists.back")});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("playlists.title"), buttonBack, undefined));	
	win.add(listView);
	
    listView.addEventListener("itemclick", function(e) {
    	var itemProps = e.section.getItemAt(e.itemIndex).properties;
    	if (e.bindId === "syncIcon") {
    		syncTracks(itemProps.tracksUri, e.section.getItemAt(e.itemIndex).main.text);
    	} else {
			var dialog = Ti.UI.createAlertDialog({
				cancel : 2,
			    buttonNames : [L("playlists.option.display"), L("playlists.option.shuffle"), L("playlists.option.cancel")],
			    message : String.format(L("playlists.option.text"), itemProps.trackCount),
			    title : itemProps.name
			});
			dialog.addEventListener("click", function(e) {
				var busyView = createBusyView();
		        win.add(busyView);
		        Titanium.App.setIdleTimerDisabled(true);
		        try {
				    if (e.index === 0) {
				        loadAndDisplayTracks(self, itemProps.tracksUri);
				    } else if (e.index === 1) {
				    	onlineShuffleSession = loadTracks(itemProps.tracksUri);
				    	removeUnsupportedAndNonAudioTracks(onlineShuffleSession);
				    	if (onlineShuffleSession.length > 0) {
					    	shuffleArray(onlineShuffleSession);
						    jukebox.setPlaylist(onlineShuffleSession, 0, true, false);
						    jukebox.open(self);
			        	} else {
			        		showError({message:L("tracks.offline.noneFound"),buttonNames:['Ok']});
			        	}
				    }
		        } finally {
		            Titanium.App.setIdleTimerDisabled(false);
		            win.remove(busyView);
		        }
			});
			dialog.show();
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
	        			name : getDisplayName(item.name)
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

}
