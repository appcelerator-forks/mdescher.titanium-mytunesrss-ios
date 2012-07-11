function ArtistsWindow() {
	
	var win = Titanium.UI.createWindow();
	win.setBackgroundGradient(WINDOW_BG);
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}), filterAttribute:'title',top:45});
	var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
	    win.close();
	});
	
	addTopToolbar(win, 'Artists', buttonBack, undefined);
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
	    loadAndDisplayAlbums(e.rowData.albumsUri);
	});
	
	/**
	 * Remove preveiously loaded data from the view.
	 */
	this.clearData = function() {
		tableView.setData([]);
	}

	/**
	 * Load data into the albums window structure.
	 */
	this.loadData = function(data) {
		setTableDataAndIndex(
		        tableView,
		        data,
		        function(item, index) {
		            var displayName = getDisplayName(item.name);
		            var row = Titanium.UI.createTableViewRow({title:displayName,color:'transparent',hasChild:true,height:48,className:'artist_row',height:TABLE_VIEW_ROW_HEIGHT});
		            row.add(Titanium.UI.createLabel({text:displayName,left:10,height:24,right:10,font:{fontSize:20,fontWeight:'bold'},minimumFontSize:12}));
		            row.albumsUri = item.albumsUri;
		            return row;
		        },
		        function(item) {
		            return item.name;
		        });
	}
	
	/**
	 * Open the artists window. 
	 */
	this.open = function() {
		win.open();
	}
	
	/**
	 * Close the artists window.
	 */
	this.close = function() {
		win.close();
	}

}
