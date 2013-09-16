function LoginWindow() {	
	
	var tabGroup = Titanium.UI.createTabGroup(STYLE.get("loginTabGroup"));
	var tabOnline = Titanium.UI.createTab({icon:"images/cloud.png",title:L("login.onlineMode"),window:new OnlineLoginWindow(tabGroup).getWindow()});
	var tabOffline = Titanium.UI.createTab({icon:"images/device.png",title:L("login.offlineMode"),window:new OfflineLoginWindow(tabGroup).getWindow()});
	var tabSafari = Titanium.UI.createTab({icon:"images/safari.png",title:L("login.openInBrowser"),window:new SafariLoginWindow().getWindow()});
	tabGroup.addTab(tabOnline);
	tabGroup.addTab(tabOffline);
	tabGroup.addTab(tabSafari);
		
	this.open = function() {
		tabGroup.setActiveTab(offlineMode ? 1 : 0);
		tabGroup.open();
	};
	
}
