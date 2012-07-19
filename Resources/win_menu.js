function MenuWindow() {
	
	var self = this;
	var myParent;
	
	function wrap(components) {
	    var row = Titanium.UI.createTableViewRow({hasChild:true,touchEnabled:true,className:'menuRow',height:TABLE_VIEW_ROW_HEIGHT});
	    for (var i = 0; i < components.length; i++) {
	        row.add(components[i]);
	    }
	    return row;
	}
	
		
	var win = Titanium.UI.createWindow();
	win.backgroundGradient = WINDOW_BG;
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var searchBar = Titanium.UI.createSearchBar({hintText:'Search',left:0,right:0,top:45,height:45,autocorrect:false,autocapitalization:false,autocomplete:false});
	
	var labelPlaylists = Titanium.UI.createLabel({text:'Playlists',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelAlbums = Titanium.UI.createLabel({text:'Albums',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelArtists = Titanium.UI.createLabel({text:'Artists',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelGenres = Titanium.UI.createLabel({text:'Genres',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelNowPlaying = Titanium.UI.createLabel({text:'Currently playing',left:10,font:{fontSize:20,fontWeight:'bold'}});
	var buttonLogout = Titanium.UI.createButton({title:'Logout',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var buttonSettings = Titanium.UI.createButton({title:'Settings',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	var tableViewData = [];
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData.push(Titanium.UI.createTableViewSection());
	
	var buttonRowPlaylists = wrap([labelPlaylists]);
	tableViewData[0].add(buttonRowPlaylists);
	var buttonRowAlbums = wrap([labelAlbums]);
	tableViewData[0].add(buttonRowAlbums);
	var buttonRowArtists = wrap([labelArtists]);
	tableViewData[0].add(buttonRowArtists);
	var buttonRowGenres = wrap([labelGenres]);
	tableViewData[0].add(buttonRowGenres);
	
	var buttonRowNowPlaying = wrap([labelNowPlaying]);
	tableViewData[1].add(buttonRowNowPlaying);
	
	var tableView = Titanium.UI.createTableView({data:tableViewData,style:Titanium.UI.iPhone.TableViewStyle.GROUPED,top:90});
	
	buttonLogout.addEventListener('click', function() {
		jukebox.destroy();
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
	
	buttonRowPlaylists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayPlaylists(self);
	    win.remove(busyView);
	});
	
	buttonRowAlbums.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayAlbums(self, getLibrary().albumsUri);
	    win.remove(busyView);
	});
	
	buttonRowArtists.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayArtists(self);
	    win.remove(busyView);
	});
	
	buttonRowGenres.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayGenres(self);
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
	
	buttonRowNowPlaying.addEventListener('click', function() {
		var busyView = createBusyView();
		win.add(busyView);
	    if (jukebox.isActive()) {
	    	win.close();
	        jukebox.open(self);
	    } else {
	        Titanium.UI.createAlertDialog({message:'There is no active playlist.',buttonNames:['Ok']}).show();
	    }
	    win.remove(busyView);
	});
		
	addTopToolbar(win, 'MyTunesRSS', buttonLogout, buttonSettings);
	win.add(searchBar);
	win.add(tableView);
	win.add(actIndicatorView);
	
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
