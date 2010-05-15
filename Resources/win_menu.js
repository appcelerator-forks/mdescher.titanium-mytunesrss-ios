Titanium.include('mytunesrss.js');

function playTrack(start) {
    audioPlayer.url = currentPlaylist[currentPlaylistIndex].playbackUrl;
    Titanium.App.fireEvent('mytunesrss_playtrack', currentPlaylist[currentPlaylistIndex]);
    audioPlayer.start();
}

var win = Titanium.UI.currentWindow;

var audioPlayer = Titanium.Media.createAudioPlayer({audioSessionMode:Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK});
var currentPlaylist;
var currentPlaylistIndex;

audioPlayer.addEventListener('progress', function(e) {
    Titanium.App.fireEvent('mytunesrss_progress', e);
});

audioPlayer.addEventListener('change', function(e) {
    if (e.state == audioPlayer.STATE_STOPPED && currentPlaylistIndex < currentPlaylist.length - 1) {
        currentPlaylistIndex++;
        playTrack();
    }
});

var labelPlaylists = Titanium.UI.createLabel({text:'Playlists',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelAlbums = Titanium.UI.createLabel({text:'Albums',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelArtists = Titanium.UI.createLabel({text:'Artists',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelGenres = Titanium.UI.createLabel({text:'Genres',left:10,font:{fontSize:20,fontWeight:'bold'}});
var inputSearch = Titanium.UI.createTextField({hintText:'Search terms',left:10,right:10,top:5,bottom:5,returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalize:false,autocomplete:false});
var labelSearch = Titanium.UI.createLabel({text:'Search',left:10,font:{fontSize:20,fontWeight:'bold'}});
var labelNowPlaying = Titanium.UI.createLabel({text:'Currently playing',left:10,font:{fontSize:20,fontWeight:'bold'}});
var buttonLogout = Titanium.UI.createButton({title:'Logout',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});

var tableViewData = [];
tableViewData.push(Titanium.UI.createTableViewSection());
tableViewData.push(Titanium.UI.createTableViewSection());
tableViewData.push(Titanium.UI.createTableViewSection());

tableViewData[0].add(wrap([labelPlaylists]));
tableViewData[0].add(wrap([labelAlbums]));
tableViewData[0].add(wrap([labelArtists]));
tableViewData[0].add(wrap([labelGenres]));

var inputSearchRow = wrap([inputSearch]);
inputSearchRow.hasChild = false;
tableViewData[1].add(inputSearchRow);
tableViewData[1].add(wrap([labelSearch]));

tableViewData[2].add(wrap([labelNowPlaying]));

var tableView = Titanium.UI.createTableView({data:tableViewData,style:Titanium.UI.iPhone.TableViewStyle.GROUPED,top:45});

buttonLogout.addEventListener('click', function() {
    if (Titanium.App.mediaPlayer) {
        Titanium.App.mediaPlayer.stop();
    }
    Titanium.App.sessionId = undefined;
    Titanium.App.mediaPlaylist = undefined;
    Titanium.App.mediaCurrentTrack = undefined;
    Titanium.App.mediaPlayer = undefined;
    win.close();
});

labelPlaylists.addEventListener('click', function() {
    ajaxCall('PlaylistService.getPlaylists', [], function(result, error) {
        if (result) {
            var winPlaylists = Titanium.UI.createWindow({url:'win_playlists.js',backgroundColor:'#FFF'});
            winPlaylists.ajaxResult = result;
            winPlaylists.open();
        } else {
            alert('server error');
        }
    });
});

labelAlbums.addEventListener('click', function() {
    ajaxCall('AlbumService.getAlbums', [null, null, null, -1, -1, -1, false, -1, -1], function(result, error) {
        if (result) {
            var winAlbums = Titanium.UI.createWindow({url:'win_albums.js',backgroundColor:'#FFF'});
            winAlbums.ajaxResult = result;
            winAlbums.open();
        } else {
            alert('server error');
        }
    });
});

labelArtists.addEventListener('click', function() {
    ajaxCall('ArtistService.getArtists', [null, null, null, -1, -1, -1], function(result, error) {
        if (result) {
            var winArtists = Titanium.UI.createWindow({url:'win_artists.js',backgroundColor:'#FFF'});
            winArtists.ajaxResult = result;
            winArtists.open();
        } else {
            alert('server error');
        }
    });
});

labelGenres.addEventListener('click', function() {
    ajaxCall('GenreService.getGenres', [1, -1, -1], function(result, error) {
        if (result) {
            var winGenres = Titanium.UI.createWindow({url:'win_genres.js',backgroundColor:'#FFF'});
            winGenres.ajaxResult = result;
            winGenres.open();
        } else {
            alert('server error');
        }
    });
});

labelSearch.addEventListener('click', function() {
    ajaxCall('TrackService.search', [inputSearch.value, 30, 'KeepOrder', 0, -1], function(result, error) {
        if (result && result.tracks && result.tracks.length > 0) {
            var winTracks = Titanium.UI.createWindow({url:'win_tracklist.js',backgroundColor:'#FFF'});
            winTracks.ajaxResult = result;
            winTracks.open();
        } else if (result && result.tracks && result.tracks.length === 0) {
            alert('no matching tracks found');
        } else {
            alert('server error');
        }
    });
});

labelNowPlaying.addEventListener('click', function() {
    if (currentPlaylist && audioPlayer) {
        Titanium.UI.createWindow({url:'win_jukebox.js',data:currentPlaylist[currentPlaylistIndex],backgroundColor:'#FFF'}).open();
    } else {
        alert('nothing in playlist');
    }
});

Titanium.App.addEventListener('mytunesrss_playlist', function(e) {
    audioPlayer.stop();
    currentPlaylist = e.playlist;
    currentPlaylistIndex = e.index;
    audioPlayer.url = currentPlaylist[currentPlaylistIndex].playbackUrl;
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

addTopToolbar(win, 'MyTunesRSS', undefined, buttonLogout);
win.add(tableView);

function wrap(components) {
    var row = Titanium.UI.createTableViewRow({hasChild:true});
    for (var i = 0; i < components.length; i++) {
        row.add(components[i]);
    }
    return row;
}
