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

	win.add(Titanium.UI.createTextArea({editable:false,scrollable:false,top:70,left:20,right:20,color:"#CCCCCC",backgroundColor:DARK_GRAY,font:{fontSize:18},textAlign:"center",value:L("appinfo") + versionInfo}));

	/**
	 * Open the app info window. 
	 */
	this.open = function() {
		win.open();
	}
	
}
