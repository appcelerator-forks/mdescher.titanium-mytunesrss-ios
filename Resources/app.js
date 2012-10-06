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

var GUI = require("lib/GUI");

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK;

var view = Titanium.UI.createView();

Titanium.UI.setBackgroundColor('#000');

var jukebox = new Jukebox();
var connectedUsername;
var connectedPassword;
var offlineMode;

db = Titanium.Database.open("OfflineTracks");
db.file.setRemoteBackup(false);
db.execute("CREATE TABLE IF NOT EXISTS track (id TEXT, name TEXT, album TEXT, artist TEXT, genre TEXT, album_artist TEXT, image_hash TEXT, protected INTEGER, media_type TEXT, time INTEGER, track_number INTEGER)");
db.close();

new LoginWindow().open();
