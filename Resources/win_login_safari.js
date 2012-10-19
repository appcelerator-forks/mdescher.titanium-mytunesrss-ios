function SafariLoginWindow() {	
	
	var self = this;
	
	var win = Titanium.UI.createWindow({id:"window",navBarHidden:true});
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, Titanium.UI.createButton({id:"infoButton",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT})));
	win.add(Titanium.UI.createLabel({id:"serverAddressLabelSafari",text:L("login.serverUrl")}));
	var inputServerUrl = GUI.add(win, Titanium.UI.createTextField({id:"serverAddressInputSafari",borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.serverUrl"),value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS}));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton({id:"loginButton",title:L("login.open"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED}));
	win.add(Titanium.UI.createImageView({id:"watermarkOfflineSafari"}));
	
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
