function AlbumsWindow(data) {

	var self = this;
	var myParent;

	var win = GUI.createWindow({});

	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:'title',top:45});
	var buttonBack = GUI.createButton({title:L("albums.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("albums.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
		if (!offlineMode) {
		    loadAndDisplayTracks(self, e.rowData.tracksUri);
		} else {
			loadAndDisplayOfflineTracks(self, e.rowData.albumName, e.rowData.albumArtist);
		}
	    win.remove(busyView);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var displayName = getDisplayName(item.name);
				var size = 40;
				var albumHeight = 24;
				var artistHeight = 18;
				var spacer = 4;
				var hires = false;
				if (Titanium.Platform.osname === "ipad") {
					size = 60;
					albumHeight = 36;
					artistHeight = 26;
					spacer = 6;
				} else if (Titanium.Platform.osname === "iphone") {
					hires = Titanium.Platform.displayCaps.density == "high";
				}
	            var row = GUI.createTableViewRow({hasChild:true,height:size + (2 * spacer),className:item.imageUri ? 'album_row_img' : 'album_row',selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	            if (item.imageUri !== undefined) {
	                var albumImage;
	                if (hires) {
	                	albumImage = createCachedImageView({cacheObjectId:item.imageHash + "_128",hires:true,image:item.imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                } else {
	                	albumImage = createCachedImageView({cacheObjectId:item.imageHash + "_64",image:item.imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                }
	                row.add(albumImage);
	            }
	            var albumName = GUI.createLabel({text:displayName,top:spacer,left:size + (2 * spacer),height:albumHeight,right:2 * spacer,font:{fontSize:16,fontWeight:'bold'},minimumFontSize:12});
	            var artistName = GUI.createLabel({text:getDisplayName(item.artist),bottom:spacer,left:size + (2 * spacer),height:artistHeight,font:{fontSize:12}});
	            row.add(albumName);
	            row.add(artistName);
	            row.tracksUri = item.tracksUri;
	            row.albumName = item.name;
	            row.albumArtist = item.artist;
	            return row;
	        },
	        function(item) {
	            return item.name;
	        });

	/**
	 * Open the albums window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
