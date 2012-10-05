var GUI = { };

GUI.createWindow = function() {
	var win = Titanium.UI.createWindow({backgroundImage:"none",backgroundColor:"#000000"});
	return win;
}

GUI.createTableView = function(options) {
	options.backgroundColor = "#000000";
	options.backgroundImage = "none";
	return Titanium.UI.createTableView(options);
}

GUI.createTextField = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createTextField(options);
}

GUI.createLabel = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createLabel(options);
}

GUI.createTableViewRow = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createTableViewRow(options);
}
