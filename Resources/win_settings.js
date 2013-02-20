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
	
	var buttonCancel = GUI.createButton({title:L("settings.cancel"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonCancel.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	var buttonSave = GUI.createButton({title:L("settings.save"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonSave.addEventListener('click', function() {
	   	if (bufferSizeInput.value < 1024 || bufferSizeInput.value > 65536) {
			showError({message:L("settings.invalidBufferSize"),buttonNames:['Ok']});
			return;
		}
	    if (bufferSizeInput.value != Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE)) {    	
	        Titanium.App.Properties.setInt('audioBufferSize', bufferSizeInput.value);
	        jukebox.restart();
	    }
	    if (!offlineMode) {
			if (searchAccuracyInput.value < 0 || searchAccuracyInput.value > 100) {
				showError({message:L("settings.invalidSearchAccuracy"),buttonNames:['Ok']});
				return;
			}
		    Titanium.App.Properties.setInt('searchAccuracy', searchAccuracyInput.value);
		    saveTranscoders(transcoderSwitchesWifi, "");
		    saveTranscoders(transcoderSwitchesMobile, "_mobile");
		    Titanium.App.Properties.setBool("imageCacheEnabled", enableCacheInput.value);
		    if (!enableCacheInput.value) {
		    	clearImageCache();
		    }
	    }
	    win.close();
	});
	
	function createHeaderView(title) {
		view = Titanium.UI.createView(STYLE.get("settingsHeaderView"));
		view.add(Titanium.UI.createLabel(STYLE.get("settingsHeaderLabel", {text:title})));
		return view;
	}
	
	var sections = [];

	var textFieldWidth = Titanium.Platform.osname === "ipad" ? 160 : 80;

	// audio player settings
	var sectionPlayer = Titanium.UI.createTableViewSection({headerView:createHeaderView(L("settings.audioPlayer"))});	
	var bufferSizeInput = GUI.createTextField({hintText:L("settings.bufferSizeHint"),right:10,width:textFieldWidth,value:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	sectionPlayer.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.bufferSize"),left:10}), bufferSizeInput]));
	sections.push(sectionPlayer);

	if (!offlineMode) {

		// search settings
		var sectionSearch = Titanium.UI.createTableViewSection({headerView:createHeaderView(L("settings.search"))});
		var staticSearchFuzziness = (searchFuzziness >= 0 && searchFuzziness <= 100);
		var searchAccuracy = staticSearchFuzziness ? 100 - searchFuzziness : Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY);
		var searchAccuracyInput = GUI.createTextField({editable:!staticSearchFuzziness,right:10,width:textFieldWidth,hintText:L("settings.accuracyHint"),value:searchAccuracy,keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
		sectionSearch.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.searchAccuracy"),left:10}), searchAccuracyInput]));
		sections.push(sectionSearch);

		// cache settings
		var sectionCache = Titanium.UI.createTableViewSection({headerView:createHeaderView(L("settings.cache"))});
		var enableCacheInput = Titanium.UI.createSwitch({value:Titanium.App.Properties.getBool("imageCacheEnabled", true),right:10});
		sectionCache.add(wrapInRow([GUI.createLabel({font:{fontSize:13,fontWeight:"bold"},text:L("settings.imageCache"),left:10}), enableCacheInput]));

		if (enableCacheInput.value) {
			var clearImageCacheButton = GUI.createButton({title:L("settings.imageCache.clear"),right:10,style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,backgroundImage:"images/button_small.png",backgroundLeftCap:9,backgroundTopCap:30,height:32,color:"#CCCCCC",font:{fontSize:13,fontWeight:"bold"}});
			clearImageCacheButton.addEventListener("click", function() {
				var busyView = createBusyView();
		        win.add(busyView);
                try {
					clearImageCache();
				} finally {
					win.remove(busyView);
				}
			});
		    sectionCache.add(wrapInRow([clearImageCacheButton]));
		}

		var clearTrackCacheButton = GUI.createButton({title:L("settings.trackCache.clear"),right:10,style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,backgroundImage:"images/button_small.png",backgroundLeftCap:9,backgroundTopCap:30,height:32,color:"#CCCCCC",font:{fontSize:13,fontWeight:"bold"}});
		clearTrackCacheButton.addEventListener("click", function() {
				var busyView = createBusyView();
        		win.add(busyView);
				try {
					clearTrackCache();
				} finally {
					win.remove(busyView);
				}
		});
		sectionCache.add(wrapInRow([clearTrackCacheButton]));
		
		sections.push(sectionCache);
		
		if (transcoders != undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders", []);
		    var sectionTrans = Titanium.UI.createTableViewSection({headerView:createHeaderView(L("settings.transcoders"))});
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
		    var sectionTransMobile = Titanium.UI.createTableViewSection({headerView:createHeaderView(L("settings.mobileTranscoders"))});
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

	win.add(GUI.createTopToolbar(L("settings.title"), buttonCancel, buttonSave));
	win.add(GUI.createTableView(getAdSpacingStyleIfOnline({data:sections,separatorStyle:Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,top:45,allowsSelection:false})));
	addIAddIfOnline(win);
	
	/**
	 * Open the settings window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	}
	
}
