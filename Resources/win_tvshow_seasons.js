function TvShowSeasonsWindow(data) {

	var self = this;
	var myParent;

	var win = createWindow();

	var actIndicatorView = Titanium.UI.createView({top:0,left:0,bottom:0,right:0,backgroundColor:'#000',opacity:0.8,visible:false});
	actIndicatorView.add(Titanium.UI.createActivityIndicator({top:0,bottom:0,left:0,right:0,visible:true}));
	
	var tableView = Titanium.UI.createTableView({search:Titanium.UI.createSearchBar({autocapitalization:false,autocorrect:false}), filterAttribute:'title',top:45});
	var buttonBack = Titanium.UI.createButton({title:'Back',style:Titanium.UI.iPhone.SystemButtonStyle.BORDERED});
	
	buttonBack.addEventListener('click', function() {
		myParent.open();
	    win.close();
	});
	
	addTopToolbar(win, 'TV Show Seasons', buttonBack, undefined);
	
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
	            var row = Titanium.UI.createTableViewRow({title:displayName,color:'transparent',hasChild:true,height:size + (2 * spacer),className:item.imageUri ? 'show_row_img' : 'show_row',selectionStyle:Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE});
	            if (item.imageUri !== undefined) {
	                var seasonImage;
	                if (hires) {
	                	seasonImage = createCachedImageView({cacheObjectId:item.imageHash + "_128",hires:true,image:item.imageUri + "/size=128",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                } else {
	                	seasonImage = createCachedImageView({cacheObjectId:item.imageHash + "_64",image:item.imageUri + "/size=64",top:spacer,left:spacer,width:size,height:size,defaultImage:'appicon.png'});
	                }
	                row.add(seasonImage);
	            }
	            var showName = Titanium.UI.createLabel({text:displayName,top:spacer,left:size + (2 * spacer),height:nameHeight,right:2 * spacer,font:{fontSize:16,fontWeight:'bold'},minimumFontSize:12});
	            var showInfo = Titanium.UI.createLabel({text:item.episodeCount + (item.episodeCount === 1 ? " episode" : " episodes"),bottom:spacer,left:size + (2 * spacer),height:infoHeight,font:{fontSize:12}});
	            row.add(showName);
	            row.add(showInfo);
	            row.episodesUri = item.episodesUri;
	            return row;
	        },
	        function(item) {
	            return "Season " + item.name;
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
