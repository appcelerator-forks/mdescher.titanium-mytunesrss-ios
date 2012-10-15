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
	
	var pos = new Counter(0);
	var view = Titanium.UI.createView({height:Titanium.UI.SIZE});
	
	view.add(GUI.createLabel({top:pos.inc(0),text:L("settings.audioPlayer"),left:10,font:{fontSize:14},shadowColor:"#AAAAAA"}));

	view.add(GUI.createLabel({top:pos.inc(20),text:L("settings.bufferSize"),left:10,right:120}));
	var bufferSizeInput = GUI.createTextField({top:pos.inc(0),hintText:L("settings.bufferSizeHint"),left:200,right:10,value:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
	view.add(bufferSizeInput);

	if (!offlineMode) {

		view.add(GUI.createLabel({top:pos.inc(45),text:L("settings.search"),left:10,font:{fontSize:14},shadowColor:"#AAAAAA"}));

		view.add(GUI.createLabel({top:pos.inc(20),text:L("settings.searchAccuracy"),left:10,right:120}));
		var staticSearchFuzziness = (searchFuzziness >= 0 && searchFuzziness <= 100);
		var searchAccuracy = staticSearchFuzziness ? 100 - searchFuzziness : Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY);
		var searchAccuracyInput = GUI.createTextField({top:pos.inc(0),editable:!staticSearchFuzziness,hintText:L("settings.accuracyHint"),left:200,right:10,value:searchAccuracy,keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD});
		view.add(searchAccuracyInput);

		view.add(GUI.createLabel({top:pos.inc(45),text:L("settings.cache"),left:10,font:{fontSize:14},shadowColor:"#AAAAAA"}));

		view.add(GUI.createLabel({top:pos.inc(20),text:L("settings.imageCache"),left:10}));
		var enableCacheInput = Titanium.UI.createSwitch({top:pos.inc(0),right:10,value:Titanium.App.Properties.getBool("imageCacheEnabled", true)});
		view.add(enableCacheInput);

		if (enableCacheInput.value) {
			var clearImageCacheButton = GUI.createButton({top:pos.inc(25),title:L("settings.imageCache.clear"),right:10});
			clearImageCacheButton.addEventListener("click", function() {
				clearImageCache();
			});
			view.add(clearImageCacheButton);
		}

		var clearTrackCacheButton = GUI.createButton({top:pos.inc(25),title:L("settings.trackCache.clear"),right:10});
		clearTrackCacheButton.addEventListener("click", function() {
			clearTrackCache();
		});
		view.add(clearTrackCacheButton);
		
		if (transcoders !== undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders", []);
		    view.add(GUI.createLabel({top:pos.inc(40),text:L("settings.transcoders"),left:10,font:{fontSize:14},shadowColor:"#AAAAAA"}));
		    pos.inc(-5); // only 20 pixel for 1st transcoder
		    for (var i = 0; i < transcoders.length; i++) {
		        var transcoderName = transcoders[i];
		        var switchValue = false;
		        for (var k = 0; k < activeTranscoders.length; k++) {
		        	if (transcoderName === activeTranscoders[k]) {
		        		switchValue = true;
		        		break;
		        	}
		        }
		        view.add(GUI.createLabel({top:pos.inc(25),text:transcoderName,left:10,right:120}));
		        var transcoderSwitch = Titanium.UI.createSwitch({top:pos.inc(0),right:10,value:switchValue});
		        transcoderSwitchesWifi.push(transcoderSwitch);
		        view.add(transcoderSwitch);
		    }
		}
		
		if (transcoders !== undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders_mobile", []);
		    view.add(GUI.createLabel({top:pos.inc(40),text:L("settings.mobileTranscoders"),left:10,font:{fontSize:14},shadowColor:"#AAAAAA"}));
		    pos.inc(-5); // only 20 pixel for 1st transcoder
		    for (var i = 0; i < transcoders.length; i++) {
		        var transcoderName = transcoders[i];
		        var switchValue = false;
		        for (var k = 0; k < activeTranscoders.length; k++) {
		        	if (transcoderName === activeTranscoders[k]) {
		        		switchValue = true;
		        		break;
		        	}
		        }
		        view.add(GUI.createLabel({top:pos.inc(25),text:transcoderName,left:10,right:120}));
		        var transcoderSwitch = Titanium.UI.createSwitch({top:pos.inc(0),right:10,value:switchValue});
		        transcoderSwitchesMobile.push(transcoderSwitch);
		        view.add(transcoderSwitch);
		    }
		}
	}

	win.add(GUI.createTopToolbar(L("settings.title"), buttonCancel, buttonSave));
	var scrollView = Titanium.UI.createScrollView({top:45,verticalBounce:false,horizontalBounce:false});
	scrollView.add(view);
	win.add(scrollView);
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
