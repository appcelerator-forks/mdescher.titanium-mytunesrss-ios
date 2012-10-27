function ArtistsWindow(data) {
	
	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:'title',top:45});
	var buttonBack = GUI.createButton({title:L("artists.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("artists.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
	    if (!offlineMode) {
	    	loadAndDisplayAlbums(self, e.rowData.albumsUri);
	    } else {
	    	loadAndDisplayOfflineAlbums(self, e.rowData.artistName, undefined);
	    }
	    win.remove(busyView);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var displayName = getDisplayName(item.name);
	            var row = GUI.createTableViewRow({rightImage:"images/children.png",height:48,className:'artist_row',height:TABLE_VIEW_ROW_HEIGHT,selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
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
