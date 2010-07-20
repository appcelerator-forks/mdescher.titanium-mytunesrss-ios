Titanium.include('mytunesrss.js');

function wrap(components) {
    var row = Titanium.UI.createTableViewRow();
    for (var i = 0; i < components.length; i++) {
        row.add(components[i]);
    }
    return row;
}

function onLogin(result) {
    Titanium.App.Properties.setString('jsonRpcSessionId', result);
    Titanium.UI.createWindow({url:'win_menu.js',backgroundColor:'#FFF'}).open();
}

var win = Titanium.UI.currentWindow;

var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
win.addEventListener('focus', function() {
    actIndicatorView.hide();
});

var inputServerUrl = Titanium.UI.createTextField({hintText:'Server URL',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false,minimumFontSize:12});
var inputUsername = Titanium.UI.createTextField({hintText:'Username',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('username'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false});
var inputPassword = Titanium.UI.createTextField({hintText:'Password',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('password'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,passwordMask:true});
var inputSaveCredentials = Titanium.UI.createSwitch({right:10,value:Titanium.App.Properties.getBool('saveCredentials', false)});
var buttonLogin = Titanium.UI.createButton({title:'Login',style:buttonStyle});
var labelDefaultInterface = Titanium.UI.createLabel({text:'Open in browser',left:10,font:{fontSize:20,fontWeight:'bold'}});

var tableViewData = [];
tableViewData.push(Titanium.UI.createTableViewSection());
tableViewData.push(Titanium.UI.createTableViewSection());
tableViewData.push(Titanium.UI.createTableViewSection());
tableViewData[0].add(wrap([inputServerUrl]));
tableViewData[1].add(wrap([inputUsername]));
tableViewData[1].add(wrap([inputPassword]));
tableViewData[1].add(wrap([Titanium.UI.createLabel({text:'Save credentials',left:10}), inputSaveCredentials]));
var buttonDefaultInterfaceRow = wrap([labelDefaultInterface]);
buttonDefaultInterfaceRow.hasChild = true;
tableViewData[2].add(buttonDefaultInterfaceRow);

var tableView = Titanium.UI.createTableView({data:tableViewData,style:tableViewGroupStyle,top:45});

function doLogin() {
    ajaxCall('ServerService.getServerInfo', [], function(result, error) {
        if (result) {
            Titanium.App.Properties.setString('serverMajor', result.major);
            Titanium.App.Properties.setString('serverMinor', result.minor);
            Titanium.App.Properties.setString('serverRevision', result.revision);
            if (result.major < 3 || (result.major == 3 && (result.minor < 8 || (result.minor == 8 && result.revision < 13)))) {
                actIndicatorView.hide();
                Titanium.UI.createAlertDialog({message:'The MyTunesRSS server must be version 3.8.13 or better and is version ' + result.version + ' only.',buttonNames:['Ok']}).show();
            } else {
                ajaxCall('LoginService.login', [inputUsername.value, inputPassword.value, 180], function(result, error) {
                    if (result) {
                        onLogin(result);
                    } else if (error) {
                        actIndicatorView.hide();
                        Titanium.UI.createAlertDialog({message:'Login failed, please check username and password.',buttonNames:['Ok']}).show();
                    } else {
                        actIndicatorView.hide();
                        Titanium.UI.createAlertDialog({message:'No response from server, please check server URL and make sure the server is running.',buttonNames:['Ok']}).show();
                    }
                });
            }
        } else {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'No response from server, please check server URL and make sure the server is running.',buttonNames:['Ok']}).show();
        }
    });
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
    var serverUrl = getServerUrl();
    Titanium.App.Properties.setString('serverUrl', serverUrl);
    Titanium.App.Properties.setBool('saveCredentials', inputSaveCredentials.value);
    if (inputSaveCredentials.value === true) {
        Titanium.App.Properties.setString('username', inputUsername.value);
        Titanium.App.Properties.setString('password', inputPassword.value);
    } else {
        Titanium.App.Properties.removeProperty('username');
        Titanium.App.Properties.removeProperty('password');
    }

    actIndicatorView.show();

    if (serverUrl.toLowerCase().search(/https?:\/\/mytunesrss.com\//) === 0) {
        // mytunesrss.com handling => resolve real server url and then login
        var httpClient = Titanium.Network.createHTTPClient({timeout:5000});
        httpClient.onload = function() {
            var resolvedServerUrl = this.location.match(/https?:\/\/[^\/]+/)[0];
            if (resolvedServerUrl.toLowerCase().search(/https?:\/\/mytunesrss.com/) === 0) {
                actIndicatorView.hide();
                Titanium.UI.createAlertDialog({message:'The mytunesrss.com username seems to be wrong. Please check the server URL.',buttonNames:['Ok']}).show();
            } else {
                Titanium.App.Properties.setString('resolvedServerUrl', resolvedServerUrl);
                doLogin();
            }
        };
        httpClient.onerror = function() {
            actIndicatorView.hide();
            Titanium.UI.createAlertDialog({message:'The mytunesrss.com username seems to be wrong. Please check the server URL.',buttonNames:['Ok']}).show();
        };
        httpClient.open('GET', Titanium.App.Properties.getString('serverUrl'));
        httpClient.send(null);
    } else {
        Titanium.App.Properties.setString('resolvedServerUrl', serverUrl);
        doLogin();
    }
});

buttonDefaultInterfaceRow.addEventListener('click', function() {
    var serverUrl = getServerUrl();
    Titanium.App.Properties.setString('serverUrl', serverUrl);
    Titanium.Platform.openURL(serverUrl + '/mytunesrss/?interface=default');
});

addTopToolbar(win, 'MyTunesRSS', undefined, buttonLogin);
win.add(tableView);
win.add(actIndicatorView);
