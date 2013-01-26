function AppInfoWindow() {	
	
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	var buttonBack = GUI.createButton({title:L("albums.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		win.close();
	});
	
	win.add(GUI.createTopToolbar("MyTunesRSS", buttonBack, undefined));
	
	var versionInfo = 'v' + Titanium.App.version
	if (Titanium.App.version.indexOf('SNAPSHOT') > 0) {
		versionInfo += "\n" + Titanium.Filesystem.getFile('white_noise.wav').modificationTimestamp();
	}

	win.add(GUI.createLabel(STYLE.get("appInfoTitle", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:"MyTunesRSS iOS App"})));
	win.add(GUI.createLabel(STYLE.get("appInfoVersion", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:"Version " + Titanium.App.version})));
	var modTs = Titanium.Filesystem.getFile('white_noise.wav').modificationTimestamp();
	if (Titanium.App.version.indexOf('SNAPSHOT') > 0) {
		win.add(GUI.createLabel(STYLE.get("appInfoTimestamp", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:modTs + " - Ti " + Titanium.version})));
	}
	win.add(GUI.createLabel(STYLE.get("appInfoCopyright", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:"\u00A9 " + new Date(modTs).getFullYear() + " Codewave Software"})));
	win.add(GUI.createLabel(STYLE.get("appInfoDesign1", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:"Design: Sebastian Reich"})));
	win.add(GUI.createLabel(STYLE.get("appInfoDesign2", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:"http://www.graphiq.de"})));
	win.add(Titanium.UI.createImageView(STYLE.get("appInfoLogo")));

	/**
	 * Open the app info window. 
	 */
	this.open = function() {
		win.open();
	}
	
}
