function SettingsWindow(transcoders, searchFuzziness) {

	var self = this;
	var myParent;

	function saveTranscoders(transcoderSwitches, suffix) {
	    var names = [];
	    for (var i = 0; i < transcoders.length; i++) {
	        if (transcoderSwitches[i].value === true) {
	            names.push(transcoders[i]);
	        }
	    }
	    if (names.length === 0) {
		    Titanium.App.Properties.removeProperty("transcoders" + suffix);
	    } else {
	    	Titanium.App.Properties.setList("transcoders" + suffix, names);
	    }
	}
	
	function wrapInRow(views) {
		var row = Titanium.UI.createTableViewRow(STYLE.get("settingsRow"));
		for (var i = 0; i < views.length; i++) {
			row.add(views[i]);
		} 
		return row;
	}
	
	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);
	
	var transcoderSwitchesWifi = [];
	var transcoderSwitchesMobile = [];
	
	var buttonCancel = GUI.createButton({title:L("settings.cancel")});
	if (!isIos7()) {
		buttonCancel.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	buttonCancel.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	var buttonSave = GUI.createButton({title:L("settings.save")});
	if (!isIos7()) {
		buttonSave.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	buttonSave.addEventListener("click", function() {
	   	if (bufferSizeInput.value < 1024 || bufferSizeInput.value > 65536) {
			showError({message:L("settings.invalidBufferSize"),buttonNames:["Ok"]});
			return;
		}
	    if (bufferSizeInput.value != Titanium.App.Properties.getInt("audioBufferSize", DEFAULT_AUDIO_BUFFER_SIZE)) {    	
	        Titanium.App.Properties.setInt("audioBufferSize", bufferSizeInput.value);
			if (!jukebox.isIos61BugPhase(true)) {
				jukebox.restart();
			}	        
	    }
	   	if (maxPhotoSizeInput.value < 480 || maxPhotoSizeInput.value > 4096) {
			showError({message:L("settings.invalidMaxPhotoSize"),buttonNames:["Ok"]});
			return;
		}
        Titanium.App.Properties.setInt("maxPhotoSize", maxPhotoSizeInput.value);
	   	if (photoJpegQualityInput.value < 25 || photoJpegQualityInput.value > 100) {
			showError({message:L("settings.invalidPhotoJpegQuality"),buttonNames:["Ok"]});
			return;
		}
        Titanium.App.Properties.setInt("photoJpegQuality", photoJpegQualityInput.value);
	    if (!offlineMode) {
			if (searchAccuracyInput.value < 0 || searchAccuracyInput.value > 100) {
				showError({message:L("settings.invalidSearchAccuracy"),buttonNames:['Ok']});
				return;
			}
		    Titanium.App.Properties.setInt('searchAccuracy', searchAccuracyInput.value);
		    saveTranscoders(transcoderSwitchesWifi, "");
		    saveTranscoders(transcoderSwitchesMobile, "_mobile");
	    }
        Titanium.App.Properties.setBool("mainMenuPlaylists", switchMenuPlaylists.value);
        Titanium.App.Properties.setBool("mainMenuAlbums", switchMenuAlbums.value);
        Titanium.App.Properties.setBool("mainMenuArtists", switchMenuArtists.value);
        Titanium.App.Properties.setBool("mainMenuGenres", switchMenuGenres.value);
        Titanium.App.Properties.setBool("mainMenuMovies", switchMenuMovies.value);
        Titanium.App.Properties.setBool("mainMenuTvShows", switchMenuTvShows.value);
        Titanium.App.Properties.setBool("mainMenuPhotos", switchMenuPhotos.value);
        Titanium.App.Properties.setBool("mainMenuRemoteControl", switchMenuRemoteControl.value);
        Titanium.App.Properties.setBool("mainMenuOfflineShuffle", switchMenuOfflineShuffle.value);
        Titanium.App.Properties.setBool("exitConfirmation", switchExitConfirmation.value);
        if (!offlineMode) {
	        Titanium.App.Properties.setBool("browseSections", switchBrowseSections.value);
        }
	    win.close();
	});
	
	function createHeaderView(title) {
		view = Titanium.UI.createView(STYLE.get("settingsHeaderView"));
		view.add(Titanium.UI.createLabel(STYLE.get("settingsHeaderLabel", {text:title})));
		return view;
	}
	
	function styleButton(button) {
		if (!isIos7()) {
			button.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
			button.backgroundImage = "images/button_small.png";
			button.backgroundLeftCap = 9;
			button.backgroundTopCap = 30;
			button.color = "#CCCCCC";
		}
	}
	
	function createSection(text) {
		if (isIos7()) {
			return Titanium.UI.createTableViewSection({headerTitle:text});
		} else {
			return Titanium.UI.createTableViewSection({headerView:createHeaderView(text)});
		}
	}
	
	var sections = [];

	var textFieldWidth = Titanium.Platform.osname === "ipad" ? 160 : 80;

	// audio player settings
	var sectionPlayer = createSection(L("settings.audioPlayer"));	
	var bufferSizeInput = GUI.createTextField({hintText:L("settings.bufferSizeHint"),right:10,width:textFieldWidth,value:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPlayer.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.bufferSize"),left:10}), bufferSizeInput]));
	sections.push(sectionPlayer);

	if (!offlineMode) {
		// search settings
		var sectionSearch = createSection(L("settings.search"));
		var staticSearchFuzziness = (searchFuzziness >= 0 && searchFuzziness <= 100);
		var searchAccuracy = staticSearchFuzziness ? 100 - searchFuzziness : Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY);
		var searchAccuracyInput = GUI.createTextField({editable:!staticSearchFuzziness,right:10,width:textFieldWidth,hintText:L("settings.accuracyHint"),value:searchAccuracy,keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
		sectionSearch.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.searchAccuracy"),left:10}), searchAccuracyInput]));
		sections.push(sectionSearch);
	}
	
	// cache settings
	var sectionCache = createSection(L("settings.cache"));

	if (!offlineMode) {
		var clearImageCacheButton = GUI.createButton({title:L("settings.imageCache.clear"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
		styleButton(clearImageCacheButton);
		clearImageCacheButton.addEventListener("click", function() {
			var busyView = createBusyView();
	        mediaControlsView.add(busyView);
	        disableIdleTimer();
            try {
				clearImageCache();
			} finally {
				enableIdleTimer();
				mediaControlsView.remove(busyView);
			}
		});
	    sectionCache.add(wrapInRow([clearImageCacheButton]));

		var clearTrackCacheButton = GUI.createButton({title:L("settings.trackCache.clear"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
		styleButton(clearTrackCacheButton);
		clearTrackCacheButton.addEventListener("click", function() {
				var busyView = createBusyView();
        		mediaControlsView.add(busyView);
        		disableIdleTimer();
				try {
					clearTrackCache();
				} finally {
					enableIdleTimer();
					mediaControlsView.remove(busyView);
				}
		});
		sectionCache.add(wrapInRow([clearTrackCacheButton]));
	}
	
	var resetTrackCachePlayCountButton = GUI.createButton({title:L("settings.trackCache.resetPlayCount"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
	styleButton(resetTrackCachePlayCountButton);
	resetTrackCachePlayCountButton.addEventListener("click", function() {
			var busyView = createBusyView();
    		mediaControlsView.add(busyView);
    		disableIdleTimer();
			try {
				resetTrackCachePlayCount();
			} finally {
				enableIdleTimer();
				mediaControlsView.remove(busyView);
			}
	});
	sectionCache.add(wrapInRow([resetTrackCachePlayCountButton]));
		
	sections.push(sectionCache);

	if (!offlineMode) {		
        // transcoder settings
		if (transcoders != undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders", []);
		    var sectionTrans = createSection(L("settings.transcoders"));
		    for (var i = 0; i < transcoders.length; i++) {
		        var transcoderName = transcoders[i];
		        var switchValue = false;
		        for (var k = 0; k < activeTranscoders.length; k++) {
		        	if (transcoderName === activeTranscoders[k]) {
		        		switchValue = true;
		        		break;
		        	}
		        }
		        var transcoderSwitch = Titanium.UI.createSwitch({value:switchValue,right:10});
		        sectionTrans.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:transcoderName,left:10}), transcoderSwitch]));
		        transcoderSwitchesWifi.push(transcoderSwitch);
		    }
		    sections.push(sectionTrans);
		}
		
		if (transcoders != undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders_mobile", []);
		    var sectionTransMobile = createSection(L("settings.mobileTranscoders"));
		    for (var i = 0; i < transcoders.length; i++) {
		        var transcoderName = transcoders[i];
		        var switchValue = false;
		        for (var k = 0; k < activeTranscoders.length; k++) {
		        	if (transcoderName === activeTranscoders[k]) {
		        		switchValue = true;
		        		break;
		        	}
		        }
		        var transcoderSwitch = Titanium.UI.createSwitch({value:switchValue,right:10});
		        sectionTransMobile.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:transcoderName,left:10}), transcoderSwitch]));
		        transcoderSwitchesMobile.push(transcoderSwitch);
		    }
		    sections.push(sectionTransMobile);
		}
	}

	// photo settings
	var sectionPhoto = createSection(L("settings.photo"));	
	var maxPhotoSizeInput = GUI.createTextField({hintText:L("settings.maxPhotoSizeHint"),right:10,width:textFieldWidth,value:getSettingsMaxPhotoSize(),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPhoto.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.maxPhotoSize"),left:10}), maxPhotoSizeInput]));
	var photoJpegQualityInput = GUI.createTextField({hintText:L("settings.photoJpegQualityHint"),right:10,width:textFieldWidth,value:getSettingsPhotoJpegQuality(),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPhoto.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.photoJpegQuality"),left:10}), photoJpegQualityInput]));
	sections.push(sectionPhoto);

	// appearance
	var sectionAppearance = createSection(L("settings.appearance"));
    var switchExitConfirmation = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("exitConfirmation", true),right:10});
    sectionAppearance.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.exitConfirmation"),left:10}), switchExitConfirmation]));
    if (!offlineMode) {
	    var switchBrowseSections = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("browseSections", true),right:10});
	    sectionAppearance.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.browseSections"),left:10}), switchBrowseSections]));	
    }
    sections.push(sectionAppearance);

	// main menu settings
	var sectionMainMenu = createSection(L("settings.mainMenu"));	
    var switchMenuPlaylists = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuPlaylists", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.playlists"),left:10}), switchMenuPlaylists]));
    var switchMenuAlbums = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuAlbums", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.albums"),left:10}), switchMenuAlbums]));
    var switchMenuArtists = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuArtists", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.artists"),left:10}), switchMenuArtists]));
    var switchMenuGenres = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuGenres", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.genres"),left:10}), switchMenuGenres]));
	var switchMenuMovies = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuMovies", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.movies"),left:10}), switchMenuMovies]));
    var switchMenuTvShows = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuTvShows", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.tvshows"),left:10}), switchMenuTvShows]));
    var switchMenuPhotos = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuPhotos", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.photoalbums"),left:10}), switchMenuPhotos]));
    var switchMenuRemoteControl = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuRemoteControl", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.remotecontrol"),left:10}), switchMenuRemoteControl]));
    var switchMenuOfflineShuffle = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("mainMenuOfflineShuffle", true),right:10});
    sectionMainMenu.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("menu.random"),left:10}), switchMenuOfflineShuffle]));
    sections.push(sectionMainMenu);

	mediaControlsView.add(GUI.createTopToolbar(L("settings.title"), buttonCancel, buttonSave));
	mediaControlsView.add(GUI.createTableView({data:sections,separatorStyle:Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,top:45,allowsSelection:false}));
	
	/**
	 * Open the settings window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
	};
	
}
