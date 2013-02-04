function ArtistsWindow(data) {
	
	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:"filter",top:45});
	var buttonBack = GUI.createButton({title:L("artists.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("artists.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        if (!offlineMode) {
	        	loadAndDisplayAlbums(self, e.rowData.albumsUri);
	        } else {
	        	loadAndDisplayOfflineAlbums(self, e.rowData.artistName, undefined);
	        }
        } finally {
	        win.remove(busyView);
        }
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var displayName = getDisplayName(item.name);
	            var row = GUI.createTableViewRow({rightImage:"images/children.png",height:48,className:'artist_row',height:TABLE_VIEW_ROW_HEIGHT,selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,filter:displayName});
	            row.add(GUI.createLabel({text:displayName,left:10,height:24,right:10,font:{fontSize:20,fontWeight:'bold'}}));
	            row.albumsUri = item.albumsUri;
	            row.artistName = item.name;
	            return row;
	        },
	        function(item) {
	            return item.name;
	        });
	
	/**
	 * Open the artists window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
