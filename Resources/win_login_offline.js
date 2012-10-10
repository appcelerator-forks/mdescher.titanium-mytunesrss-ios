function OfflineLoginWindow(parent) {	
	

	var win = GUI.createWindow({navBarHidden:true});
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, GUI.createButton({style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT})));
	var pos = new Counter(345);
	var buttonLogin = GUI.add(win, Titanium.UI.createButton({left:10,right:10,top:pos.inc(0),width:Titanium.UI.FILL,title:L("login.connect"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED}));
	

	buttonLogin.addEventListener('click', function() {
		offlineMode = true;
		new MenuWindow().open();
		parent.close();
	});

	this.getWindow = function() {
		return win;
	}
}
