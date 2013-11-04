var TABLE_VIEW_ROW_HEIGHT = 40;
var DEFAULT_AUDIO_BUFFER_SIZE = 2048;
var DEFAULT_SEARCH_ACCURACY = 40;
var MININUM_SERVER_VERSION = {
	major : 4,
	minor : 9,
	bugfix : 12,
	text : "4.9.12"
};
var TRACK_ATTRIBUTES = "attr.incl=id&attr.incl=name&attr.incl=playbackUri&attr.incl=httpLiveStreamUri&attr.incl=mediaType&attr.incl=artist&attr.incl=imageUri&attr.incl=imageHash&attr.incl=time&attr.incl=protected&attr.incl=album&attr.incl=albumArtist&attr.incl=genre&attr.incl=discNumber&attr.incl=trackNumber";

function getServerBasedCacheDir() {
	var dir = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationCacheDirectory);
	if (!dir.exists()) {
		dir.createDirectory();
	}
	return dir.getNativePath();
}

function createBusyView() {
	var busyView = Titanium.UI.createView({backgroundColor:"#000000",opacity:0.8});
	busyView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	return busyView;
}

function isStaleCache(uri, ts) {
	if (!Titanium.Network.online) {
		return false;
	}
	var httpClient = Titanium.Network.createHTTPClient({timeout:30000});
	httpClient.open("HEAD",  uri, false);
	httpClient.setRequestHeader("If-Modified-Since", ts.toGMTString());
	httpClient.send();
	return httpClient.status % 100 == 2;
}

function restCall(method, uri, params) {
	if (!Titanium.Network.online) {
		return {status:500,result:"NO_NETWORK"};
	}
	var httpClient = Titanium.Network.createHTTPClient({timeout:30000});
	// send request
	httpClient.open(method,  uri, false);
	httpClient.send(params);
	if (httpClient.status / 100 == 2) {
		// 2xx response
		return {status:httpClient.status,result:JSON.parse(httpClient.getResponseText())};
	} else if (httpClient.status === 401 && httpClient.getResponseText() === "NO_VALID_USER_SESSION" && connectedUsername != undefined) {
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

function setListDataAndIndex(listView, items, createListItemDataCallback, getSectionAndIndexNameCallback) {
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
			section[index] = Titanium.UI.createListSection({headerTitle:sectionTitle[index]});
		}
		section[index].appendItems([createListItemDataCallback(items[i], i)]);
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
	listView.setSections(tableData);
}

function removeUnsupportedTracks(items) {
    for (var i = items.length - 1; i >= 0; i--) {
        if ((items[i].mediaType != 'Audio' && items[i].mediaType != 'Video') || items[i].protected === true) {
            items = items.slice(0, i).concat(items.slice(i + 1));
        }
    }
    return items;
}

function removeUnsupportedAndNonAudioTracks(items) {
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].mediaType != "Audio" || items[i].protected === true) {
            items = items.slice(0, i).concat(items.slice(i + 1));
        }
    }
    return items;
}

function isSessionAlive() {
	var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=");
	return response.status / 100 === 2;
}

function shuffleArray(arr) {
	for (var i = 0; i < arr.length; i++) {
		var rnd = Math.floor(Math.random() * arr.length);
		var temp = arr[i];
		arr[i] = arr[rnd];
		arr[rnd] = temp;
	}	
}

function getRandomOfflineTrack() {
	var db = Titanium.Database.open("OfflineTracks");
	try {
		rs = db.execute("SELECT COUNT(id) AS track_count FROM track WHERE play_count = 0");
		var trackCount = rs.fieldByName("track_count");
        if (trackCount === 0) {
            db.execute("UPDATE track SET play_count = 0");
		    rs = db.execute("SELECT COUNT(id) AS track_count FROM track WHERE play_count = 0");
		    trackCount = rs.fieldByName("track_count");
        }
        var track = undefined;
        if (trackCount > 0) {
		    var offset = Math.floor(Math.random() * trackCount);
		    Titanium.API.debug("Selecting track " + (offset + 1) + " of " + trackCount + " tracks with play count 0.");
		    rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE play_count = 0 LIMIT 1 OFFSET ?", offset);
		    track = rs.isValidRow() ? mapTrack(rs) : undefined;
		    if (track != undefined) {
			    db.execute("UPDATE track SET play_count = 1 WHERE id = ?", track.id);
		    }
        }
		return track;
	} finally {
		db.close();
	}
}

function loadAndDisplayOfflineAlbums(parent, artist, genre) {
	db = Titanium.Database.open("OfflineTracks");
	if (artist != undefined) {
		rs = db.execute("SELECT album, album_artist, MAX(image_hash) AS ihash FROM track WHERE album IS NOT NULL AND LOWER(artist) = LOWER(?) GROUP BY LOWER(album), LOWER(album_artist) ORDER BY album", artist);
	} else if (genre != undefined) {
		rs = db.execute("SELECT album, album_artist, MAX(image_hash) AS ihash FROM track WHERE album IS NOT NULL AND LOWER(genre) = LOWER(?) GROUP BY LOWER(album), LOWER(album_artist) ORDER BY album", genre);
	} else {
		rs = db.execute("SELECT album, album_artist, MAX(image_hash) AS ihash FROM track WHERE album IS NOT NULL GROUP BY LOWER(album), LOWER(album_artist) ORDER BY album");
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
    	showError({message:L("albums.noneFound"),buttonNames:['Ok']});
    } else {
    	new AlbumsWindow(result).open(parent);
    }
}

function loadAndDisplayAlbums(parent, uri) {
    var response = restCall("GET", uri + "?attr.incl=name&attr.incl=tracksUri&attr.incl=imageUri&attr.incl=imageHash&attr.incl=artist");
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	showError({message:L("albums.noneFound"),buttonNames:['Ok']});
        } else {
	    	new AlbumsWindow(response.result).open(parent);
	    }
    } else {
	    showError({message:response.result,buttonNames:['Ok']});
    }
}

function loadAndDisplayArtists(parent) {
	if (offlineMode) {
		db = Titanium.Database.open("OfflineTracks");
		rs = db.execute("SELECT artist FROM track WHERE artist IS NOT NULL GROUP BY LOWER(artist) ORDER BY artist");
		result = [];
		while (rs.isValidRow()) {
			result.push({
				name : rs.fieldByName("artist")
			});
			rs.next();
		}
		db.close();
        if (result.length === 0) {
        	showError({message:L("artists.noneFound"),buttonNames:['Ok']});
        } else {
	    	new ArtistsWindow(result).open(parent);
	    }
	} else {
	    var response = restCall("GET", getLibrary().artistsUri + "?attr.incl=name&attr.incl=albumsUri&attr.incl=tracksUri", {});
	    if (response.status / 100 === 2) {
	        if (response.result.length === 0) {
	        	showError({message:L("artists.noneFound"),buttonNames:['Ok']});
	        } else {
		    	new ArtistsWindow(response.result).open(parent);
		    }
	    } else {
		    showError({message:response.result,buttonNames:['Ok']});
	    }
	}
}

function loadAndDisplayGenres(parent) {
	if (offlineMode) {
		db = Titanium.Database.open("OfflineTracks");
		rs = db.execute("SELECT genre FROM track WHERE genre IS NOT NULL GROUP BY LOWER(genre) ORDER BY genre");
		result = [];
		while (rs.isValidRow()) {
			result.push({
				name : rs.fieldByName("genre")
			});
			rs.next();
		}
		db.close();
        if (result.length === 0) {
        	showError({message:L("genres.noneFound"),buttonNames:['Ok']});
        } else {
	    	new GenresWindow(result).open(parent);
	    }
	} else {
	    var response = restCall("GET", getLibrary().genresUri + "?attr.incl=name&attr.incl=albumsUri&attr.incl=tracksUri", {});
	    if (response.status / 100 === 2) {
	        if (response.result.length === 0) {
	        	showError({message:L("genres.noneFound"),buttonNames:['Ok']});
	        } else {
		    	new GenresWindow(response.result).open(parent);
		    }
	    } else {
		    showError({message:response.result,buttonNames:['Ok']}).show();
	    }
	}
}

function loadAndDisplayPlaylists(parent) {
    var response = restCall("GET", getLibrary().playlistsUri + "?attr.incl=name&attr.incl=tracksUri&attr.incl=trackCount&attr.incl=type&attr.incl=owner", {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	showError({message:L("playlists.noneFound"),buttonNames:['Ok']});
        } else {
	    	new PlaylistsWindow(response.result).open(parent);
	    }
    } else {
	    showError({message:response.result,buttonNames:['Ok']});
    }
}

function loadAndDisplayPhotoAlbums(parent) {
    var response = restCall("GET", getLibrary().photoAlbumsUri + "?attr.incl=name&attr.incl=photosUri&attr.incl=photoCount&attr.incl=firstDate&attr.incl=lastDate", {});
    if (response.status / 100 === 2) {
        var data = removeEmptyPhotoAlbums(response.result);
        if (data.length === 0) {
        	showError({message:L("photoalbums.noneFound"),buttonNames:['Ok']});
        } else {
	    	new PhotoAlbumsWindow(data).open(parent);
	    }
    } else {
	    showError({message:response.result,buttonNames:['Ok']});
    }
}

function refreshSmartPlaylist(playlistUri) {
    var response = restCall("POST", playlistUri + "/refresh?attr.incl=none", {});
    if (response.status / 100 != 2) {
	    showError({message:L("playlists.refreshError"),buttonNames:['Ok']});
    }
}

function removeEmptyPhotoAlbums(items) {
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].photoCount === 0) {
            items = items.slice(0, i).concat(items.slice(i + 1));
        }
    }
    return items;
}

function loadAndDisplayOfflineTracks(parent, album, albumArtist) {
	var result = loadOfflineAlbumTracks(album, albumArtist);
    if (result.length === 0) {
    	showError({message:L("tracks.offline.noneFound"),buttonNames:['Ok']});
    } else {
    	new TracksWindow(result).open(parent);
    }
}

function mapTrack(rs) {
	return {
		id : rs.fieldByName("id"),
		name : rs.fieldByName("name"),
		artist : rs.fieldByName("artist"),
		imageUri : "",
		imageHash : rs.fieldByName("image_hash"),
		mediaType : rs.fieldByName("media_type"),
		time : rs.fieldByName("time")
	};	
}

function removeObsoleteTracks(tracks) {
	var db = Titanium.Database.open("OfflineTracks");
	var rs = db.execute("SELECT id FROM track");
	while (rs.isValidRow()) {
		var trackId = rs.fieldByName("id");
		var obsolete = true;
		for (var i = 0; i < tracks.length; i++) {
			if (trackId === tracks[i].id) {
				obsolete = false;
				break;
			}
		}
		if (obsolete) {
			db.execute("DELETE FROM track WHERE id = ?", trackId);
			getFileForTrackCache(trackId).deleteFile();
		}
		rs.next();
	}
	db.close();
}

function loadAndDisplayTracks(parent, tracksUri) {
    var response = restCall("GET", tracksUri + "?" + TRACK_ATTRIBUTES, {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	showError({message:L("tracks.online.noneFound"),buttonNames:['Ok']});
        } else {
	    	new TracksWindow(data).open(parent);
	    }
    } else {
    	showError({message:response.result,buttonNames:['Ok']});
    }
}

function loadAndDisplayPhotos(parent, photosUri) {
    var response = restCall("GET", photosUri + "?attr.incl=name&attr.incl=date&attr.incl=thumbnailImageUri&attr.incl=originalImageUri", {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	showError({message:L("photos.noneFound"),buttonNames:['Ok']});
        } else {
	    	new PhotosWindow(response.result).open(parent);
	    }
    } else {
    	showError({message:response.result,buttonNames:['Ok']});
    }
}

function loadTracks(tracksUri) {
    var response = restCall("GET", tracksUri + "?" + TRACK_ATTRIBUTES, {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	showError({message:L("tracks.online.noneFound"),buttonNames:['Ok']});
        } else {
			return data;
	    }
    } else {
    	showError({message:response.result,buttonNames:['Ok']});
    }
    return undefined;
}

function loadOfflineAlbumTracks(album, albumArtist) {
	db = Titanium.Database.open("OfflineTracks");
	rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE name IS NOT NULL AND LOWER(album) = LOWER(?) AND LOWER(album_artist) = LOWER(?) ORDER BY disc_number, track_number", album, albumArtist);
	result = [];
	while (rs.isValidRow()) {
		result.push(mapTrack(rs));
		rs.next();
	}
	db.close();
	return result;	
}

function loadOfflineArtistsTracks(artist) {
	db = Titanium.Database.open("OfflineTracks");
	rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE name IS NOT NULL AND LOWER(artist) = LOWER(?) ORDER BY disc_number, track_number", artist);
	result = [];
	while (rs.isValidRow()) {
		result.push(mapTrack(rs));
		rs.next();
	}
	db.close();
	return result;	
}

function loadOfflineGenreTracks(genre) {
	db = Titanium.Database.open("OfflineTracks");
	rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE name IS NOT NULL AND LOWER(genre) = LOWER(?) ORDER BY disc_number, track_number", genre);
	result = [];
	while (rs.isValidRow()) {
		result.push(mapTrack(rs));
		rs.next();
	}
	db.close();
	return result;	
}

function loadAndDisplayMovies(parent) {
    var response = restCall("GET", getLibrary().moviesUri + "?attr.incl=name&attr.incl=httpLiveStreamUri&attr.incl=playbackUri&attr.incl=mediaType&attr.incl=imageUri&attr.incl=imageHash&attr.incl=protected", {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	showError({message:L("movies.noneFound"),buttonNames:['Ok']});
        } else {
	    	new MoviesWindow(data).open(parent);
	    }
    } else {
    	showError({message:response.result,buttonNames:['Ok']});
    }
}

function loadAndDisplayTvShows(parent) {
    var response = restCall("GET", getLibrary().tvShowsUri, {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	showError({message:L("tvshows.noneFound"),buttonNames:['Ok']});
        } else {
	    	new TvShowsWindow(response.result).open(parent);
	    }
    } else {
    	showError({message:response.result,buttonNames:['Ok']});
    }
}

function loadAndDisplayTvShowSeasons(parent, seasonsUri) {
    var response = restCall("GET", seasonsUri, {});
    if (response.status / 100 === 2) {
        if (response.result.length === 0) {
        	showError({message:L("tvshows.seasons.noneFound"),buttonNames:['Ok']});
        } else {
	    	new TvShowSeasonsWindow(response.result).open(parent);
	    }
    } else {
    	showError({message:response.result,buttonNames:['Ok']});
    }
}

function searchAndDisplayTracks(parent, searchTerm) {
	if (offlineMode) {
		db = Titanium.Database.open("OfflineTracks");
		like = "%" + searchTerm + "%";
		rs = db.execute("SELECT id, name, artist, image_hash, media_type, time FROM track WHERE name LIKE ? OR album LIKE ? OR album_artist LIKE ? OR artist LIKE ? OR genre LIKE ? ORDER BY album, album_artist, disc_number, track_number", like, like, like, like, like);
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
	    	showError({message:L("tracks.search.offline.noneFound"),buttonNames:['Ok']});
	    } else {
	    	new TracksWindow(result).open(parent);
	    }
	} else {
	    var response = restCall("GET", getLibrary().tracksUri + "?term=" + Titanium.Network.encodeURIComponent(searchTerm) + "&fuzziness=" + (100 - Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY)) + "&" + TRACK_ATTRIBUTES, {});
	    if (response.status / 100 === 2) {
	    	var data = removeUnsupportedTracks(response.result);
	        if (data.length === 0) {
	        	showError({message:L("tracks.search.online.noneFound"),buttonNames:['Ok']});
	        } else {
		    	new TracksWindow(data).open(parent);
		    }
	    } else {
	    	showError({message:response.result,buttonNames:['Ok']});
	    }	
	}
}

function getServerVersion() {
	var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest?attr.incl=version", {});
	if (response.status / 100 === 2 && response.result.version != undefined && response.result.version.text != undefined) {
		return response.result.version;
	} else {
	    return undefined;
	}
}

function compareVersions(left, right) {
	if (left.major != right.major) {
		return left.major - right.major;
	}
	if (left.minor != right.minor) {
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
	var baseDir = getServerBasedCacheDir();
	var dir = Titanium.Filesystem.getFile(baseDir, "cache", "images");
	if (dir.exists()) {
		dir.deleteDirectory(true);
	}
}

function clearTrackCache() {
	var baseDir = getServerBasedCacheDir();
	var dir = Titanium.Filesystem.getFile(baseDir, "cache", "tracks");
	if (dir.exists()) {
		dir.deleteDirectory(true);
	}
	db = Titanium.Database.open("OfflineTracks");
	db.execute("DELETE FROM track");
	db.close();
}

function resetTrackCachePlayCount() {
	try {
		db = Titanium.Database.open("OfflineTracks");
		db.execute("UPDATE track SET play_count = 0");
	} finally {
		db.close();
	}
}

function getImageCacheFile(cacheObjectId) {
	var baseDir = getServerBasedCacheDir();
	var dir = Titanium.Filesystem.getFile(baseDir, "cache");
	if (!dir.exists()) {
		dir.createDirectory();
	}
	dir = Titanium.Filesystem.getFile(baseDir, "cache", "images");
	if (!dir.exists()) {
		dir.createDirectory();
	}
	return Titanium.Filesystem.getFile(baseDir, "cache/images/" + cacheObjectId);	
}

function getCacheableImageUri(cacheObjectId, uri) {
	return "http://localhost:" + HTTP_SERVER_PORT + "/image/" + cacheObjectId + "/" + encodeURIComponent(uri);
}

function downloadImage(cacheObjectId, uri, callback) {
	var httpClient = Titanium.Network.createHTTPClient();
	if (callback != undefined) {
		httpClient.onload = callback;
		httpClient.onerror = callback;
	}
	httpClient.open("GET", uri, callback != undefined);
	httpClient.setFile(getImageCacheFile(cacheObjectId));
	httpClient.send();
}

function getFileForTrackCache(id) {
	return Titanium.Filesystem.getFile(getTrackCacheBaseDir().getNativePath(), id);
}

function getTrackCacheBaseDir() {
	var baseDir = getServerBasedCacheDir();
	var dir = Titanium.Filesystem.getFile(baseDir, "cache");
	if (!dir.exists()) {
		dir.createDirectory();
	}
	dir = Titanium.Filesystem.getFile(baseDir, "cache", "tracks");
	if (!dir.exists()) {
		dir.createDirectory();
	}
	return dir;
}

function getCachedTrackFile(id) {
	var file = getFileForTrackCache(id);
	if (file.exists()) {
		return file;
	} else {
		return undefined;
	}
}

function cacheTrack(id, headUri, uri, progressCallback, doneCallback) {
	var file = getFileForTrackCache(id);
	if (file.exists()) {
		if (isStaleCache(headUri, file.modificationTimestamp())) {
			Titanium.API.debug("Deleting stale cache file \"" + file.getName() + "\".");
			file.deleteFile();
		}
	}
	if (file.exists()) {
		if (doneCallback != undefined) {
			doneCallback({});
		}
	} else {
		var httpClient = Titanium.Network.createHTTPClient();
		if (progressCallback != undefined) {
			httpClient.ondatastream = function(e) {
				if (!progressCallback(e.progress * 100)) {
					httpClient.abort();
					if (doneCallback != undefined) {
						doneCallback({aborted:true});
					}
				}
			};
		}
		if (doneCallback != undefined) {
			httpClient.onload = doneCallback;
			httpClient.onerror = doneCallback;
		}
		httpClient.open("GET", uri, progressCallback != undefined || doneCallback != undefined);
		httpClient.setFile(file);
		httpClient.send();
	}
}

function deleteCachedTrackFile(id) {
	getFileForTrackCache(id).deleteFile();
}

function pingServer() {
	restCall("GET", Titanium.App.Properties.getString("resolvedServerUrl") + "/rest/session?attr.incl=dummy");
}

function showError(options) {
	if (!options.message || options.message === "") {
		options.message = L("servererror.UNKNOWN");
	} else {
		options.message = L("servererror." + options.message, options.message);
	}
	var idleTimerDisabled = Titanium.App.getIdleTimerDisabled();
	enableIdleTimer();
	Titanium.UI.createAlertDialog(options).show();
    Titanium.API.debug("Idle timer " + idleTimerDisabled ? "off" : "on" + ".");
	Titanium.App.setIdleTimerDisabled(idleTimerDisabled);
}

function rememberServerUrl(url) {
	var urls = getRememberedServerUrls();
	var index = urls.indexOf(url);
	if (index != -1) {
		urls.splice(index, 1);
	}
	urls.splice(0, 0, url);
	if (urls.length > 20) {
		urls.splice(20, urls.length - 20);
	}
	Titanium.App.Properties.setList("serverUrls", urls);
}

function getLastRememberedServerUrl() {
	var urls = getRememberedServerUrls();
	return urls.length > 0 ? urls[0] : ""; 
}

function getRememberedServerUrls() {
	return Titanium.App.Properties.getList("serverUrls", []);	
}

function toDisplayDate(ts) {
    var date = new Date(ts);
    return String.formatDate(date, "short");
    //return L("date", date.getDate(), date.getMonth() + 1, date.getFullYear());
}

function getSettingsMaxPhotoSize() {
    return Titanium.App.Properties.getInt("maxPhotoSize", Titanium.Platform.osname === "ipad" ? 2048 : 1136);
}

function getSettingsPhotoJpegQuality() {
    return Titanium.App.Properties.getInt("photoJpegQuality", 75);
}

function isIos7() {
	return Titanium.Platform.version.split(".")[0] === "7";
}

function downloadTracksForUri(win, tracksUri, displayName, analyticsEvent) {
    var busyView = createBusyView();
    win.add(busyView);
    disableIdleTimer();
    var tracks;
    try {
	    tracks = removeUnsupportedAndNonAudioTracks(loadTracks(tracksUri));
    } finally {
	    enableIdleTimer();
        win.remove(busyView);
    }
    downloadTracksForList(win, tracks, displayName, analyticsEvent);
}

function downloadTracksForList(win, tracks, displayName, analyticsEvent) {
    if (tracks != undefined && tracks.length > 0) {
    	Titanium.Analytics.featureEvent(analyticsEvent);
	    CANCEL_SYNC_AUDIO_TRACKS = false;
	    var busyWindow = new BusyWindow(L("busy.downloading"), displayName, function() {
		    CANCEL_SYNC_AUDIO_TRACKS = true;
	    });
	    busyWindow.open();
	    disableIdleTimer();
	    var syncProgress = function(e) {
		    busyWindow.setProgress(e.progress);
	    };
	    var syncDone = function() {
		    enableIdleTimer();
		    busyWindow.close();
		    Titanium.App.removeEventListener("mytunesrss_sync_progress", syncProgress);
		    Titanium.App.removeEventListener("mytunesrss_sync_done", syncDone);
	    };
	    Titanium.App.addEventListener("mytunesrss_sync_progress", syncProgress);
	    Titanium.App.addEventListener("mytunesrss_sync_done", syncDone);
	    Titanium.App.fireEvent("mytunesrss_sync", {data:tracks,index:0});
    }	
}

function deleteLocalTracks(win, tracks, analyticsEvent) {
	if (tracks != undefined && tracks.length > 0) {
	   	var db = Titanium.Database.open("OfflineTracks");
		for (var i = 0; i < tracks.length; i++) {
			Titanium.API.debug("Deleting local track \"" + tracks[i].name + "\".");
    		deleteCachedTrackFile(tracks[i].id);
			db.execute("DELETE FROM track WHERE id = ?", tracks[i].id);
		}
		db.close();
	}
}

function createCommonListView(template) {
	return isIos7() ? GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : (isIos7() ? 58: 48),search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:("default")}) : GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"default":template},defaultItemTemplate:("default")});
}

function createCommonBackButton() {
    var buttonBackArgs = {title:L("common.back")};
    if (!isIos7()) {
        buttonBackArgs.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
    }
	return GUI.createButton(buttonBackArgs);
}

function addMoreMenuToTemplate(template) {
    template.childTemplates.push({
		type : "Titanium.UI.MaskedImage",
		bindId : "optionsMenu",
		properties : {
			width : 42,
			height : 43,
            right : 5,
            image : (isIos7() ? "ios7/images/more.png" : "images/more.png"),
            touchEnabled : false,
            tint : isIos7() ? "#007AFF" : "#CCCCCC"
		}
	});
}

function addTextColorToTemplates(template, indices) {
    if (!isIos7()) {
    	for (var i = 0; i < indices.length; i++) {
	        template.childTemplates[indices[i]].properties.color = "#CCCCCC";    
    	}
    }
}

var IDLE_TIMER_COUNT = 0;

function disableIdleTimer() {
	if (IDLE_TIMER_COUNT === 0) {
		Titanium.API.debug("Disabling idle timer.");
		Titanium.App.setIdleTimerDisabled(true);
	}
	IDLE_TIMER_COUNT++;
}

function enableIdleTimer() {
	IDLE_TIMER_COUNT--;
	if (IDLE_TIMER_COUNT === 0) {
		Titanium.API.debug("Enabling idle timer.");
		Titanium.App.setIdleTimerDisabled(false);
	}
}
