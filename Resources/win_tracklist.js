function TracksWindow(data, parent) {

	var self = this;
	var myParent = parent;

	var win = GUI.createWindow({});

	var tableView = GUI.createTableView({top:45});
	var buttonBack = GUI.createButton({title:L("tracklist.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open(myParent === jukebox ? self : undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tracklist.title"), buttonBack, undefined));

	win.add(tableView);
	
	var tableData = new RowArray();
	for (var i = 0; i < data.length; i++) {
		var trackHeight = 20;
		var artistHeight = 15;
		var spacer = 4;
		var size = 40;
		var hires = false;
		if (Titanium.Platform.osname === "ipad") {
			size = 30;
			trackHeight = 18;
			artistHeight = 13;
			spacer = 6;
		} else if (Titanium.Platform.osname === "iphone") {
			hires = Titanium.Platform.displayCaps.density == "high";
		}
	    var row = GUI.createTableViewRow({height:size + (2 * spacer),className:'track_row',index:i,selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	    var infoView = Titanium.UI.createView({right:30});
	    row.add(infoView);
        if (data[i].imageUri !== undefined) {
            if (hires) {
            	infoView.add(createCachedImageView({cacheObjectId:data[i].imageHash + "_128",hires:true,image:data[i].imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'}));
            } else {
            	infoView.add(createCachedImageView({cacheObjectId:data[i].imageHash + "_64",image:data[i].imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'}));
            }
        }
        var trackName = GUI.createLabel({text:getDisplayName(data[i].name),top:spacer,left:size + (3 * spacer),height:trackHeight,right:2 * spacer,font:{fontSize:14,fontWeight:'bold'},minimumFontSize:10,touchEnabled:false});
        var artistName = GUI.createLabel({text:getDisplayName(data[i].artist),bottom:spacer,left:size + (3 * spacer),height:artistHeight,font:{fontSize:10},touchEnabled:false});
	    infoView.add(trackName);
	    infoView.add(artistName);
	    infoView.addEventListener("click", function(e) {
	    	var busyView = createBusyView();
			win.add(busyView);
	        if (data[e.index].mediaType === "Video") {
	            jukebox.destroy();
	            jukebox = new Jukebox();
	            var url = data[e.index].httpLiveStreamUri !== undefined ? data[e.index].httpLiveStreamUri : data[e.index].playbackUri;
	            var tcParam = getTcParam();
	            if (tcParam !== undefined) {
	                url += "/" + tcParam;
	            }
	            new VideoPlayerWindow(url).open(self);
	        } else {
	            jukebox.setPlaylist(data, e.index);
	            if (myParent === jukebox) {
			        jukebox.open(self);
	            } else {
			        jukebox.open(undefined, self);
	            }
	        }
	        win.remove(busyView);
	    });

	    syncImage = offlineMode || getCachedTrackFile(data[i].id) !== undefined ? "images/trash.png" : "images/download.png";
	    var syncImageGlowView = GUI.createGlow({right:15});
	    var syncImageView = Titanium.UI.createImageView({hires:hires,image:syncImage,width:20,height:20,right:5,glow:syncImageGlowView});
	    syncImageView.addEventListener("touchstart", function(e) {
	    	e.source.glow.setOpacity(0.75);
	    });
  	    syncImageView.addEventListener("touchend", function(e) {
	    	e.source.glow.setOpacity(0);
	    });
  	    syncImageView.addEventListener("touchcancel", function(e) {
	    	e.source.glow.setOpacity(0);
	    });
	    syncImageView.addEventListener("click", function(e) {
	    	if (offlineMode || getCachedTrackFile(data[e.index].id) !== undefined) {
	    		deleteCachedTrackFile(data[e.index].id);
	    		db = Titanium.Database.open("OfflineTracks");
				db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
				db.close();
	    		if (offlineMode) {
					jukebox.destroy();
				    jukebox = new Jukebox();
		    		tableView.deleteRow(e.index);
		    		data.splice(e.index, 1);
	    		} else {
		    		tableView.data[0].rows[e.index].getChildren()[1].image = "images/download.png";
	    		}
	    	} else {
				var url = data[e.index].playbackUri;
				var tcParam = getTcParam();
	    		if (tcParam !== undefined) {
	        		url += '/' + tcParam;
	    		}
	    		var busyView = createBusyView();
	    		win.add(busyView);
				getCachedTrackFile(data[e.index].id, url);
				downloadImage(data[e.index].imageHash,data[e.index].imageUri);
	    		db = Titanium.Database.open("OfflineTracks");
				db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
				db.execute(
					"INSERT INTO track (id, name, album, artist, genre, album_artist, image_hash, protected, media_type, time, track_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
					data[e.index].trackNumber
				);
				db.close();
				tableView.data[0].rows[e.index].getChildren()[1].image = "images/trash.png";
				win.remove(busyView);		    				
	    	}
	    });
	    row.add(syncImageView);
	    row.add(syncImageGlowView);
	    tableData.push(row);
	}
	tableView.setData(tableData.getRows());
	
	/**
	 * Open the tracks window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}
	
}
