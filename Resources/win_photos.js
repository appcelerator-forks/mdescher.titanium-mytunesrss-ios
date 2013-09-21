function PhotosWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var templateIphone = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic0",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 55, y : 55 },
					top : 5,
					bottom : 5,
					left : 5,
					right : 215
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic1",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 160, y : 55 },
					top : 5,
					bottom : 5,
					left : 110,
					right : 110
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic2",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 265, y : 55 },
					top : 5,
					bottom : 5,
					left : 215,
					right : 5
				}
			}
		]
	};
	var templateIpad = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic0",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 86, y : 85 },
					top : 21,
					bottom : 21,
					left : 22,
					right : 618
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic1",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 235, y : 85 },
					top : 21,
					bottom : 21,
					left : 171,
					right : 469
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic2",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 384, y : 85 },
					top : 21,
					bottom : 21,
					left : 320,
					right : 320
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic3",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 533, y : 85 },
					top : 21,
					bottom : 21,
					left : 469,
					right : 171
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic4",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					center : { x : 682, y : 85 },
					top : 21,
					bottom : 21,
					left : 618,
					right : 22
				}
			},
		]
	};

	var ipad = Titanium.Platform.osname === "ipad";
	var listView = GUI.createListView(tryGetAdSpacingStyle({separatorColor:DARK_GRAY,top:45,templates:{"default":ipad ? templateIpad : templateIphone},defaultItemTemplate:"default",rowHeight:ipad ? 170 : 110}));
	var buttonBack = GUI.createButton({title:L("photos.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener("click", function() {
		myParent.open(undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("photos.title"), buttonBack, undefined));
	win.add(listView);
	tryAddAd(win);
	
    var lastDate = "";
    var listSections = [];
	for (var i = 0; i < data.length; i++) {
		var currDate = toDisplayDate(data[i].date);
		if (currDate != lastDate) {
			listSections.push(Titanium.UI.createListSection({headerTitle:currDate}));
			lastDate = currDate;
		}
		var urls = [undefined, undefined, undefined, undefined, undefined];
		var rowFirstIndex = i;
		for (var k = 0; i < data.length && toDisplayDate(data[i].date) == currDate && k < (ipad ? 5 : 3); k++) {
			urls[k] = data[i].thumbnailImageUri;
			i++;
		}
	    var item = {
		    pic0 : {
			    image : urls[0]
		    },
		    pic1 : {
			    image : urls[1]
		    },
		    pic2 : {
			    image : urls[2]
		    },
		    pic3 : {
			    image : urls[3]
		    },
		    pic4 : {
			    image : urls[4]
		    },
		    properties : {
		    	picIndex : rowFirstIndex,
		    	selectionStyle : Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE
		    }
	    };
        listSections[listSections.length - 1].appendItems([item]);
	}
	listView.setSections(listSections);

    listView.addEventListener("itemclick", function(e) {
        var itemProps = e.section.getItemAt(e.itemIndex).properties;
        if (e.bindId != undefined && e.bindId.length === 4 && e.bindId.substr(0, 3) === "pic") {
	    	new PhotoWindow(data, itemProps.picIndex + parseInt(e.bindId.substr(3, 1))).open(self);
        }
    });
	
	/**
	 * Open the photos window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};
	
}
