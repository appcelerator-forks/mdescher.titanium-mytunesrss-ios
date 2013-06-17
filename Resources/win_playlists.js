function PlaylistsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var templateOnline = {
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
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			}
		]
	};
	var templateOffline = {
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
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "syncIcon",
				properties : {
					width : 20,
                    right : 10,
                    image : "images/sync.png",
                    touchEnabled : false
				}
			},
			{
				type : "Titanium.UI.View",
				bindId : "syncGlow",
				properties : {
                    GUI.glowViewOptions({right:20})
				},
                events : {
				    "touchstart" : function(e) {
				    	e.source.setOpacity(0.75);
				    },
			  	    "touchend" : function(e) {
				    	e.source.setOpacity(0);
				    },
			  	    "touchcancel" : function(e) {
				    	e.source.setOpacity(0);
				    },
                    "click" : syncClick
                }
			}
		]
	};

	var listView = GUI.createListView(tryGetAdSpacingStyle({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"online":templateOnline,"offline":templateOffline},defaultItemTemplate:offlineMode ? "offline" : "online"}));
	var buttonBack = GUI.createButton({title:L("playlists.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("playlists.title"), buttonBack, undefined));	
	win.add(listView);
	tryAddAd(win);

    listView.addEventListener("itemclick", function(e) {
        var busyView = createBusyView();
        win.add(busyView);
        Titanium.App.setIdleTimerDisabled(true);
        try {
            var itemProps = e.section.getItemAt(e.itemIndex).properties;
            loadAndDisplayTracks(self, itemProps.tracksUri);
        } finally {
            Titanium.App.setIdleTimerDisabled(false);
            win.remove(busyView);
        }
    });

    var syncClick = function(e) {
	    var busyView = createBusyView();
	    win.add(busyView);
	    Titanium.App.setIdleTimerDisabled(true);
	    try {
		    var tracks = loadTracks(e.source.tracksUri);
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
		    var syncProgress = function(e2) {
			    busyWindow.setProgress(e2.progress);
		    }
		    var syncDone = function() {
			    Titanium.App.setIdleTimerDisabled(false);
			    busyWindow.close();
			    Titanium.App.removeEventListener("mytunesrss_sync_progress", syncProgress);
			    Titanium.App.removeEventListener("mytunesrss_sync_done", syncDone);
		    }
		    Titanium.App.addEventListener("mytunesrss_sync_progress", syncProgress);
		    Titanium.App.addEventListener("mytunesrss_sync_done", syncDone);
		    Titanium.App.fireEvent("mytunesrss_sync", {data:tracks,index:0});
        }
    }

	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
                    syncGlow : {
                        tracksUri : item.tracksUri
                    }
	        		properties : {
	        			tracksUri : item.tracksUri
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
	}

}
