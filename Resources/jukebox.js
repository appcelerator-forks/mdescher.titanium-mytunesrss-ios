function Jukebox() {
	
	var self = this;
	var myParent;
	var myPlaylist;
	
	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var myTrack;
	var imageView;
	var infoView;
	var progressBar;
	var timePlayed;
	var timeRemaining;
	var size = 220;
	var hires = false;
	var noCoverImage;
	if (Titanium.Platform.osname === "ipad") {
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
	    imageView = Titanium.UI.createView({top:55,left:10,right:10,hires:true,image:track.imageUri,height:size});
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
	    infoView = Titanium.UI.createView({height:60,top:size+65,left:10,right:10});
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
	    control.addEventListener('touchstart', function() {
	        control.image = control.image.replace(".png", "_touched.png");
	    });
	    control.addEventListener('touchend', function() {
	        control.image = control.image.replace("_touched.png", ".png");
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
	
	var buttonBack = GUI.createButton({title:L("jukebox.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonPlaylist = GUI.createButton({title:L("jukebox.playlist"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var controlRewind = Titanium.UI.createImageView({image:'images/back.png',width:38,height:38,bottom:0,left:34});
	controlRewind.addEventListener('click', function() {
		rewind();
	});
	
	var controlPlayPause = Titanium.UI.createImageView({image:'images/play.png',width:38,height:38,bottom:0,left:105});
	controlPlayPause.addEventListener('click', function() {
		playPause();
	});
	
	var controlFastForward = Titanium.UI.createImageView({image:'images/forward.png',width:38,height:38,bottom:0,right:105});
	controlFastForward.addEventListener('click', function() {
	    fastForward();
	});
	
	var controlShuffle = Titanium.UI.createImageView({image:'images/shuffle.png',width:38,height:38,bottom:0,right:34});
	controlShuffle.addEventListener('click', function() {
	    shuffle();
	});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	buttonPlaylist.addEventListener('click', function() {
		myPlaylist.open();
	    win.close();
	});

	addTouchListener(controlRewind);
	addTouchListener(controlFastForward);
	addTouchListener(controlPlayPause);
	addTouchListener(controlShuffle);
	
	var topbar = undefined;
	
	win.add(Titanium.UI.createView({left:0,right:0,bottom:0,height:38,backgroundGradient:{type:"linear",colors:["#1F1F1F","#323232"],startPoint:{x:0,y:37},endPoint:{x:0,y:0},backFillStart:false}}));
	win.add(controlRewind);
	win.add(controlFastForward);
	win.add(controlPlayPause);
	win.add(controlShuffle);
	
	/**
	 * Open the jukebox window. 
	 */
	this.open = function(playlist, parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		myPlaylist = playlist;
		if (topbar !== undefined) {
			win.remove(topbar);
		}
		if (myPlaylist === undefined) {
			topbar = GUI.createTopToolbar(L("jukebox.title"), buttonBack, undefined);
		} else {
			topbar = GUI.createTopToolbar(L("jukebox.title"), buttonBack, buttonPlaylist);
		}
		win.add(topbar);
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
	
	var progressEventListener = function(e) {
		setProgress(e.progress);
	}
	
	var localFileServerSocket;
	
	function setPlayerUrl(id, url) {
		fastForwardOnStopped = false;
		var tcParam = getTcParam();
		audioPlayer.stop();
	    var localFile = getCachedTrackFile(id);
	    if (localFile !== undefined) {
	    	if (localFileServerSocket !== undefined) {
	    		localFileServerSocket.close();
	    	}
	    	for (port = 30000; port < 60000; port++) {
				localFileServerSocket = Titanium.Network.Socket.createTCP({host:"127.0.0.1",port:port,accepted:function(e) {
					e.inbound.write(Titanium.createBuffer({value:"HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: " + localFile.getSize() + "\r\n\r\n"}));
					Titanium.Stream.writeStream(localFile.open(Titanium.Filesystem.MODE_READ), e.inbound, 102400, function(e2) {
						if (e2.bytesProcessed === undefined || e2.bytesProcessed === -1) {
							e.inbound.close();
						}
					});
				}});
				try {
					localFileServerSocket.listen();
					localFileServerSocket.accept();
					audioPlayer.setUrl("http://localhost:" + localFileServerSocket.getPort());
					break; // okay, we are playing
				} catch (e) {
					// ignore and try next port
				}
	    	}
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
	    setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	    if (!audioPlayer.playing) {
	        audioPlayer.start();
		    keepAliveSound.play();
			controlPlayPause.setImage("images/pause.png");
	    }
	}
	
	var fastForwardOnStopped = true;
	
	function createPlayer() {
	    audioPlayer = Titanium.Media.createAudioPlayer({allowBackground:true, bufferSize:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE)});
	    audioPlayer.addEventListener('progress', progressEventListener);
	    audioPlayer.addEventListener('change', function(e) {
			if (e.state === audioPlayer.STATE_STOPPED && fastForwardOnStopped === true) {
		        fastForward();
		   	}
			if (e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
	            showJukeboxActivityView();
	        } else {
	            hideJukeboxActivityView();
	        }
	        if (e.state === audioPlayer.STATE_PLAYING) {
	        	fastForwardOnStopped = true;
	        }
	    });
	}
	
	this.destroy = function() {
		fastForwardOnStopped = false;
		if (audioPlayer.url) {
			audioPlayer.start();
			audioPlayer.stop();
		}
		audioPlayer.removeEventListener('progress', progressEventListener);
	    keepAliveSound.stop();
	}

	this.isActive = function() {
		return currentPlaylist && audioPlayer;
	}

	this.setPlaylist = function(playlist, index) {
		fastForwardOnStopped = false;
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
	    playTrack();
	};
	
	function rewind() {
		fastForwardOnStopped = false;
	    if (audioPlayer.playing && audioPlayer.progress > 2000) {
	        audioPlayer.stop();
	        playTrack();
	    } else if (currentPlaylistIndex > 0) {
	        audioPlayer.stop();
	        currentPlaylistIndex--;
	        playTrack();
	    }
	};
	
	function fastForward() {
		fastForwardOnStopped = false;
	    if (currentPlaylistIndex + 1 < currentPlaylist.length) {
	        audioPlayer.stop();
	        currentPlaylistIndex++;
	        playTrack();
	    } else if (!audioPlayer.playing) {
	    	keepAliveSound.pause();
	    }
	};
	
	function playPause() {
	    if (audioPlayer.stopped || audioPlayer.paused) {
		    audioPlayer.start();
		    keepAliveSound.play();
		    controlPlayPause.setImage("images/pause.png");
	    } else {
	        audioPlayer.pause();
	        keepAliveSound.pause();
			controlPlayPause.setImage("images/play.png");
	    }
	};
	
	function shuffle() {
	    fastForwardOnStopped = false;
	    var playing = audioPlayer.playing;
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
	        setTrackInformation(currentPlaylist[currentPlaylistIndex]);
	    }
	};
	
	this.restart = function() {
		fastForwardOnStopped = false;
	    audioPlayer.stop();
	    createPlayer();
	};
	
	createPlayer();
}
