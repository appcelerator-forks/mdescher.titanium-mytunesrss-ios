Titanium.include('mytunesrss.js');

var view = Titanium.UI.createView();

Titanium.App.Properties.removeProperty('jsonRpcSessionId');

Titanium.UI.setBackgroundColor('#000');

var win = Titanium.UI.createWindow({url:'win_login.js',backgroundColor:'#FFF'});
win.open();