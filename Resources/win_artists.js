function ArtistsWindow(data) {
	
	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	
	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 10,
					font : {
						fontSize : 20,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			}
		]
	};

	var listView = GUI.createListView(tryGetAdSpacingStyle({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:"default"}));
	var buttonBack = GUI.createButton({title:L("artists.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("artists.title"), buttonBack, undefined));
	win.add(listView);
	tryAddAd(win);
	
	listView.addEventListener('itemclick', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
		Titanium.App.setIdleTimerDisabled(true);
        try {
            var itemProps = e.section.getItemAt(e.itemIndex).properties;
	        if (!offlineMode) {
	        	loadAndDisplayAlbums(self, itemProps.albumsUri);
	        } else {
	        	loadAndDisplayOfflineAlbums(self, itemProps.artistName, undefined);
	        }
        } finally {
        	Titanium.App.setIdleTimerDisabled(false);
	        win.remove(busyView);
        }
	});
	
	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
	        		properties : {
	        			albumsUri : item.albumsUri;
						artistName : item.name;
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the artists window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}

}
