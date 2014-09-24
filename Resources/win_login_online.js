function OnlineLoginWindow(parent) {	
	
	var infoButton = Titanium.UI.createButton(STYLE.get("infoButton",{systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT}));
	if (!isIos7()) {
		infoButton.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	infoButton.addEventListener("click", function() {
		new AppInfoWindow().open();
	});

	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, infoButton));
	win.add(Titanium.UI.createLabel(STYLE.get("serverAddressLabelOnline",{text:L("login.serverUrl")})));	
	var inputServerUrl = GUI.add(win, Titanium.UI.createTextField(STYLE.get("serverAddressInputOnline",{borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.serverUrl"),value:getLastRememberedServerUrl(),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS})));
	win.add(Titanium.UI.createLabel(STYLE.get("credentialsLabel",{text:L("login.credentials")})));
	var inputUsername = GUI.add(win, Titanium.UI.createTextField(STYLE.get("usernameInput",{borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.username"),value:Titanium.App.Properties.getString('username'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS})));
	var inputPassword = GUI.add(win, Titanium.UI.createTextField(STYLE.get("passwordInput",{borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.password"),value:Titanium.App.Properties.getString('password'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,passwordMask:true,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS})));
	var inputSaveCredentials = GUI.add(win, Titanium.UI.createSwitch(STYLE.get("saveCredentialsSwitch",{value:Titanium.App.Properties.getBool('saveCredentials', false)})));
	win.add(Titanium.UI.createLabel(STYLE.get("saveCredentialsLabel",{text:L("login.saveCredentials")})));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton(STYLE.get("loginButton",{title:L("login.connect")})));
	if (!isIos7()) {
		buttonLogin.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	win.add(Titanium.UI.createImageView(STYLE.get("watermarkOnline")));

	var buttonServerUrlHistory = GUI.add(win, Titanium.UI.createButton(STYLE.get("serverAddressHistoryButtonOnline",{image:"images/history.png"})));
	if (!isIos7()) {
		buttonServerUrlHistory.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
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

	function doLogin() {
		var busyView = createBusyView();
		win.add(busyView);
		disableIdleTimer();
        try {
		    Titanium.Network.createHTTPClient().clearCookies(Titanium.App.Properties.getString('resolvedServerUrl'));
		    serverVersion = getServerVersion();
		    if (serverVersion === undefined) {
		        showError({message:String.format(L("login.noValidResponse"), MINIMUM_SERVER_VERSION.text),buttonNames:['Ok']});
		    } else if (compareVersions(serverVersion, MINIMUM_SERVER_VERSION) < 0) {
		        showError({message:String.format(L("login.wrongServerVersion"), serverVersion.text, MINIMUM_SERVER_VERSION.text),buttonNames:['Ok']});
		    } else {
			    var response = restCall("POST", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=libraryUri", {username:inputUsername.value,password:inputPassword.value});
			    if (response.status / 100 === 2) {
				    Titanium.App.Properties.setString("libraryBase", JSON.stringify(restCall("GET", response.result.libraryUri, {}).result));
				    connectedUsername = inputUsername.value;
				    connectedPassword = inputPassword.value;
				    new MenuWindow().open();
				    Titanium.Analytics.featureEvent("login.online");
			    } else {
				    showError({message:response.result,buttonNames:['Ok']});
			    }
		    }
        } finally {
        	enableIdleTimer();
    		win.remove(busyView);
        }
	}
	
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
		offlineMode = false;
	    var serverUrl = getServerUrl();
	    rememberServerUrl(serverUrl);
	    Titanium.App.Properties.setBool('saveCredentials', inputSaveCredentials.value);
	    if (inputSaveCredentials.value === true) {
	        Titanium.App.Properties.setString('username', inputUsername.value);
	        Titanium.App.Properties.setString('password', inputPassword.value);
	    } else {
	        Titanium.App.Properties.removeProperty('username');
	        Titanium.App.Properties.removeProperty('password');
	    }
	
	    if (serverUrl.toLowerCase().search(/https?:\/\/mytunesrss.com\//) === 0) {
	        // mytunesrss.com handling => resolve real server url and then login
	        var httpClient = Titanium.Network.createHTTPClient({timeout:5000});
	        httpClient.onload = function() {
	            var resolvedServerUrl = this.location.match(/https?:\/\/[^\/]+/)[0];
	            if (resolvedServerUrl.toLowerCase().search(/https?:\/\/mytunesrss.com/) === 0) {
	                showError({message:L("login.mytunesrsscom.failed"),buttonNames:['Ok']});
	            } else {
	                Titanium.App.Properties.setString('resolvedServerUrl', resolvedServerUrl);
	                doLogin();
	            }
	        };
	        httpClient.onerror = function() {
	            showError({message:L("login.mytunesrsscom.failed"),buttonNames:['Ok']});
	        };
	        httpClient.open("GET", serverUrl);
	        httpClient.send(null);
	    } else {
	        Titanium.App.Properties.setString('resolvedServerUrl', serverUrl);
	        doLogin();
	    }
	});
	
	this.getWindow = function() {
		return win;
	};

}
