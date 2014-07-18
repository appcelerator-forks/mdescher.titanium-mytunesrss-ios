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
	var currentPlayingTemplate = {
		childTemplates : [
			{
				type : "Titanium.UI.View",
				bindId : "background",
				properties : {
					top : 0,
					bottom : 0,
					left : 0,
					right : 0,
					backgroundColor : "#FFCCCC"
				}
			},
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

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,top:45,bottom:100,templates:{"default":template,"nowPlaying":currentPlayingTemplate},defaultItemTemplate:"default"});
	var buttonBack = createCommonBackButton();
	
	buttonBack.addEventListener("click", function() {
		myParent.open(undefined);
	    win.close();
	});
	var buttonSettings = GUI.createButton({image:"images/config.png"});
	if (!isIos7()) {
		buttonSettings.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
    buttonSettings.addEventListener("click", function() {
        // TODO open settings window (volume control, renderer selection, maybe option to clear playlist)
    });
	
	mediaControlsView.add(GUI.createTopToolbar(L("remotecontrol.title"), buttonBack, buttonSettings));
	mediaControlsView.add(listView);

	createListView(data);	

	var draggingSlider = false;
    var progressBar = Titanium.UI.createSlider(STYLE.get("jukeboxProgressSlider", {min:0,max:0,value:0}));
    progressBar.addEventListener("start", function(e) {
    	draggingSlider = true;
    });
    progressBar.addEventListener("stop", function(e) {
    	restCall("POST", getLibrary().mediaPlayerUri, {action:"SEEK", seek:Math.round((100 * e.value) / progressBar.getMax())});
    	draggingSlider = false;
    });
    mediaControlsView.add(progressBar);
    progressBar.show();
	var timePlayed = GUI.createLabel(STYLE.get("jukeboxProgressPlayed", {text:""}));
	mediaControlsView.add(timePlayed);
	var timeRemaining = GUI.createLabel(STYLE.get("jukeboxProgressRemaining", {text:""}));
	mediaControlsView.add(timeRemaining);
    timePlayed = GUI.createLabel(STYLE.get("jukeboxProgressPlayed", {text:""}));
    mediaControlsView.add(timePlayed);
    timeRemaining = GUI.createLabel(STYLE.get("jukeboxProgressRemaining", {text:""}));
    mediaControlsView.add(timeRemaining);

	function addTouchListener(control) {
	    control.addEventListener("touchstart", function() {
	        control.glow.opacity = 0.75;
	    });
	    control.addEventListener("touchend", function() {
	        control.glow.opacity = 0;
	    });
	    control.addEventListener("touchcancel", function() {
	        control.glow.opacity = 0;
	    });
	}

	var controlRewind = Titanium.UI.createImageView(STYLE.get("jukeboxRewind"));
	if (!isIos7()) {
		controlRewind.glow = Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxRewindGlow")));
	}
	controlRewind.addEventListener("click", function() {
        restCall("POST", getLibrary().mediaPlayerUri, {action:"PREVIOUS"});
	});
	
	var controlPlayPause = Titanium.UI.createImageView(STYLE.get("jukeboxPlayPause"));
	if (!isIos7()) {
		controlPlayPause.glow = Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxPlayPauseGlow")));
	}
	controlPlayPause.addEventListener("click", function() {
        restCall("POST", getLibrary().mediaPlayerUri, {action:"TOGGLE_PLAY_PAUSE"});
	});
	
	var controlFastForward = Titanium.UI.createImageView(STYLE.get("jukeboxForward"));
	if (!isIos7()) {
		controlFastForward.glow = Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxForwardGlow")));
	}
	controlFastForward.addEventListener("click", function() {
        restCall("POST", getLibrary().mediaPlayerUri, {action:"NEXT"});
	});
	
	var controlShuffle = Titanium.UI.createImageView(STYLE.get("jukeboxShuffle"));
	if (!isIos7()) {
		controlShuffle.glow = Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxShuffleGlow")));
	}
	controlShuffle.addEventListener("click", function() {
        restCall("POST", getLibrary().mediaPlayerUri, {action:"SHUFFLE"});
	});

	var playbackControlsView = Titanium.UI.createView({left:0,right:0,bottom:0,height:38});
	if (!isIos7()) {
		playbackControlsView.backgroundGradient = {type:"linear",colors:["#1F1F1F","#323232"],startPoint:{x:0,y:37},endPoint:{x:0,y:0},backFillStart:false};
	} 
	mediaControlsView.add(playbackControlsView);
	mediaControlsView.add(controlRewind);
	mediaControlsView.add(controlFastForward);
	mediaControlsView.add(controlPlayPause);
	mediaControlsView.add(controlShuffle);
	if (!isIos7()) {
		mediaControlsView.add(controlRewind.glow);
		mediaControlsView.add(controlFastForward.glow);
		mediaControlsView.add(controlPlayPause.glow);
		mediaControlsView.add(controlShuffle.glow);
	}

	function playTrack(trackIndex) {
		restCall("POST", getLibrary().mediaPlayerUri, {action:"PLAY",track:(trackIndex)});
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
    
	function getDisplayTime(time) {
	    var mins = Math.floor(time / 60);
	    var secs = Math.floor(time % 60);
	    if (secs < 10) {
	        return mins + ':0' + secs;
	    }
	    return mins + ':' + secs;
	}

    function refresh() {
        Titanium.API.debug("Refreshing media player state.");
    	var response = restCall("GET", getLibrary().mediaPlayerUri, {});
	    if (response.status / 100 === 2) {
	        if (myPlaylistVersion != response.result.playlistVersion) {
	        	reloadPlaylist();
	        }
	        // mark current track
	        if (currentTrackIndex != response.result.currentTrack - 1) {
	        	if (currentTrackIndex != undefined) {
	        		currentTrackData.template = "default";
	        		listView.getSections()[0].replaceItemsAt(currentTrackIndex, 1, [currentTrackData]);
	        	}
	        	currentTrackIndex = response.result.currentTrack - 1;
	        	currentTrackData = listView.getSections()[0].getItemAt(currentTrackIndex);
	        	currentTrackData.template = "nowPlaying";
	        	listView.getSections()[0].replaceItemsAt(currentTrackIndex, 1, [currentTrackData]);
	        }
	        if (response.result.playing) {
                controlPlayPause.setImage((isIos7() ? "ios7/" : "") + "images/pause.png");
            } else {
                controlPlayPause.setImage((isIos7() ? "ios7/" : "") + "images/play.png");
            }
	        progressBar.setMax(response.result.length);
		    if (!draggingSlider && progressBar != undefined) {
	        	progressBar.setValue(response.result.currentTime);
		    }
		    if (timePlayed != undefined) {
			    timePlayed.text = getDisplayTime(response.result.currentTime);
		    }
		    if (timeRemaining != undefined) {
			    timeRemaining.text = response.result.length > Math.floor(response.result.currentTime) ? getDisplayTime(response.result.length - Math.floor(response.result.currentTime)) : "0:00";
		    }
	        // response.result.volume;
	        // response.result.mediaRenderer;
	    }
		setTimeout(refresh, 1000);
    }
	
	function reloadPlaylist() {
	    var response = restCall("GET", getLibrary().mediaPlayerUri + "?attr.incl=playlistVersion", {});
	    if (response.status / 100 === 2) {
	        myPlaylistVersion = response.result.playlistVersion;
		    response = restCall("GET", getLibrary().mediaPlayerUri + "/playlist?" + TRACK_ATTRIBUTES, {});
		    if (response.status / 100 === 2) {
		        var data = response.result;
		        if (data.length > 0) {
			    	createListView(data);
			    	currentTrackIndex = undefined;
			    	currentTrackData = undefined;
			    	return;
			    }
		    } else {
			    showError({message:response.result,buttonNames:['Ok']});
		    }
	    } else {
		    showError({message:response.result,buttonNames:['Ok']});
	    }
		myParent.open(undefined);
	    win.close();
	}
	
	function createListView(data) {
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
		refresh();
        // TODO auto-open settings if no media renderer is set
	};
	
}
