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
					minimumFontSize : 10,
					textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT
				}
			}
		]
	};

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:"default"});
	var buttonBack = GUI.createButton({title:L("photoalbums.back")});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("photoalbums.title"), buttonBack, undefined));	
	win.add(listView);
	
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

    var lastYear = -1;
    var listSections = [];
	for (var i = 0; i < data.length; i++) {
		var currYear = new Date(data[i].firstDate).getFullYear();
		if (lastYear < currYear) {
			listSections.push(Titanium.UI.createListSection({headerTitle:"" + currYear}));
		}
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
        listSections[listSections.length - 1].appendItems([item]);
		lastYear = currYear;
	};
	listView.setSections(listSections);

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
