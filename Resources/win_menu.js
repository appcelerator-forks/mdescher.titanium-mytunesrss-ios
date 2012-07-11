function MenuWindow() {
	
	function wrap(components) {
	    var row = Titanium.UI.createTableViewRow({hasChild:true,touchEnabled:true,className:'menuRow',height:TABLE_VIEW_ROW_HEIGHT});
	    for (var i = 0; i < components.length; i++) {
	        row.add(components[i]);
	    }
	    return row;
	}
	
	var currentPlaylist;
	var currentPlaylistIndex;
	var audioPlayer;
	var keepAliveSound = Titanium.Media.createSound({url:"white_noise.wav",volume:0,looping:true,preload:true});
	
	var autoSkipEventListener = function(e) {
	    if (e.state === audioPlayer.STATE_PLAYING && keepAliveSound.isPlaying()) {
	        keepAliveSound.pause();
	    } else if ((e.state === audioPlayer.STATE_STOPPING || e.state === audioPlayer.STATE_BUFFERING) && !keepAliveSound.isPlaying()) {
	        keepAliveSound.play();
	    } else if (e.state === audioPlayer.STATE_STOPPED) {
	        Titanium.App.fireEvent('mytunesrss_fastforward');
	    }
	};
	
	var progressEventListener = function(e) {
		Titanium.App.fireEvent('mytunesrss_progress', {value:e.progress});
	}
	
	function setPlayerUrl(url) {
		var tcParam = getTcParam();
		audioPlayer.stop();
	    if (tcParam !== undefined) {
	        audioPlayer.setUrl(url + '/' + tcParam);
	    } else {
	        audioPlayer.setUrl(url);
	    }
	}
	
	function playTrack() {
	    setPlayerUrl(currentPlaylist[currentPlaylistIndex].playbackUri);
	    Titanium.App.fireEvent('mytunesrss_setTrackInfo', currentPlaylist[currentPlaylistIndex]);
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
	            Titanium.App.fireEvent('mytunesrss_showJukeboxActivityView');
	        } else if (e.state === audioPlayer.STATE_PLAYING) {
	            Titanium.App.fireEvent('mytunesrss_hideJukeboxActivityView');
	        }
	    });
	}
	
	var win = Titanium.UI.createWindow();
	win.backgroundGradient = WINDOW_BG;
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	createPlayer();
	
	var searchBar = Titanium.UI.createSearchBar({hintText:'Search',left:0,right:0,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});
	
	var labelPlaylists = Titanium.UI.createLabel({text:'Playlists',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelAlbums = Titanium.UI.createLabel({text:'Albums',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelArtists = Titanium.UI.createLabel({text:'Artists',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelGenres = Titanium.UI.createLabel({text:'Genres',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelNowPlaying = Titanium.UI.createLabel({text:'Currently playing',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var buttonLogout = Titanium.UI.createButton({title:'Logout',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonSettings = Titanium.UI.createButton({title:'Settings',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var tableViewData = [];
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData.push(Titanium.UI.createTableViewSection());
	
	var buttonRowPlaylists = wrap([labelPlaylists]);
	tableViewData[0].add(buttonRowPlaylists);
	var buttonRowAlbums = wrap([labelAlbums]);
	tableViewData[0].add(buttonRowAlbums);
	var buttonRowArtists = wrap([labelArtists]);
	tableViewData[0].add(buttonRowArtists);
	var buttonRowGenres = wrap([labelGenres]);
	tableViewData[0].add(buttonRowGenres);
	
	var buttonRowNowPlaying = wrap([labelNowPlaying]);
	tableViewData[1].add(buttonRowNowPlaying);
	
	var tableView = Titanium.UI.createTableView({data:tableViewData,style:Titanium.UI.iPhone.TableViewStyle.GROUPED,top:90});
	
	buttonLogout.addEventListener('click', function() {
		audioPlayer.removeEventListener("change", autoSkipEventListener);
		audioPlayer.removeEventListener('progress', progressEventListener);
		if (audioPlayer.url) {
			audioPlayer.start();
			audioPlayer.stop();
		}
	    keepAliveSound.stop();
	    win.close();
	});
	
	buttonSettings.addEventListener('click', function() {
	    actIndicatorView.show();
		var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=transcoders", {});
		if (response.status / 100 === 2) {
			var winSettings = Titanium.UI.createWindow({url:'win_settings.js'});
			winSettings.backgroundGradient = WINDOW_BG;
			winSettings.transcoders = response.result.transcoders;
			actIndicatorView.hide();
			winSettings.open();
		} else {
		    actIndicatorView.hide();
		    Titanium.UI.createAlertDialog({message:'Could not load current settings.',buttonNames:['Ok']}).show();
		}
	});
	
	buttonRowPlaylists.addEventListener('click', function() {
	    loadAndDisplayPlaylists();
	});
	
	buttonRowAlbums.addEventListener('click', function() {
	    loadAndDisplayAlbums(getLibrary().albumsUri);
	});
	
	buttonRowArtists.addEventListener('click', function() {
	    loadAndDisplayArtists();
	});
	
	buttonRowGenres.addEventListener('click', function() {
	    loadAndDisplayGenres();
	});
	
	searchBar.addEventListener('return', function() {
	    searchBar.showCancel = false;
	    searchBar.blur();
	    if (searchBar.value.length === 0) {
	        Titanium.UI.createAlertDialog({message:'Please enter a search term.',buttonNames:['Ok']}).show();
	    } else {
	        actIndicatorView.show();
	        searchAndDisplayTracks(searchBar.value);
	    }
	});
	
	searchBar.addEventListener('focus', function() {
	    searchBar.showCancel = true;
	});
	
	searchBar.addEventListener('cancel', function() {
	    searchBar.showCancel = false;
	    searchBar.blur();        
	});
	
	buttonRowNowPlaying.addEventListener('click', function() {
	    if (currentPlaylist && audioPlayer) {
	        var winJukebox = Titanium.UI.createWindow({url:'win_jukebox.js',data:currentPlaylist[currentPlaylistIndex]});
	        winJukebox.backgroundGradient = WINDOW_BG;
	        winJukebox.open();
	    } else {
	        Titanium.UI.createAlertDialog({message:'There is no active playlist.',buttonNames:['Ok']}).show();
	    }
	});
	
	Titanium.App.addEventListener('mytunesrss_playlist', function(e) {
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
	    audioPlayer.stop();
	    currentPlaylist = e.playlist;
	    currentPlaylistIndex = e.index;
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
	    setPlayerUrl(currentPlaylist[currentPlaylistIndex].playbackUri);
	    audioPlayer.addEventListener("change", autoSkipEventListener);
	    audioPlayer.start();
	    var winJukebox = Titanium.UI.createWindow({url:'win_jukebox.js',data:currentPlaylist[currentPlaylistIndex]});
	    winJukebox.backgroundGradient = WINDOW_BG;
	    winJukebox.open();
	});
	
	Titanium.App.addEventListener('mytunesrss_rewind', function() {
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
	});
	
	Titanium.App.addEventListener('mytunesrss_fastforward', function() {
	    if (currentPlaylistIndex + 1 < currentPlaylist.length) {
	        audioPlayer.removeEventListener("change", autoSkipEventListener);
	        audioPlayer.stop();
	        currentPlaylistIndex++;
	        playTrack();
	    } else {
	        keepAliveSound.pause();
	    }
	});
	
	Titanium.App.addEventListener('mytunesrss_stop', function() {
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
	    audioPlayer.stop();
	    keepAliveSound.pause();
	});
	
	Titanium.App.addEventListener('mytunesrss_play', function() {
	    audioPlayer.addEventListener("change", autoSkipEventListener);
	    audioPlayer.start();
	});
	
	Titanium.App.addEventListener('mytunesrss_pause', function() {
	    if (audioPlayer.playing) {
	        audioPlayer.removeEventListener("change", autoSkipEventListener);
	        audioPlayer.pause();
	        keepAliveSound.pause();
	    }
	});
	
	Titanium.App.addEventListener('mytunesrss_shuffle', function() {
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
	        setPlayerUrl(currentPlaylist[currentPlaylistIndex].playbackUri);
	        Titanium.App.fireEvent('mytunesrss_setTrackInfo', currentPlaylist[currentPlaylistIndex]);
	    }
	});
	
	Titanium.App.addEventListener('mytunesrss_audiobuffersize_changed', function() {
	    audioPlayer.removeEventListener("change", autoSkipEventListener);
	    audioPlayer.stop();
	    createPlayer();
	});
	
	addTopToolbar(win, 'MyTunesRSS', buttonLogout, buttonSettings);
	win.add(searchBar);
	win.add(tableView);
	win.add(actIndicatorView);
	
	this.open = function() {
		win.open();
	}
	
	this.close = function() {
		win.close();
	}

}
