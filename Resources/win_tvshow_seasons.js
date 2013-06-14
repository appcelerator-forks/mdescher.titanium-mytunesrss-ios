function TvShowSeasonsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var tableView = GUI.createTableView(tryGetAdSpacingStyle({top:45}));
	var buttonBack = GUI.createButton({title:L("tvshow.seasons.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tvshow.seasons.title"), buttonBack, undefined));
	win.add(tableView);
	tryAddAd(win);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
		Titanium.App.setIdleTimerDisabled(true);
        try {
    	    loadAndDisplayTracks(self, e.rowData.episodesUri);
        } finally {
        	Titanium.App.setIdleTimerDisabled(false);
	        win.remove(busyView);
        }
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var row = GUI.createMediaItemRow(item.imageUri != undefined);
	            if (item.imageUri != undefined) {
	                row.add(GUI.createMediaItemImage(item.imageHash, item.imageUri));
	            }
	            row.add(GUI.createMediaItemLabel("Season " + item.name));
	            row.add(GUI.createMediaItemSubLabel(String.format(L("tvshow.seasons.info"), item.episodeCount)));
	            row.episodesUri = item.episodesUri;
	            return row;
	        },
	        function(item) {
	            return String.format(L("tvshow.seasons.itemName"), item.name);
	        });

	/**
	 * Open the tv show seasons window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}

}
