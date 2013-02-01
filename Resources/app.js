Titanium.include('mytunesrss.js');
Titanium.include('win_login.js');
Titanium.include('win_login_online.js');
Titanium.include('win_login_offline.js');
Titanium.include('win_login_safari.js');
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
Titanium.include("win_appinfo.js");
Titanium.include("win_busy.js");

var DARK_GRAY = "#2A2A2A";
var LIGHT_GRAY = "#3A3A3A";

function RowArray() {
	var rows = [];
	
	this.push = function(row) {
		row.backgroundColor = rows.length % 2 == 0 ? DARK_GRAY : LIGHT_GRAY;
		rows.push(row);
	}
	
	this.getRows = function() {
		return rows;
	}
	
	this.getLength = function() {
		return rows.length;
	}
}

var GUI = require("lib/GUI");

var WEBSERVER = require("com.0x82.webserver");
WEBSERVER.disconnectsInBackground = false;
var HTTP_SERVER;
var HTTP_SERVER_PORT = -1;
for (i = 1025; i < 65536; i++) {
	try {
		HTTP_SERVER = WEBSERVER.startServer({port:i,bonjour:false,requestCallback:function(e) {
			return {
				file : getFileForTrackCache(e.path.substr(1))
			}
		}});
		HTTP_SERVER_PORT = i;
		break; // done
	} catch (ex) {
		// ignore and try next port
	}	
}

var STYLE = new GUI.Style();

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK;

var KEEP_ALIVE_SOUND = Titanium.Media.createSound({url:"white_noise.wav",volume:0,looping:true,preload:true});

var view = Titanium.UI.createView({backgroundColor:DARK_GRAY});

var jukebox = new Jukebox();
Titanium.App.addEventListener("pause", jukebox.onAppPaused);

var connectedUsername;
var connectedPassword;
var offlineMode;

db = Titanium.Database.open("OfflineTracks");
db.file.setRemoteBackup(false);
db.execute("CREATE TABLE IF NOT EXISTS track (id TEXT, name TEXT, album TEXT, artist TEXT, genre TEXT, album_artist TEXT, image_hash TEXT, protected INTEGER, media_type TEXT, time INTEGER, track_number INTEGER)");
db.close();

new LoginWindow().open();
