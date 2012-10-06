var MENU_ITEM_HEIGHT = 44;

function MenuWindow() {
	
	var self = this;
	var myParent;
	
	var win = GUI.createWindow();
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var searchBar = Titanium.UI.createSearchBar({hintText:L("menu.search.hint"),left:0,right:0,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});
	searchBar.addEventListener('return', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    searchBar.showCancel = false;
	    searchBar.blur();
	    if (searchBar.value.length === 0) {
	        showError({message:L("menu.missingSearchTerm"),buttonNames:['Ok']});
	    } else {
	        searchAndDisplayTracks(self, searchBar.value);
	    }
	    win.remove(busyView);
	});
	searchBar.addEventListener('focus', function() {
	    searchBar.showCancel = true;
	});	
	searchBar.addEventListener('cancel', function() {
	    searchBar.showCancel = false;
	    searchBar.blur();        
	});
	
	var buttonLogout = GUI.createSmallButton({title:offlineMode ? L("menu.back") : L("menu.logout")});
	buttonLogout.addEventListener('click', function() {
		jukebox.destroy();
	    jukebox = new Jukebox();
		connectedUsername = undefined;
		connectedPassword = undefined;
		myParent.open();
	    win.close();
	});

	var buttonSettings = GUI.createSmallButton({title:L("menu.settings")});
	buttonSettings.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
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
		win.remove(busyView);
	});
	
	function createMenuItem(item) {
		item.height = MENU_ITEM_HEIGHT;
		item.className = "menu_item";
		item.hasChild = true;
		item.selectionStyle = Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE;
		var row = GUI.createTableViewRow(item);
		return row;
	}
	
	var tableView = GUI.createTableView({top:90,bottom:50,scrollable:false});
	
	var rowPlaylists = createMenuItem({title:L("menu.playlists")});
	rowPlaylists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayPlaylists(self);
	    win.remove(busyView);
	});

	var rowAlbums = createMenuItem({title:L("menu.albums")});
	rowAlbums.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    if (!offlineMode) {
	    	loadAndDisplayAlbums(self, getLibrary().albumsUri);
	    } else {
	    	loadAndDisplayOfflineAlbums(self, undefined, undefined);
	    }
	    win.remove(busyView);
	});

	var rowArtists = createMenuItem({title:L("menu.artists")});
	rowArtists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayArtists(self);
	    win.remove(busyView);
	});

	var rowGenres = createMenuItem({title:L("menu.genres")});
	rowGenres.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayGenres(self);
	    win.remove(busyView);
	});

	var rowMovies = createMenuItem({title:L("menu.movies")});
	rowMovies.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayMovies(self);
	    win.remove(busyView);
	});

	var rowTvShows = createMenuItem({title:L("menu.tvshows")});
	rowTvShows.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayTvShows(self);
	    win.remove(busyView);
	});

	var rowNowPlaying = createMenuItem({title:L("menu.currentlyPlaying")});
	rowNowPlaying.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    if (jukebox.isActive()) {
	    	win.close();
	        jukebox.open(new TracksWindow(jukebox.getCurrentPlaylist(), jukebox), self);
	    } else {
	        showError({message:L("menu.currentlyPlaying.none"),buttonNames:['Ok']});
	    }
	    win.remove(busyView);
	});
			
	win.add(GUI.createTopToolbar("MyTunesRSS", buttonLogout, buttonSettings));
	win.add(searchBar);
	win.add(tableView);
	win.add(Titanium.UI.iOS.createAdView({adSize:Titanium.UI.iOS.AD_SIZE_LANDSCAPE,bottom:0,height:50}));
	
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		var rows = offlineMode ? [rowAlbums, rowArtists, rowGenres] : [rowPlaylists, rowAlbums, rowArtists, rowGenres, rowMovies, rowTvShows];
		tableView.height = MENU_ITEM_HEIGHT * 6;
		if (jukebox.isActive()) {
			rows.push(rowNowPlaying);
			tableView.height = MENU_ITEM_HEIGHT * 7;
		}
		tableView.setData(rows);
		win.open();
	}

}
