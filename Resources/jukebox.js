function Jukebox() {
	
	var self = this;
	var myParent;
	var myPlaylist;
	
	var win = createWindow();

	var myTrack;
	var imageView;
	var infoView;
	var progressBar;
	var timePlayed;
	var timeRemaining;
	var size = 220;
	var hires = false;
	if (Titanium.Platform.osname === "ipad") {
		size = 440;
	} else if (Titanium.Platform.osname === "iphone") {
		hires = Titanium.Platform.displayCaps.density == "high";
	}
	
	function getDisplayTime(time) {
	    var mins = Math.floor(time / 60);
	    var secs = Math.floor(time % 60);
	    if (secs < 10) {
	        return mins + ':0' + secs;
	    }
	    return mins + ':' + secs;
	}
	
	this.setTrackInformation = function(track) {
		myTrack = track;
	    if (imageView !== undefined) {
	        win.remove(imageView);
	        win.remove(infoView);
	        win.remove(progressBar);
	    	win.remove(timePlayed);
	    	win.remove(timeRemaining);
	    }
	    imageView = Titanium.UI.createView({top:55,left:10,right:10,hires:true,image:track.imageUri,height:size,borderWidth:1,borderRadius:5,borderColor:"#000000",backgroundColor:"#FFFFFF"});
	    if (track.imageUri !== undefined) {
	        if (hires) {
	    	    imageView.add(Titanium.UI.createImageView({top:10,hires:true,image:track.imageUri,width:size-20,height:size-20}));
	        } else {
		        imageView.add(Titanium.UI.createImageView({top:10,image:track.imageUri,width:size-20,height:size-20}));
	        }
	    } else {
	        if (hires) {
	    	    imageView.add(Titanium.UI.createImageView({top:10,hires:true,image:'appicon.png',width:size-20,height:size-20}));
	        } else {
		        imageView.add(Titanium.UI.createImageView({top:10,image:'appicon.png',width:size-20,height:size-20}));
	        }
	    }
	    infoView = Titanium.UI.createView({height:60,top:size+65,left:10,right:10,borderWidth:1,borderColor:"#000000",borderRadius:5,backgroundColor:"#FFFFFF"});
	    infoView.add(Titanium.UI.createLabel({top:7,left:0,right:0,height:30,font:{fontSize:16,fontWeight:'bold'},text:getDisplayName(track.name),textAlign:"center"}));
	    infoView.add(Titanium.UI.createLabel({bottom:7,left:0,right:0,height:24,font:{fontSize:12},text:getDisplayName(track.artist),textAlign:"center"}));
	    win.add(imageView);
	    win.add(infoView);
	    progressBar = Titanium.UI.createProgressBar({min:0,max:track.time,value:0,bottom:60,left:60,right:60,height:10});
	    win.add(progressBar);
	    progressBar.show();
	    timePlayed = Titanium.UI.createLabel({bottom:60,left:10,height:10,width:40,font:{fontSize:12},text:'',textAlign:'right',color:'#000000'});
	    win.add(timePlayed);
	    timeRemaining = Titanium.UI.createLabel({bottom:60,right:10,width:40,height:10,font:{fontSize:12},text:'',color:'#000000'});
	    win.add(timeRemaining);
	}
	
	function setProgress(progress) {
	    if (progressBar) {
	        progressBar.value = Math.floor(progress / 1000);
	    }
	    timePlayed.text = getDisplayTime(progress / 1000);
	    timeRemaining.text = getDisplayTime(myTrack.time - Math.floor(progress / 1000));
	}

	function wrapInSection(rows) {
	    var section = Titanium.UI.createTableViewSection();
	    for (var i = 0; i < rows.length; i++) {
	        section.add(rows[i]);
	    }
	    return section;
	}
	
	function addTouchListener(control, name) {
	    control.addEventListener('touchstart', function() {
	        control.image = "images/" + name + '_touched.png';
	    });
	    control.addEventListener('touchend', function() {
	        control.image = "images/" + name + '.png';
	    });
	}
	
	var actIndicatorView = Titanium.UI.createView({top:45,left:0,bottom:44,right:0,backgroundColor:'#000000',opacity:0.8,visible:false});
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
	
	var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonPlaylist = Titanium.UI.createButton({title:'Playlist',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var controlRewind = Titanium.UI.createImageView({image:'images/back.png',width:45,height:45});
	controlRewind.addEventListener('click', function() {
		rewind();
	});
	
	var controlPlay = Titanium.UI.createImageView({image:'images/play.png',width:45,height:45});
	controlPlay.addEventListener('click', function() {
		jukebox.play();
	});
	
	var controlPause = Titanium.UI.createImageView({image:'images/pause.png',width:45,height:45});
	controlPause.addEventListener('click', function() {
	    jukebox.pause();
	    hideJukeboxActivityView();
	});
	
	var controlStop = Titanium.UI.createImageView({image:'images/stop.png',width:45,height:45});
	controlStop.addEventListener('click', function() {
	    if (progressBar) {
	        progressBar.value = 0;
	    }
	    timePlayed.text = '';
	    timeRemaining.text = '';
	    jukebox.stop();
	    hideJukeboxActivityView();
	});
	
	var controlFastForward = Titanium.UI.createImageView({image:'images/forward.png',width:45,height:45});
	controlFastForward.addEventListener('click', function() {
	    fastForward();
	});
	
	var controlShuffle = Titanium.UI.createImageView({image:'images/shuffle.png',width:45,height:45});
	controlShuffle.addEventListener('click', function() {
	    jukebox.shuffle();
	});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	buttonPlaylist.addEventListener('click', function() {
		myPlaylist.open();
	    win.close();
	});

	addTouchListener(controlRewind, 'back');
	addTouchListener(controlFastForward, 'forward');
	addTouchListener(controlPause, 'pause');
	addTouchListener(controlPlay, 'play');
	addTouchListener(controlStop, 'stop');
	addTouchListener(controlShuffle, 'shuffle');
	
	var topbar = addTopToolbar(win, 'Jukebox', buttonBack, undefined);
	
	var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
	win.add(Titanium.UI.iOS.createToolbar({bottom:0,height:45,items:[flexSpace, controlRewind, flexSpace, controlPlay, flexSpace, controlPause, flexSpace, controlStop, flexSpace, controlFastForward, flexSpace, controlShuffle, flexSpace]}));
	
	
	/**
	 * Open the jukebox window. 
	 */
	this.open = function(playlist, parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		myPlaylist = playlist;
		win.remove(buttonPlaylist);
		if (myPlaylist === undefined) {
			topbar.items = [buttonBack, Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE})];
		} else {
			topbar.items = [buttonBack, Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE}), buttonPlaylist];
		}
		win.open();
	}
	
	// =================================
	// player stuff
	
	var currentPlaylist;
	var currentPlaylistIndex;
	var audioPlayer;
	var keepAliveSound = Titanium.Media.createSound({url:"white_noise.wav",volume:0,looping:true,preload:true});
	
	this.getCurrentPlaylist = function() {
		return currentPlaylist;
	}
	
	var autoSkipEventListener = function(e) {
	    if (e.state === audioPlayer.STATE_PLAYING && keepAliveSound.isPlaying()) {
	        keepAliveSound.pause();
	    } else if ((e.state === audioPlayer.STATE_STOPPING || e.state === audioPlayer.STATE_BUFFERING) && !keepAliveSound.isPlaying()) {
	        keepAliveSound.play();
	    } else if (e.state === audioPlayer.STATE_STOPPED) {
	        fastForward();
	    }
	};
	
	var progressEventListener = function(e) {
		setProgress(e.progress);
	}
	
	var localFileServerSocket;
	
	function setPlayerUrl(id, url) {
		var tcParam = getTcParam();
		audioPlayer.stop();
	    var localFile = getCachedTrackFile(id);
	    if (localFile !== undefined) {
	    	if (localFileServerSocket !== undefined) {
	    		localFileServerSocket.close();
	    	}
			localFileServerSocket = Titanium.Network.Socket.createTCP({host:"127.0.0.1",port:34567,accepted:function(e) {
				e.inbound.write(Titanium.createBuffer({value:"HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: " + localFile.getSize() + "\r\n\r\n"}));
				Titanium.Stream.writeStream(localFile.open(Titanium.Filesystem.MODE_READ), e.inbound, 102400, function(e2) {
					if (e2.bytesProcessed === -1) {
						e.inbound.close();
					}
				});
			}});
			localFileServerSocket.listen();
			localFileServerSocket.accept();
			audioPlayer.setUrl("http://localhost:" + localFileServerSocket.getPort());
	    } else {
		    if (tcParam !== undefined) {
		        audioPlayer.setUrl(url + '/' + tcParam);
		    } else {
		        audioPlayer.setUrl(url);
		    }
	    }
	}
	
	function playTrack() {
	    setPlayerUrl(currentPlaylist[currentPlaylistIndex].id, currentPlaylist[currentPlaylistIndex].playbackUri);
	    self.setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	    if (!audioPlayer.playing) {
	        audioPlayer.addEventListener("change", autoSkipEventListener);
	        audioPlayer.start();
	    }
	}
	
	function createPlayer() {
	    audioPlayer = Titanium.Media.createAudioPlayer({allowBackground:true, bufferSize:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE)});
	
	    audioPlayer.addEventListener('progress', progressEventListener);
	
	    audioPlayer.addEventListener('change', function(e) {
	        if (e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
	            showJukeboxActivityView();
	        } else if (e.state === audioPlayer.STATE_PLAYING) {
	            hideJukeboxActivityView();
	        }
	    });
	}
	
	this.destroy = function() {
		audioPlayer.removeEventListener("change", autoSkipEventListener);
		audioPlayer.removeEventListener('progress', progressEventListener);
		if (audioPlayer.url) {
			audioPlayer.start();
			audioPlayer.stop();
		}
	    keepAliveSound.stop();
	}

	this.isActive = function() {
		return currentPlaylist && audioPlayer;
	}

	this.setPlaylist = function(playlist, index) {
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
	    audioPlayer.stop();
	    currentPlaylist = playlist;
	    currentPlaylistIndex = index;
	    // remove all non-audio tracks
	    for (var i = currentPlaylist.length - 1; i >= 0; i--) {
	        if (currentPlaylist[i].mediaType != 'Audio') {
	            currentPlaylist = currentPlaylist.slice(0, i).concat(currentPlaylist.slice(i + 1));
	            if (i < currentPlaylistIndex) {
	                currentPlaylistIndex--;
	            }
	        }
	    }
	    // start playback with the selected track
	    setPlayerUrl(currentPlaylist[currentPlaylistIndex].id, currentPlaylist[currentPlaylistIndex].playbackUri);
	    audioPlayer.addEventListener("change", autoSkipEventListener);
	    audioPlayer.start();
    	self.setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	};
	
	function rewind() {
	    if (audioPlayer.playing && audioPlayer.progress > 2000) {
	        audioPlayer.removeEventListener("change", autoSkipEventListener);
	        audioPlayer.stop();
	        audioPlayer.addEventListener("change", autoSkipEventListener);
	        audioPlayer.start();
	    } else if (currentPlaylistIndex > 0) {
	        audioPlayer.removeEventListener("change", autoSkipEventListener);
	        audioPlayer.stop();
	        currentPlaylistIndex--;
	        playTrack();
	    }
	};
	
	function fastForward() {
	    if (currentPlaylistIndex + 1 < currentPlaylist.length) {
	        audioPlayer.removeEventListener("change", autoSkipEventListener);
	        audioPlayer.stop();
	        currentPlaylistIndex++;
	        playTrack();
	    } else {
	        keepAliveSound.pause();
	    }
	};
	
	this.stop = function() {
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
	    audioPlayer.stop();
	    keepAliveSound.pause();
	};
	
	this.play = function() {
	    audioPlayer.addEventListener("change", autoSkipEventListener);
	    audioPlayer.start();
	};
	
	this.pause = function() {
	    if (audioPlayer.playing) {
	        audioPlayer.removeEventListener("change", autoSkipEventListener);
	        audioPlayer.pause();
	        keepAliveSound.pause();
	    }
	};
	
	this.shuffle = function() {
	    var playing = audioPlayer.playing;
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
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
	        setPlayerUrl(currentPlaylist[currentPlaylistIndex].id, currentPlaylist[currentPlaylistIndex].playbackUri);
	        self.setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	    }
	};
	
	this.restart = function() {
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
	    audioPlayer.stop();
	    createPlayer();
	};
	
	createPlayer();
}
