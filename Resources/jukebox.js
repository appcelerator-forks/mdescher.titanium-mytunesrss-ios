function Jukebox() {

	var keepAliveSound = Titanium.Media.createSound({url:"keep_alive.wav",volume:0,looping:true,preload:true});

	var background = false;

	var self = this;
	var myParent;
	
	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var myRandomOnlineMode;
	var myRandomOfflineMode;
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
	    if (imageView != undefined) {
	        win.remove(imageView);
	        win.remove(infoView);
	        win.remove(progressBar);
	    	win.remove(timePlayed);
	    	win.remove(timeRemaining);
	    }
	    imageView = Titanium.UI.createView({top:vOffset+55,left:10,right:10,hires:true,image:track.imageUri,height:size});
	    if (track.imageUri != undefined) {
	        if (hires) {
	    	    imageView.add(createCachedImageView({cacheObjectId:track.imageHash,top:10,hires:true,image:track.imageUri,width:size-20,height:size-20,defaultImage:noCoverImage}));
	        } else {
		        imageView.add(createCachedImageView({cacheObjectId:track.imageHash,top:10,image:track.imageUri,width:size-20,height:size-20,defaultImage:noCoverImage}));
	        }
	    } else {
	        if (hires) {
	    	    imageView.add(Titanium.UI.createImageView({top:10,hires:true,image:noCoverImage,width:size-20,height:size-20}));
	        } else {
		        imageView.add(Titanium.UI.createImageView({top:10,image:noCoverImage,width:size-20,height:size-20}));
	        }
	    }
	    infoView = Titanium.UI.createView({height:60,top:vOffset+size+65,left:10,right:10});
	    infoView.add(GUI.createLabel({top:7,left:0,right:0,height:30,font:{fontSize:16,fontWeight:'bold'},text:getDisplayName(track.name),textAlign:"center",color:"#CCCCCC"}));
	    infoView.add(GUI.createLabel({bottom:7,left:0,right:0,height:24,font:{fontSize:12},text:getDisplayName(track.artist),textAlign:"center",color:"#CCCCCC"}));
	    win.add(imageView);
	    win.add(infoView);
	    progressBar = Titanium.UI.createProgressBar(STYLE.get("jukeboxProgressBar", {min:0,max:track.time,value:0}));
	    win.add(progressBar);
	    progressBar.show();
	    timePlayed = GUI.createLabel(STYLE.get("jukeboxProgressPlayed", {text:""}));
	    win.add(timePlayed);
	    timeRemaining = GUI.createLabel(STYLE.get("jukeboxProgressRemaining", {text:""}));
	    win.add(timeRemaining);
	    Titanium.API.debug("Setting now playing title = \"" + getDisplayName(track.name) + "\", artist = \"" + getDisplayName(track.artist) + "\", albumTitle = \"" + getDisplayName(track.album) + "\", playbackDuration = \"" + track.time + "\", genre = \"" + getDisplayName(track.genre) + "\", albumArtist = \"" + getDisplayName(track.albumArtist) + "\", discNumber = \"" + track.discNumber + "\", trackNumber = \"" + track.trackNumber + "\".");
	    MEDIA_CONTROLS.setNowPlaying({
	    	"title" : getDisplayName(track.name),
	    	"artist" : getDisplayName(track.artist),
	    	"albumTitle" : getDisplayName(track.album),
	    	"playbackDuration" : track.time,
	    	"genre" : getDisplayName(track.genre),
	    	"albumArtist" : getDisplayName(track.albumArtist),
	    	"discNumber" : track.discNumber,
	    	"albumTrackNumber" : track.trackNumber
	    });
	}
	
	function setProgress(progress) {
	    if (progressBar != undefined) {
	        progressBar.value = Math.floor(progress / 1000);
	    }
	    if (timePlayed != undefined) {
		    timePlayed.text = getDisplayTime(progress / 1000);
	    }
	    if (timeRemaining != undefined) {
		    timeRemaining.text = myTrack.time > Math.floor(progress / 1000) ? getDisplayTime(myTrack.time - Math.floor(progress / 1000)) : "0:00";
	    }
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
	
	var actIndicatorView = Titanium.UI.createView(STYLE.get("jukeboxActivityIndicator"));
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));

	function showJukeboxActivityView() {
	    if (!actIndicatorView.visible) {
	        Titanium.API.debug("Showing jukebox activity view.");
	        win.add(actIndicatorView);
	        actIndicatorView.show();
	    }
	};
	
	function hideJukeboxActivityView() {
	    if (actIndicatorView.visible) {
	    	Titanium.API.debug("Hiding jukebox activity view.");
	        actIndicatorView.hide();
	        win.remove(actIndicatorView);
	    }
	};
	
	var buttonBack = GUI.createButton({title:L("jukebox.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonPlaylist = GUI.createButton({title:L("jukebox.playlist"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var controlRewind = Titanium.UI.createImageView(STYLE.get("jukeboxRewind",{glow:Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxRewindGlow")))}));
	controlRewind.addEventListener('click', function() {
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		rewind();
	});
	
	var controlPlayPause = Titanium.UI.createImageView(STYLE.get("jukeboxPlayPause",{glow:Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxPlayPauseGlow")))}));
	controlPlayPause.addEventListener('click', function() {
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		playPause();
	});
	
	var controlFastForward = Titanium.UI.createImageView(STYLE.get("jukeboxForward",{glow:Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxForwardGlow")))}));
	controlFastForward.addEventListener('click', function() {
		if (jukebox.isIos61BugPhase()) {
			return;
		}
	    fastForward();
	});
	
	var controlShuffle = Titanium.UI.createImageView(STYLE.get("jukeboxShuffle",{glow:Titanium.UI.createView(GUI.glowViewOptions(STYLE.get("jukeboxShuffleGlow")))}));
	controlShuffle.addEventListener('click', function() {
		if (jukebox.isIos61BugPhase()) {
			return;
		}
	    shuffle();
	});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	buttonPlaylist.addEventListener('click', function() {
		if (myRandomOnlineMode != true && myRandomOfflineMode != true) {
			var busyView = createBusyView();
			win.add(busyView);
			Titanium.App.setIdleTimerDisabled(true);
	        try {
			    new TracksWindow(jukebox.getCurrentPlaylist(), true).open(self);
		        win.close();
	        } finally {
	        	Titanium.App.setIdleTimerDisabled(false);
			    win.remove(busyView);
	        }
		} else {
			showError({message:L("jukebox.noPlaylistInRandomMode"),buttonNames:['Ok']});
		}
	});

	addTouchListener(controlRewind);
	addTouchListener(controlFastForward);
	addTouchListener(controlPlayPause);
	addTouchListener(controlShuffle);
	
	win.add(Titanium.UI.createView({left:0,right:0,bottom:0,height:38,backgroundGradient:{type:"linear",colors:["#1F1F1F","#323232"],startPoint:{x:0,y:37},endPoint:{x:0,y:0},backFillStart:false}}));
	win.add(controlRewind);
	win.add(controlRewind.glow);
	win.add(controlFastForward);
	win.add(controlFastForward.glow);
	win.add(controlPlayPause);
	win.add(controlPlayPause.glow);
	win.add(controlShuffle);
	win.add(controlShuffle.glow);

	win.add(GUI.createTopToolbar(L("jukebox.title"), buttonBack, buttonPlaylist));
	
	var mediaControlsView = MEDIA_CONTROLS.createView({left:0,top:0,width:0,height:0});
	mediaControlsView.addEventListener("remoteControlPlay", function() {
		Titanium.API.debug("RemoteControlPlay");
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		checkWebserverSanity(function() {play();});
	}); 
	mediaControlsView.addEventListener("remoteControlPause", function() {
		Titanium.API.debug("RemoteControlPause");
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		pause();
	}); 
	mediaControlsView.addEventListener("remoteControlStop", function() {
		Titanium.API.debug("RemoteControlStop");
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		jukebox.stopPlayback();
	}); 
	mediaControlsView.addEventListener("remoteControlTogglePlayPause", function() {
		Titanium.API.debug("RemoteControlTogglePlayPause");
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		checkWebserverSanity(function() {playPause();});
	}); 
	mediaControlsView.addEventListener("remoteControlPreviousTrack", function() {
		Titanium.API.debug("RemoteControlPreviousTrack");
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		checkWebserverSanity(function() {rewind();});
	}); 
	mediaControlsView.addEventListener("remoteControlNextTrack", function() {
		Titanium.API.debug("RemoteControlNextTrack");
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		checkWebserverSanity(function() {fastForward();});
	}); 
	win.add(mediaControlsView);
	
	/**
	 * Open the jukebox window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};
	
	// =================================
	// player stuff
	
	var currentPlaylist;
	var currentPlaylistIndex;
	var audioPlayer;
	
	this.getCurrentPlaylist = function() {
		return currentPlaylist;
	};
	
	var progressEventListener = function(e) {
		setProgress(e.progress);
	};
	
	function getStateName(state) {
		if (state === audioPlayer.STATE_BUFFERING) {
			return "BUFFERING";
		} else if (state === audioPlayer.STATE_INITIALIZED) {
			return "INITIALIZED";
		} else if (state === audioPlayer.STATE_PAUSED) {
			return "PAUSED";
		} else if (state === audioPlayer.STATE_PLAYING) {
			return "PLAYING";
		} else if (state === audioPlayer.STATE_STARTING) {
			return "STARTING";
		} else if (state === audioPlayer.STATE_STOPPED) {
			return "STOPPED";
		} else if (state === audioPlayer.STATE_STOPPING) {
			return "STOPPING";
		} else if (state === audioPlayer.STATE_WAITING_FOR_DATA) {
			return "WAITING_FOR_DATA";
		} else if (state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
			return "WAITING_FOR_QUEUE";
		} else {
			return "unknown";
		}
	}
	
	var waitingForDataTimeout;
	var pauseTimeout;
	var stopKeepAliveTimeout;

	var changeEventListener = function(e) {
		Titanium.API.debug("Audio player state changed to \"" + getStateName(e.state) + "\".");
		if (background) {
			if (e.state === audioPlayer.STATE_STOPPED) {
				if (!keepAliveSound.playing) {
					Titanium.API.debug("Starting keep-alive sound.");
					keepAliveSound.play();
				}
				if (stopKeepAliveTimeout === undefined) {
					Titanium.API.debug("Creating keep-alive timeout.");
					stopKeepAliveTimeout = setTimeout(function() {
						if (keepAliveSound.playing) {
							Titanium.API.debug("Stopping keep-alive sound.");
							keepAliveSound.stop();
						}
					}, 30000);
				}
			} else if (e.state === audioPlayer.STATE_PLAYING) {
				if (stopKeepAliveTimeout != undefined) {
					Titanium.API.debug("Clearing keep-alive timeout.");
					clearTimeout(stopKeepAliveTimeout);
                    stopKeepAliveTimeout = undefined;
				}
				if (keepAliveSound.playing) {
					Titanium.API.debug("Stopping keep-alive sound.");
					keepAliveSound.stop();
				}
			} else {
				if (!keepAliveSound.playing) {
					Titanium.API.debug("Starting keep-alive sound.");
					keepAliveSound.play();
				}				
			}			
		}
		if (e.state === audioPlayer.STATE_STOPPED) {
			MEDIA_CONTROLS.clearNowPlaying();
			if (fastForwardOnStopped === true) {
				Titanium.API.debug("Skipping to next track.");
				fastForwardOnStopped = false;
				audioPlayer.stop();
		        if (!fastForward(true)) {
		        	currentPlaylistIndex = 0; // reset to first track...
		        	myParent.open();
	   				win.close(); // ... and return to parent view
		        }
			}
		}
		if (e.state == audioPlayer.STATE_INITIALIZED || e.state == audioPlayer.STATE_PAUSED || e.state === audioPlayer.STATE_STOPPED) {
			Titanium.API.debug("Setting PLAY button image.");
	   		controlPlayPause.setImage("images/play.png");
	   	}
		if (e.state === audioPlayer.STATE_PLAYING || e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE || e.state === audioPlayer.STATE_STARTING) {
        	fastForwardOnStopped = true;
	   		Titanium.API.debug("Setting PAUSE button image.");
        	controlPlayPause.setImage("images/pause.png");
        }
	    if (e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
            showJukeboxActivityView();
        } else {
            hideJukeboxActivityView();
        }
        if (e.state === audioPlayer.STATE_WAITING_FOR_DATA && waitingForDataTimeout === undefined) {
        	waitingForDataTimeout = setTimeout(function() {
				Titanium.API.debug("Stopping audio player after 20 seconds waiting for data.");
				fastForwardOnStopped = false;
				audioPlayer.stop();
		        showError({message:L("jukebox.noDataTimeout"),buttonNames:["Ok"]});
        	}, 20000);
        } else if (waitingForDataTimeout != undefined) {
        	clearTimeout(waitingForDataTimeout);
        	waitingForDataTimeout = undefined;
        }
        if (e.state === audioPlayer.STATE_PAUSED && pauseTimeout === undefined) {
        	pauseTimeout = setTimeout(function() {
				Titanium.API.debug("Stopping audio player after 5 minutes in pause.");
				fastForwardOnStopped = false;
				setTrack(true);
        	}, 300000);
        } else if (pauseTimeout != undefined) {
        	clearTimeout(pauseTimeout);
        	pauseTimeout = undefined;
        }
    };

	var localFileServerSocket;
	
	function setPlayerUrl(id, url) {
		Titanium.API.debug("[setPlayerUrl] Stopping audio player.");
		fastForwardOnStopped = false;
		audioPlayer.stop();
		var tcParam = getTcParam();
		setProgress(0);
	    var localFile = getCachedTrackFile(id);
	    if (localFile != undefined) {
	    	Titanium.API.debug("[setPlayerUrl] Setting audio player URL \"" + "http://localhost:" + HTTP_SERVER_PORT + "/track/" + id + "\" (state=" + audioPlayer.getState() + ").");
			audioPlayer.setUrl("http://localhost:" + HTTP_SERVER_PORT + "/track/" + id);
	    } else {
		    if (tcParam != undefined) {
		    	Titanium.API.debug("[setPlayerUrl] Setting audio player URL \"" + url + '/' + tcParam + "\" (state=" + audioPlayer.getState() + ").");
		        audioPlayer.setUrl(url + '/' + tcParam);
		    } else {
		    	Titanium.API.debug("[setPlayerUrl] Setting audio player URL \"" + url + "\" (state=" + audioPlayer.getState() + ").");
		        audioPlayer.setUrl(url);
		    }
	    }
	}
	
	function setTrack() {
	    setPlayerUrl(currentPlaylist[currentPlaylistIndex].id, currentPlaylist[currentPlaylistIndex].playbackUri);
	    setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	    Titanium.Analytics.featureEvent("jukebox.setTrack");
	}

	function isPlayingOrBuffering() {
		var state = audioPlayer.getState();
		return state === audioPlayer.STATE_PLAYING || state === audioPlayer.STATE_BUFFERING || state === audioPlayer.STATE_WAITING_FOR_DATA || state === audioPlayer.STATE_WAITING_FOR_QUEUE || state === audioPlayer.STATE_STARTING || state === audioPlayer.STATE_STOPPING;
	}
	
	this.isIos61BugPhase = function(disableAlert) {
		var version = Titanium.Platform.version.split(".");
		if (version[0] === "6" && version[1] === "1" && audioPlayer.getState() === audioPlayer.STATE_STOPPING) {
			if (disableAlert === false || disableAlert === undefined) {
				showError({message:L("ios61bugphase"),buttonNames:['Ok']});
			}
			return true;
		}
		return false;
	};

	function playTrack() {
    	setTrack();
    	Titanium.API.debug("[playTrack] Starting audio player.");
        audioPlayer.start();
	}
	
	var fastForwardOnStopped = true;
	
	function createPlayer() {
		if (audioPlayer != undefined) {
			Titanium.API.debug("[createPlayer] Removing progress listener from audio player.");
			audioPlayer.removeEventListener("progress", progressEventListener);
			Titanium.API.debug("[createPlayer] Removing change listener from audio player.");
			audioPlayer.removeEventListener("change", changeEventListener);
		}
		Titanium.API.debug("[createPlayer] Creating audio player.");
	    audioPlayer = Titanium.Media.createAudioPlayer({allowBackground:true, bufferSize:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE)});
	    Titanium.API.debug("[createPlayer] Adding progress listener to audio player.");
	    audioPlayer.addEventListener("progress", progressEventListener);
	    Titanium.API.debug("[createPlayer] Adding change listener to audio player.");
	    audioPlayer.addEventListener("change", changeEventListener);
	}
	
	this.isActive = function() {
		return currentPlaylist != undefined && audioPlayer != undefined;
	};
	
	this.isPlaying = function() {
		return isPlayingOrBuffering();
	};

	this.setPlaylist = function(playlist, index, randomOnlineMode, randomOfflineMode) {
		Titanium.API.debug("[this.setPlaylist] Stopping audio player.");
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
	    if (randomOnlineMode === true) {
	    	myRandomOnlineMode = true;
	    } else {
	    	myRandomOnlineMode = false;
	    }
	    if (randomOfflineMode === true) {
	    	myRandomOfflineMode = true;
	    } else {
	    	myRandomOfflineMode = false;
	    }
	    playTrack();
	};
	
	function rewind() {
		fastForwardOnStopped = false;
		var playing = isPlayingOrBuffering();
	    if (audioPlayer.progress > 2000 || myRandomOnlineMode === true || myRandomOfflineMode === true) {
	        if (playing === true) {
	        	playTrack();
	        } else {
	        	setTrack();
	        }
	    } else if (currentPlaylistIndex > 0) {
	        currentPlaylistIndex--;
	        if (playing === true) {
	        	playTrack();
	        } else {
	        	setTrack();
	        }
	    }
	};
		
	function fastForward(forcePlayAfterFastforward) {
		var playing = isPlayingOrBuffering();
	    if (currentPlaylistIndex + 1 < currentPlaylist.length) {
	        currentPlaylistIndex++;
	        if (playing === true || forcePlayAfterFastforward === true) {
	        	Titanium.API.debug("Playing on fast-forward [playing=" + playing + ", forcePlayAfterFastforward=" + forcePlayAfterFastforward + "].");
	        	playTrack();
	        	return true;
	        } else {
	        	setTrack();
	        	return false;
	        }
	    } else if (myRandomOnlineMode === true) {
	    	currentPlaylistIndex = 0;
	        if (playing === true || forcePlayAfterFastforward === true) {
	        	Titanium.API.debug("Playing on fast-forward [playing=" + playing + ", forcePlayAfterFastforward=" + forcePlayAfterFastforward + "].");
	        	playTrack();
	        	return true;
	        } else {
	        	setTrack();
	        	return false;
	        }
	    } else if (myRandomOfflineMode === true) {
	    	currentPlaylist = [getRandomOfflineTrack()];
	    	currentPlaylistIndex = 0;
	        if (playing === true || forcePlayAfterFastforward === true) {
	        	Titanium.API.debug("Playing on fast-forward [playing=" + playing + ", forcePlayAfterFastforward=" + forcePlayAfterFastforward + "].");
	        	playTrack();
	        	return true;
	        } else {
	        	setTrack();
	        	return false;
	        }
	    }	    
	    return false;
	};
	
	function playPause() {
	    if (isPlayingOrBuffering()) {
	    	Titanium.API.debug("[playPause] Pausing audio player.");
	        audioPlayer.pause();
	    } else {
	    	Titanium.API.debug("[playPause] Starting audio player.");
		    audioPlayer.start();
	    }
	};

	function play() {
	    if (!isPlayingOrBuffering()) {
	    	Titanium.API.debug("[playPause] Starting audio player.");
		    audioPlayer.start();
	    }
	};
	
	function pause() {
	    if (isPlayingOrBuffering()) {
	    	Titanium.API.debug("[playPause] Pausing audio player.");
	        audioPlayer.pause();
	    }
	};
	
	function shuffle() {
		if (myRandomOnlineMode === true || myRandomOfflineMode === true) {
			fastForward();
		} else {
		    var playing = isPlayingOrBuffering();
		    Titanium.API.debug("[shuffle] Stopping audio player.");
		    fastForwardOnStopped = false;
		    audioPlayer.stop();
		    var tmp, rand;
		    for (var i = 0; i < currentPlaylist.length; i++){
		      rand = Math.floor(Math.random() * currentPlaylist.length);
		      tmp = currentPlaylist[i];
		      currentPlaylist[i] = currentPlaylist[rand];
		      currentPlaylist[rand] = tmp;
		    }
		    currentPlaylistIndex = 0;
		    if (playing) {
		        playTrack();
		    } else {
		    	setTrack();
		    }
		}
	};
	
	this.reset = function() {
		if (audioPlayer != undefined) {
			Titanium.API.debug("[this.reset] Stopping audio player.");
			fastForwardOnStopped = false;
			audioPlayer.stop();
			Titanium.API.debug("[this.reset] Setting audio player URL \"\" (state=" + audioPlayer.getState() + ").");
		    audioPlayer.setUrl("");
            currentPlaylist = undefined;
		}
	};

	this.restart = function() {
		if (audioPlayer != undefined) {
			Titanium.API.debug("[this.restart] Stopping audio player.");
			fastForwardOnStopped = false;
			audioPlayer.stop();
            currentPlaylist = undefined;
		    createPlayer();
		}
	};
	
	this.stopPlayback = function() {
		Titanium.API.debug("[this.stopPlayback] Stopping audio player.");
		fastForwardOnStopped = false;
	    audioPlayer.stop();
	    setProgress(0);
	};

    this.isRandomOnlineMode = function() {
    	return myRandomOnlineMode;
    };

    this.isRandomOfflineMode = function() {
    	return myRandomOfflineMode;
    };

	this.onResumed = function() {
		background = false;
		if (stopKeepAliveTimeout != undefined) {
			Titanium.API.debug("Clearing keep-alive timeout.");
			clearTimeout(stopKeepAliveTimeout);
            stopKeepAliveTimeout = undefined;
		}
		if (keepAliveSound.playing) {
			Titanium.API.debug("Stopping keep-alive sound.");
			keepAliveSound.stop();
		}
	};
	
	this.onPause = function() {
		background = true;
		if (audioPlayer.state === audioPlayer.STATE_BUFFERING || audioPlayer.state === audioPlayer.STATE_PAUSED || audioPlayer.state === audioPlayer.STATE_STOPPING || audioPlayer.state === audioPlayer.STATE_WAITING_FOR_DATA || audioPlayer.state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
			if (!keepAliveSound.playing) {
				Titanium.API.debug("Starting keep-alive sound.");
				keepAliveSound.play();
			}				
		}
	};

	createPlayer();
}


