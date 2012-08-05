function MenuWindow() {
	
	var self = this;
	var myParent;
	
	var win = createWindow();
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var searchBar = Titanium.UI.createSearchBar({hintText:'Search',left:0,right:0,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});
	searchBar.addEventListener('return', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    searchBar.showCancel = false;
	    searchBar.blur();
	    if (searchBar.value.length === 0) {
	        Titanium.UI.createAlertDialog({message:'Please enter a search term.',buttonNames:['Ok']}).show();
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
	
	var buttonLogout = Titanium.UI.createButton({title:"Logout",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonLogout.addEventListener('click', function() {
		jukebox.destroy();
	    jukebox = new Jukebox();
		if (pinger !== undefined) {
			clearInterval(pinger);
		}
		pinger = undefined;
		myParent.open();
	    win.close();
	});

	var buttonSettings = Titanium.UI.createButton({title:"Settings",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonSettings.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
		var response = restCall("GET", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=transcoders&attr.incl=searchFuzziness", {});
		if (response.status / 100 === 2) {
			new SettingsWindow(response.result.transcoders, response.result.searchFuzziness).open(self);
		} else {
		    Titanium.UI.createAlertDialog({message:'Could not load current settings.',buttonNames:['Ok']}).show();
		}
		win.remove(busyView);
	});
	
	function createMenuItem(item) {
		item.height = 50;
		item.className = "menu_item";
		item.hasChild = true;
		item.selectionStyle = Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE;
		var row = Titanium.UI.createTableViewRow(item);
		return row;
	}
	
	var tableView = Titanium.UI.createTableView({top:45,bottom:50,backgroundImage:"images/stripe.png",scrollable:false});
	var rowPlaylists = createMenuItem({title:"Playlists"});
	rowPlaylists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayPlaylists(self);
	    win.remove(busyView);
	});

	var rowAlbums = createMenuItem({title:"Albums"});
	rowAlbums.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayAlbums(self, getLibrary().albumsUri);
	    win.remove(busyView);
	});

	var rowArtists = createMenuItem({title:"Artists"});
	rowArtists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayArtists(self);
	    win.remove(busyView);
	});

	var rowGenres = createMenuItem({title:"Genres"});
	rowGenres.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayGenres(self);
	    win.remove(busyView);
	});

	var rowMovies = createMenuItem({title:"Movies"});
	rowMovies.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayMovies(self);
	    win.remove(busyView);
	});

	var rowTvShows = createMenuItem({title:"TV Shows"});
	rowTvShows.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayTvShows(self);
	    win.remove(busyView);
	});

	var rowNowPlaying = createMenuItem({title:"Currently playing"});
	rowNowPlaying.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    if (jukebox.isActive()) {
	    	win.close();
	        jukebox.open(new TracksWindow(jukebox.getCurrentPlaylist(), jukebox), self);
	    } else {
	        Titanium.UI.createAlertDialog({message:"There is no active playlist.",buttonNames:['Ok']}).show();
	    }
	    win.remove(busyView);
	});
			
	addTopToolbar(win, "MyTunesRSS", buttonLogout, buttonSettings);
	win.add(searchBar);
	win.add(tableView);
	win.add(Titanium.UI.iOS.createAdView({adSize:Titanium.UI.iOS.AD_SIZE_LANDSCAPE,bottom:0,height:50}));
	
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		var rows = [rowPlaylists, rowAlbums, rowArtists, rowGenres, rowMovies, rowTvShows];
		tableView.height = 300;
		if (jukebox.isActive()) {
			rows.push(rowNowPlaying);
			tableView.height = 350;
		}
		tableView.setData(rows);
		win.open();
	}

}
