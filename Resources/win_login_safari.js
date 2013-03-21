function SafariLoginWindow() {	
	
	var infoButton = Titanium.UI.createButton(STYLE.get("infoButton",{style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT}));
	infoButton.addEventListener("click", function() {
		new AppInfoWindow().open();
	});

	var self = this;
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, infoButton));
	win.add(Titanium.UI.createLabel(STYLE.get("serverAddressLabelSafari",{text:L("login.serverUrl")})));
	var inputServerUrl = GUI.add(win, Titanium.UI.createTextField(STYLE.get("serverAddressInputSafari",{borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.serverUrl"),value:getLastRememberedServerUrl(),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS})));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton(STYLE.get("loginButton",{title:L("login.open"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED})));
	win.add(Titanium.UI.createImageView(STYLE.get("watermarkOfflineSafari")));
	
	var buttonServerUrlHistory = GUI.add(win, Titanium.UI.createButton(STYLE.get("serverAddressHistoryButtonSafari",{style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,image:"images/history.png"})));
	buttonServerUrlHistory.addEventListener("click", function() {
		if (getRememberedServerUrls().length === 0) {
			showError({message:L("login.noHistoryAvailable"),buttonNames:['Ok']});
		} else {
			new ServerHistoryWindow().open();
		}
	});
	Titanium.App.addEventListener("mytunesrss_serverurlselected", function(e) {
		inputServerUrl.value = e.url;
	});

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
	    rememberServerUrl(serverUrl);
	    Titanium.Platform.openURL(serverUrl + '/mytunesrss/?interface=default');
	});
	
	this.getWindow = function() {
		return win;
	}
	
}
