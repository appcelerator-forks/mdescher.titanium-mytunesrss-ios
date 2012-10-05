function SettingsWindow(transcoders, searchFuzziness) {

	var self = this;
	var myParent;

	function wrap(components) {
	    var row = GUI.createTableViewRow({className:'settingsRow',height:TABLE_VIEW_ROW_HEIGHT,selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	    for (var i = 0; i < components.length; i++) {
	        row.add(components[i]);
	    }
	    return row;
	}
	
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
	
	var win = GUI.createWindow();
	
	var transcoderSwitchesWifi = [];
	var transcoderSwitchesMobile = [];
	
	var bufferSizeInput = GUI.createTextField({hintText:'Size in Bytes',left:200,right:10,value:Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE),keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,minimumFontSize:12});
	
	var staticSearchFuzziness = (searchFuzziness >= 0 && searchFuzziness <= 100);
	var searchAccuracy = staticSearchFuzziness ? 100 - searchFuzziness : Titanium.App.Properties.getInt('searchAccuracy', DEFAULT_SEARCH_ACCURACY);
	var searchAccuracyInput = GUI.createTextField({editable:!staticSearchFuzziness,hintText:'Accuracy in Percent',left:200,right:10,value:searchAccuracy,keyboardType:Titanium.UI.KEYBOARD_NUMBER_PAD,minimumFontSize:12});
	
	var enableCacheInput = Titanium.UI.createSwitch({right:10,value:Titanium.App.Properties.getBool("imageCacheEnabled", true)});
	var clearCacheButton = Titanium.UI.createButton({title:"clear cache",right:10,height:25});
	clearCacheButton.addEventListener("click", function() {
		clearImageCache();
	});

	var clearTrackCacheButton = Titanium.UI.createButton({title:'clear cache',right:10,height:25});
	clearTrackCacheButton.addEventListener("click", function() {
		clearTrackCache();
	});
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var buttonCancel = Titanium.UI.createButton({title:'Cancel',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonCancel.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	var buttonSave = Titanium.UI.createButton({title:'Save',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	buttonSave.addEventListener('click', function() {
	   	if (bufferSizeInput.value < 1024 || bufferSizeInput.value > 65536) {
			showError({message:'Buffer size must be a value from 1024 to 65536.',buttonNames:['Ok']});
			return;
		}
	    if (bufferSizeInput.value != Titanium.App.Properties.getInt('audioBufferSize', DEFAULT_AUDIO_BUFFER_SIZE)) {    	
	        Titanium.App.Properties.setInt('audioBufferSize', bufferSizeInput.value);
	        jukebox.restart();
	    }
	    if (!offlineMode) {
			if (searchAccuracyInput.value < 0 || searchAccuracyInput.value > 100) {
				showError({message:'Search accuracy must be a value from 0 to 100.',buttonNames:['Ok']});
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
	
	tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Audio Player'}));
	tableViewData[tableViewData.length - 1].add(wrap([GUI.createLabel({text:'Buffer Size',left:10,right:120,minimumFontSize:12}), bufferSizeInput]));

	if (!offlineMode) {
		tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Search'}));
		tableViewData[tableViewData.length - 1].add(wrap([GUI.createLabel({text:'Search result accuracy',left:10,right:120,minimumFontSize:12}), searchAccuracyInput]));
		tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Image cache'}));
		tableViewData[tableViewData.length - 1].add(wrap([GUI.createLabel({text:'Cache images on device',left:10}), enableCacheInput]));
		if (enableCacheInput.value) {
			tableViewData[tableViewData.length - 1].add(wrap([clearCacheButton]));
		}
		tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Track cache'}));
		tableViewData[tableViewData.length - 1].add(wrap([clearTrackCacheButton]));
		
		if (transcoders !== undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders", []);
		    tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Transcoder'}));
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
		        tableViewData[tableViewData.length - 1].add(wrap([GUI.createLabel({text:transcoderName,left:10,right:120,minimumFontSize:12}), transcoderSwitch]));
		    }
		}
		
		if (transcoders !== undefined  && transcoders.length > 0) {
			var activeTranscoders = Titanium.App.Properties.getList("transcoders_mobile", []);
		    tableViewData.push(Titanium.UI.createTableViewSection({headerTitle:'Transcoder (mobile)'}));
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
		        tableViewData[tableViewData.length - 1].add(wrap([GUI.createLabel({text:transcoderName,left:10,right:120,minimumFontSize:12}), transcoderSwitch]));
		    }
		}
	}

	var tableView = GUI.createTableView({data:tableViewData,style:Titanium.UI.iPhone.TableViewStyle.GROUPED,top:45,backgroundImage:"images/stripe.png"});
	
	addTopToolbar(win, 'Settings', buttonCancel, buttonSave);
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
