function PhotoWindow(data, index) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window", {orientationModes:[Titanium.UI.LANDSCAPE_LEFT,Titanium.UI.LANDSCAPE_RIGHT,Titanium.UI.PORTRAIT,Titanium.UI.UPSIDE_PORTRAIT]}));

	var views = [];
	for (var i = 0; i < data.length; i++) {
		var imageView = Titanium.UI.createImageView({image:data[i].originalImageUri + "/size=" + getSettingsMaxPhotoSize() + "/jpegQuality=" + getSettingsPhotoJpegQuality()});
		var scrollView = Titanium.UI.createScrollView({contentWidth:"auto",contentHeight:"auto",showVerticalScrollIndicator:false,showHorizontalScrollIndicator:false,minZoomScale:1,maxZoomScale:5,zoomScale:1,oldZoom:1});
		if (!isIos7()) {
			scrollView.backgroundColor = "#000000";
		}
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
 	var scrollableView = Titanium.UI.createScrollableView({cacheSize:3,views:views,currentPage:index});
 	
	var buttonBack = createCommonBackButton();
	
	var orientationChangeFunction = function (e) {
		var min = Math.max(0, scrollableView.getCurrentPage() - ((scrollableView.getCacheSize() - 1) / 2));
		var max = Math.min(scrollableView.getCurrentPage() + ((scrollableView.getCacheSize() - 1) / 2), views.length - 1);
		for (i = min; i <= max; i++) {
			var scrollView = views[i];
			var imageView = scrollView.getChildren()[0];
			var image = imageView.toImage();
			var scaleX = Titanium.Platform.displayCaps.platformWidth / image.width;
			var scaleY = Titanium.Platform.displayCaps.platformHeight / image.height;
			var scale = scaleX < scaleY ? scaleX : scaleY;
			scrollView.setMinZoomScale(scale);
			scrollView.setZoomScale(scale);
		}
	};

	buttonBack.addEventListener("click", function() {
		Ti.Gesture.removeEventListener("orientationchange", orientationChangeFunction);
		myParent.open(undefined);
	    win.close();
	});
	
	var toolbar = GUI.createTopToolbar(L("photo.title"), buttonBack, undefined);
	toolbar.setVisible(false);

	win.add(scrollableView);
	win.add(toolbar);

	win.addEventListener("singletap", function() {
		toolbar.setVisible(!toolbar.visible);		
	});
	
	Ti.Gesture.addEventListener("orientationchange", orientationChangeFunction);

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
