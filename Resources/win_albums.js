function AlbumsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var tableView = GUI.createTableView(getAdSpacingStyleIfOnline({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45}));
	var buttonBack = GUI.createButton({title:L("albums.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("albums.title"), buttonBack, undefined));
	win.add(tableView);
	addIAddIfOnline(win);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		Titanium.App.setIdleTimerDisabled(true);
		win.add(busyView);
        try {
		    if (!offlineMode) {
		        loadAndDisplayTracks(self, e.rowData.tracksUri);
		    } else {
			    loadAndDisplayOfflineTracks(self, e.rowData.albumName, e.rowData.albumArtist);
		    }
        } finally {
        	Titanium.App.setIdleTimerDisabled(false);
    	    win.remove(busyView);
        }
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var row = GUI.createMediaItemRow(item.imageUri != undefined, getDisplayName(item.name));
	            if (item.imageUri != undefined) {
	                row.add(GUI.createMediaItemImage(item.imageHash, item.imageUri));
	            }
	            row.add(GUI.createMediaItemLabel(getDisplayName(item.name)));
	            row.add(GUI.createMediaItemSubLabel(getDisplayName(item.artist)));
	            row.tracksUri = item.tracksUri;
	            row.albumName = item.name;
	            row.albumArtist = item.artist;
	            return row;
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the albums window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}

}
