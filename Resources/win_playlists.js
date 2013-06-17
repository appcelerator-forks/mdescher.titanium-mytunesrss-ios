function PlaylistsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var tableView = GUI.createTableView(tryGetAdSpacingStyle({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:"filter",top:45}));
	var buttonBack = GUI.createButton({title:L("playlists.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("playlists.title"), buttonBack, undefined));	
	win.add(tableView);
	tryAddAd(win);
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item) {
	            var displayName = getDisplayName(item.name);
	            var row = GUI.createTableViewRow({height:TABLE_VIEW_ROW_HEIGHT,className:'playlist_row',selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,filter:displayName});
	            var infoView = Titanium.UI.createView({right:30});
	            infoView.add(GUI.createLabel({text:displayName,left:10,height:24,right:10,font:{fontSize:20,fontWeight:'bold'}}));
	            infoView.addEventListener('click', function(e) {
					var busyView = createBusyView();
					win.add(busyView);
					Titanium.App.setIdleTimerDisabled(true);
                    try {
				        loadAndDisplayTracks(self, item.tracksUri);
                    } finally {
                    	Titanium.App.setIdleTimerDisabled(false);
				        win.remove(busyView);
                    }
		    	});
		        row.add(infoView);
	            if (!offlineMode) {
				    var syncImageGlowView = Titanium.UI.createView(GUI.glowViewOptions({right:20}));
				    var syncImageView = Titanium.UI.createImageView({width:20,image:"images/sync.png",right:10,touchEnabled:false});
				    var touchView = Titanium.UI.createView({right:0,height:Titanium.UI.FILL,width:40,backgroundColor:"transparent",glow:syncImageGlowView});
				    row.add(touchView);
				    touchView.addEventListener("touchstart", function(e) {
				    	e.source.glow.setOpacity(0.75);
				    });
			  	    touchView.addEventListener("touchend", function(e) {
				    	e.source.glow.setOpacity(0);
				    });
			  	    touchView.addEventListener("touchcancel", function(e) {
				    	e.source.glow.setOpacity(0);
				    });
				    touchView.addEventListener("click", function(e) {
						var busyView = createBusyView();
						win.add(busyView);
						Titanium.App.setIdleTimerDisabled(true);
						try {
							var tracks = loadTracks(item.tracksUri);
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
				    });
				    row.add(syncImageView);
				    row.add(syncImageGlowView);	            	
	            }
	            return row;
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
