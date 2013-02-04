function MoviesWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:"filter",top:45});
	var buttonBack = GUI.createButton({title:L("movies.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("movies.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	tableView.addEventListener('click', function(e) {
        jukebox.reset();
        var url = e.rowData.playbackUri;
        var tcParam = getTcParam();
        if (tcParam !== undefined) {
            url += '/' + tcParam;
        }
        new VideoPlayerWindow(url).open(self);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var row = GUI.createMediaItemRow(item.imageUri !== undefined, getDisplayName(item.name));
	            if (item.imageUri !== undefined) {
	                row.add(GUI.createMediaItemImage(item.imageHash, item.imageUri));
	            }
	            row.add(GUI.createMediaItemLabel(getDisplayName(item.name)));
	            row.playbackUri = item.httpLiveStreamUri !== undefined ? item.httpLiveStreamUri : item.playbackUri;
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
