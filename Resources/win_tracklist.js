function TracksWindow(data, currentJukeboxPlaylist) {

	var self = this;
	var myParent;
	var myCurrentJukeboxPlaylist = currentJukeboxPlaylist != undefined ? currentJukeboxPlaylist : false;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var tableView = GUI.createTableView(getAdSpacingStyleIfOnline({top:45}));
	var buttonBack = GUI.createButton({title:L("tracklist.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open(undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tracklist.title"), buttonBack, undefined));
	win.add(tableView);
	addIAddIfOnline(win);
	
	var tableData = [];
	for (var i = 0; i < data.length; i++) {
	    var row = GUI.createMediaTrackItemRow(data[i].imageUri != undefined);
	    var infoView = GUI.createMediaTrackItemInfoView(data[i].imageHash, data[i].imageUri, getDisplayName(data[i].name), getDisplayName(data[i].artist));
    	row.add(infoView);
	    infoView.addEventListener("click", function(e) {
	    	var busyView = createBusyView();
			win.add(busyView);
            try {
	            if (data[e.index].mediaType === "Video") {
	                jukebox.reset();
	                var url = data[e.index].httpLiveStreamUri != undefined ? data[e.index].httpLiveStreamUri : data[e.index].playbackUri;
	                var tcParam = getTcParam();
	                if (tcParam != undefined) {
	                    url += "/" + tcParam;
	                }
	                new VideoPlayerWindow(url).open(self);
	            } else {
	                jukebox.setPlaylist(data, e.index);
			        jukebox.open(myCurrentJukeboxPlaylist === true ? undefined : self);
			        if (myCurrentJukeboxPlaylist === true) {
			        	win.close();
			        }
	            }
            } finally {
	            win.remove(busyView);
            }
	    });

		if (!offlineMode && data[i].mediaType === "Audio") {
		    var syncImageGlowView = GUI.createGlow({right:20});
		    var syncImageViewImage = getCachedTrackFile(data[i].id) === undefined ? "images/download.png" : "images/delete.png"; 
		    var syncImageView = Titanium.UI.createImageView({width:20,image:syncImageViewImage,right:10,touchEnabled:false});
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
		    	if (getCachedTrackFile(data[e.index].id) != undefined) {
		    		deleteCachedTrackFile(data[e.index].id);
		    		db = Titanium.Database.open("OfflineTracks");
					db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
					db.close();
	    			tableView.data[0].rows[e.index].getChildren()[2].setImage("images/download.png");
		    	} else {
					var url = data[e.index].playbackUri;
					var tcParam = getTcParam();
		    		if (tcParam != undefined) {
		        		url += '/' + tcParam;
		    		}
		    		var busyWindow = new BusyWindow(L("tracklist.busy.downloading"), data[e.index].name);
		    		busyWindow.open();
		    		Titanium.App.setIdleTimerDisabled(true);
					cacheTrack(data[e.index].id, url, function(e) {busyWindow.setProgress(e);return true}, function(e) {
						if (e.aborted == undefined) {
				    		db = Titanium.Database.open("OfflineTracks");
							db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
							db.execute(
								"INSERT INTO track (id, name, album, artist, genre, album_artist, image_hash, protected, media_type, time, disc_number, track_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
								data[e.index].id,
								data[e.index].name,
								data[e.index].album,
								data[e.index].artist,
								data[e.index].genre,
								data[e.index].albumArtist,
								data[e.index].imageHash,
								data[e.index].protected,
								data[e.index].mediaType,
								data[e.index].time,
								data[e.index].discNumber,
								data[e.index].trackNumber
							);
							db.close();
							tableView.data[0].rows[e.index].getChildren()[2].setImage("images/delete.png");
						}
						Titanium.App.setIdleTimerDisabled(false);
						busyWindow.close();		    				
					});
					downloadImage(data[e.index].imageHash,data[e.index].imageUri);
		    	}
		    });
		    row.add(syncImageView);
		    row.add(syncImageGlowView);
		}
	    tableData.push(row);
	}
	tableView.addEventListener("delete", function(e) {
		jukebox.reset();
		deleteCachedTrackFile(data[e.index].id);
		db = Titanium.Database.open("OfflineTracks");
		db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
		db.close();
		data.splice(e.index, 1);
	});
	tableView.setData(tableData);
	
	/**
	 * Open the tracks window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}
	
}
