function OfflineLoginWindow(parent) {	
	

	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, Titanium.UI.createButton(STYLE.get("infoButton",{style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT}))));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton(STYLE.get("loginButton",{title:L("login.open"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED})));
	win.add(Titanium.UI.createImageView(STYLE.get("watermarkOfflineSafari")));

	buttonLogin.addEventListener('click', function() {
		offlineMode = true;
		new MenuWindow().open();
		parent.close();
	});

	this.getWindow = function() {
		return win;
	}
}
