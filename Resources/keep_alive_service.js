var keepAliveSound = Titanium.Media.createSound({url:"keep_alive.wav",volume:0,looping:false,preload:true});
var keepAliveJob = setInterval(function() {
	Titanium.API.debug("Playing keep-alive sound.");
	keepAliveSound.play();
}, 60000);
Titanium.App.currentService.addEventListener("stop", function() {
	if (keepAliveJob != undefined) {
		Titanium.API.debug("Keep-alive service has been stopped, clearing keep-alive job interval timer.");
		clearInterval(keepAliveJob);
		keepAliveJob = undefined;
	}
});
