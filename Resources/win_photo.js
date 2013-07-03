function PhotoWindow(data, index) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window", {orientationModes:[Titanium.UI.LANDSCAPE_LEFT,Titanium.UI.LANDSCAPE_RIGHT,Titanium.UI.PORTRAIT,Titanium.UI.UPSIDE_PORTRAIT]}));

	var views = [];
	for (var i = 0; i < data.length; i++) {
		var imageView = Titanium.UI.createImageView(tryGetAdSpacingStyle({image:data[i].originalImageUri}));
		var scrollView = Titanium.UI.createScrollView({contentWidth:"auto",contentHeight:"auto",showVerticalScrollIndicator:false,showHorizontalScrollIndicator:false,backgroundColor:"#000000",minZoomScale:1,maxZoomScale:5,zoomScale:1,oldZoom:1});
		scrollView.add(imageView);
	    scrollView.addEventListener("pinch", function(e) {
	 		if (e.scale > 1) {
	 			if (e.scale > scrollView.zoomScale) {
	 				scrollView.zoomScale = e.scale;
	 			} else {
					scrollView.zoomScale = scrollView.oldZoom + (e.scale - 1);
				}
			} else if (e.scale < scrollView.zoomScale) {
				scrollView.zoomScale = scrollView.zoomScale - (1 - e.scale);
			}
		});
		imageView.addEventListener("load", function(e) {
			var image = e.source.toImage();
			var scaleX = Titanium.Platform.displayCaps.platformWidth / image.width;
			var scaleY = Titanium.Platform.displayCaps.platformHeight / image.height;
			var scale = scaleX < scaleY ? scaleX : scaleY;
			e.source.getParent().setMinZoomScale(scale);
			e.source.getParent().setZoomScale(scale);
		});
	 	scrollView.addEventListener("touchend", function(e) {
	 		scrollView.oldZoom = scrollView.zoomScale;
	 	});
		views.push(scrollView);
	}
 	var scrollableView = Titanium.UI.createScrollableView({top:45,cacheSize:3,views:views,currentPage:index});
 	
	var buttonBack = GUI.createButton({title:L("photo.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener("click", function() {
		myParent.open(undefined);
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("photo.title"), buttonBack, undefined));
	win.add(scrollableView);
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
