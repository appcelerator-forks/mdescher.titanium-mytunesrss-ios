function LoginWindow() {	
	
	var tabOnline = Titanium.UI.createTab({icon:"images/light_home.png",title:L("login.onlineMode"),window:new OnlineLoginWindow(this).getWindow()});
	var tabOffline = Titanium.UI.createTab({icon:"images/light_heart.png",title:L("login.offlineMode"),window:new OfflineLoginWindow(this).getWindow()});
	var tabSafari = Titanium.UI.createTab({icon:"images/light_globe.png",title:L("login.openInBrowser"),window:new SafariLoginWindow().getWindow()});
	var bottomBar = Titanium.UI.createTabGroup();
	bottomBar.addTab(tabOnline);
	bottomBar.addTab(tabOffline);
	bottomBar.addTab(tabSafari);
	
	/*if (Titanium.App.version.indexOf('SNAPSHOT') > 0) {
		win.add(GUI.createLabel({text:'v' + Titanium.App.version,textAlign:'center',bottom:30,height:10,font:{fontSize:10}}));
		win.add(GUI.createLabel({text: Titanium.Filesystem.getFile('white_noise.wav').modificationTimestamp(), textAlign:'center',bottom:20,height:10,font:{fontSize:10}}));
	} else {
		win.add(GUI.createLabel({text:'v' + Titanium.App.version,textAlign:'center',bottom:20,height:10,font:{fontSize:10}}));
	}*/
	
	this.open = function() {
		bottomBar.open();
	}
	
}
