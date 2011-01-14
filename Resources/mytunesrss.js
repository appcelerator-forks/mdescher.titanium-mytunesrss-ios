var FETCH_SIZE = 1000;
var DEFAULT_AUDIO_BUFFER_SIZE = 2048;

function ajaxCall(func, parameterArray, resultCallback) {
    var httpClient = Titanium.Network.createHTTPClient({timeout:30000});
    httpClient.onload = function() {
        if (this.status == 200) {
            var response = JSON.parse(this.responseText);
            resultCallback(response.result, response.error);
        } else {
            resultCallback(undefined, {'msg':'The MyTunesRSS server encountered an internal error, please contact the server admin.'});
        }
    };
    httpClient.onerror = function() {
        resultCallback(undefined, undefined);
    };
    httpClient.open('POST', Titanium.App.Properties.getString('resolvedServerUrl') + '/jsonrpc');
    httpClient.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    if (Titanium.App.Properties.getString('jsonRpcSessionId') != undefined) {
        httpClient.setRequestHeader('X-MyTunesRSS-ID', Titanium.App.Properties.getString('jsonRpcSessionId'));
    }
    httpClient.setRequestHeader('Accept-Encoding', 'gzip,deflate');
    var data = {
        'version' : '1.1',
        'method' : func,
        'id' : '0',
        'params' : parameterArray
    };
    httpClient.send(JSON.stringify(data));
}

function getDisplayName(name) {
    if (name == 'undefined' || name == null || name == '!') {
        return 'Unknown';
    }
    return name;
}

function internalSetTableDataAndIndex(section, startIndex, tableView, fetchItemsCallback, tableCompleteCallback, createTableViewRowCallback, getSectionAndIndexNameCallback) {
	fetchItemsCallback(startIndex, FETCH_SIZE, function(items) {
		var sectionTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '123'];
		var indexTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
		for (var i = 0; i < items.length; i++) {
			var itemName = getSectionAndIndexNameCallback(items[i]);
			var index = itemName[0].toUpperCase().charCodeAt(0) - 65;
			if (index < 0 || index > 25) {
				index = 26;
			}
			if (!section[index]) {
				section[index] = Titanium.UI.createTableViewSection({headerTitle:sectionTitle[index]});
			}
			section[index].add(createTableViewRowCallback(items[i], i));
		}
		if (items.length < FETCH_SIZE) {
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
            tableCompleteCallback();
		} else {
			internalSetTableDataAndIndex(section, startIndex + FETCH_SIZE, tableView, fetchItemsCallback, tableCompleteCallback, createTableViewRowCallback, getSectionAndIndexNameCallback);
		}
	});
}

function setTableDataAndIndex(tableView, fetchItemsCallback, tableCompleteCallback, createTableViewRowCallback, getSectionAndIndexNameCallback) {
	internalSetTableDataAndIndex(new Array(27), 0, tableView, fetchItemsCallback, tableCompleteCallback, createTableViewRowCallback, getSectionAndIndexNameCallback);
}

function addTopToolbar(window, titleText, leftButton, rightButton) {
    var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
    var toolbarItems = [];
    if (leftButton) {
        toolbarItems.push(leftButton);
    }
    toolbarItems.push(flexSpace);
    if (rightButton) {
        toolbarItems.push(rightButton);
    }
    window.add(Titanium.UI.createToolbar({top:0,height:45,items:toolbarItems}));
    if (titleText) {
        var title = Titanium.UI.createLabel({text:titleText,left:0,right:0,top:0,height:45,textAlign:'center',color:'#FFF',font:{fontSize:20,fontWeight:'bold'}});
        window.add(title);
    }
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
        if (items[i].mediaType != 'Audio' && items[i].mediaType != 'Video') {
            items = items.slice(0, i).concat(items.slice(i + 1));
        }
    }
    return items;
}

function loadAndDisplayAlbums(artistName, genreName) {
    var winAlbums = Titanium.UI.createWindow({url:'win_albums.js',backgroundColor:'#FFF'});
    winAlbums.fetchItemsCallback = function(fetchStart, fetchSize, fetchResultCallback) {
        ajaxCall('AlbumService.getAlbums', [null, artistName, genreName, -1, -1, -1, false, fetchStart, fetchSize], function(result, error) {
            if (result) {
                fetchResultCallback(result.results);
            } else {
                actIndicatorView.hide();
                handleServerError(error);
            }
        });
    };
    winAlbums.open();    
}

function loadAndDisplayArtists() {
    var winArtists = Titanium.UI.createWindow({url:'win_artists.js',backgroundColor:'#FFF'});
    winArtists.fetchItemsCallback = function(fetchStart, fetchSize, fetchResultCallback) {
        ajaxCall('ArtistService.getArtists', [null, null, null, -1, fetchStart, fetchSize], function(result, error) {
            if (result) {
                fetchResultCallback(result.results);
            } else {
                actIndicatorView.hide();
                handleServerError(error);
            }
        });
    };
    winArtists.open();
}

function loadAndDisplayGenres() {
    var winGenres = Titanium.UI.createWindow({url:'win_genres.js',backgroundColor:'#FFF'});
    winGenres.fetchItemsCallback = function(fetchStart, fetchSize, fetchResultCallback) {
        ajaxCall('GenreService.getGenres', [-1, fetchStart, fetchSize], function(result, error) {
            if (result) {
                fetchResultCallback(result.results);
            } else {
                actIndicatorView.hide();
                handleServerError(error);
            }
        });
    };
    winGenres.open();
}

function loadAndDisplayPlaylists() {
    var winPlaylists = Titanium.UI.createWindow({url:'win_playlists.js',backgroundColor:'#FFF'});
    winPlaylists.fetchItemsCallback = function(fetchStart, fetchSize, fetchResultCallback) {
        if (fetchStart > 0) {
            return new Array(0);
        }
        ajaxCall('PlaylistService.getPlaylists', [], function(result, error) {
            if (result) {
                fetchResultCallback(result.results);
            } else {
                actIndicatorView.hide();
                handleServerError(error);
            }
        });
    };
    winPlaylists.open();
}