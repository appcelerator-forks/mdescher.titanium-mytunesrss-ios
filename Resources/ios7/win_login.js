function LoginWindow() {	
	
	var tabGroup = Titanium.UI.createTabGroup(STYLE.get("loginTabGroup"));
	var tabOnline = Titanium.UI.createTab({icon:"ios7/images/cloud.png",activeIcon:"ios7/images/cloud_active.png",title:L("login.onlineMode"),window:new OnlineLoginWindow(tabGroup).getWindow()});
	var tabOffline = Titanium.UI.createTab({icon:"ios7/images/device.png",activeIcon:"ios7/images/device_active.png",title:L("login.offlineMode"),window:new OfflineLoginWindow(tabGroup).getWindow()});
	var tabSafari = Titanium.UI.createTab({icon:"ios7/images/safari.png",activeIcon:"ios7/images/safari_active.png",title:L("login.openInBrowser"),window:new SafariLoginWindow().getWindow()});
	tabGroup.addTab(tabOnline);
	tabGroup.addTab(tabOffline);
	tabGroup.addTab(tabSafari);
		
	this.open = function() {
		tabGroup.setActiveTab(offlineMode ? 1 : 0);
		tabGroup.open();
	};
	
}
