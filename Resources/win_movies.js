function MoviesWindow(data) {

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
					left : Titanium.Platform.osname === "ipad" ? 78 : (isIos7() ? 56 : 52),
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : Titanium.Platform.osname === "ipad" ? 6 : padding,
					font : {
						fontSize : 16,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [1]);

	var listView = createCommonListView(template);
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("movies.title"), buttonBack, undefined));
	mediaControlsView.add(listView);
	
	listView.addEventListener("itemclick", function(e) {
		if (jukebox.isIos61BugPhase()) {
			return;
		}
        jukebox.reset();
        var itemProps = e.section.getItemAt(e.itemIndex).properties;
        var url = itemProps.playbackUri;
        var tcParam = getTcParam();
        if (tcParam != undefined) {
            url += '/' + tcParam;
        }
        new VideoPlayerWindow(url).open(self);
	});
	
	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		pic : {
	        			image : item.imageHash != undefined ?"http://localhost:" + HTTP_SERVER_PORT + "/image/" + item.imageHash + "_" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64) + "/" + encodeURIComponent(item.imageUri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64)) : "appicon.png",
	        		},
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
	        		properties : {
	        			playbackUri : (item.httpLiveStreamUri != undefined ? item.httpLiveStreamUri : item.playbackUri)
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
