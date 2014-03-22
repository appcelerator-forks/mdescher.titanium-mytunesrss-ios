function TracksWindow(data, currentJukeboxPlaylist) {

	var self = this;
	var myParent;
	var myCurrentJukeboxPlaylist = currentJukeboxPlaylist != undefined ? currentJukeboxPlaylist : false;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);

	var template = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 6 : 4,
					right : Titanium.Platform.osname === "ipad" ? 691 : 270,
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : 42 + (Titanium.Platform.osname === "ipad" ? 12 : 8),
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
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : 42 + (Titanium.Platform.osname === "ipad" ? 12 : 8),
					font : {
						fontSize : 12,
						fontWeight : (isIos7() ? "normal" : "bold")
					},
					minimumFontSize : 12
				}
			}
		]
	};
	var noMoreMenu = {
		childTemplates : [
			{
				type : "Titanium.UI.ImageView",
				bindId : "pic",
				properties : {
					hires : Titanium.Platform.displayCaps.density === "high",
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 6 : 4,
					right : Titanium.Platform.osname === "ipad" ? 691 : 270,
					defaultImage : "appicon.png"					
				}
			},
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					top : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 36 : 24,
					right : Titanium.Platform.osname === "ipad" ? 12 : 8,
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
					bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : Titanium.Platform.osname === "ipad" ? 12 : 8,
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
	addTextColorToTemplates(noMoreMenu, [1, 2]);
    addMoreMenuToTemplate(template, function optionsMenu(item, itemIndex) {
        var itemProps = item.properties;
        var buttons = offlineMode ? [L("common.option.localdelete"), L("common.option.cancel")] : [L("common.option.download"), L("common.option.cancel")];
        new MenuView(win, item.main.text, buttons, function(selectedButton) {
        var busyView = createBusyView();
        mediaControlsView.add(busyView);
        disableIdleTimer();
        try {
            if (selectedButton === L("common.option.download")) {
                downloadTracksForList(win, [data[itemIndex]], item.main.text, "download.track");
            } else if (selectedButton === L("common.option.localdelete")) {
                deleteLocalTracks(win, [data[itemIndex]], "localdelete.track");
	            myParent.open();
            	win.close();
            }
        } finally {
            enableIdleTimer();
            mediaControlsView.remove(busyView);
        }
        }).show();
    });

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,top:45,templates:{"default":template,"noMoreMenu":noMoreMenu},defaultItemTemplate:"default",searchView:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}),caseInsensitiveSearch:true});
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open(undefined);
	    win.close();
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("tracklist.title"), buttonBack, undefined));
	mediaControlsView.add(listView);
	
    var listSection = Titanium.UI.createListSection({});
    listView.setSections([listSection]);
	var tableData = [];
	for (var i = 0; i < data.length; i++) {
	    var item = {
		    pic : {
			    image : data[i].imageHash != undefined ? "http://localhost:" + HTTP_SERVER_PORT + "/image/" + data[i].imageHash + "_" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64) + "/" + encodeURIComponent(data[i].imageUri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64)) : "appicon.png",
		    },
		    main : {
			    text : getDisplayName(data[i].name)
		    },
		    sub : {
			    text : getDisplayName(data[i].artist)
		    },
		    properties : {
		    	track : data[i],
		    	searchableText : data[i].name + " " + data[i].artist
		    }
	    };
        if (!offlineMode && (data[i].mediaType != "Audio" || data[i].protected === true)) {
            item.template = "noMoreMenu";
        }
        listSection.appendItems([item]);
	}

    function playTrack(trackIndex) {
    	if (jukebox.isIos61BugPhase()) {
    		return;
    	}
    	var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
            if (data[trackIndex].mediaType === "Video") {
                jukebox.reset();
                var url = data[trackIndex].httpLiveStreamUri != undefined ? data[trackIndex].httpLiveStreamUri : data[trackIndex].playbackUri;
                var tcParam = getTcParam();
                if (tcParam != undefined) {
                    url += "/" + tcParam;
                }
                new VideoPlayerWindow(url).open(self);
            } else {
                jukebox.setPlaylist(data, trackIndex, false, false);
		        jukebox.open(myCurrentJukeboxPlaylist === true ? undefined : self);
		        if (myCurrentJukeboxPlaylist === true) {
		        	win.close();
		        }
            }
        } finally {
        	enableIdleTimer();
            mediaControlsView.remove(busyView);
        }
    };

    listView.addEventListener("itemclick", function(e) {
		if (suppressItemClick) {
			suppressItemClick = false;
		} else {
            playTrack(e.itemIndex);
        }
    });
	
	/**
	 * Open the tracks window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
	};
	
}
