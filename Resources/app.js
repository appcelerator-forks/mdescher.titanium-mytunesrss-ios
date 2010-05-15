Titanium.include('mytunesrss.js');

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

var win = Titanium.UI.createWindow({url:'win_login.js'});
win.open();
