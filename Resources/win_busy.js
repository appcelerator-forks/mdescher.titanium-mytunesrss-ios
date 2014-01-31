function BusyWindow(label1, label2, cancelCallback) {	
	
	var win = Titanium.UI.createWindow(STYLE.get("window",{navBarHidden:true}));
	var mediaControlsView = createMediaControlsView();
	win.add(mediaControlsView);

	var progressBar = Titanium.UI.createProgressBar(STYLE.get("busyViewProgress"), {style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN});
	progressBar.show();
		
	var cancelButton = undefined;
	if (cancelCallback != undefined) {
		cancelButton = isIos7() ? GUI.createButton({title:L("busy.cancel")}) : GUI.createButton({title:L("busy.cancel"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
		cancelButton.addEventListener("click", function() {
        	var busyView = createBusyView();
		    mediaControlsView.add(busyView);
            try {
    			cancelCallback();
            } finally {
                mediaControlsView.remove(busyView);
            }
		});
	}
	mediaControlsView.add(GUI.createTopToolbar("MyTunesRSS", cancelButton, undefined));
	
	mediaControlsView.add(GUI.createLabel(STYLE.get("busyViewMessage1", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:label1})));
	mediaControlsView.add(GUI.createLabel(STYLE.get("busyViewMessage2", {textAlign:Titanium.UI.TEXT_ALIGNMENT_CENTER,text:label2})));
	mediaControlsView.add(Titanium.UI.createImageView(STYLE.get("busyViewLogo")));
	mediaControlsView.add(progressBar);

	/**
	 * Open the busy window. 
	 */
	this.open = function(label1, label2) {
		win.open();
		mediaControlsView.becomeFirstResponder();
	};
	
	this.close = function() {
		win.close();
	};
	
	this.setProgress = function(percentage) {
		progressBar.setValue(percentage);
	};
	
}
