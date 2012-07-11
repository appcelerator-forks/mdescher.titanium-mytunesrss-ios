var TABLE_VIEW_ROW_HEIGHT = 40;
var DEFAULT_AUDIO_BUFFER_SIZE = 2048;
var DEFAULT_SEARCH_ACCURACY = 40;
var MININUM_SERVER_VERSION = {
	major : 4,
	minor : 3,
	bugfix : 2,
	text : "4.3.2"
}
var WINDOW_BG = {
	type : 'linear',
	colors : ['#8290bd', '#111419'],
	startPoint : {x : 0, y : 0},
	endPoint : {x : '100%', y : '100%'},
	backFillStart : false
};

function restCall(method, uri, params) {
	var httpClient = Titanium.Network.createHTTPClient({timeout:30000});
	httpClient.open(method,  uri, false);
	httpClient.send(params);
	if (httpClient.status / 100 == 2) {
		return {status:httpClient.status,result:JSON.parse(httpClient.getResponseText())};
	} else {
		return {status:httpClient.status,result:httpClient.getResponseText()};
	}
}

function getDisplayName(name) {
    if (name === undefined || name === null || name === '!') {
        return 'Unknown';
    }
    return name;
}

function setTableDataAndIndex(tableView, items, createTableViewRowCallback, getSectionAndIndexNameCallback) {
	var sectionTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '123'];
	var indexTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
	var section = new Array(27);
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
    var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
    var toolbarItems = [];
    if (leftButton) {
        toolbarItems.push(leftButton);
    }
    toolbarItems.push(flexSpace);
    if (rightButton) {
        toolbarItems.push(rightButton);
    }
    window.add(Titanium.UI.iOS.createToolbar({top:0,height:45,items:toolbarItems}));
    if (titleText) {
        var title = Titanium.UI.createLabel({text:titleText,left:0,right:0,top:0,height:45,textAlign:'center',color:'#000000',font:{fontSize:20,fontWeight:'bold'}});
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

function isSessionAlive() {
	var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=");
	return response.status / 100 === 2;
}

function loadAndDisplayAlbums(uri) {
    var response = restCall("GET", uri + "?attr.incl=name&attr.incl=tracksUri&attr.incl=imageUri&attr.incl=artist");
    if (response.status / 100 === 2) {
    	albumsWindow.clearData();
	    albumsWindow.open();
    	albumsWindow.loadData(response.result);
    } else {
	    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayArtists() {
    var response = restCall("GET", getLibrary().artistsUri + "?attr.incl=name&attr.incl=albumsUri", {});
    if (response.status / 100 === 2) {
    	artistsWindow.clearData();
    	artistsWindow.open();
    	artistsWindow.loadData(response.result);
    } else {
	    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayGenres() {
    var response = restCall("GET", getLibrary().genresUri + "?attr.incl=name&attr.incl=albumsUri", {});
    if (response.status / 100 === 2) {
    	genresWindow.clearData();
    	genresWindow.open();
    	genresWindow.loadData(response.result);
    } else {
	    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayPlaylists() {
    var response = restCall("GET", getLibrary().playlistsUri + "?attr.incl=name&attr.incl=tracksUri", {});
    if (response.status / 100 === 2) {
    	playlistsWindow.clearData();
    	playlistsWindow.open();
    	playlistsWindow.loadData(response.result);
    } else {
	    Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function loadAndDisplayTracks(tracksUri) {
    var response = restCall("GET", tracksUri + "?attr.incl=name&attr.incl=playbackUri&attr.incl=httpLiveStreamUri&attr.incl=mediaType&attr.incl=artist&attr.incl=imageUri&attr.incl=time", {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No tracks matching the query found.',buttonNames:['Ok']}).show();
        } else {
	    	tracksWindow.clearData();
	    	tracksWindow.open();
	    	tracksWindow.loadData(data);
	    }
    } else {
    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
    }
}

function searchAndDisplayTracks(searchTerm) {
    var response = restCall("GET", getLibrary().tracksUri + "?term=" + Titanium.Network.encodeURIComponent(searchTerm) + "&fuzziness=" + (100 - Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY)) + "&attr.incl=name&attr.incl=playbackUri&attr.incl=httpLiveStreamUri&attr.incl=mediaType&attr.incl=artist&attr.incl=imageUri&attr.incl=time", {});
    if (response.status / 100 === 2) {
    	var data = removeUnsupportedTracks(response.result);
        if (data.length === 0) {
        	Titanium.UI.createAlertDialog({message:'No tracks matching the query found.',buttonNames:['Ok']}).show();
        } else {
	    	tracksWindow.clearData();
	    	tracksWindow.open();
	    	tracksWindow.loadData(data);
	    }
    } else {
    	Titanium.UI.createAlertDialog({message:response.result,buttonNames:['Ok']}).show();
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
	var transcoders = Titanium.App.Properties.getList("transcoders", []);
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
