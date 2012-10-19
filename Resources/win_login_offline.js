function OfflineLoginWindow(parent) {	
	

	var win = Titanium.UI.createWindow({id:"window",navBarHidden:true});
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, Titanium.UI.createButton({id:"infoButton",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT})));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton({id:"loginButton",title:L("login.open"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED}));
	win.add(Titanium.UI.createImageView({id:"watermarkOfflineSafari"}));

	buttonLogin.addEventListener('click', function() {
		offlineMode = true;
		new MenuWindow().open();
		parent.close();
	});

	this.getWindow = function() {
		return win;
	}
}
