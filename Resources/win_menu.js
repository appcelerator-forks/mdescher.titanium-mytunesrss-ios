Titanium.include('mytunesrss.js');

function wrap(components) {
    var row = Titanium.UI.createTableViewRow({hasChild:true,touchEnabled:true});
    for (var i = 0; i < components.length; i++) {
        row.add(components[i]);
    }
    return row;
}

var win = Titanium.UI.currentWindow;

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.addEventListener('focus', function() {
    actIndicatorView.hide();
});

var audioPlayer = Titanium.Media.createAudioPlayer({audioSessionMode:Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK});
var currentPlaylist;
var currentPlaylistIndex;

function setPlayerUrl(url) {
    audioPlayer.url = url;
    if (Titanium.App.Properties.getString('tcParam') != undefined) {
        audioPlayer.url = url + '/' + Titanium.App.Properties.getString('tcParam');
    } else {
        audioPlayer.url = url;
    }
}

function playTrack() {
    setPlayerUrl(currentPlaylist[currentPlaylistIndex].playbackUrl);
    Titanium.App.fireEvent('mytunesrss_setTrackInfo', currentPlaylist[currentPlaylistIndex]);
    audioPlayer.start();
}

audioPlayer.addEventListener('progress', function(e) {
    Titanium.App.fireEvent('mytunesrss_progress', {value:e.progress});
});

audioPlayer.addEventListener('change', function(e) {
    if (e.state == audioPlayer.STATE_STOPPED && currentPlaylistIndex < currentPlaylist.length - 1) {
        currentPlaylistIndex++;
        playTrack();
    } else if (e.state === audioPlayer.STATE_BUFFERING || e.state === audioPlayer.STATE_WAITING_FOR_DATA || e.state === audioPlayer.STATE_WAITING_FOR_QUEUE) {
        Titanium.App.fireEvent('mytunesrss_showJukeboxActivityView');
    } else if (e.state === audioPlayer.STATE_PLAYING) {
        Titanium.App.fireEvent('mytunesrss_hideJukeboxActivityView');
    }
});

var searchBar = Titanium.UI.createSearchBar({hintText:'Search',left:0,right:0,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});

var labelPlaylists = Titanium.UI.createLabel({text:'Playlists',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelAlbums = Titanium.UI.createLabel({text:'Albums',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelArtists = Titanium.UI.createLabel({text:'Artists',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelGenres = Titanium.UI.createLabel({text:'Genres',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelNowPlaying = Titanium.UI.createLabel({text:'Currently playing',left:10,font:{fontSize:20,fontWeight:'bold'}});
var buttonLogout = Titanium.UI.createButton({title:'Logout',style:buttonStyle});
var buttonSettings = Titanium.UI.createButton({title:'Settings',style:buttonStyle});

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

var tableView = Titanium.UI.createTableView({data:tableViewData,style:tableViewGroupStyle,top:90});

buttonLogout.addEventListener('click', function() {
    audioPlayer.stop();
    Titanium.App.Properties.removeProperty('jsonRpcSessionId');
    Titanium.App.Properties.removeProperty('serverMajor');
    Titanium.App.Properties.removeProperty('serverMinor');
    Titanium.App.Properties.removeProperty('serverRevision');
    win.close();
});

buttonSettings.addEventListener('click', function() {
    actIndicatorView.show();
    ajaxCall('LoginService.getUserInfo', [], function(result, error) {
        if (result) {
            var winSettings = Titanium.UI.createWindow({url:'win_settings.js',backgroundColor:'#FFF'});
            winSettings.ajaxResult = result;
            winSettings.open();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

buttonRowPlaylists.addEventListener('click', function() {
    actIndicatorView.show();
    ajaxCall('PlaylistService.getPlaylists', [], function(result, error) {
        if (result) {
            var winPlaylists = Titanium.UI.createWindow({url:'win_playlists.js',backgroundColor:'#FFF'});
            winPlaylists.ajaxResult = result;
            winPlaylists.open();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

buttonRowAlbums.addEventListener('click', function() {
    actIndicatorView.show();
    ajaxCall('AlbumService.getAlbums', [null, null, null, -1, -1, -1, false, -1, -1], function(result, error) {
        if (result) {
            var winAlbums = Titanium.UI.createWindow({url:'win_albums.js',backgroundColor:'#FFF'});
            winAlbums.ajaxResult = result;
            winAlbums.open();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

buttonRowArtists.addEventListener('click', function() {
    actIndicatorView.show();
    ajaxCall('ArtistService.getArtists', [null, null, null, -1, -1, -1], function(result, error) {
        if (result) {
            var winArtists = Titanium.UI.createWindow({url:'win_artists.js',backgroundColor:'#FFF'});
            winArtists.ajaxResult = result;
            winArtists.open();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

buttonRowGenres.addEventListener('click', function() {
    actIndicatorView.show();
    ajaxCall('GenreService.getGenres', [1, -1, -1], function(result, error) {
        if (result) {
            var winGenres = Titanium.UI.createWindow({url:'win_genres.js',backgroundColor:'#FFF'});
            winGenres.ajaxResult = result;
            winGenres.open();
        } else if (error) {
            actIndicatorView.hide();
            handleUnexpectedServerError(error.msg);
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
});

searchBar.addEventListener('return', function() {
    searchBar.showCancel = false;
    searchBar.blur();
    if (searchBar.value.length === 0) {
        Titanium.UI.createAlertDialog({message:'Please enter a search term.',buttonNames:['Ok']}).show();
    } else {
        actIndicatorView.show();
        ajaxCall('TrackService.search', [searchBar.value, 30, 'KeepOrder', 0, -1], function(result, error) {
            if (result && result.tracks && result.tracks.length > 0) {
                var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundColor:'#FFF'});
                winTracks.ajaxResult = result;
                winTracks.open();
            } else if (result && result.tracks && result.tracks.length === 0) {
                actIndicatorView.hide();
                Titanium.UI.createAlertDialog({message:'No tracks matching the query found.',buttonNames:['Ok']}).show();
            } else if (error && error.msg) {
                actIndicatorView.hide();
                showServerError(error);
            } else if (error) {
                actIndicatorView.hide();
                handleUnexpectedServerError(error.msg);
            } else {
                actIndicatorView.hide();
                Titanium.UI.createAlertDialog({message:'No response from server, please make sure the server is running.',buttonNames:['Ok']}).show();
            }
        });
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
        Titanium.UI.createWindow({url:'win_jukebox.js',data:currentPlaylist[currentPlaylistIndex],backgroundColor:'#FFF'}).open();
    } else {
        Titanium.UI.createAlertDialog({message:'There is no active playlist.',buttonNames:['Ok']}).show();
    }
});

Titanium.App.addEventListener('mytunesrss_playlist', function(e) {
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
    setPlayerUrl(currentPlaylist[currentPlaylistIndex].playbackUrl);
    audioPlayer.start();
    Titanium.UI.createWindow({url:'win_jukebox.js',data:currentPlaylist[currentPlaylistIndex],backgroundColor:'#FFF'}).open();
});

Titanium.App.addEventListener('mytunesrss_rewind', function() {
    if (audioPlayer.playing && audioPlayer.progress > 2.0) {
        audioPlayer.stop();
        audioPlayer.start();
    } else if (currentPlaylistIndex > 0) {
        audioPlayer.stop();
        currentPlaylistIndex--;
        playTrack();
    }
});

Titanium.App.addEventListener('mytunesrss_fastforward', function() {
    if (currentPlaylistIndex + 1 < currentPlaylist.length) {
        audioPlayer.stop();
        currentPlaylistIndex++;
        playTrack();
    }
});

Titanium.App.addEventListener('mytunesrss_stop', function() {
    audioPlayer.stop();
});

Titanium.App.addEventListener('mytunesrss_play', function() {
    audioPlayer.start();
});

Titanium.App.addEventListener('mytunesrss_pause', function() {
    audioPlayer.pause();
});

Titanium.App.addEventListener('mytunesrss_shuffle', function() {
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
        setPlayerUrl(currentPlaylist[currentPlaylistIndex].playbackUrl);
        Titanium.App.fireEvent('mytunesrss_setTrackInfo', currentPlaylist[currentPlaylistIndex]);
    }
});

/*Titanium.App.addEventListener('mytunesrss_moveplayhead', function(e) {
    alert(e.value);
    audioPlayer.pause();
    audioPlayer.progress = e.value;
    audioPlayer.start();
});*/

addTopToolbar(win, 'MyTunesRSS', buttonLogout, buttonSettings);
win.add(searchBar);
win.add(tableView);
win.add(actIndicatorView);
