function MenuWindow() {
	
	var self = this;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);
	
	var searchBar = Titanium.UI.createSearchBar({hintText:L("menu.search.hint"),width:Titanium.UI.FILL,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});
	searchBar.addEventListener('return', function() {
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
        try  {
	        searchBar.showCancel = false;
	        searchBar.blur();
	        if (searchBar.value.length === 0) {
	            showError({message:L("menu.missingSearchTerm"),buttonNames:['Ok']});
	        } else {
	            searchAndDisplayTracks(self, searchBar.value);
	        }
        } finally {
    	    mediaControlsView.remove(busyView);
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
		buttonLogout = GUI.createButton({title:L("menu.back")});
	} else {
		buttonLogout = GUI.createButton({title:L("menu.logout")});
	}
	if (!isIos7()) {
		buttonLogout.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	buttonLogout.addEventListener('click', function() {
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		jukebox.reset();
		connectedUsername = undefined;
		connectedPassword = undefined;
	    win.close();
	});

	var buttonSettings = GUI.createButton({image:"images/config.png"});
	if (!isIos7()) {
		buttonSettings.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	buttonSettings.addEventListener('click', function() {
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
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
        	enableIdleTimer();
		    mediaControlsView.remove(busyView);
        }
	});
	
	function createMenuItem(label, leftImage) {
		var row = Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE}));
		row.add(Titanium.UI.createLabel(STYLE.get("menuLabel",{text:label})));
		row.add(Titanium.UI.createImageView(STYLE.get("menuLeftImage",{image:leftImage})));
		return row;
	}
	
	var tableView = GUI.createTableView({top:90,scrollable:false});
	
	var rowPlaylists = createMenuItem(L("menu.playlists"), "images/playlists.png");
	rowPlaylists.addEventListener('click', function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
    	    if (loadAndDisplayPlaylists(self)) {
    	    	win.close();
    	    }
        } finally {
        	enableIdleTimer();
    	    mediaControlsView.remove(busyView);
        }
	});

	var rowAlbums = createMenuItem(L("menu.albums"), "images/albums.png");
	rowAlbums.addEventListener('click', function() {
		searchBar.blur();
        if (!offlineMode) {
        	new SectionsWindow(L("menu.albums")).open(self, function(requestIndex) {
	        	if (loadAndDisplayAlbums(self, getLibrary().albumsUri, requestIndex)) {
	        		win.close();
	        		return true;
	        	} else {
	        		return false;
	        	}
        	});
        } else {
			var busyView = createBusyView();
			mediaControlsView.add(busyView);
			disableIdleTimer();
	        try {
	        	if (loadAndDisplayOfflineAlbums(self, undefined, undefined)) {
	        		win.close();
	        	}
	        } finally {
	        	enableIdleTimer();
		        mediaControlsView.remove(busyView);
	        }
        }
	});

	var rowArtists = createMenuItem(L("menu.artists"), "images/artists.png");
	rowArtists.addEventListener('click', function() {
		searchBar.blur();
		if (!offlineMode) {
        	new SectionsWindow(L("menu.artists")).open(self, function(requestIndex) {
		        if (loadAndDisplayArtists(self, requestIndex)) {
			        win.close();
	        		return true;
	        	} else {
	        		return false;
	        	}
        	});
		} else {
			var busyView = createBusyView();
			mediaControlsView.add(busyView);
			disableIdleTimer();
	        try {
		        if (loadAndDisplayArtists(self)) {
			        win.close();
		        }
	        } finally {
	        	enableIdleTimer();
		        mediaControlsView.remove(busyView);
	        }
		}
	});

	var rowGenres = createMenuItem(L("menu.genres"), "images/genres.png");
	rowGenres.addEventListener('click', function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
	        if (loadAndDisplayGenres(self)) {
	        	win.close();
	        }
        } finally {
        	enableIdleTimer();
	        mediaControlsView.remove(busyView);
        }
	});

	var rowMovies = createMenuItem(L("menu.movies"), "images/movies.png");
	rowMovies.addEventListener('click', function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
	        if (loadAndDisplayMovies(self)) {
	        	win.close();	        	
	        }
        } finally {
        	enableIdleTimer();
	        mediaControlsView.remove(busyView);
        }
	});

	var rowTvShows = createMenuItem(L("menu.tvshows"), "images/tvshows.png");
	rowTvShows.addEventListener('click', function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
	        if (loadAndDisplayTvShows(self)) {
		        win.close();
	        }
        } finally {
        	enableIdleTimer();
	        mediaControlsView.remove(busyView);
        }
	});

	var rowRandomMode = createMenuItem(L("menu.random"), "images/random.png");
	rowRandomMode.addEventListener('click', function() {
		searchBar.blur();
		if (jukebox.isIos61BugPhase()) {
			return;
		}
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
        	var track = getRandomOfflineTrack();
        	if (track != undefined) {
		        jukebox.setPlaylist([track], 0, false, true);
		        jukebox.open(self);
		        win.close();
        	} else {
        		showError({message:L("tracks.offline.noneFound"),buttonNames:['Ok']});
        	}
        } finally {
        	enableIdleTimer();
	        mediaControlsView.remove(busyView);
        }
	});

	var rowPhotoalbums = createMenuItem(L("menu.photoalbums"), "images/photoalbums.png");
	rowPhotoalbums.addEventListener('click', function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
    	    if (loadAndDisplayPhotoAlbums(self)) {
	    	    win.close();
    	    }
        } finally {
        	enableIdleTimer();
    	    mediaControlsView.remove(busyView);
        }
	});

	var rowRemoteControl = createMenuItem(L("menu.remotecontrol"), "images/remote.png");
	rowRemoteControl.addEventListener("click", function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
    	    if (loadAndDisplayRemoteControl(self)) {
	    	    win.close();
    	    }
        } finally {
        	enableIdleTimer();
    	    mediaControlsView.remove(busyView);
        }
	});

	var rowNowPlaying = createMenuItem(L("menu.currentlyPlaying"), "images/currently.png");
	rowNowPlaying.addEventListener('click', function() {
		searchBar.blur();
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
	        if (jukebox.isActive()) {
	            jukebox.open(self);
	        	win.close();
	        } else {
	            showError({message:L("menu.currentlyPlaying.none"),buttonNames:['Ok']});
	        }
        } finally {
        	enableIdleTimer();
	        mediaControlsView.remove(busyView);
        }
	});
			
	mediaControlsView.add(GUI.createTopToolbar("MyTunesRSS", buttonLogout, buttonSettings));
	mediaControlsView.add(searchBar);
	mediaControlsView.add(tableView);
	
	this.open = function() {
		var rows = new RowArray();
		if (offlineMode) {
            if (Titanium.App.Properties.getBool("mainMenuAlbums", true)) {
    			rows.push(rowAlbums);
            }
            if (Titanium.App.Properties.getBool("mainMenuArtists", true)) {
			    rows.push(rowArtists);
            }
            if (Titanium.App.Properties.getBool("mainMenuGenres", true)) {
    			rows.push(rowGenres);
            }
			if ((!jukebox.isActive() || !jukebox.isRandomOfflineMode()) && Titanium.App.Properties.getBool("mainMenuOfflineShuffle", true)) {
				rows.push(rowRandomMode);
			}
		} else {
			var permissions = getPermissions();
            if (Titanium.App.Properties.getBool("mainMenuPlaylists", true)) {
    			rows.push(rowPlaylists);
            }
            if (permissions.indexOf("audio") >= 0 && Titanium.App.Properties.getBool("mainMenuAlbums", true)) {
    			rows.push(rowAlbums);
            }
            if (permissions.indexOf("audio") >= 0 && Titanium.App.Properties.getBool("mainMenuArtists", true)) {
    			rows.push(rowArtists);
            }
            if (Titanium.App.Properties.getBool("mainMenuGenres", true)) {
    			rows.push(rowGenres);
            }
			if (permissions.indexOf("video") >= 0 && Titanium.App.Properties.getBool("mainMenuMovies", true)) {
				rows.push(rowMovies);
			}
			if (permissions.indexOf("video") >= 0 && Titanium.App.Properties.getBool("mainMenuTvShows", true)) {
				rows.push(rowTvShows);	
			}
			if (permissions.indexOf("photos") >= 0 && Titanium.App.Properties.getBool("mainMenuPhotos", true)) {
	            rows.push(rowPhotoalbums);
			}
			if (permissions.indexOf("remoteControl") >= 0 && Titanium.App.Properties.getBool("mainMenuRemoteControl", true)) {
	            rows.push(rowRemoteControl);
			}
		}
		if (jukebox.isActive()) {
			rows.push(rowNowPlaying);
		}
		if (rows.getRows().length > 0) {
			tableView.height = rows.getRows()[0].height * rows.getLength();
			tableView.setData(rows.getRows());
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
	};

}
