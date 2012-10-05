function GenresWindow(data) {

	var self = this;
	var myParent;

	var win = GUI.createWindow();
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}), filterAttribute:'title',top:45});
	var buttonBack = Titanium.UI.createButton({title:L("genres.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	addTopToolbar(win, L("genres.title"), buttonBack, undefined);
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
	    if (!offlineMode) {
	    	loadAndDisplayAlbums(self, e.rowData.albumsUri);
	    } else {
	    	loadAndDisplayOfflineAlbums(self, undefined, e.rowData.genreName);
	    }
	    win.remove(busyView);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item) {
	            var displayName = getDisplayName(item.name);
	            var row = GUI.createTableViewRow({hasChild:true,height:48,className:'genre_row',height:TABLE_VIEW_ROW_HEIGHT,selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	            row.add(GUI.createLabel({text:displayName,left:10,height:24,right:10,font:{fontSize:20,fontWeight:'bold'},minimumFontSize:12}));
	            row.albumsUri = item.albumsUri;
	            row.genreName = item.name;
	            return row;
	        },
	        function(item) {
	            return item.name;
	        });
	/**
	 * Open the genres window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}
	
}