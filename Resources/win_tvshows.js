function TvShowsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:'title',top:45});
	var buttonBack = GUI.createButton({title:L("tvshows.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tvshows.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayTvShowSeasons(self, e.rowData.seasonsUri);
	    win.remove(busyView);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var row = GUI.createMediaItemRow(item.imageUri !== undefined);
	            if (item.imageUri !== undefined) {
	                row.add(GUI.createMediaItemImage(item.imageHash, item.imageUri));
	            }
	            row.add(GUI.createMediaItemLabel(getDisplayName(item.name)));
	            row.add(GUI.createMediaItemSubLabel(String.format(L("tvshows.info"), item.seasonCount, item.episodeCount)));
	            row.seasonsUri = item.seasonsUri;
	            return row;
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the tv shows window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
