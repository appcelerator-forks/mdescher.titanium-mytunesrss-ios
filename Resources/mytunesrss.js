var TABLE_VIEW_ROW_HEIGHT = 40;
var DEFAULT_AUDIO_BUFFER_SIZE = 2048;
var DEFAULT_SEARCH_ACCURACY = 40;
var MININUM_SERVER_VERSION = {
	major : 4,
	minor : 3,
	bugfix : 7,
	text : "4.3.7"
};
var TRACKROW_BG_LOCAL = "#CCFFCC";
var TRACKROW_BG_REMOTE = "white";
var TRACK_ATTRIBUTES = "attr.incl=id&attr.incl=name&attr.incl=playbackUri&attr.incl=httpLiveStreamUri&attr.incl=mediaType&attr.incl=artist&attr.incl=imageUri&attr.incl=imageHash&attr.incl=time&attr.incl=protected&attr.incl=album&attr.incl=albumArtist&attr.incl=genre&attr.incl=trackNumber";

function getServerBasedCacheDir() {
	var dir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationCacheDirectory);
	if (!dir.exists()) {
		dir.createDirectory();
	}
	return dir.getNativePath();
}

function createBusyView() {
	var busyView = Titanium.UI.createView({backgroundColor:'#000',opacity:0.8});
	busyView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	return busyView;
}

function restCall(method, uri, params) {
	var httpClient = Titanium.Network.createHTTPClient({timeout:30000});
	// send request
	httpClient.open(method,  uri, false);
	httpClient.send(params);
	if (httpClient.status / 100 == 2) {
		// 2xx response
		return {status:httpClient.status,result:JSON.parse(httpClient.getResponseText())};
	} else if (httpClient.status === 401 && httpClient.getResponseText() === "NO_VALID_USER_SESSION" && connectedUsername !== undefined) {
		// probably session expired => login again
		httpClient.open("POST",  Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session", false);
		httpClient.send({username:connectedUsername,password:connectedPassword});
		if (httpClient.status / 100 == 2) {
			// re-send request
			httpClient.open(method,  uri, false);
			httpClient.send(params);
			if (httpClient.status / 100 == 2) {
				// 2xx response
				return {status:httpClient.status,result:JSON.parse(httpClient.getResponseText())};
			} else {
				// still no 2xx response
				return {status:httpClient.status,result:httpClient.getResponseText()};
			}
		}
	} else {
		// neither 2xx nor 401
		return {status:httpClient.status,result:httpClient.getResponseText()};
	}
}

function getDisplayName(name) {
    if (name === undefined || name === null || name === '!') {
        return "";
    }
    return name;
}

function setTableDataAndIndex(tableView, items, createTableViewRowCallback, getSectionAndIndexNameCallback) {
	var sectionTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '123'];
	var indexTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
	var section = new Array(27);
	for (var i = 0; i < items.length; i++) {
		var itemName = getSectionAndIndexNameCallback(items[i]);
		var index = itemName.toUpperCase().charCodeAt(0) - 65;
		if (index < 0 || index > 25) {
			index = 26;
		}
		if (!section[index]) {
			section[index] = Titanium.UI.createTableViewSection({headerTitle:sectionTitle[index]});
		}
		section[index].add(createTableViewRowCallback(items[i], i));
	}
	var indexData = [];
	var tableData = [];
	var globalIndex = 0;
	for (i = 0; i < 27; i++) {
		if (section[i]) {
			tableData.push(section[i]);
			indexData.push({title:indexTitle[i],index:globalIndex});
			globalIndex += section[i].rowCount;
		}
	}
	tableView.setData(tableData);
	if (indexData.length > 5) {
		tableView.setIndex(indexData);
	}
}

function addTopToolbar(window, titleText, leftButton, rightButton) {
    var title = Titanium.UI.createLabel({text:titleText,top:0,height:45,textAlign:'center',color:'#FFFFFF',font:{fontSize:20,fontWeight:'bold'}});
    var buttons = [];
    if (leftButton !== undefined) {
	    buttons.push(leftButton);
    }
    buttons.push(Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE}));
    if (rightButton !== undefined) {
		buttons.push(rightButton);    	
    }
	var toolbar = Titanium.UI.iOS.createToolbar({top:0,height:45,items:buttons});
	toolbar.add(title);
	window.add(toolbar);
	return toolbar;
}

function handleServerError(error) {
    if (error && error.msg && error.msg.toUpperCase() === 'UNAUTHORIZED') {
        Titanium.UI.createAlertDialog({message:'You are not authorized to access the server. Maybe your session has expired. Please go back to the menu and logout.',buttonNames:['Ok']}).show();
    } else if (error && error.msg) {
        Titanium.UI.createAlertDialog({message:error.msg,buttonNames:['Ok']}).show();
    } else {
        Titanium.UI.createAlertDialog({message:'No valid response from server, please contact the server admin.',buttonNames:['Ok']}).show();
    }
}

function removeUnsupportedTracks(items) {
    for (var i = items.length - 1; i >= 0; i--) {
        if ((items[i].mediaType != 'Audio' && items[i].mediaType != 'Video') || items[i].protected === true) {
            items = items.slice(0, i).concat(items.slice(i + 1));
        }
    }
    return items;
}

function isSessionAlive() {
	var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=");
	return response.status / 100 === 2;
}

function loadAndDisplayOfflineAlbums(parent, artist, genre) {
	db = Titanium.Database.open("OfflineTracks");
	if (artist !== undefined) {
		rs = db.execute("SELECT album, album_artist, MAX(image_hash) AS ihash FROM track WHERE album IS NOT NULL AND artist = ? GROUP BY album, album_artist ORDER BY album", artist);
	} else if (genre !== undefined) {
		rs = db.execute("SELECT album, album_artist, MAX(image_hash) AS ihash FROM track WHERE album IS NOT NULL AND genre = ? GROUP BY album, album_artist ORDER BY album", genre);
	} else {
		rs = db.execute("SELECT album, album_artist, MAX(image_hash) AS ihash FROM track WHERE album IS NOT NULL GROUP BY album, album_artist ORDER BY album");
	}
	result = [];
	while (rs.isValidRow()) {
		result.push({
			name : rs.fieldByName("album"),
			artist : rs.fieldByName("album_artist"),
			imageUri : "",
			imageHash : rs.fieldByName("ihash")
		});
		rs.next();
	}
	db.close();
    if (result.length === 0) {
    	Titanium.UI.createAlertDialog({message:'No albums found.',buttonNames:['Ok']}).show();
    } else {
    	new AlbumsWindow(result).open(parent);
    }
}

function loadAndDisplayAlbums(parent, uri) {
    var response = restCall("GET", uri + "?attr.incl=name&attr.incl=tracksUri&attr.incl=imageUri&attr.incl=imageHash&attr.incl=artist");
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No albums found.',buttonNames:['Ok']}).show();
        } else {
	    	new AlbumsWindow(response.result).open(parent);
	    }
    } else {
	    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayArtists(parent) {
	if (offlineMode) {
		db = Titanium.Database.open("OfflineTracks");
		rs = db.execute("SELECT artist FROM track WHERE artist IS NOT NULL GROUP BY artist ORDER BY artist");
		result = [];
		while (rs.isValidRow()) {
			result.push({
				name : rs.fieldByName("artist")
			});
			rs.next();
		}
		db.close();
        if (result.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No artists found.',buttonNames:['Ok']}).show();
        } else {
	    	new ArtistsWindow(result).open(parent);
	    }
	} else {
	    var response = restCall("GET", getLibrary().artistsUri + "?attr.incl=name&attr.incl=albumsUri", {});
	    if (response.status / 100 === 2) {
	        if (response.result.length === 0) {
	        	Titanium.UI.createAlertDialog({message:'No artists found.',buttonNames:['Ok']}).show();
	        } else {
		    	new ArtistsWindow(response.result).open(parent);
		    }
	    } else {
		    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
	    }
	}
}

function loadAndDisplayGenres(parent) {
	if (offlineMode) {
		db = Titanium.Database.open("OfflineTracks");
		rs = db.execute("SELECT genre FROM track WHERE genre IS NOT NULL GROUP BY genre ORDER BY genre");
		result = [];
		while (rs.isValidRow()) {
			result.push({
				name : rs.fieldByName("genre")
			});
			rs.next();
		}
		db.close();
        if (result.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No genres found.',buttonNames:['Ok']}).show();
        } else {
	    	new GenresWindow(result).open(parent);
	    }
	} else {
	    var response = restCall("GET", getLibrary().genresUri + "?attr.incl=name&attr.incl=albumsUri", {});
	    if (response.status / 100 === 2) {
	        if (response.result.length === 0) {
	        	Titanium.UI.createAlertDialog({message:'No genres found.',buttonNames:['Ok']}).show();
	        } else {
		    	new GenresWindow(response.result).open(parent);
		    }
	    } else {
		    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
	    }
	}
}

function loadAndDisplayPlaylists(parent) {
    var response = restCall("GET", getLibrary().playlistsUri + "?attr.incl=name&attr.incl=tracksUri", {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No playlists found.',buttonNames:['Ok']}).show();
        } else {
	    	new PlaylistsWindow(response.result).open(parent);
	    }
    } else {
	    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayOfflineTracks(parent, album, albumArtist) {
	db = Titanium.Database.open("OfflineTracks");
	rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE name IS NOT NULL AND album = ? AND album_artist = ? ORDER BY track_number", album, albumArtist);
	result = [];
	while (rs.isValidRow()) {
		result.push({
			id : rs.fieldByName("id"),
			name : rs.fieldByName("name"),
			artist : rs.fieldByName("artist"),
			imageUri : "",
			imageHash : rs.fieldByName("image_hash"),
			mediaType : rs.fieldByName("media_type"),
			time : rs.fieldByName("time")
		});
		rs.next();
	}
	db.close();
    if (result.length === 0) {
    	Titanium.UI.createAlertDialog({message:'No tracks found.',buttonNames:['Ok']}).show();
    } else {
    	new TracksWindow(result).open(parent);
    }
}

function loadAndDisplayTracks(parent, tracksUri) {
    var response = restCall("GET", tracksUri + "?" + TRACK_ATTRIBUTES, {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No unprotected audio or video tracks found.',buttonNames:['Ok']}).show();
        } else {
	    	new TracksWindow(data).open(parent);
	    }
    } else {
    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayMovies(parent) {
    var response = restCall("GET", getLibrary().moviesUri + "?attr.incl=name&attr.incl=httpLiveStreamUri&attr.incl=playbackUri&attr.incl=mediaType&attr.incl=imageUri&attr.incl=imageHash&attr.incl=protected", {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No unprotected movies found.',buttonNames:['Ok']}).show();
        } else {
	    	new MoviesWindow(data).open(parent);
	    }
    } else {
    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayTvShows(parent) {
    var response = restCall("GET", getLibrary().tvShowsUri, {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No TV Shows found.',buttonNames:['Ok']}).show();
        } else {
	    	new TvShowsWindow(response.result).open(parent);
	    }
    } else {
    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayTvShowSeasons(parent, seasonsUri) {
    var response = restCall("GET", seasonsUri, {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No seasons found.',buttonNames:['Ok']}).show();
        } else {
	    	new TvShowSeasonsWindow(response.result).open(parent);
	    }
    } else {
    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function searchAndDisplayTracks(parent, searchTerm) {
	if (offlineMode) {
		db = Titanium.Database.open("OfflineTracks");
		like = "%" + searchTerm + "%";
		rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE name LIKE ? OR album LIKE ? OR album_artist LIKE ? OR artist LIKE ? OR genre LIKE ? ORDER BY album, album_artist, track_number", like, like, like, like, like);
		result = [];
		while (rs.isValidRow()) {
			result.push({
				id : rs.fieldByName("id"),
				name : rs.fieldByName("name"),
				artist : rs.fieldByName("artist"),
				imageUri : "",
				imageHash : rs.fieldByName("image_hash"),
				mediaType : rs.fieldByName("media_type"),
				time : rs.fieldByName("time")
			});
			rs.next();
		}
		db.close();
	    if (result.length === 0) {
	    	Titanium.UI.createAlertDialog({message:'No tracks found.',buttonNames:['Ok']}).show();
	    } else {
	    	new TracksWindow(result).open(parent);
	    }
	} else {
	    var response = restCall("GET", getLibrary().tracksUri + "?term=" + Titanium.Network.encodeURIComponent(searchTerm) + "&fuzziness=" + (100 - Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY)) + "&" + TRACK_ATTRIBUTES, {});
	    if (response.status / 100 === 2) {
	    	var data = removeUnsupportedTracks(response.result);
	        if (data.length === 0) {
	        	Titanium.UI.createAlertDialog({message:'No matching unprotected audio or video tracks found.',buttonNames:['Ok']}).show();
	        } else {
		    	new TracksWindow(data).open(parent);
		    }
	    } else {
	    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
	    }	
	}
}

function getServerVersion() {
	var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest?attr.incl=version", {});
	if (response.status / 100 === 2 && response.result.version !== undefined && response.result.version.text !== undefined) {
		return response.result.version;
	} else {
	    return undefined;
	}
}

function compareVersions(left, right) {
	if (left.major !== right.major) {
		return left.major - right.major;
	}
	if (left.minor !== right.minor) {
		return left.minor - right.minor;
	}
	return left.bugfix - right.bugfix;
}

function getLibrary() {
	return JSON.parse(Titanium.App.Properties.getString("libraryBase"));
}

function getTcParam() {
	var networkType = Titanium.Network.getNetworkType();
	var transcoders = Titanium.App.Properties.getList("transcoders" + (networkType == Titanium.Network.NETWORK_MOBILE ? "_mobile" : ""), []);
	if (transcoders === undefined || transcoders.length === 0) {
		return undefined;
	} else {
		var tcString = "";
		for (var i = 0; i < transcoders.length; i++) {
			tcString += transcoders[i];
			if (i + 1 < transcoders.length) {
				tcString += ",";
			}
		}
		return "tc=" + Titanium.Network.encodeURIComponent(tcString);
	}
}

function clearImageCache() {
	var baseDir = getServerBasedCacheDir();;
	var dir = Titanium.Filesystem.getFile(baseDir, "cache", "images");
	if (dir.exists()) {
		dir.deleteDirectory(true);
	}
}

function clearTrackCache() {
	var baseDir = getServerBasedCacheDir();;
	var dir = Titanium.Filesystem.getFile(baseDir, "cache", "tracks");
	if (dir.exists()) {
		dir.deleteDirectory(true);
	}
	db = Titanium.Database.open("OfflineTracks");
	db.execute("DELETE FROM track");
	db.close();
}

function getImageCacheFile(cacheObjectId) {
	var baseDir = getServerBasedCacheDir();
	var dir = Titanium.Filesystem.getFile(baseDir, "cache");
	if (!dir.exists()) {
		//Titanium.API.info("Creating cache directory \"" + dir.getNativePath() + "\".");
		dir.createDirectory();
	}
	dir = Titanium.Filesystem.getFile(baseDir, "cache", "images");
	if (!dir.exists()) {
		//Titanium.API.info("Creating cache directory \"" + dir.getNativePath() + "\".");
		dir.createDirectory();
	}
	return Titanium.Filesystem.getFile(baseDir, "cache/images/" + cacheObjectId);	
}

function createCachedImageView(options) {
	if (Titanium.App.Properties.getBool("imageCacheEnabled", true)) {
		var file = getImageCacheFile(options.cacheObjectId);
		delete(options.cacheObjectId);
		if (file.exists()) {
			//Titanium.API.info("Found cached image \"" + file.getNativePath() + "\".");
			options.image = file.getNativePath();
			return Titanium.UI.createImageView(options);
		} else if (options.headless) {
			file.write();
		} else {
			var imageView = Titanium.UI.createImageView(options);
			imageView.addEventListener("load", function(e) {
				//Titanium.API.info("Caching image \"" + file.getNativePath() + "\".");
			    file.write(e.source.toImage());
			});
			return imageView;
		}
	} else {
		delete(options.cacheObjectId);
		return Titanium.UI.createImageView(options);
	}
}

function downloadImage(cacheObjectId, uri) {
	var httpClient = Titanium.Network.createHTTPClient();
	httpClient.open("GET", uri, false);
	httpClient.setFile(getImageCacheFile(cacheObjectId));
	httpClient.send();
}

function getFileForTrackCache(id) {
	var baseDir = getServerBasedCacheDir();
	var dir = Titanium.Filesystem.getFile(baseDir, "cache");
	if (!dir.exists()) {
		//Titanium.API.info("Creating cache directory \"" + dir.getNativePath() + "\".");
		dir.createDirectory();
	}
	dir = Titanium.Filesystem.getFile(baseDir, "cache", "tracks");
	if (!dir.exists()) {
		//Titanium.API.info("Creating cache directory \"" + dir.getNativePath() + "\".");
		dir.createDirectory();
	}
	return Titanium.Filesystem.getFile(baseDir, "cache/tracks/" + id);
}

function getCachedTrackFile(id, uri) {
	var file = getFileForTrackCache(id);
	if (file.exists()) {
		return file;
	} else if (uri === undefined) {
		return undefined;
	}
	var httpClient = Titanium.Network.createHTTPClient();
	httpClient.open("GET", uri, false);
	httpClient.setFile(file);
	httpClient.send();
	return file;
}

function deleteCachedTrackFile(id) {
	getFileForTrackCache(id).deleteFile();
}

function createWindow() {
	var win = Titanium.UI.createWindow({backgroundImage:"images/stripe.png",backgroundRepeat:true});
	return win;
}

function pingServer() {
	restCall("GET", Titanium.App.Properties.getString("resolvedServerUrl") + "/rest/session?attr.incl=dummy");
}
