function Jukebox() {
	
	var self = this;
	var myParent;
	
	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var myTrack;
	var imageView;
	var infoView;
	var progressBar;
	var timePlayed;
	var timeRemaining;
	var size = 220;
	var vOffset = 0;
	var hires = false;
	var noCoverImage;
	if (Titanium.Platform.osname === "ipad") {
		vOffset = 100;
		size = 440;
		noCoverImage = "images/nocover_ipad.png";
	} else if (Titanium.Platform.osname === "iphone") {
		hires = Titanium.Platform.displayCaps.density == "high";
		noCoverImage = "images/nocover.png";
	}
	
	function getDisplayTime(time) {
	    var mins = Math.floor(time / 60);
	    var secs = Math.floor(time % 60);
	    if (secs < 10) {
	        return mins + ':0' + secs;
	    }
	    return mins + ':' + secs;
	}
	
	function setTrackInformation(track) {
		myTrack = track;
	    if (imageView !== undefined) {
	        win.remove(imageView);
	        win.remove(infoView);
	        win.remove(progressBar);
	    	win.remove(timePlayed);
	    	win.remove(timeRemaining);
	    }
	    imageView = Titanium.UI.createView({top:vOffset+55,left:10,right:10,hires:true,image:track.imageUri,height:size});
	    if (track.imageUri !== undefined) {
	        if (hires) {
	    	    imageView.add(createCachedImageView({cacheObjectId:track.imageHash,top:10,hires:true,image:track.imageUri,width:size-20,height:size-20}));
	        } else {
		        imageView.add(createCachedImageView({cacheObjectId:track.imageHash,top:10,image:track.imageUri,width:size-20,height:size-20}));
	        }
	    } else {
	        if (hires) {
	    	    imageView.add(createCachedImageView({cacheObjectId:track.imageHash,top:10,hires:true,image:noCoverImage,width:size-20,height:size-20}));
	        } else {
		        imageView.add(createCachedImageView({cacheObjectId:track.imageHash,top:10,image:noCoverImage,width:size-20,height:size-20}));
	        }
	    }
	    infoView = Titanium.UI.createView({height:60,top:vOffset+size+65,left:10,right:10});
	    infoView.add(GUI.createLabel({top:7,left:0,right:0,height:30,font:{fontSize:16,fontWeight:'bold'},text:getDisplayName(track.name),textAlign:"center",color:"#CCCCCC"}));
	    infoView.add(GUI.createLabel({bottom:7,left:0,right:0,height:24,font:{fontSize:12},text:getDisplayName(track.artist),textAlign:"center",color:"#CCCCCC"}));
	    win.add(imageView);
	    win.add(infoView);
	    progressBar = Titanium.UI.createProgressBar({min:0,max:track.time,value:0,bottom:60,left:60,right:60,height:10});
	    win.add(progressBar);
	    progressBar.show();
	    timePlayed = GUI.createLabel({bottom:60,left:10,height:10,width:40,font:{fontSize:12},text:'',textAlign:'right',color:'#CCCCCC000000'});
	    win.add(timePlayed);
	    timeRemaining = GUI.createLabel({bottom:60,right:10,width:40,height:10,font:{fontSize:12},text:'',color:'#CCCCCC'});
	    win.add(timeRemaining);
	}
	
	function setProgress(progress) {
	    if (progressBar) {
	        progressBar.value = Math.floor(progress / 1000);
	    }
	    timePlayed.text = getDisplayTime(progress / 1000);
	    timeRemaining.text = myTrack.time > Math.floor(progress / 1000) ? getDisplayTime(myTrack.time - Math.floor(progress / 1000)) : "0:00";
	}

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
	
	var actIndicatorView = Titanium.UI.createView({top:45,left:0,bottom:0,right:0,backgroundColor:'#000000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	function showJukeboxActivityView() {
	    if (!actIndicatorView.visible) {
	        win.add(actIndicatorView);
	        actIndicatorView.show();
	    }
	};
	
	function hideJukeboxActivityView() {
	    if (actIndicatorView.visible) {
	        actIndicatorView.hide();
	        win.remove(actIndicatorView);
	    }
	};
	
	var buttonBack = GUI.createButton({title:L("jukebox.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonPlaylist = GUI.createButton({title:L("jukebox.playlist"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var controlRewind = Titanium.UI.createImageView(STYLE.get("jukeboxRewind",{glow:GUI.createGlow(STYLE.get("jukeboxRewindGlow"))}));
	controlRewind.addEventListener('click', function() {
		rewind();
	});
	
	var controlPlayPause = Titanium.UI.createImageView(STYLE.get("jukeboxPlayPause",{glow:GUI.createGlow(STYLE.get("jukeboxPlayPauseGlow"))}));
	controlPlayPause.addEventListener('click', function() {
		playPause();
	});
	
	var controlFastForward = Titanium.UI.createImageView(STYLE.get("jukeboxForward",{glow:GUI.createGlow(STYLE.get("jukeboxForwardGlow"))}));
	controlFastForward.addEventListener('click', function() {
	    fastForward();
	});
	
	var controlShuffle = Titanium.UI.createImageView(STYLE.get("jukeboxShuffle",{glow:GUI.createGlow(STYLE.get("jukeboxShuffleGlow"))}));
	controlShuffle.addEventListener('click', function() {
	    shuffle();
	});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	buttonPlaylist.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
		new TracksWindow(jukebox.getCurrentPlaylist(), true).open(self);
		win.remove(busyView);
	    win.close();
	});

	addTouchListener(controlRewind);
	addTouchListener(controlFastForward);
	addTouchListener(controlPlayPause);
	addTouchListener(controlShuffle);
	
	var topbar = undefined;
	
	win.add(Titanium.UI.createView({left:0,right:0,bottom:0,height:38,backgroundGradient:{type:"linear",colors:["#1F1F1F","#323232"],startPoint:{x:0,y:37},endPoint:{x:0,y:0},backFillStart:false}}));
	win.add(controlRewind);
	win.add(controlRewind.glow);
	win.add(controlFastForward);
	win.add(controlFastForward.glow);
	win.add(controlPlayPause);
	win.add(controlPlayPause.glow);
	win.add(controlShuffle);
	win.add(controlShuffle.glow);
	
	/**
	 * Open the jukebox window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		if (topbar !== undefined) {
			win.remove(topbar);
		}
		topbar = GUI.createTopToolbar(L("jukebox.title"), buttonBack, buttonPlaylist);
		win.add(topbar);
		win.open();
	}
	
	// =================================
	// player stuff
	
	var currentPlaylist;
	var currentPlaylistIndex;
	var audioPlayer;
	
	this.getCurrentPlaylist = function() {
		return currentPlaylist;
	}
	
	var progressEventListener = function(e) {
		setProgress(e.progress);
	}
	
	var changeEventListener = function(e) {
		if (e.state === audioPlayer.STATE_STOPPED) {
			if (fastForwardOnStopped === true) {
		        fastForward();
		        playTrack();
			} else {
		        KEEP_ALIVE_SOUND.stop();
				controlPlayPause.setImage("images/play.png");
			}
	   	}
		if (e.state == audioPlayer.STATE_PAUSED || e.state === audioPlayer.STATE_STOPPED || e.state == audioPlayer.STATE_STOPPING) {
	   		controlPlayPause.setImage("images/play.png");
	   	} else if (e.state === audioPlayer.STATE_PLAYING || e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE || e.state === audioPlayer.STATE_STARTING) {
	   		KEEP_ALIVE_SOUND.play();
        	fastForwardOnStopped = true;
        	controlPlayPause.setImage("images/pause.png");
        }
	    if (e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
            showJukeboxActivityView();
        } else {
            hideJukeboxActivityView();
        }
    }

	var localFileServerSocket;
	
	function setPlayerUrl(id, url) {
		fastForwardOnStopped = false;
		var tcParam = getTcParam();
		audioPlayer.stop();
	    var localFile = getCachedTrackFile(id);
	    if (localFile !== undefined) {
			audioPlayer.setUrl("http://localhost:" + HTTP_SERVER_PORT + "/" + id);
	    } else {
		    if (tcParam !== undefined) {
		        audioPlayer.setUrl(url + '/' + tcParam);
		    } else {
		        audioPlayer.setUrl(url);
		    }
	    }
	}
	
	function setTrack() {
	    setPlayerUrl(currentPlaylist[currentPlaylistIndex].id, currentPlaylist[currentPlaylistIndex].playbackUri);
	    setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	}

	function isPlayingOrBuffering() {
		var state = audioPlayer.getState();
		return state === audioPlayer.STATE_PLAYING || state === audioPlayer.STATE_BUFFERING || state === audioPlayer.STATE_WAITING_FOR_DATA || state === audioPlayer.STATE_WAITING_FOR_QUEUE || state === audioPlayer.STATE_STARTING;
	}

	function playTrack() {
	    if (!isPlayingOrBuffering()) {
	        audioPlayer.start();
	    }
	}
	
	var fastForwardOnStopped = true;
	
	function createPlayer() {
		if (audioPlayer != undefined) {
			audioPlayer.removeEventListener("progress", progressEventListener);
			audioPlayer.removeEventListener("change", changeEventListener);
		}
	    audioPlayer = Titanium.Media.createAudioPlayer({allowBackground:true, bufferSize:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE)});
	    audioPlayer.addEventListener("progress", progressEventListener);
	    audioPlayer.addEventListener("change", changeEventListener);
	}
	
	this.isActive = function() {
		return currentPlaylist != undefined && audioPlayer != undefined;
	}

	this.setPlaylist = function(playlist, index) {
		fastForwardOnStopped = false;
	    audioPlayer.stop();
	    currentPlaylist = playlist;
	    currentPlaylistIndex = index;
	    // remove all non-audio tracks
	    for (var i = currentPlaylist.length - 1; i >= 0; i--) {
	        if (currentPlaylist[i].mediaType != "Audio") {
	            currentPlaylist = currentPlaylist.slice(0, i).concat(currentPlaylist.slice(i + 1));
	            if (i < currentPlaylistIndex) {
	                currentPlaylistIndex--;
	            }
	        }
	    }
	    setTrack();
	    playTrack();
	};
	
	function rewind() {
		fastForwardOnStopped = false;
		var playing = isPlayingOrBuffering();
	    if (audioPlayer.progress > 2000) {
	        setTrack();
	        if (playing === true) {
	        	playTrack();
	        }
	    } else if (currentPlaylistIndex > 0) {
	        currentPlaylistIndex--;
	        setTrack();
	        if (playing === true) {
	        	playTrack();
	        }
	    }
	};
		
	function fastForward() {
		fastForwardOnStopped = false;
		var playing = isPlayingOrBuffering();
	    if (currentPlaylistIndex + 1 < currentPlaylist.length) {
	        currentPlaylistIndex++;
	        setTrack();
	        if (playing === true) {
	        	playTrack();
	        }
	    }
	};
	
	function playPause() {
	    if (isPlayingOrBuffering()) {
	        audioPlayer.pause();
	    } else {
		    audioPlayer.start();
	    }
	};
	
	function shuffle() {
	    fastForwardOnStopped = false;
	    var playing = isPlayingOrBuffering();
	    audioPlayer.stop();
	    var tmp, rand;
	    for (var i = 0; i < currentPlaylist.length; i++){
	      rand = Math.floor(Math.random() * currentPlaylist.length);
	      tmp = currentPlaylist[i];
	      currentPlaylist[i] = currentPlaylist[rand];
	      currentPlaylist[rand] = tmp;
	    }
	    currentPlaylistIndex = 0;
	    setTrack();
	    if (playing) {
	        playTrack();
	    }
	};
	
	this.reset = function() {
		if (audioPlayer != undefined) {
			fastForwardOnStopped = false;
			if (isPlayingOrBuffering() || audioPlayer.getState() === audioPlayer.STATE_PAUSED) {
				audioPlayer.stop();
			}
		    audioPlayer.setUrl("");
            currentPlaylist = undefined;
		    KEEP_ALIVE_SOUND.stop();
		}
	}

	this.restart = function() {
		if (audioPlayer != undefined) {
			fastForwardOnStopped = false;
			if (isPlayingOrBuffering() || audioPlayer.getState() === audioPlayer.STATE_PAUSED) {
				audioPlayer.stop();
			}
		    KEEP_ALIVE_SOUND.stop();
		    createPlayer();
		}
	};
	
	createPlayer();
}
