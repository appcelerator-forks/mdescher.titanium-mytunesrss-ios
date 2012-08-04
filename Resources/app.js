Titanium.include('mytunesrss.js');
Titanium.include('win_login.js');
Titanium.include('win_menu.js');
Titanium.include('win_albums.js');
Titanium.include("win_artists.js");
Titanium.include("win_genres.js");
Titanium.include("win_playlists.js");
Titanium.include("win_tracklist.js");
Titanium.include("jukebox.js");
Titanium.include("win_settings.js");
Titanium.include("videoplayer.js");
Titanium.include("win_tvshows.js");
Titanium.include("win_tvshow_seasons.js");
Titanium.include("win_movies.js");
Titanium.include("win_tracksync.js");

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK;

var view = Titanium.UI.createView();

Titanium.UI.setBackgroundColor('#000');

var jukebox = new Jukebox();
var pinger;

new LoginWindow().open();
