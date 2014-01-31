function TvShowsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);

	var padding = isIos7() ? 8 : 4;

	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : padding,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : padding,
					left : Titanium.Platform.osname === "ipad" ? 6 : padding,
					right : Titanium.Platform.osname === "ipad" ? 691 : (isIos7() ? 274 : 270),
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : padding,
					left : Titanium.Platform.osname === "ipad" ? 78 : (isIos7() ? 56 : 52),
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : Titanium.Platform.osname === "ipad" ? 6 : padding,
					font : {
						fontSize : 16,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "sub",
				properties : {
					bottom : Titanium.Platform.osname === "ipad" ? 6 : padding,
					left : Titanium.Platform.osname === "ipad" ? 78 : (isIos7() ? 56 : 52),
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : Titanium.Platform.osname === "ipad" ? 6 : padding,
					font : {
						fontSize : 12,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [1, 2]);

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("tvshows.title"), buttonBack, undefined));
	mediaControlsView.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
            var itemProps = e.section.getItemAt(e.itemIndex).properties;
    	    loadAndDisplayTvShowSeasons(self, itemProps.seasonsUri);
        } finally {
        	enableIdleTimer();
    	    mediaControlsView.remove(busyView);
        }
	});
	
	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		pic : {
	        			image : item.imageHash != undefined ? "http://localhost:" + HTTP_SERVER_PORT + "/image/" + item.imageHash + "_" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64) + "/" + encodeURIComponent(item.imageUri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64)) : "appicon.png",
	        		},
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
	        		sub : {
	        			text : String.format(L("tvshows.info"), item.seasonCount, item.episodeCount)
	        		},
	        		properties : {
	        			seasonsUri : item.seasonsUri
	        		}
	        	};
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
		mediaControlsView.becomeFirstResponder();
	};

}
