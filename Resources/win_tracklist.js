function TracksWindow(data, parent) {

	var self = this;
	var myParent = parent;

	var win = createWindow();

	var tableView = Titanium.UI.createTableView({top:45});
	var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonSync = Titanium.UI.createButton({title:'Sync',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open(myParent === jukebox ? self : undefined);
	    win.close();
	});
	
	buttonSync.addEventListener("click", function() {
	    new SyncWindow(data).open(self);
	});
	
	addTopToolbar(win, 'Tracks', buttonBack, buttonSync);

	win.add(tableView);
	
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
	    var row = Titanium.UI.createTableViewRow({hasChild:true,height:size + (2 * spacer),className:'track_row',index:i,backgroundColor:(getCachedTrackFile(data[i].id) === undefined ? TRACKROW_BG_REMOTE : TRACKROW_BG_LOCAL),selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
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
    	var busyView = createBusyView();
		win.add(busyView);
        if (data[e.index].mediaType === 'Video') {
            jukebox.destroy();
            jukebox = new Jukebox();
            var url = data[e.index].httpLiveStreamUri !== undefined ? data[e.index].httpLiveStreamUri : data[e.index].playbackUri;
            var tcParam = getTcParam();
            if (tcParam !== undefined) {
                url += '/' + tcParam;
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
	
	/**
	 * Open the tracks window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		for (var i = 0; i < tableView.data[0].rows.length; i++) {
			tableView.data[0].rows[i].backgroundColor=(getCachedTrackFile(data[i].id) === undefined ? TRACKROW_BG_REMOTE : TRACKROW_BG_LOCAL)
		}
		win.open();
	}
	
}
