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
	
	var transcoderSwitchesWifi = [];
	var transcoderSwitchesMobile = [];
	
	var buttonCancel = GUI.createButton({title:L("settings.cancel")});
	buttonCancel.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	var buttonSave = GUI.createButton({title:L("settings.save")});
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
	    win.close();
	});
	
	var sections = [];

	var textFieldWidth = Titanium.Platform.osname === "ipad" ? 160 : 80;

	// audio player settings
	var sectionPlayer = Titanium.UI.createTableViewSection({headerTitle:L("settings.audioPlayer")});	
	var bufferSizeInput = GUI.createTextField({hintText:L("settings.bufferSizeHint"),right:10,width:textFieldWidth,value:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPlayer.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.bufferSize"),left:10}), bufferSizeInput]));
	sections.push(sectionPlayer);

	if (!offlineMode) {
		// search settings
		var sectionSearch = Titanium.UI.createTableViewSection({headerTitle:L("settings.search")});
		var staticSearchFuzziness = (searchFuzziness >= 0 && searchFuzziness <= 100);
		var searchAccuracy = staticSearchFuzziness ? 100 - searchFuzziness : Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY);
		var searchAccuracyInput = GUI.createTextField({editable:!staticSearchFuzziness,right:10,width:textFieldWidth,hintText:L("settings.accuracyHint"),value:searchAccuracy,keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
		sectionSearch.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.searchAccuracy"),left:10}), searchAccuracyInput]));
		sections.push(sectionSearch);
	}
	
	// cache settings
	var sectionCache = Titanium.UI.createTableViewSection({headerTitle:L("settings.cache")});

	if (!offlineMode) {
		var clearImageCacheButton = GUI.createButton({title:L("settings.imageCache.clear"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
		clearImageCacheButton.addEventListener("click", function() {
			var busyView = createBusyView();
	        win.add(busyView);
	        Titanium.App.setIdleTimerDisabled(true);
            try {
				clearImageCache();
			} finally {
				Titanium.App.setIdleTimerDisabled(false);
				win.remove(busyView);
			}
		});
	    sectionCache.add(wrapInRow([clearImageCacheButton]));

		var clearTrackCacheButton = GUI.createButton({title:L("settings.trackCache.clear"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
		clearTrackCacheButton.addEventListener("click", function() {
				var busyView = createBusyView();
        		win.add(busyView);
        		Titanium.App.setIdleTimerDisabled(true);
				try {
					clearTrackCache();
				} finally {
					Titanium.App.setIdleTimerDisabled(false);
					win.remove(busyView);
				}
		});
		sectionCache.add(wrapInRow([clearTrackCacheButton]));
	}
	
	var resetTrackCachePlayCountButton = GUI.createButton({title:L("settings.trackCache.resetPlayCount"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
	resetTrackCachePlayCountButton.addEventListener("click", function() {
			var busyView = createBusyView();
    		win.add(busyView);
    		Titanium.App.setIdleTimerDisabled(true);
			try {
				resetTrackCachePlayCount();
			} finally {
				Titanium.App.setIdleTimerDisabled(false);
				win.remove(busyView);
			}
	});
	sectionCache.add(wrapInRow([resetTrackCachePlayCountButton]));
		
	sections.push(sectionCache);

	if (!offlineMode) {		
        // transcoder settings
		if (transcoders != undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders", []);
		    var sectionTrans = Titanium.UI.createTableViewSection({headerTitle:L("settings.transcoders")});
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
		    var sectionTransMobile = Titanium.UI.createTableViewSection({headerTitle:L("settings.mobileTranscoders")});
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
	var sectionPhoto = Titanium.UI.createTableViewSection({headerTitle:L("settings.photo")});	
	var maxPhotoSizeInput = GUI.createTextField({hintText:L("settings.maxPhotoSizeHint"),right:10,width:textFieldWidth,value:getSettingsMaxPhotoSize(),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPhoto.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.maxPhotoSize"),left:10}), maxPhotoSizeInput]));
	var photoJpegQualityInput = GUI.createTextField({hintText:L("settings.photoJpegQualityHint"),right:10,width:textFieldWidth,value:getSettingsPhotoJpegQuality(),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPhoto.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.photoJpegQuality"),left:10}), photoJpegQualityInput]));
	sections.push(sectionPhoto);

	win.add(GUI.createTopToolbar(L("settings.title"), buttonCancel, buttonSave));
	win.add(GUI.createTableView(tryGetAdSpacingStyle({data:sections,separatorStyle:Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,top:45,allowsSelection:false})));
	tryAddAd(win);
	
	/**
	 * Open the settings window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};
	
}
