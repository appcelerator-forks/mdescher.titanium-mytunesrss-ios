function OfflineLoginWindow(parent) {	
	
	var infoButton = Titanium.UI.createButton(STYLE.get("infoButton",{style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT}));
	infoButton.addEventListener("click", function() {
		new AppInfoWindow().open();
	});
	
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, infoButton));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton(STYLE.get("loginButton",{title:L("login.open"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED})));
	win.add(Titanium.UI.createImageView(STYLE.get("watermarkOfflineSafari")));

	buttonLogin.addEventListener('click', function() {
		offlineMode = true;
		new MenuWindow().open();
	});

	this.getWindow = function() {
		return win;
	}
}
