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
Titanium.include("videoplayer.js");
Titanium.include("win_tvshows.js");
Titanium.include("win_tvshow_seasons.js");
Titanium.include("win_movies.js");
Titanium.include("win_appinfo.js");
Titanium.include("win_busy.js");
Titanium.include("win_server_history.js");
Titanium.include("win_photoalbums.js");
Titanium.include("win_photos.js");
Titanium.include("win_photo.js");
Titanium.include("view_menu.js");

var DARK_GRAY = "#2A2A2A";
var LIGHT_GRAY = "#3A3A3A";
var view = Titanium.UI.createView({backgroundColor:DARK_GRAY});
var GUI = require("lib/GUI");

function RowArray() {
	var rows = [];
	
	this.push = function(row) {
		row.backgroundColor = rows.length % 2 == 0 ? DARK_GRAY : LIGHT_GRAY;
		rows.push(row);
	};
	
	this.getRows = function() {
		return rows;
	};
	
	this.getLength = function() {
		return rows.length;
	};
};

Titanium.include("common_main.js");
