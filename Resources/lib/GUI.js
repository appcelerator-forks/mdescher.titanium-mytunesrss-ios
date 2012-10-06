exports.createWindow = function() {
	var win = Titanium.UI.createWindow({backgroundImage:"none",backgroundColor:"#000000"});
	return win;
}

exports.createTableView = function(options) {
	options.backgroundColor = "#000000";
	options.backgroundImage = "none";
	options.separatorColor = "#808080";
	return Titanium.UI.createTableView(options);
}

exports.createInvisibleTableView = function(options) {
	options.backgroundColor = "transparent";
	options.borderColor = "transparent";
	options.backgroundImage = "none";
	options.separatorStyle = Titanium.UI.iPhone.TableViewSeparatorStyle.NONE;
	return Titanium.UI.createTableView(options);
}

exports.createTextField = function(options) {
	options.color = "#000000";
	options.backgroundImage = "images/textfield.png";
	options.backgroundTopCap = 17;
	options.backgroundLeftCap = 17;
	options.paddingLeft = 17;
	options.paddingRight = 17;
	return Titanium.UI.createTextField(options);
}

exports.createLabel = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createLabel(options);
}

exports.createButton = function(options) {
	options.color = "#000000";
	options.backgroundImage = "images/button.png";
	options.backgroundTopCap = 17;
	options.backgroundLeftCap = 17;
	options.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	options.height = 45;
	return Titanium.UI.createButton(options);
}

exports.createSmallButton = function(options) {
	options.color = "#000000";
	options.backgroundImage = "images/button_small.png";
	options.backgroundTopCap = 10;
	options.backgroundLeftCap = 10;
	options.font = {fontSize:12};
	options.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	options.height = 25;
	return Titanium.UI.createButton(options);
}

exports.createTableViewRow = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createTableViewRow(options);
}

exports.createInvisibleTableViewRow = function(options) {
	options.backgroundColor = "transparent";
	options.borderColor = "transparent";
	return Titanium.UI.createTableViewRow(options);
}

exports.createTopToolbar = function(titleText, leftButton, rightButton) {
	var view = Titanium.UI.createView({width:Titanium.UI.FILL,top:0,height:45,backgroundImage:"images/toolbar.png",backgroundTopCap:22,backgroundLeftCap:5});
	view.add(Titanium.UI.createLabel({text:titleText,textAlign:"center",color:"#FFFFFF",shadowColor:"#000000",font:{fontSize:20,fontWeight:"bold"}}));
	if (leftButton !== undefined) {
		leftButton.left = 5;
		view.add(leftButton);
	}
	if (rightButton !== undefined) {
		rightButton.right = 5;
		view.add(rightButton);
	}
	return view;
}
