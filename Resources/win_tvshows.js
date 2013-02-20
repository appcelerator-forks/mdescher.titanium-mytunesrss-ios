function TvShowsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var tableView = GUI.createTableView(getAdSpacingStyleIfOnline({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:"filter",top:45}));
	var buttonBack = GUI.createButton({title:L("tvshows.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tvshows.title"), buttonBack, undefined));
	win.add(tableView);
	addIAddIfOnline(win);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
        try {
    	    loadAndDisplayTvShowSeasons(self, e.rowData.seasonsUri);
        } finally {
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
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}

}
