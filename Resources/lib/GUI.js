exports.createTableView = function(options) {
	options.separatorColor = "#000000";
	options.backgroundColor = DARK_GRAY;
	return Titanium.UI.createTableView(options);
}

exports.createTextField = function(options) {
	options.borderStyle = Titanium.UI.INPUT_BORDERSTYLE_ROUNDED;
	options.font = {fontSize:14};
	if (options.minimumFontSiue === undefined) {
		options.minimumFontSize = 12;
	}
	return Titanium.UI.createTextField(options);
}

exports.createLabel = function(options) {
	options.color = "#CCCCCC";
	if (options.minimumFontSize === undefined) {
		options.minimumFontSize = 12;
	}
	return Titanium.UI.createLabel(options);
}

exports.createButton = function(options) {
	options.color = "#CCCCCC";
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
		options.right = center.right - 25;
	}
	if (center.top != undefined) {
		options.top = center.top - 25;
	} else if (center.bottom != undefined) {
		options.bottom = center.bottom - 25;
	}
	return Titanium.UI.createView(options);
}

exports.createMediaItemRow = function(image, title) {
	return Titanium.UI.createTableViewRow({
		className : "media_row" + (image ? "_image" : ""),	
		rightImage : "images/children.png",
		height : Titanium.Platform.osname === "ipad" ? 72 : 48,
		color : "#CCCCCC",
		selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
		filter : title
	});
}

exports.createMediaTrackItemRow = function(image) {
	return Titanium.UI.createTableViewRow({
		className : "media_row" + (image ? "_image" : ""),	
		height : Titanium.Platform.osname === "ipad" ? 42 : 48,
		color : "#CCCCCC",
		selectionStyle : Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,
		moveable : false,
		editable : offlineMode
	});
}

exports.createMediaTrackItemInfoView = function(imageHash, imageUri, label, sublabel) {
	var trackHeight = Titanium.Platform.osname === "ipad" ? 18 : 20;
	var artistHeight = Titanium.Platform.osname === "ipad" ? 13 : 15;
	var spacer = Titanium.Platform.osname === "ipad" ? 6 : 4;
	var size = Titanium.Platform.osname === "ipad" ? 30 : 40;
    var infoView = Titanium.UI.createView({right:30});
    if (imageUri !== undefined) {
		var hires = Titanium.Platform.displayCaps.density == "high";
		var imagesize = hires ? 128 : 64;
    	infoView.add(createCachedImageView({cacheObjectId:imageHash + "_" + imagesize,hires:true,image:imageUri + "/size=" + imagesize,top:spacer,left:spacer,width:size,height:size,defaultImage:"appicon.png"}));
    }
    var trackName = GUI.createLabel({text:label,top:spacer,left:size + (3 * spacer),height:trackHeight,right:2 * spacer,font:{fontSize:14,fontWeight:"bold"},minimumFontSize:10,touchEnabled:false});
    var artistName = GUI.createLabel({text:sublabel,bottom:spacer,left:size + (3 * spacer),height:artistHeight,right:2 * spacer,font:{fontSize:10},touchEnabled:false});
    infoView.add(trackName);
    infoView.add(artistName);
    return infoView;	
}

exports.createMediaItemImage = function(hash, uri) {
	return createCachedImageView({
		cacheObjectId : hash + "_" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64),
		hires : Titanium.Platform.displayCaps.density === "high",
		image : uri + "/size=" + (Titanium.Platform.displayCaps.density === "high" ? 128 : 64),
		top : Titanium.Platform.osname === "ipad" ? 6 : 4,
		left : Titanium.Platform.osname === "ipad" ? 6 : 4,
		width : Titanium.Platform.osname === "ipad" ? 60 : 40,
		height : Titanium.Platform.osname === "ipad" ? 60 : 40,
		defaultImage : "appicon.png"
	});
}

exports.createMediaItemLabel = function(label) {
	return Titanium.UI.createLabel({
		text : label,
		top : Titanium.Platform.osname === "ipad" ? 6 : 4,
		left : Titanium.Platform.osname === "ipad" ? 78 : 52,
		height : Titanium.Platform.osname === "ipad" ? 36 : 24,
		right : Titanium.Platform.osname === "ipad" ? 12 : 8,
		font : {
			fontSize : 16,
			fontWeight : "bold"
		},
		color : "#CCCCCC",
		minimumFontSize : 12
	});
}

exports.createMediaItemSubLabel = function(label) {
	return Titanium.UI.createLabel({
		text : label,
		bottom : Titanium.Platform.osname === "ipad" ? 6 : 4,
		left : Titanium.Platform.osname === "ipad" ? 78 : 52,
		height : Titanium.Platform.osname === "ipad" ? 26 : 18,
		font : {
			fontSize : 12,
			fontWeight : "bold"
		},
		color : "#CCCCCC",
		minimumFontSize : 12
	});
}

exports.Style = function() {
	
	var styles = JSON.parse(Titanium.Filesystem.getFile("styles/iphone.json").read());
	if (Titanium.Platform.osname === "ipad") {
		var ipadStyles = JSON.parse(Titanium.Filesystem.getFile("styles/ipad.json").read());
		for (var attrname in ipadStyles) {
			styles[attrname] = ipadStyles[attrname];
		}
	}
	
	this.get = function(id, options) {
		var style = {};
		if (styles[id] !== undefined) {
			style = JSON.parse(JSON.stringify(styles[id]));
		}
		if (options != undefined) {
			for (var attrname in options) {
				style[attrname] = options[attrname];
			}
		}
		return style;
	}
	
}

