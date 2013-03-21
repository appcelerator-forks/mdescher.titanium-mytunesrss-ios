function ServerHistoryWindow() {	
	
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true,modal:true}));
	var buttonClose = GUI.createButton({title:"x",style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonClose.addEventListener("click", function() {
		win.close();
	});
	
	win.add(GUI.createTopToolbar("Server History", undefined, buttonClose));
	
	var tableView = GUI.createTableView({top:45,scrollable:false});
	var data = [];
	var urls = getRememberedServerUrls();
	for (var i = 0; i < urls.length; i++) {
		data.push(GUI.createTableViewRow({title:urls[i],font:{size:12},selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE}));
	}
	tableView.setData(data);
	tableView.addEventListener("click", function(e) {
		Titanium.App.fireEvent("mytunesrss_serverurlselected", {url:urls[e.index]});
		win.close();
	});
	win.add(tableView);

	/**
	 * Open the app info window. 
	 */
	this.open = function() {
		win.open();
	}
	
}
