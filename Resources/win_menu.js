function MenuWindow() {
	
	var self = this;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	
	var searchBar = Titanium.UI.createSearchBar({hintText:L("menu.search.hint"),width:Titanium.UI.FILL,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false,barColor:"#000000"});
	searchBar.addEventListener('return', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try  {
	        searchBar.showCancel = false;
	        searchBar.blur();
	        if (searchBar.value.length === 0) {
	            showError({message:L("menu.missingSearchTerm"),buttonNames:['Ok']});
	        } else {
	            searchAndDisplayTracks(self, searchBar.value);
	        }
        } finally {
    	    win.remove(busyView);
        }
	});
	searchBar.addEventListener('focus', function() {
	    searchBar.showCancel = true;
	});	
	searchBar.addEventListener('cancel', function() {
	    searchBar.showCancel = false;
	    searchBar.blur();        
	});
	
	var buttonLogout;
	if (offlineMode) {
		buttonLogout = GUI.createButton({title:L("menu.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	} else {
		buttonLogout = GUI.createButton({title:L("menu.logout"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	} 
	buttonLogout.addEventListener('click', function() {
		jukebox.reset();
		connectedUsername = undefined;
		connectedPassword = undefined;
	    win.close();
	});

	var buttonSettings = GUI.createButton({image:"images/config.png",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonSettings.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
		    if (offlineMode) {
			    new SettingsWindow().open(self);
		    } else {
			    var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=transcoders&attr.incl=searchFuzziness", {});
			    if (response.status / 100 === 2) {
				    new SettingsWindow(response.result.transcoders, response.result.searchFuzziness).open(self);
			    } else {
			        showError({message:L("menu.settings.loadFailed"),buttonNames:['Ok']});
			    }
		    }
        } finally {
		    win.remove(busyView);
        }
	});
	
	function createMenuItem(label, leftImage) {
		var row = Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE}));
		row.add(Titanium.UI.createLabel(STYLE.get("menuLabel",{text:label})));
		row.add(Titanium.UI.createImageView(STYLE.get("menuLeftImage",{image:leftImage})));
		return row;
	}
	
	var tableView = GUI.createTableView(getAdSpacingStyleIfOnline({top:90,scrollable:false}));
	
	var rowPlaylists = createMenuItem(L("menu.playlists"), "images/playlists.png");
	rowPlaylists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
    	    loadAndDisplayPlaylists(self);
        } finally {
    	    win.remove(busyView);
        }
	});

	var rowAlbums = createMenuItem(L("menu.albums"), "images/albums.png");
	rowAlbums.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        if (!offlineMode) {
	        	loadAndDisplayAlbums(self, getLibrary().albumsUri);
	        } else {
	        	loadAndDisplayOfflineAlbums(self, undefined, undefined);
	        }
        } finally {
	        win.remove(busyView);
        }
	});

	var rowArtists = createMenuItem(L("menu.artists"), "images/artists.png");
	rowArtists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        loadAndDisplayArtists(self);
        } finally {
	        win.remove(busyView);
        }
	});

	var rowGenres = createMenuItem(L("menu.genres"), "images/genres.png");
	rowGenres.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        loadAndDisplayGenres(self);
        } finally {
	        win.remove(busyView);
        }
	});

	var rowMovies = createMenuItem(L("menu.movies"), "images/movies.png");
	rowMovies.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        loadAndDisplayMovies(self);
        } finally {
	        win.remove(busyView);
        }
	});

	var rowTvShows = createMenuItem(L("menu.tvshows"), "images/tvshows.png");
	rowTvShows.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        loadAndDisplayTvShows(self);
        } finally {
	        win.remove(busyView);
        }
	});

	var rowRandomMode = createMenuItem(L("menu.random"), "images/random.png");
	rowRandomMode.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        jukebox.setPlaylist([getRandomOfflineTrack()], 0, true);
	        jukebox.open(self);
	        win.close();
        } finally {
	        win.remove(busyView);
        }
	});

	var rowNowPlaying = createMenuItem(L("menu.currentlyPlaying"), "images/currently.png");
	rowNowPlaying.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
        try {
	        if (jukebox.isActive()) {
	            jukebox.open(self);
	        	win.close();
	        } else {
	            showError({message:L("menu.currentlyPlaying.none"),buttonNames:['Ok']});
	        }
        } finally {
	        win.remove(busyView);
        }
	});
			
	win.add(GUI.createTopToolbar("MyTunesRSS", buttonLogout, buttonSettings));
	win.add(searchBar);
	win.add(tableView);
	addIAddIfOnline(win);
	
	this.open = function() {
		var rows = new RowArray();
		if (offlineMode) {
			rows.push(rowAlbums);
			rows.push(rowArtists);
			rows.push(rowGenres);
			if (!jukebox.isActive() || !jukebox.isRandomOfflineMode()) {
				rows.push(rowRandomMode);
			}
		} else {
			rows.push(rowPlaylists);
			rows.push(rowAlbums);
			rows.push(rowArtists);
			rows.push(rowGenres);
			rows.push(rowMovies);
			rows.push(rowTvShows);	
		}
		if (jukebox.isActive()) {
			rows.push(rowNowPlaying);
		}
		tableView.height = rows.getRows()[0].height * rows.getLength();
		tableView.setData(rows.getRows());
		win.open();
	}

}
