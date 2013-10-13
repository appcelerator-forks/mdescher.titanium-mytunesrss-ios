function MenuView(parentWindow, title, buttons, listener) {
	
	var staticHeight = isIos7() ? 23 + 6 - 1 : 22 + 6 - 1;
	var buttonHeight = 44;
	
	var glassPane = Titanium.UI.createView(STYLE.get("menuGlassPane"));
	var whiteView = Titanium.UI.createView(STYLE.get("menuOuterView", {height:staticHeight + buttons.length * buttonHeight}));
	var blackView = Titanium.UI.createView(STYLE.get("menuInnerView"));
	var tableView = Titanium.UI.createTableView(STYLE.get("menuTableView"));
	var tableViewSection = Titanium.UI.createTableViewSection({headerTitle:title});
	tableView.appendSection(tableViewSection);
	for (var i = 0; i < buttons.length; i++) {
		var tableViewRow = Titanium.UI.createTableViewRow({title:buttons[i]});
		tableViewRow.addEventListener("click", function(e) {
			parentWindow.remove(whiteView);
			parentWindow.remove(glassPane);
			listener(e.index);
		});
		tableView.appendRow(tableViewRow);
		
	}
	whiteView.add(blackView);
	whiteView.add(tableView);
	
	this.show = function() {
		parentWindow.add(glassPane);
		parentWindow.add(whiteView);	
	};
	
}
