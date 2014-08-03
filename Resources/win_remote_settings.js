function RemoteControlSettingsWindow() {

	var self = this;
	var myParent;
	var myMediaRenderers;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);

	var buttonBack = createCommonBackButton();
	buttonBack.addEventListener("click", function() {
		myParent.open(undefined, true);
	    win.close();
	});

	function wrapInRow(views, height) {
		var row = Titanium.UI.createTableViewRow({height:height * (Titanium.Platform.osname === "ipad" ? 1.25 : 1)});
		for (var i = 0; i < views.length; i++) {
			row.add(views[i]);
		} 
		return row;
	}

	function createSection(text) {
		if (isIos7()) {
			return Titanium.UI.createTableViewSection({headerTitle:text});
		} else {
			return Titanium.UI.createTableViewSection({headerView:createHeaderView(text)});
		}
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

	var sections = [];

	// renderer selection
	var sectionRenderer = createSection(L("remotecontrol.settings.renderer"));	
	var mediaRendererPicker = Ti.UI.createPicker({left:10,right:10,height:150});
	mediaRendererPicker.selectionIndicator = true;
	sectionRenderer.add(wrapInRow([mediaRendererPicker], 150));
	var applyButton = GUI.createButton({title:L("remotecontrol.settings.renderer.apply"),right:10,height:32,font:{fontSize:13,fontWeight:"bold"}});
	styleButton(applyButton);
	applyButton.addEventListener("click", function(e) {
		var id = mediaRendererPicker.getSelectedRow(0).rendererId;
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
		try {
			restCall("POST", getLibrary().mediaPlayerUri, {renderer:id});
		} finally {
			enableIdleTimer();
			mediaControlsView.remove(busyView);
		}
	});
	sectionRenderer.add(wrapInRow([Titanium.UI.createView({height:0})], 0));
	sectionRenderer.add(wrapInRow([applyButton], 40));
	sections.push(sectionRenderer);

	// volume section
	var sectionVolume = createSection(L("remotecontrol.settings.volume"));	
    var volumeBar = Titanium.UI.createSlider({left:10,right:10,height:10,min:0,max:100,value:0});
    var draggingSlider = false;
    volumeBar.addEventListener("start", function(e) {
    	draggingSlider = true;
    });
    volumeBar.addEventListener("stop", function(e) {
    	restCall("POST", getLibrary().mediaPlayerUri, {volume:Math.round(e.value)});
    	draggingSlider = false;
    });
    volumeBar.show();
    sectionVolume.add(wrapInRow([volumeBar], 40));
    sections.push(sectionVolume);

	mediaControlsView.add(GUI.createTopToolbar(L("remotecontrol.title"), buttonBack, undefined));
	mediaControlsView.add(GUI.createTableView({data:sections,separatorStyle:Titanium.UI.iPhone.TableViewSeparatorStyle.NONE,top:45,allowsSelection:false}));

	function setMediaRenderPickerData(mediaRenderers) {
		var data = [Titanium.UI.createPickerRow({title:L("remotecontrol.settings.renderer.none"),rendererId:""})];
		for (var i = 0; i < mediaRenderers.length; i++) {
			data.push(Titanium.UI.createPickerRow({title:mediaRenderers[i].name,rendererId:mediaRenderers[i].id}));
		}
		mediaRendererPicker.add(data);
	}
	
	function setCurrentMediaRenderer(mediaRendererId) {
		for (var i = 0; i < myMediaRenderers.length; i++) {
			if (myMediaRenderers[i].id === mediaRendererId) {
				mediaRendererPicker.setSelectedRow(0, i + 1);
				return;
			}
		}
		mediaRendererPicker.setSelectedRow(0, 0);
	}
	
	function setCurrentVolume(volume) {
	    if (!draggingSlider && volumeBar != undefined) {
        	volumeBar.setValue(volume);
	    }
	}

	function refresh() {
		response = restCall("GET", getLibrary().mediaPlayerUri + "?attr.incl=volume");
		if (response.status / 100 === 2) {
			setCurrentVolume(response.result.volume);
		}
		setTimeout(refresh, 1000);
	}

	/**
	 * Open the remote control settings window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		var response = restCall("GET", Titanium.App.Properties.getString("resolvedServerUrl") + "/rest/session?attr.incl=mediaRenderers&attr.incl=id&attr.incl=name");
		if (response.status / 100 === 2) {
			myMediaRenderers = response.result.mediaRenderers;
			setMediaRenderPickerData(response.result.mediaRenderers);
		}
		response = restCall("GET", getLibrary().mediaPlayerUri + "?attr.incl=mediaRendererId");
		if (response.status / 100 === 2) {
			setCurrentMediaRenderer(response.result.mediaRendererId);
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
		refresh();
	};
	
}
