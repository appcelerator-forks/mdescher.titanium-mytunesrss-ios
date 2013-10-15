function TracksWindow(data, currentJukeboxPlaylist) {

	var self = this;
	var myParent;
	var myCurrentJukeboxPlaylist = currentJukeboxPlaylist != undefined ? currentJukeboxPlaylist : false;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

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
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : 42 + (Titanium.Platform.osname === "ipad" ? 12 : 8),
					font : {
						fontSize : 12,
						fontWeight : "bold"
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
					left : Titanium.Platform.osname === "ipad" ? 78 : 52,
					height : Titanium.Platform.osname === "ipad" ? 26 : 18,
					right : Titanium.Platform.osname === "ipad" ? 12 : 8,
					font : {
						fontSize : 12,
						fontWeight : "bold"
					},
					minimumFontSize : 12
				}
			}
		]
	};
	addTextColorToTemplates(template, [1, 2]);
	addTextColorToTemplates(noMoreMenu, [1, 2]);
    addMoreMenuToTemplate(template);

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,top:45,templates:{"default":template,"noMoreMenu":noMoreMenu},defaultItemTemplate:"default"});
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener('click', function() {
		myParent.open(undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tracklist.title"), buttonBack, undefined));
	win.add(listView);
	
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
		    	track : data[i]
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
		win.add(busyView);
        Titanium.API.debug("Idle timer off.");
		Titanium.App.setIdleTimerDisabled(true);
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
            Titanium.API.debug("Idle timer on.");
        	Titanium.App.setIdleTimerDisabled(false);
            win.remove(busyView);
        }
    };

    listView.addEventListener("itemclick", function(e) {
		if (e.bindId === "optionsMenu") {
    		optionsMenu(e);
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
	};

    function optionsMenu(ice) {
        var itemProps = ice.section.getItemAt(ice.itemIndex).properties;
        var buttons = offlineMode ? [L("common.option.localdelete"), L("common.option.cancel")] : [L("common.option.download"), L("common.option.cancel")];
        new MenuView(win, ice.section.getItemAt(ice.itemIndex).main.text, buttons, function(selectedButton) {
        var busyView = createBusyView();
        win.add(busyView);
        Titanium.API.debug("Idle timer off.");
        Titanium.App.setIdleTimerDisabled(true);
        try {
            if (selectedButton === L("common.option.download")) {
                downloadTracksForList(win, [data[ice.itemIndex]], ice.section.getItemAt(ice.itemIndex).main.text, "download.track");
            } else if (selectedButton === L("common.option.localdelete")) {
                deleteLocalTracks(win, [data[ice.itemIndex]], "localdelete.track");
	            myParent.open();
            	win.close();
            }
        } finally {
            Titanium.API.debug("Idle timer on.");
            Titanium.App.setIdleTimerDisabled(false);
            win.remove(busyView);
        }
        }).show();
    }
	
}
