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
