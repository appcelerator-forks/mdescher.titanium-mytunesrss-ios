function OfflineLoginWindow(parent) {	
	
	var infoButton = Titanium.UI.createButton(STYLE.get("infoButton",{systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT}));
	if (!isIos7()) {
		infoButton.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	infoButton.addEventListener("click", function() {
		new AppInfoWindow().open();
	});
	
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, infoButton));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton(STYLE.get("loginButton",{title:L("login.open")})));
	if (!isIos7()) {
		buttonLogin.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	win.add(Titanium.UI.createImageView(STYLE.get("watermarkOfflineSafari")));

	buttonLogin.addEventListener('click', function() {
		offlineMode = true;
		new MenuWindow().open();
		Titanium.Analytics.featureEvent("login.offline");
	});

	this.getWindow = function() {
		return win;
	};
}
