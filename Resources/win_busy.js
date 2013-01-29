function BusyWindow(label1, label2) {	
	
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	var progressBar = Titanium.UI.createProgressBar(STYLE.get("busyViewProgress"), {style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN});
	progressBar.show();
	
	win.add(GUI.createTopToolbar("MyTunesRSS", undefined, undefined));
	
	win.add(GUI.createLabel(STYLE.get("busyViewMessage1", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:label1})));
	win.add(GUI.createLabel(STYLE.get("busyViewMessage2", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:label2})));
	win.add(Titanium.UI.createImageView(STYLE.get("busyViewLogo")));
	win.add(progressBar);
	win.add(Titanium.UI.iOS.createAdView(STYLE.get("iad", {adSize:Titanium.UI.iOS.AD_SIZE_LANDSCAPE,backgroundColor:DARK_GRAY})));

	/**
	 * Open the busy window. 
	 */
	this.open = function(label1, label2) {
		win.open();
	}
	
	this.close = function() {
		win.close();
	}
	
	this.setProgress = function(percentage) {
		progressBar.setValue(percentage);
	}
	
}
