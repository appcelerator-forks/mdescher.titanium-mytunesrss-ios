function LoginWindow() {	
	
	var self = this;
	
	function wrap(components) {
	    var row = Titanium.UI.createTableViewRow({className:'loginRow',height:TABLE_VIEW_ROW_HEIGHT});
	    for (var i = 0; i < components.length; i++) {
	        row.add(components[i]);
	    }
	    return row;
	}
	
	var win = createWindow();
	
	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var inputServerUrl = Titanium.UI.createTextField({hintText:L("login.serverUrl"),left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,minimumFontSize:12});
	var inputUsername = Titanium.UI.createTextField({hintText:L("login.username"),left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('username'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false});
	var inputPassword = Titanium.UI.createTextField({hintText:L("login.password"),left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('password'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,passwordMask:true});
	var inputSaveCredentials = Titanium.UI.createSwitch({right:10,value:Titanium.App.Properties.getBool('saveCredentials', false)});
	var buttonLogin = Titanium.UI.createButton({title:L("login.login"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	var labelOnlineMode = Titanium.UI.createLabel({text:L("login.onlineMode"),left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelOfflineMode = Titanium.UI.createLabel({text:L("login.offlineMode"),left:10,font:{fontSize:20,fontWeight:'bold'}});
	var labelDefaultInterface = Titanium.UI.createLabel({text:L("login.openInBrowser"),left:10,font:{fontSize:20,fontWeight:'bold'}});
	
	var tableViewData = [];
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData.push(Titanium.UI.createTableViewSection());
	tableViewData[0].add(wrap([inputServerUrl]));
	tableViewData[1].add(wrap([inputUsername]));
	tableViewData[1].add(wrap([inputPassword]));
	tableViewData[1].add(wrap([Titanium.UI.createLabel({text:L("login.saveCredentials"),left:10}), inputSaveCredentials]));
	var buttonOnlineModeRow = wrap([labelOnlineMode]);
	buttonOnlineModeRow.hasChild = true;
	var buttonOfflineModeRow = wrap([labelOfflineMode]);
	buttonOfflineModeRow.hasChild = true;
	var buttonDefaultInterfaceRow = wrap([labelDefaultInterface]);
	buttonDefaultInterfaceRow.hasChild = true;
	tableViewData[2].add(buttonOnlineModeRow);
	tableViewData[2].add(buttonOfflineModeRow);
	tableViewData[2].add(buttonDefaultInterfaceRow);
	
	var tableView = Titanium.UI.createTableView({data:tableViewData,style:Titanium.UI.iPhone.TableViewStyle.GROUPED,top:45,backgroundImage:"images/stripe.png",selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,scrollable:false});
	
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
				new MenuWindow().open(self);
				win.close();
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
	
    buttonOnlineModeRow.addEventListener('click', function() {
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
	
	buttonOfflineModeRow.addEventListener('click', function() {
		offlineMode = true;
	    var serverUrl = getServerUrl();
		new MenuWindow().open(self);
		win.close();
	});

	buttonDefaultInterfaceRow.addEventListener('click', function() {
		var serverUrl = getServerUrl();
	    Titanium.App.Properties.setString('serverUrl', serverUrl);
	    Titanium.Platform.openURL(serverUrl + '/mytunesrss/?interface=default');
	   
	});
	
	addTopToolbar(win, 'MyTunesRSS', undefined, undefined);
	win.add(tableView);
	
	if (Titanium.App.version.indexOf('SNAPSHOT') > 0) {
		win.add(Titanium.UI.createLabel({text:'v' + Titanium.App.version,textAlign:'center',bottom:30,height:10,font:{fontSize:10}}));
		win.add(Titanium.UI.createLabel({text: Titanium.Filesystem.getFile('white_noise.wav').modificationTimestamp(), textAlign:'center',bottom:20,height:10,font:{fontSize:10}}));
	} else {
		win.add(Titanium.UI.createLabel({text:'v' + Titanium.App.version,textAlign:'center',bottom:20,height:10,font:{fontSize:10}}));
	}
	win.add(actIndicatorView);
	
	this.open = function() {
		win.open();
	}
	
}
