function OnlineLoginWindow(parent) {	
	
	var win = Titanium.UI.createWindow({id:"window",navBarHidden:true});
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, Titanium.UI.createButton({id:"infoButton",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED,systemButton:Titanium.UI.iPhone.SystemButton.INFO_LIGHT})));
	win.add(Titanium.UI.createLabel({id:"serverAddressLabelOnline",text:L("login.serverUrl")}));
	var inputServerUrl = GUI.add(win, Titanium.UI.createTextField({id:"serverAddressInputOnline",borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.serverUrl"),value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS}));
	win.add(Titanium.UI.createLabel({id:"credentialsLabel",text:L("login.credentials")}));
	var inputUsername = GUI.add(win, Titanium.UI.createTextField({id:"usernameInput",borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.username"),value:Titanium.App.Properties.getString('username'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS}));
	var inputPassword = GUI.add(win, Titanium.UI.createTextField({id:"passwordInput",borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,hintText:L("login.password"),value:Titanium.App.Properties.getString('password'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,passwordMask:true,clearButtonMode:Titanium.UI.INPUT_BUTTONMODE_ALWAYS}));
	var inputSaveCredentials = GUI.add(win, Titanium.UI.createSwitch({id:"saveCredentialsSwitch",value:Titanium.App.Properties.getBool('saveCredentials', false)}));
	win.add(Titanium.UI.createLabel({id:"saveCredentialsLabel",text:L("login.saveCredentials")}));
	var buttonLogin = GUI.add(win, Titanium.UI.createButton({id:"loginButton",title:L("login.connect"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED}));
	var actIndicatorView = GUI.add(win, GUI.createActivityIndicator());
	win.add(Titanium.UI.createImageView({id:"watermarkOnline"}));

	function doLogin() {
		var busyView = createBusyView();
		win.add(busyView);
		Titanium.Network.createHTTPClient().clearCookies(Titanium.App.Properties.getString('resolvedServerUrl'));
		var serverVersion = getServerVersion();
		if (serverVersion === undefined) {
		    showError({message:String.format(L("login.noValidResponse"), MININUM_SERVER_VERSION.text),buttonNames:['Ok']});
		} else if (compareVersions(serverVersion, MININUM_SERVER_VERSION) < 0) {
		    showError({message:String.format(L("login.wrongServerVersion"), serverVersion.text, MININUM_SERVER_VERSION.text),buttonNames:['Ok']});
		} else {
			var response = restCall("POST", Titanium.App.Properties.getString('resolvedServerUrl') + "/rest/session?attr.incl=libraryUri", {username:inputUsername.value,password:inputPassword.value});
			if (response.status / 100 === 2) {
				Titanium.App.Properties.setString("libraryBase", JSON.stringify(restCall("GET", response.result.libraryUri, {}).result));
				connectedUsername = inputUsername.value;
				connectedPassword = inputPassword.value;
				new MenuWindow().open();
				parent.close();
			} else {
				showError({message:response.result,buttonNames:['Ok']});
			}
		}
		win.remove(busyView);
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
	    if (Titanium.App.Properties.getString("serverUrl") !== serverUrl) {
	    	// server has changed
	    	clearImageCache();
	    	clearTrackCache();
	    }
	    Titanium.App.Properties.setString('serverUrl', serverUrl);
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
	        httpClient.open('GET', Titanium.App.Properties.getString('serverUrl'));
	        httpClient.send(null);
	    } else {
	        Titanium.App.Properties.setString('resolvedServerUrl', serverUrl);
	        doLogin();
	    }
	});
	
	this.getWindow = function() {
		return win;
	}

}