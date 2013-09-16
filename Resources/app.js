if (Titanium.Platform.version.split(".")[0] === "7") {
	Titanium.include("ios7/main.js");
} else {
	Titanium.include("main.js");
}
