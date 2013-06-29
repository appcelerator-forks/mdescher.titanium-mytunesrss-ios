function PhotoWindow(uri) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var imageView = Titanium.UI.createImageView(tryGetAdSpacingStyle({top:45,image:uri}));

	var buttonBack = GUI.createButton({title:L("photo.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open(undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("photo.title"), buttonBack, undefined));
	win.add(imageView);
	tryAddAd(win);
	
	/**
	 * Open the photo window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};
	
}
