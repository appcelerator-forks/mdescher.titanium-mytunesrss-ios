function TracksWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow();
	win.setBackgroundGradient(WINDOW_BG);

	var tableView = Titanium.UI.createTableView({top:45});
	var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	addTopToolbar(win, 'Tracks', buttonBack, undefined);

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
	    var row = Titanium.UI.createTableViewRow({hasChild:true,height:size + (2 * spacer),className:'track_row'});
        if (data[i].imageUri !== undefined) {
            if (hires) {
            	row.add(createCachedImageView({cacheObjectId:data[i].imageHash + "_128",hires:true,image:data[i].imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'}));
            } else {
            	row.add(createCachedImageView({cacheObjectId:data[i].imageHash + "_64",image:data[i].imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'}));
            }
        }
        var trackName = Titanium.UI.createLabel({text:getDisplayName(data[i].name),top:spacer,left:size + (2 * spacer),height:trackHeight,right:2 * spacer,font:{fontSize:14,fontWeight:'bold'},minimumFontSize:10});
        var artistName = Titanium.UI.createLabel({text:getDisplayName(data[i].artist),bottom:spacer,left:size + (2 * spacer),height:artistHeight,font:{fontSize:10}});
	    row.add(trackName);
	    row.add(artistName);
	    tableData.push(row);
	}
	if (tableData.length == 0) {
	    tableView.touchEnabled = false;
	    tableData.push(Titanium.UI.createTableViewRow({height:48,className:'track_row',title:'No supported tracks'}));
	} else {
	    tableView.addEventListener('click', function(e) {
	    	var busyView = createBusyView();
		win.add(busyView);
	        if (data[e.index].mediaType === 'Video') {
	            jukebox.stop();
	            var url = data[e.index].httpLiveStreamUri !== undefined ? data[e.index].httpLiveStreamUri : data[e.index].playbackUri;
	            var tcParam = getTcParam();
	            if (tcParam !== undefined) {
	                url += '/' + tcParam;
	            }
	            new VideoPlayerWindow(url).open(self);
	        } else {
	            jukebox.setPlaylist(data, e.index);
	            jukebox.open(self);
	        }
	        win.remove(busyView);
	    });
	}
	tableView.setData(tableData);
	
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
