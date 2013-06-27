function PhotoAlbumsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : 10,
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : 50,
					font : {
						fontSize : 16,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "sub",
				properties : {
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : 10,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : 50,
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "count",
				properties : {
					width : 30,
					height : 24,
					right : 10,
					font : {
						fontSize : 14,
					},
					color : "#CCCCCC",
					minimumFontSize : 10,
					textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT
				}
			}
		]
	};

	var listView = GUI.createListView(tryGetAdSpacingStyle({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:"default"}));
	var buttonBack = GUI.createButton({title:L("photoalbums.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("photoalbums.title"), buttonBack, undefined));	
	win.add(listView);
	tryAddAd(win);

    listView.addEventListener("itemclick", function(e) {
    	var itemProps = e.section.getItemAt(e.itemIndex).properties;
        var busyView = createBusyView();
        win.add(busyView);
        Titanium.App.setIdleTimerDisabled(true);
        try {
            loadAndDisplayPhotos(self, itemProps.photosUri);
        } finally {
            Titanium.App.setIdleTimerDisabled(false);
            win.remove(busyView);
        }
    });

    var listSection = Titanium.UI.createListSection({});
    listView.setSections([listSection]);
	var tableData = [];
	for (var i = 0; i < data.length; i++) {
        var dateText = toDisplayDate(data[i].firstDate);
        if (data[i].firstDate != data[i].lastDate) {
            dateText += " - " + toDisplayDate(data[i].lastDate);
        }
	    var item = {
    		main : {
    			text : data[i].name
    		},
    		count : {
    			text : data[i].photoCount
    		},
    		sub : {
                text : dateText
    		},
    		properties : {
    			photosUri : data[i].photosUri
    		}
	    };
        listSection.appendItems([item]);
	}

	/*setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
                var dateText = toDisplayDate(item.firstDate);
                if (item.firstDate != item.lastDate) {
                    dateText += " - " + toDisplayDate(item.lastDate);
                }
	        	return {
	        		main : {
	        			text : item.name
	        		},
	        		count : {
	        			text : item.photoCount
	        		},
	        		sub : {
                        text : dateText
	        		},
	        		properties : {
	        			photosUri : item.photosUri
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
	        });*/
		
	/**
	 * Open the photo albums window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};

}
