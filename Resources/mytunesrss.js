function ajaxCall(func, parameterArray, resultCallback) {
    var httpClient = Titanium.Network.createHTTPClient();
    httpClient.onload = function() {
        var response = JSON.parse(this.responseText);
        resultCallback(response.result, response.error);
    };
    httpClient.onerror = function() {
        resultCallback();
    };
    httpClient.open('POST', Titanium.App.Properties.getString('serverUrl') + '/jsonrpc');
    httpClient.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    if (Titanium.App.sessionId != undefined) {
        httpClient.setRequestHeader('X-MyTunesRSS-ID', Titanium.App.sessionId);
    }
    var data = {
        'version' : '1.1',
        'method' : func,
        'id' : '0',
        'params' : parameterArray
    };
    httpClient.send(JSON.stringify(data));
}

function getDisplayName(name) {
    if (name == 'undefined' || name == null || name == '!') {
        return 'Unknown';
    }
    return name;
}

function setTableDataAndIndex(items, tableView, createTableViewRowCallback, getSectionAndIndexNameCallback) {
    var sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var tableIndex = [];
    var tableData = [];
    var elementCount = 0;
    for (var i = 0; i < sections.length; i++) {
        tableIndex.push({title:sections[i], index:elementCount});
        var section = Titanium.UI.createTableViewSection({headerTitle:sections[i]});
        for (var k = 0; k < items.length; k++) {
            if (items[k] != null) {
                var firstChar = getSectionAndIndexNameCallback(items[k]).substr(0, 1).toUpperCase();
                if (firstChar === section.headerTitle) {
                    section.add(createTableViewRowCallback(items[k], k));
                    elementCount++;
                    items[k] = null;
                }
            }
        }
        if (section.rowCount > 0) {
            tableData.push(section);
        }
    }
    section = Titanium.UI.createTableViewSection({headerTitle:'123'});
    tableIndex.push({title:'#', index:elementCount});
    for (k = 0; k < items.length; k++) {
        if (items[k] != null) {
            section.add(Titanium.UI.createTableViewRow({title:getDisplayName(items[k].name)}));
        }
    }
    if (section.rowCount > 0) {
        tableData.push(section);
    }
    tableView.setData(tableData);
    if (items.length > 50) {
        tableView.setIndex(tableIndex);
    }
}

function addTopToolbar(window, titleText, leftButton, rightButton) {
    var flexSpace = Titanium.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
    var toolbarItems = [];
    if (leftButton) {
        toolbarItems.push(leftButton);
    }
    toolbarItems.push(flexSpace);
    if (rightButton) {
        toolbarItems.push(rightButton);
    }
    window.add(Titanium.UI.createToolbar({top:0,height:45,items:toolbarItems}));
    if (titleText) {
        var title = Titanium.UI.createLabel({text:titleText,left:0,right:0,top:0,height:45,textAlign:'center',color:'#FFF',font:{fontSize:20,fontWeight:'bold'}});
        window.add(title);
    }
}
