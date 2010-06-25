var buttonStyle = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
var tableViewGroupStyle = Titanium.UI.iPhone.TableViewStyle.GROUPED;

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
    if (Titanium.App.Properties.getString('jsonRpcSessionId') != undefined) {
        httpClient.setRequestHeader('X-MyTunesRSS-ID', Titanium.App.Properties.getString('jsonRpcSessionId'));
    }
    httpClient.setRequestHeader('Accept-Encoding', 'gzip,deflate');
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
    var sectionTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '123'];
    var indexTitle = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];
    var section = new Array(27);
    for (var i = 0; i < items.length; i++) {
        var itemName = getSectionAndIndexNameCallback(items[i]);
        var index = itemName[0].toUpperCase().charCodeAt(0) - 65;
        if (index < 0 || index > 25) {
            index = 26;
        }
        if (!section[index]) {
            section[index] = Titanium.UI.createTableViewSection({headerTitle:sectionTitle[index]});
        }
        section[index].add(createTableViewRowCallback(items[i], i));
    }
    var indexData = [];
    var tableData = [];
    var globalIndex = 0;
    for (i = 0; i < 27; i++) {
        if (section[i]) {
            tableData.push(section[i]);
            indexData.push({title:indexTitle[i],index:globalIndex});
            globalIndex += section[i].rowCount;
        }
    }
    tableView.setData(tableData);
    if (items.length > 50 && indexData.length > 5) {
        tableView.setIndex(indexData);
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

function handleUnexpectedServerError(msg) {
    if (msg.toUpperCase() === 'UNAUTHORIZED') {
        Titanium.UI.createAlertDialog({message:'You are not authorized to access the server. Maybe your session has expired. Please go back to the menu and logout.',buttonNames:['Ok']}).show();
    } else {
        Titanium.UI.createAlertDialog({message:'Unexpected server error.',buttonNames:['Ok']}).show();
    }
}

function showServerError(error) {
    Titanium.UI.createAlertDialog({message:error.msg,buttonNames:['Ok']}).show();
}