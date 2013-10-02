function TracksWindow(data, currentJukeboxPlaylist) {

	var self = this;
	var myParent;
	var myCurrentJukeboxPlaylist = currentJukeboxPlaylist != undefined ? currentJukeboxPlaylist : false;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 6 : 4,
					right : Titanium.Platform.osname === "ipad" ? 691 : 270,
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : Titanium.Platform.osname === "ipad" ? 12 : 8,
					font : {
						fontSize : 16,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "sub",
				properties : {
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			}
		]
	};
	var templateOnlineAudio = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 6 : 4,
					right : Titanium.Platform.osname === "ipad" ? 691 : 270,
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : 40,
					font : {
						fontSize : 16,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "sub",
				properties : {
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
                    right : 40,
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Button",
				bindId : "syncIcon",
				properties : {
					width : 20,
                    right : 10,
                    touchEnabled : false
				}
			}
		]
	};

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,top:45,templates:{"default":template,"onlineAudio":templateOnlineAudio},defaultItemTemplate:"default"});
	var buttonBack = GUI.createButton({title:L("tracklist.back")});
	
	buttonBack.addEventListener('click', function() {
		myParent.open(undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tracklist.title"), buttonBack, undefined));
	win.add(listView);
	
    var listSection = Titanium.UI.createListSection({});
    listView.setSections([listSection]);
	var tableData = [];
	for (var i = 0; i < data.length; i++) {
	    var item = {
		    pic : {
			    image : data[i].imageHash != undefined ? "http://localhost:" + HTTP_SERVER_PORT + "/image/" + data[i].imageHash + "_" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64) + "/" + encodeURIComponent(data[i].imageUri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64)) : "appicon.png",
		    },
		    main : {
			    text : getDisplayName(data[i].name)
		    },
		    sub : {
			    text : getDisplayName(data[i].artist)
		    },
		    syncIcon : {
		    	image : getCachedTrackFile(data[i].id) === undefined ? "ios7/images/download.png" : "ios7/images/delete.png"
		    }
	    };
        if (!offlineMode && data[i].mediaType === "Audio") {
            item.template = "onlineAudio";
        }
        listSection.appendItems([item]);
	}

    /* sweep delete 
	tableView.addEventListener("delete", function(e) {
		jukebox.reset();
		deleteCachedTrackFile(data[e.index].id);
		db = Titanium.Database.open("OfflineTracks");
		db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
		db.close();
		data.splice(e.index, 1);
	});
    */

    function syncTrack(section, trackIndex) {
    	if (getCachedTrackFile(data[trackIndex].id) != undefined) {
    		deleteCachedTrackFile(data[trackIndex].id);
    		db = Titanium.Database.open("OfflineTracks");
			db.execute("DELETE FROM track WHERE id = ?", data[trackIndex].id);
			db.close();
			var item = section.getItemAt(trackIndex);
			item.syncIcon.image = "ios7/images/download.png";
			section.updateItemAt(trackIndex, item);
			Titanium.Analytics.featureEvent("sync.deleteTrack");
    	} else {
			var url = data[trackIndex].playbackUri;
			var plainUrl = url;
			var tcParam = getTcParam();
    		if (tcParam != undefined) {
        		url += '/' + tcParam;
    		}
    		var busyWindow = new BusyWindow(L("tracklist.busy.downloading"), data[trackIndex].name);
    		busyWindow.open();
    		Titanium.App.setIdleTimerDisabled(true);
			cacheTrack(data[trackIndex].id, plainUrl, url, function(e) {busyWindow.setProgress(e);return true;}, function(e) {
				if (e.aborted == undefined) {
		    		db = Titanium.Database.open("OfflineTracks");
					db.execute("DELETE FROM track WHERE id = ?", data[trackIndex].id);
					db.execute(
						"INSERT INTO track (id, name, album, artist, genre, album_artist, image_hash, protected, media_type, time, disc_number, track_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
						data[trackIndex].id,
						data[trackIndex].name,
						data[trackIndex].album,
						data[trackIndex].artist,
						data[trackIndex].genre,
						data[trackIndex].albumArtist,
						data[trackIndex].imageHash,
						data[trackIndex].protected,
						data[trackIndex].mediaType,
						data[trackIndex].time,
						data[trackIndex].discNumber,
						data[trackIndex].trackNumber
					);
					db.close();
					var item = section.getItemAt(trackIndex);
					item.syncIcon.image = "ios7/images/delete.png";
					section.updateItemAt(trackIndex, item);
					Titanium.Analytics.featureEvent("sync.downloadTrack");
				}
				Titanium.App.setIdleTimerDisabled(false);
				busyWindow.close();		    				
			});
			downloadImage(data[trackIndex].imageHash,data[trackIndex].imageUri);
    	}
    };

    function playTrack(trackIndex) {
    	var busyView = createBusyView();
		win.add(busyView);
		Titanium.App.setIdleTimerDisabled(true);
        try {
            if (data[trackIndex].mediaType === "Video") {
                jukebox.reset();
                var url = data[trackIndex].httpLiveStreamUri != undefined ? data[trackIndex].httpLiveStreamUri : data[trackIndex].playbackUri;
                var tcParam = getTcParam();
                if (tcParam != undefined) {
                    url += "/" + tcParam;
                }
                new VideoPlayerWindow(url).open(self);
            } else {
                jukebox.setPlaylist(data, trackIndex);
		        jukebox.open(myCurrentJukeboxPlaylist === true ? undefined : self);
		        if (myCurrentJukeboxPlaylist === true) {
		        	win.close();
		        }
            }
        } finally {
        	Titanium.App.setIdleTimerDisabled(false);
            win.remove(busyView);
        }
    };

    listView.addEventListener("itemclick", function(e) {
        if (e.bindId === "syncIcon") {
            syncTrack(e.section, e.itemIndex);
        } else {
            playTrack(e.itemIndex);
        }
    });
	
	/**
	 * Open the tracks window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};
	
}
