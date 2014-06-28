// TODO:
// - display slider for volume and playback time
// - display playback state (playing/paused)
// - add controls for play, pause, stop, rewind, forward
// - add actions for volume and playback time changes
// - add button for media renderer selection

function RemoteControlWindow(playlistVersion, data) {

	var myPlaylistVersion = playlistVersion;
	var self = this;
	var myParent;

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

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,top:45,templates:{"default":template},defaultItemTemplate:"default"});
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener("click", function() {
		myParent.open(undefined);
	    win.close();
	});
	
	mediaControlsView.add(GUI.createTopToolbar(L("remotecontrol.title"), buttonBack, undefined));
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
        listSection.appendItems([item]);
	}

	function playTrack(trackIndex) {
		restCall("POST", getLibrary().mediaPlayerUri, {action:"PLAY",track:trackIndex});
	}

    listView.addEventListener("itemclick", function(e) {
		if (suppressItemClick) {
			suppressItemClick = false;
		} else {
            playTrack(e.itemIndex);
        }
    });
    
    var currentTrackIndex;
    var currentTrackData;
    
    function refresh() {
    	var response = restCall("GET", getLibrary().mediaPlayerUri, {});
	    if (response.status / 100 === 2) {
	        if (myPlaylistVersion != response.result.playlistVersion) {
	        	reloadPlaylist();
	        }
	        // mark current track
	        if (currentTrackIndex != response.result.currentTrack) {
	        	if (currentTrackIndex != undefined) {
	        		currentTrackData.main.setBackgroundColor('#FFFFFF');
	        		listView.replaceItem(currentTrackIndex, 1, currentTrackData);
	        	}
	        	currentTrackIndex = response.result.currentTrack;
	        	currentTrackData = listView.getSections()[0].getItemAt(response.result.currentTrack); 
	        	currentTrackData.main.setBackgroundColor('#CCCC00');
	        	listView.replaceItem(currentTrackIndex, 1, currentTrackData);
	        }
	        // mark current playback state and show current time and volume
	        response.result.playing;
	        response.result.length;
	        response.result.currentTime;
	        response.result.volume;
	        // display current media renderer
	        response.result.mediaRenderer;
	    //} else {
		//    showError({message:response.result,buttonNames:['Ok']});
	    }
		setTimeout(refresh, 1000);
    }
	
	/**
	 * Open the remote control window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
		setTimeout(refresh, 1000);
	};
	
}
