function LoginWindow() {	
	
	var tabGroup = Titanium.UI.createTabGroup();
	var tabOnline = Titanium.UI.createTab({icon:"images/cloud.png",title:L("login.onlineMode"),window:new OnlineLoginWindow(tabGroup).getWindow()});
	var tabOffline = Titanium.UI.createTab({icon:"images/device.png",title:L("login.offlineMode"),window:new OfflineLoginWindow(tabGroup).getWindow()});
	var tabSafari = Titanium.UI.createTab({icon:"images/safari.png",title:L("login.openInBrowser"),window:new SafariLoginWindow().getWindow()});
	tabGroup.addTab(tabOnline);
	tabGroup.addTab(tabOffline);
	tabGroup.addTab(tabSafari);
	
	/*if (Titanium.App.version.indexOf('SNAPSHOT') > 0) {
		win.add(GUI.createLabel({text:'v' + Titanium.App.version,textAlign:'center',bottom:30,height:10,font:{fontSize:10}}));
		win.add(GUI.createLabel({text: Titanium.Filesystem.getFile('white_noise.wav').modificationTimestamp(), textAlign:'center',bottom:20,height:10,font:{fontSize:10}}));
	} else {
		win.add(GUI.createLabel({text:'v' + Titanium.App.version,textAlign:'center',bottom:20,height:10,font:{fontSize:10}}));
	}*/
	
	this.open = function() {
		tabGroup.setActiveTab(offlineMode ? 1 : 0);
		tabGroup.open();
	}
	
}
