function TvShowSeasonsWindow(data) {

	var self = this;
	var myParent;

	var win = GUI.createWindow({});

	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = GUI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false,barColor:"#000000"}), filterAttribute:'title',top:45});
	var buttonBack = GUI.createButton({title:L("tvshow.seasons.back"),style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	win.add(GUI.createTopToolbar(L("tvshow.seasons.title"), buttonBack, undefined));
	
	win.add(tableView);
	
	win.add(actIndicatorView);
	
	tableView.addEventListener('click', function(e) {
		var busyView = createBusyView();
		win.add(busyView);
	    loadAndDisplayTracks(self, e.rowData.episodesUri);
	    win.remove(busyView);
	});
	
	setTableDataAndIndex(
	        tableView,
	        data,
	        function(item, index) {
	            var displayName = "Season " + item.name;
				var size = 40;
				var nameHeight = 24;
				var infoHeight = 18;
				var spacer = 4;
				var hires = false;
				if (Titanium.Platform.osname === "ipad") {
					size = 60;
					nameHeight = 36;
					infoHeight = 26;
					spacer = 6;
				} else if (Titanium.Platform.osname === "iphone") {
					hires = Titanium.Platform.displayCaps.density == "high";
				}
	            var row = GUI.createTableViewRow({hasChild:true,height:size + (2 * spacer),className:item.imageUri ? 'show_row_img' : 'show_row',selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	            if (item.imageUri !== undefined) {
	                var seasonImage;
	                if (hires) {
	                	seasonImage = createCachedImageView({cacheObjectId:item.imageHash + "_128",hires:true,image:item.imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                } else {
	                	seasonImage = createCachedImageView({cacheObjectId:item.imageHash + "_64",image:item.imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                }
	                row.add(seasonImage);
	            }
	            var showName = GUI.createLabel({text:displayName,top:spacer,left:size + (2 * spacer),height:nameHeight,right:2 * spacer,font:{fontSize:16,fontWeight:'bold'}});
	            var showInfo = GUI.createLabel({text:String.format(L("tvshow.seasons.info"), item.episodeCount),bottom:spacer,left:size + (2 * spacer),height:infoHeight,font:{fontSize:12}});
	            row.add(showName);
	            row.add(showInfo);
	            row.episodesUri = item.episodesUri;
	            return row;
	        },
	        function(item) {
	            return String.format(L("tvshow.seasons.itemName"), item.name);
	        });

	/**
	 * Open the tv show seasons window. 
	 */
	this.open = function(parent) {
		if (parent !== undefined) {
			myParent = parent;
		}
		win.open();
	}

}
