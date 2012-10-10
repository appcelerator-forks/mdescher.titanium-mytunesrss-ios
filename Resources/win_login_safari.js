function SafariLoginWindow() {	
	
	var self = this;
	
	var win = GUI.createWindow({navBarHidden:true});
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, GUI.createButton({style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT})));
	var pos = new Counter(275);
	win.add(GUI.createHeader({text:L("login.serverUrl"),left:10,top:pos.inc(0)}));
	var inputServerUrl = GUI.add(win, GUI.createTextField({left:10,right:10,top:pos.inc(25),hintText:L("login.serverUrl"),width:Titanium.UI.FILL,value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,minimumFontSize:12}));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton({left:10,right:10,top:pos.inc(45),title:L("login.connect"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED}));

	function getServerUrl() {
	    var serverUrl = inputServerUrl.value;
	    while (serverUrl.length > 0 && serverUrl.substr(serverUrl.length - 1) === '/') {
	        serverUrl = serverUrl.substr(0, serverUrl.length - 1);
	    }
	    if (serverUrl.toLowerCase().search(/https?:\/\//) != 0) {
	        serverUrl = 'http://' + serverUrl;
	    }
	    return serverUrl;
	}

	buttonLogin.addEventListener('click', function() {
		var serverUrl = getServerUrl();
	    Titanium.App.Properties.setString('serverUrl', serverUrl);
	    Titanium.Platform.openURL(serverUrl + '/mytunesrss/?interface=default');
	});
	
	this.getWindow = function() {
		return win;
	}
	
}
