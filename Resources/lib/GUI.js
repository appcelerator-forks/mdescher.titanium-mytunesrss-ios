exports.createWindow = function(options) {
	options.barColor = "#000000";
	options.backgroundColor = DARK_GRAY;
	return Titanium.UI.createWindow(options);
}

exports.createTableView = function(options) {
	options.separatorColor = "#000000";
	options.backgroundColor = DARK_GRAY;
	return Titanium.UI.createTableView(options);
}

exports.createTextField = function(options) {
	options.borderStyle = Titanium.UI.INPUT_BORDERSTYLE_ROUNDED;
	return Titanium.UI.createTextField(options);
}

exports.createLabel = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createLabel(options);
}

exports.createButton = function(options) {
	return Titanium.UI.createButton(options);
}

exports.createTableViewRow = function(options) {
	options.color = "#CCCCCC";
	return Titanium.UI.createTableViewRow(options);
}

exports.createTopToolbar = function(titleText, leftButton, rightButton) {
	var items = [];
	if (leftButton !== undefined) {
		items.push(leftButton);
	}
	items.push(Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE}));
	if (rightButton !== undefined) {
		items.push(rightButton);
	}
	var toolbar = Titanium.UI.iOS.createToolbar({width:Titanium.UI.FILL,top:0,height:45,items:items,barColor:"#000000"});
	toolbar.add(Titanium.UI.createLabel({text:titleText,textAlign:"center",font:{fontSize:18,fontWeight:"bold"},color:"#CCCCCC"}));
	return toolbar;
}

exports.createPopulatedTableViewRow = function(components, vScale) {
	if (vScale == undefined) {
		vScale = 1;
	}
    var row = Titanium.UI.createTableViewRow({height:40 * vScale});
    for (var i = 0; i < components.length; i++) {
        row.add(components[i]);
    }
    return row;
}

exports.createActivityIndicator = function() {
	var view = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000000',opacity:0.8,visible:false});
	view.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	return view;
}

exports.add = function(view, component) {
	view.add(component);
	return component;
}

exports.createGlow = function(center) {
	var options = {
		width:50,
		height:50,
		opacity:0,
		backgroundGradient:{
			type:"radial",
			startPoint:{
				x:25,
				y:25
			},
			endPoint:{
				x:25,
				y:25
			},
			colors:["#FFFFFF",DARK_GRAY],
			startRadius:"0",
			endRadius:"25",
			backfillStart:false
		}
	};
	if (center.left != undefined) {
		options.left = center.left - 25;
	} else if (center.right != undefined) {
		options.right =center.right - 25;
	}
	return Titanium.UI.createView(options);
}
