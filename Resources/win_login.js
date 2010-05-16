Titanium.include('mytunesrss.js');
Titanium.include('mytunesrss_platform.js');

var win = Titanium.UI.currentWindow;

var inputServerUrl = Titanium.UI.createTextField({hintText:'Server URL',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('serverUrl'),returnKeyType:Titanium.UI.RETURNKEY_DONE,keyboardType:Titanium.UI.KEYBOARD_URL,autocorrect:false,autocapitalize:false,autocomplete:false});
var inputUsername = Titanium.UI.createTextField({hintText:'Username',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('username'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalize:false,autocomplete:false});
var inputPassword = Titanium.UI.createTextField({hintText:'Password',left:10,right:10,top:5,bottom:5,value:Titanium.App.Properties.getString('password'),returnKeyType:Titanium.UI.RETURNKEY_DONE,autocorrect:false,autocapitalize:false,autocomplete:false,passwordMask:true});
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

    ajaxCall('LoginService.login', [inputUsername.value, inputPassword.value, 180], function(result, error) {
        if (result) {
            onLogin(result);
        } else {
            alert('login failed');
        }
    });

});

buttonDefaultInterfaceRow.addEventListener('click', function() {
    Titanium.App.Properties.setString('serverUrl', inputServerUrl.value);
    Titanium.Platform.openURL(inputServerUrl.value);
});

addTopToolbar(win, 'MyTunesRSS', undefined, buttonLogin);
win.add(tableView);

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