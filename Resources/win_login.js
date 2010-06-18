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

var inputServerUrl = Titanium.UI.createTextField({hintText:'Server URL',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalization:false,autocomplete:false});
var inputUsername = Titanium.UI.createTextField({hintText:'Username',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('username'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false});
var inputPassword = Titanium.UI.createTextField({hintText:'Password',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('password'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalization:false,autocomplete:false,passwordMask:true});
var inputSaveCredentials = Titanium.UI.createSwitch({right:10,value:Titanium.App.Properties.getBool('saveCredentials', false)});
var buttonLogin = Titanium.UI.createButton({title:'Login',style:buttonStyle});
var labelDefaultInterface = Titanium.UI.createLabel({text:'Default Web-Interface',left:10,font:{fontSize:20,fontWeight:'bold'}});

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

buttonLogin.addEventListener('click', function() {

    Titanium.App.Properties.setString('serverUrl', inputServerUrl.value);
    Titanium.App.Properties.setBool('saveCredentials', inputSaveCredentials.value);
    if (inputSaveCredentials.value === true) {
        Titanium.App.Properties.setString('username', inputUsername.value);
        Titanium.App.Properties.setString('password', inputPassword.value);
    } else {
        Titanium.App.Properties.removeProperty('username');
        Titanium.App.Properties.removeProperty('password');
    }

    actIndicatorView.show();
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

});

buttonDefaultInterfaceRow.addEventListener('click', function() {
    Titanium.App.Properties.setString('serverUrl', inputServerUrl.value);
    Titanium.Platform.openURL(inputServerUrl.value);
});

addTopToolbar(win, 'MyTunesRSS', undefined, buttonLogin);
win.add(tableView);
win.add(actIndicatorView);
