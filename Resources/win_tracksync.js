function SyncWindow(data) {

	var self = this;
	var myParent;

	var win = createWindow();

	var tableView = Titanium.UI.createTableView({top:45});
	var buttonDone = Titanium.UI.createButton({title:'Done',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonDone.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	addTopToolbar(win, 'Sync', undefined, buttonDone);

	win.add(tableView);
	
	function setRowColorLocal(i) {
		tableView.data[0].rows[i].backgroundColor = TRACKROW_BG_LOCAL;
	}

	function setRowColorRemote(i) {
		tableView.data[0].rows[i].backgroundColor = TRACKROW_BG_REMOTE;
	}
	
	var swipeListener = function(e) {
    	if (e.direction === "right") {
    		if (getCachedTrackFile(data[e.source.index].id) === undefined) {
	    		syncButton = Titanium.UI.createButton({title:"Download",right:10,style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,parent:e.source});
	    		syncButton.addEventListener("click", function() {
    				var url = data[e.source.index].playbackUri;
    				var tcParam = getTcParam();
            		if (tcParam !== undefined) {
                		url += '/' + tcParam;
            		}
            		var busyView = createBusyView();
            		win.add(busyView);
    				getCachedTrackFile(data[e.source.index].id, url);
    				setRowColorLocal(e.source.index);
    				win.remove(busyView);		    				
			    	syncButton.parent.remove(syncButton);
			    	tableView.fireEvent("normalmode");
	    		});
	    	} else {
	    		syncButton = Titanium.UI.createButton({title:"Remove",right:10,style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,parent:e.source});
	    		syncButton.addEventListener("click", function() {
    				deleteCachedTrackFile(data[e.source.index].id);
					setRowColorRemote(e.source.index);
			    	syncButton.parent.remove(syncButton);
			    	tableView.fireEvent("normalmode");
	    		});
	    	}
	    	e.source.add(syncButton);
	    	tableView.fireEvent("syncmode");
	    }
    }

	var tableData = [];
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
	    var row = Titanium.UI.createTableViewRow({height:size + (2 * spacer),className:'track_row',index:i,backgroundColor:(offlineMode || getCachedTrackFile(data[i].id) === undefined ? TRACKROW_BG_REMOTE : TRACKROW_BG_LOCAL),selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
        if (data[i].imageUri !== undefined) {
            if (hires) {
            	row.add(createCachedImageView({cacheObjectId:data[i].imageHash + "_128",hires:true,image:data[i].imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'}));
            } else {
            	row.add(createCachedImageView({cacheObjectId:data[i].imageHash + "_64",image:data[i].imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'}));
            }
        }
        var trackName = Titanium.UI.createLabel({text:getDisplayName(data[i].name),top:spacer,left:size + (2 * spacer),height:trackHeight,right:2 * spacer,font:{fontSize:14,fontWeight:'bold'},minimumFontSize:10,touchEnabled:false});
        var artistName = Titanium.UI.createLabel({text:getDisplayName(data[i].artist),bottom:spacer,left:size + (2 * spacer),height:artistHeight,font:{fontSize:10},touchEnabled:false});
	    row.add(trackName);
	    row.add(artistName);
	    tableData.push(row);
	}
	tableView.setData(tableData);
    tableView.addEventListener("click", function(e) {
    	if (offlineMode || getCachedTrackFile(data[e.index].id) !== undefined) {
    		deleteCachedTrackFile(data[e.index].id);
    		db = Titanium.Database.open("OfflineTracks");
			db.execute("DELETE FROM track WHERE id = ?", data[e.index].id);
			db.close();
    		if (offlineMode) {
				jukebox.destroy();
			    jukebox = new Jukebox();
	    		tableView.deleteRow(e.index);
	    		// do not splice data since it reference the same as the tracklist which removes it in the following call
	    		myParent.deleteRow(e.index);
    		} else {
	    		tableView.data[0].rows[e.index].backgroundColor = TRACKROW_BG_REMOTE;
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
			tableView.data[0].rows[e.index].backgroundColor = TRACKROW_BG_LOCAL;
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
			win.remove(busyView);		    				
    	}
    });
	
	/**
	 * Open the sync window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}
	
}
