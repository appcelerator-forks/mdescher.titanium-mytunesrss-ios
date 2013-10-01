Titanium.include("mytunesrss.js");
Titanium.include("win_login.js");
Titanium.include("win_login_online.js");
Titanium.include("win_login_offline.js");
Titanium.include("win_login_safari.js");
Titanium.include("win_menu.js");
Titanium.include("win_albums.js");
Titanium.include("win_artists.js");
Titanium.include("win_genres.js");
Titanium.include("win_playlists.js");
Titanium.include("win_tracklist.js");
Titanium.include("jukebox.js");
Titanium.include("win_settings.js");
Titanium.include("../videoplayer.js");
Titanium.include("win_tvshows.js");
Titanium.include("win_tvshow_seasons.js");
Titanium.include("win_movies.js");
Titanium.include("win_appinfo.js");
Titanium.include("win_busy.js");
Titanium.include("win_server_history.js");
Titanium.include("win_photoalbums.js");
Titanium.include("win_photos.js");
Titanium.include("win_photo.js");

Titanium.API.debug("Platform version: \"" + Titanium.Platform.version + "\".");

var LIGHT_GRAY = "#CCCCCC";
// db versions
// 1 = initial
// 2 = added disc_number column
// 3 = added play_count column
var DB_VERSION = 3;

function RowArray() {
	var rows = [];
	
	this.push = function(row) {
		rows.push(row);
	};
	
	this.getRows = function() {
		return rows;
	};
	
	this.getLength = function() {
		return rows.length;
	};
};

var GUI = require("ios7/lib/GUI");

var MEDIA_CONTROLS = require("de.codewave.ti.mediacontrols");

var WEBSERVER = require("com.0x82.webserver");
WEBSERVER.disconnectsInBackground = false;

var HTTP_SERVER;
var HTTP_SERVER_PORT = -1;

function startHttpServer(okCallback) {
	Titanium.API.debug("Starting HTTP server.");
	for (i = 1025; i < 65536; i++) {
		try {
			HTTP_SERVER = WEBSERVER.startServer({port:i,bonjour:false,requestCallback:function(e) {
				Titanium.API.debug("HTTP server request with path \"" + e.path + "\".");
				if (e.path.length < 2) {
					return "OK";
				}
                var splitChar = e.path.indexOf("/", 1);
                var command = e.path.substring(1, splitChar);
                var argument = e.path.substring(splitChar + 1);
                Titanium.API.debug("Command = '" + command + "', argument = '" + argument + "'.");
                if (command === "track") {
                	Titanium.API.debug("Track '" + argument + "' requested.");
				    return {
					    file : getFileForTrackCache(argument)
				    };
                } else if (command === "image") {
                    var cacheObjectId = argument.split("/", 2)[0];
                    var remoteImage = decodeURIComponent(argument.split("/", 2)[1]);
                    Titanium.API.debug("Cached image '" + cacheObjectId + "' requested.");
                    var cachedImage = getImageCacheFile(cacheObjectId);
                    if (cachedImage.exists()) {
				        return {
					        file : cachedImage
				        };
                    } else {
                    	Titanium.API.debug("Cached image not found, loading remote image from '" + remoteImage + "'.");
		                downloadImage(cacheObjectId, remoteImage);
                        cachedImage = getImageCacheFile(cacheObjectId);
		                if (cachedImage.exists()) {
					        return {
						        file : cachedImage
					        };
		                } else {
				            return {
					            status : 404,
                                body : "Image not found."
				            };
                        }
                    }
                } else {
					return {
                        status : 401,
                        body : "Unrecognized command."
                    };
                }
			}});
			Titanium.API.debug("HTTP server listening on port " + i + ".");
			HTTP_SERVER_PORT = i;
			if (okCallback != undefined) {
				okCallback();
			}
			return; // done
		} catch (ex) {
			// ignore and try next port
		}	
	}
}

startHttpServer();

var STYLE = new GUI.Style();

Titanium.Media.audioSessionMode = Titanium.Media.AUDIO_SESSION_MODE_PLAYBACK;

var view = Titanium.UI.createView();

var jukebox = new Jukebox();

var checkWebserverSanity = function(okCallback) {
	var httpClient = Titanium.Network.createHTTPClient({
		onload : function() {
			Titanium.API.debug("Response from HTTP server: \"" + this.responseText + "\".");
			if (this.responseText !== "OK") {
				startHttpServer(okCallback);
			} else if (okCallback != undefined) {
				okCallback();
			}
		},
		onerror : function() {
			Titanium.API.debug("HTTP server error.");
			startHttpServer(okCallback);
		}
	});
	httpClient.open("GET", "http://127.0.0.1:" + HTTP_SERVER_PORT);
	httpClient.send();
};

Titanium.App.addEventListener("resumed", function() {
	Titanium.API.debug("Application event \"resumed\".");
	checkWebserverSanity();
	jukebox.onResumed();
});
Titanium.App.addEventListener("pause", function() {
	Titanium.API.debug("Application event \"pause\".");
	jukebox.onPause();
});

var CANCEL_SYNC_AUDIO_TRACKS = false;
Titanium.App.addEventListener("mytunesrss_sync", function(event) {
    var tcParam = getTcParam();
    var uri = event.data[event.index].playbackUri + (tcParam != undefined ? "/" + tcParam : "");
	cacheTrack(event.data[event.index].id, uri, function() {return !CANCEL_SYNC_AUDIO_TRACKS;}, function(e) {
		if (e == undefined || (e.error == undefined && e.aborted !== true)) {
			if (!getImageCacheFile(event.data[event.index].imageHash).exists()) {
				downloadImage(event.data[event.index].imageHash, event.data[event.index].imageUri);
			}
			if (!getImageCacheFile(event.data[event.index].imageHash + "_64").exists()) {
				downloadImage(event.data[event.index].imageHash + "_64", event.data[event.index].imageUri + "/size=64");
			}
			if (!getImageCacheFile(event.data[event.index].imageHash + "_128").exists()) {
				downloadImage(event.data[event.index].imageHash + "_128", event.data[event.index].imageUri + "/size=128");
			}
			db = Titanium.Database.open("OfflineTracks");
			db.execute("DELETE FROM track WHERE id = ?", event.data[event.index].id);
			db.execute(
				"INSERT INTO track (id, name, album, artist, genre, album_artist, image_hash, protected, media_type, time, disc_number, track_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				event.data[event.index].id,
				event.data[event.index].name,
				event.data[event.index].album,
				event.data[event.index].artist,
				event.data[event.index].genre,
				event.data[event.index].albumArtist,
				event.data[event.index].imageHash,
				event.data[event.index].protected,
				event.data[event.index].mediaType,
				event.data[event.index].time,
				event.data[event.index].discNumber,
				event.data[event.index].trackNumber
			);
			db.close();
		}
		event.index++;
		Titanium.App.fireEvent("mytunesrss_sync_progress", {progress:event.index * 100 / event.data.length});
		if (CANCEL_SYNC_AUDIO_TRACKS || event.index >= event.data.length) {
			Titanium.App.fireEvent("mytunesrss_sync_done");
		} else {
			Titanium.App.fireEvent("mytunesrss_sync", event);
		}
	});
});

var connectedUsername;
var connectedPassword;
var offlineMode;

db = Titanium.Database.open("OfflineTracks");
db.file.setRemoteBackup(false);
var dbVersion = Titanium.App.Properties.getInt("offlineTracksDbVersion", 1);
Titanium.API.debug("Found offline tracks database version " + dbVersion + ".");
if (dbVersion < DB_VERSION) {
	try {
		Titanium.API.debug("Trying to drop offline tracks table since we need version " + DB_VERSION + ".");
		db.execute("DROP TABLE track");
		showError({message:L("offlineDatabaseDropped"),buttonNames:['Ok']});
	} catch (e) {
		Titanium.API.warn("Could not drop offline tracks table. It probably did not exist.");
	}
}
Titanium.API.debug("Trying to create offline tracks table version " + DB_VERSION + " if it does not exist.");
db.execute("CREATE TABLE IF NOT EXISTS track (id TEXT, name TEXT, album TEXT, artist TEXT, genre TEXT, album_artist TEXT, image_hash TEXT, protected INTEGER, media_type TEXT, time INTEGER, disc_number INTEGER, track_number INTEGER, play_count INTEGER DEFAULT 0)");
db.close();
Titanium.App.Properties.setInt("offlineTracksDbVersion", DB_VERSION);

new LoginWindow().open();
