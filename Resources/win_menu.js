var MENU_ITEM_HEIGHT = 44;

function MenuWindow() {
	
	var self = this;

	var win = GUI.createWindow({});
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var searchBar = Titanium.UI.createSearchBar({hintText:L("menu.search.hint"),width:Titanium.UI.FILL,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false,barColor:"#000000"});
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
	
	var buttonLogout;
	if (offlineMode) {
		buttonLogout = GUI.createButton({title:L("menu.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	} else {
		buttonLogout = GUI.createButton({title:L("menu.logout"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	} 
	buttonLogout.addEventListener('click', function() {
		jukebox.destroy();
	    jukebox = new Jukebox();
		connectedUsername = undefined;
		connectedPassword = undefined;
		new LoginWindow().open();
	    win.close();
	});

	var buttonSettings = GUI.createButton({image:"images/config.png",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
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
		item.rightImage = "images/children.png";
		item.height = MENU_ITEM_HEIGHT;
		item.className = "menu_item";
		item.selectionStyle = Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE;
		var label = item.title;
		item.title = undefined;
		var row = GUI.createTableViewRow(item);
		row.add(GUI.createLabel({text:label,left:60,font:{fontSize:18,fontWeight:"bold"}}))
		return row;
	}
	
	var tableView = GUI.createTableView({top:90,scrollable:false});
	
	var rowPlaylists = createMenuItem({title:L("menu.playlists"),leftImage:"images/playlists.png"});
	rowPlaylists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayPlaylists(self);
	    win.remove(busyView);
	});

	var rowAlbums = createMenuItem({title:L("menu.albums"),leftImage:"images/albums.png"});
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

	var rowArtists = createMenuItem({title:L("menu.artists"),leftImage:"images/artists.png"});
	rowArtists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayArtists(self);
	    win.remove(busyView);
	});

	var rowGenres = createMenuItem({title:L("menu.genres"),leftImage:"images/genres.png"});
	rowGenres.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayGenres(self);
	    win.remove(busyView);
	});

	var rowMovies = createMenuItem({title:L("menu.movies"),leftImage:"images/movies.png"});
	rowMovies.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayMovies(self);
	    win.remove(busyView);
	});

	var rowTvShows = createMenuItem({title:L("menu.tvshows"),leftImage:"images/tvshows.png"});
	rowTvShows.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayTvShows(self);
	    win.remove(busyView);
	});

	var rowNowPlaying = createMenuItem({title:L("menu.currentlyPlaying"),leftImage:"images/currently.png"});
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
	
	this.open = function() {
		var rows = new RowArray();
		if (offlineMode) {
			rows.push(rowAlbums);
			rows.push(rowArtists);
			rows.push(rowGenres);
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
		tableView.height = MENU_ITEM_HEIGHT * rows.getLength();
		tableView.setData(rows.getRows());
		win.open();
	}

}
