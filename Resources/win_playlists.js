function PlaylistsWindow(data) {

	var self = this;
	var myParent;

	var win = Titanium.UI.createWindow(STYLE.get("window"));

	var templateOffline = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 10,
					font : {
						fontSize : 20,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			}
		]
	};

	var templateOnline = {
		childTemplates : [
			{
				type : "Titanium.UI.Label",
				bindId : "main",
				properties : {
					left : 10,
					height : 24,
					right : 52,
					font : {
						fontSize : 20,
						fontWeight : "bold"
					},
					color : "#CCCCCC",
					minimumFontSize : 12
				}
			},
			{
				type : "Titanium.UI.ImageView",
				bindId : "optionsMenu",
				properties : {
					width : 32,
                    right : 10,
                    image : "images/more.png",
                    touchEnabled : false
				}
			},
			{
				type : "Titanium.UI.View",
				bindId : "optionsMenuGlow",
				properties : GUI.glowViewOptions({right:20})
			}
		]
	};

	var listView = GUI.createListView({rowHeight:Titanium.Platform.osname === "ipad" ? 72 : 48,search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}),filterAttribute:"filter",top:45,templates:{"online":templateOnline,"offline":templateOffline},defaultItemTemplate:offlineMode ? "offline" : "online"});
	var buttonBack = GUI.createButton({title:L("playlists.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("playlists.title"), buttonBack, undefined));	
	win.add(listView);
	
    listView.addEventListener("itemclick", function(e) {
    	if (e.bindId === "optionsMenu" || e.bindId === "optionsMenuGlow") {
    		optionsMenu(itemProps);
    	} else {
	    	var itemProps = e.section.getItemAt(e.itemIndex).properties;
			var busyView = createBusyView();
	        win.add(busyView);
	        Titanium.App.setIdleTimerDisabled(true);
			try {
	    		loadAndDisplayTracks(self, itemProps.tracksUri);
	        } finally {
	            Titanium.App.setIdleTimerDisabled(false);
	            win.remove(busyView);
	        }
    	}
    });

	setListDataAndIndex(
	        listView,
	        data,
	        function(item, index) {
	        	return {
	        		main : {
	        			text : getDisplayName(item.name)
	        		},
                    syncGlow : {
                        tracksUri : item.tracksUri
                    },
	        		properties : {
	        			tracksUri : item.tracksUri,
	        			trackCount : item.trackCount,
	        			name : getDisplayName(item.name)
	        		}
	        	};
	        },
	        function(item) {
	            return item.name;
	        });
		
	/**
	 * Open the genres window. 
	 */
	this.open = function(parent) {
		if (parent != undefined) {
			myParent = parent;
		}
		win.open();
	};

	function optionsMenu(ice) {
    	var itemProps = ice.section.getItemAt(ice.itemIndex).properties;
		var dialog = Ti.UI.createAlertDialog({
			cancel : 2,
		    buttonNames : [L("playlists.option.download"), L("playlists.option.shuffle"), L("common.option.cancel")],
		    title : itemProps.name
		});
		dialog.addEventListener("click", function(e) {
			var busyView = createBusyView();
	        win.add(busyView);
	        Titanium.App.setIdleTimerDisabled(true);
	        try {
			    if (e.index === 0) {
			        syncTracks(itemProps.tracksUri, ice.section.getItemAt(ice.itemIndex).main.text, "download.playlist", false);
			    } else if (e.index === 1) {
			    	onlineShuffleSession = loadTracks(itemProps.tracksUri);
			    	removeUnsupportedAndNonAudioTracks(onlineShuffleSession);
			    	if (onlineShuffleSession.length > 0) {
				    	shuffleArray(onlineShuffleSession);
					    jukebox.setPlaylist(onlineShuffleSession, 0, true, false);
					    jukebox.open(self);
		        	} else {
		        		showError({message:L("tracks.online.noneFound"),buttonNames:['Ok']});
		        	}
			    }
	        } finally {
	            Titanium.App.setIdleTimerDisabled(false);
	            win.remove(busyView);
	        }
		});
		dialog.show();
	}

}
