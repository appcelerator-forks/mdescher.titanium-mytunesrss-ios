function SectionsWindow(title) {
	
	var self = this;
	var myParent;
	var myCallback;

	var win = Titanium.UI.createWindow(STYLE.get("window"));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);
	
	var buttonBack = createCommonBackButton();
	buttonBack.addEventListener("click", function() {
		myParent.open();
	    win.close();
	});
	mediaControlsView.add(GUI.createTopToolbar(title, buttonBack, undefined));

	var rows = new RowArray();
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:L("sections.all"),requestIndex:-1})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"0 - 9",requestIndex:0})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"A - C",requestIndex:1})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"D - F",requestIndex:2})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"G - I",requestIndex:3})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"J - L",requestIndex:4})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"M - O",requestIndex:5})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"P - S",requestIndex:6})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"T - V",requestIndex:7})));
	rows.push(Titanium.UI.createTableViewRow(STYLE.get("menuRow",{selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE,title:"W - Z",requestIndex:8})));

	var tableView = GUI.createTableView({top:45,scrollable:false});
	tableView.setData(rows.getRows());
	tableView.addEventListener("click", function(e) {
		var busyView = createBusyView();
		mediaControlsView.add(busyView);
		disableIdleTimer();
        try {
			if (myCallback(e.rowData.requestIndex)) {
				win.close();
			}
        } finally {
        	enableIdleTimer();
	        mediaControlsView.remove(busyView);
        }
	});
	mediaControlsView.add(tableView);

	this.open = function(parent, callback) {
		if (parent != undefined) {
			myParent = parent;
			myCallback = callback;
		}
		win.open();
		mediaControlsView.becomeFirstResponder();
	};

}
