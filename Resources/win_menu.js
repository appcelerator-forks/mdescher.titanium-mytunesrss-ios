function MenuWindow() {
	
	var self = this;
	var myParent;
	
	var win = createWindow();
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var searchBar = Titanium.UI.createSearchBar({hintText:'Search',left:0,right:0,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});
	
	var buttonLogout = Titanium.UI.createButton({title:'Logout',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonSettings = Titanium.UI.createButton({title:'Settings',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var layout;
	if (Titanium.Platform.osname === "ipad") {
		layout = {
			size : 128,
			top : 140,
			middle : 330,
			bottom : 520,
			side : 80,
			suffix : ""
		};
	} else {
		layout = {
			size : 64,
			top : 110,
			middle : 190,
			bottom : 270,
			side : 40,
			suffix : ""
		};
	}
	var buttonAlbums = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.top,left:layout.side});
	var buttonArtists = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.top});
	var buttonGenres = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.top,right:layout.side});
	var buttonPlaylists = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.middle,left:layout.side});
	var buttonMovies = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.middle});
	var buttonTvShows = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.middle,right:layout.side});
	var buttonNowPlaying = Titanium.UI.createButton({image:"images/menu_albums" + layout.suffix + ".jpg",width:layout.size,height:layout.size,top:layout.bottom});
	
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
	
	buttonPlaylists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayPlaylists(self);
	    win.remove(busyView);
	});
	
	buttonAlbums.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayAlbums(self, getLibrary().albumsUri);
	    win.remove(busyView);
	});
	
	buttonArtists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayArtists(self);
	    win.remove(busyView);
	});
	
	buttonGenres.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayGenres(self);
	    win.remove(busyView);
	});
	
	buttonMovies.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayMovies(self);
	    win.remove(busyView);
	});

	buttonTvShows.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayTvShows(self);
	    win.remove(busyView);
	});

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
	
	buttonNowPlaying.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    if (jukebox.isActive()) {
	    	win.close();
	        jukebox.open(new TracksWindow(jukebox.getCurrentPlaylist(), jukebox), self);
	    } else {
	        Titanium.UI.createAlertDialog({message:'There is no active playlist.',buttonNames:['Ok']}).show();
	    }
	    win.remove(busyView);
	});
		
	addTopToolbar(win, 'MyTunesRSS', buttonLogout, buttonSettings);
	win.add(searchBar);
	win.add(buttonAlbums);
	win.add(buttonArtists);
	win.add(buttonGenres);
	win.add(buttonPlaylists);
	win.add(buttonMovies);
	win.add(buttonTvShows);
	win.add(buttonNowPlaying);
	win.add(actIndicatorView);
	
	win.add(Titanium.UI.iOS.createAdView({adSize:Titanium.UI.iOS.AD_SIZE_LANDSCAPE,bottom:0,height:50}));
	
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		if (jukebox.isActive()) {
			buttonNowPlaying.show();
		} else{
			buttonNowPlaying.hide();
		}
		win.open();
	}

}
