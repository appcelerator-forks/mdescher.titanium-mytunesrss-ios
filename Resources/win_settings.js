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
	
	var win = GUI.createWindow({});
	
	var transcoderSwitchesWifi = [];
	var transcoderSwitchesMobile = [];
	
	var bufferSizeInput = GUI.createTextField({hintText:L("settings.bufferSizeHint"),left:200,right:10,value:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,minimumFontSize:12});
	
	var staticSearchFuzziness = (searchFuzziness >= 0 && searchFuzziness <= 100);
	var searchAccuracy = staticSearchFuzziness ? 100 - searchFuzziness : Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY);
	var searchAccuracyInput = GUI.createTextField({editable:!staticSearchFuzziness,hintText:L("settings.accuracyHint"),left:200,right:10,value:searchAccuracy,keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,minimumFontSize:12});
	
	var enableCacheInput = Titanium.UI.createSwitch({right:10,value:Titanium.App.Properties.getBool("imageCacheEnabled", true)});
	var clearImageCacheButton = GUI.createButton({title:L("settings.imageCache.clear"),right:10});
	clearImageCacheButton.addEventListener("click", function() {
		clearImageCache();
	});

	var clearTrackCacheButton = GUI.createButton({title:L("settings.trackCache.clear"),right:10});
	clearTrackCacheButton.addEventListener("click", function() {
		clearTrackCache();
	});
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
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
	
	var tableViewData = [];
	
	tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createHeader({text:L("settings.audioPlayer"),left:10})], 0.5));
	tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createLabel({text:L("settings.bufferSize"),left:10,right:120,minimumFontSize:12}), bufferSizeInput]));

	if (!offlineMode) {
		tableViewData.push(GUI.createPopulatedTableViewRow([], 0.75));
		tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createHeader({text:L("settings.search"),left:10})], 0.5));
		tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createLabel({text:L("settings.searchAccuracy"),left:10,right:120,minimumFontSize:12}), searchAccuracyInput]));
		tableViewData.push(GUI.createPopulatedTableViewRow([], 0.75));
		tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createHeader({text:L("settings.cache"),left:10})], 0.5));
		tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createLabel({text:L("settings.imageCache"),left:10}), enableCacheInput]));
		if (enableCacheInput.value) {
			tableViewData.push(GUI.createPopulatedTableViewRow([clearImageCacheButton]));
		}
		tableViewData.push(GUI.createPopulatedTableViewRow([clearTrackCacheButton]));
		
		if (transcoders !== undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders", []);
			tableViewData.push(GUI.createPopulatedTableViewRow([], 0.75));
		    tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createHeader({text:L("settings.transcoders"),left:10})], 0.5));
		    for (var i = 0; i < transcoders.length; i++) {
		        var transcoderName = transcoders[i];
		        var switchValue = false;
		        for (var k = 0; k < activeTranscoders.length; k++) {
		        	if (transcoderName === activeTranscoders[k]) {
		        		switchValue = true;
		        		break;
		        	}
		        }
		        var transcoderSwitch = Titanium.UI.createSwitch({right:10,value:switchValue});
		        transcoderSwitchesWifi.push(transcoderSwitch);
		        tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createLabel({text:transcoderName,left:10,right:120,minimumFontSize:12}), transcoderSwitch]));
		    }
		}
		
		if (transcoders !== undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders_mobile", []);
			tableViewData.push(GUI.createPopulatedTableViewRow([], 0.75));
		    tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createHeader({text:L("settings.mobileTranscoders"),left:10})], 0.5));
		    for (var i = 0; i < transcoders.length; i++) {
		        var transcoderName = transcoders[i];
		        var switchValue = false;
		        for (var k = 0; k < activeTranscoders.length; k++) {
		        	if (transcoderName === activeTranscoders[k]) {
		        		switchValue = true;
		        		break;
		        	}
		        }
		        var transcoderSwitch = Titanium.UI.createSwitch({right:10,value:switchValue});
		        transcoderSwitchesMobile.push(transcoderSwitch);
		        tableViewData.push(GUI.createPopulatedTableViewRow([GUI.createLabel({text:transcoderName,left:10,right:120,minimumFontSize:12}), transcoderSwitch]));
		    }
		}
	}

	var tableView = GUI.createTableView({data:tableViewData,top:80,separatorStyle:Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,borderColor:"transparent"});
	
	win.add(GUI.createTopToolbar(L("settings.title"), buttonCancel, buttonSave));
	win.add(tableView);
	win.add(actIndicatorView);

	/**
	 * Open the settings window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}
	
}
