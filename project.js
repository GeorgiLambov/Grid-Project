$(document).ready(function () {
    ko.applyBindings(new ViewBranches(), document.getElementById("AdminBranchesContent"));
});

function ViewBranches() {
    var self = this;
    var dataJson = { "result": true, "msg": "No Data in POST", "errorDescription": "", "data": { "Branches": [{ "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 1, "ID": 0, "Code": null, "Name": "HO", "Notes": "Head Office", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 0, "CreatedBy": "System", "CreatedOn": "2014-05-29T09:26:23.1", "LastEditBy": "System", "LastEditOn": "2015-02-27T17:35:23.467" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 2, "ID": 1, "Code": null, "Name": "London", "Notes": "ECR London", "Lat": 51.52, "Lon": -0.1, "Active": 1, "SortOrder": 1, "CreatedBy": "System", "CreatedOn": "2014-07-30T13:55:20.743", "LastEditBy": "System", "LastEditOn": "2015-02-25T13:16:50.097" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 3, "ID": 2, "Code": null, "Name": "New York", "Notes": "New York", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 2, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:32:06.187", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:12.69" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 4, "ID": 3, "Code": null, "Name": "Paris", "Notes": "Paris", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 3, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:36:08.077", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:13.86" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 5, "ID": 4, "Code": null, "Name": "Washington DC", "Notes": "Washington DC", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 4, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:39:42.273", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:15.223" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 6, "ID": 5, "Code": null, "Name": "San Francisco", "Notes": "San Francisco", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 5, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:39:56.223", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:16.417" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 7, "ID": 6, "Code": null, "Name": "Miami", "Notes": "Miami", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 6, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:40:20.84", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:17.71" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 8, "ID": 7, "Code": null, "Name": "Las Vegas", "Notes": "Las Vegas", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 7, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:40:33.59", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:18.997" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 9, "ID": 8, "Code": null, "Name": "Vienna", "Notes": "Vienna", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 8, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:41:31.443", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:20.09" }, { "TotalCnt": 15, "PageCnt": 2.0, "RecNo": 10, "ID": 9, "Code": null, "Name": "Budapest", "Notes": "Budapest", "Lat": 0.0, "Lon": 0.0, "Active": 1, "SortOrder": 9, "CreatedBy": "System", "CreatedOn": "2015-02-19T16:41:49.943", "LastEditBy": "System", "LastEditOn": "2015-02-24T13:20:21.207" }], "Table1": [{ "Name": "Inactive", "ID": 0 }, { "Name": "Active", "ID": 1 }] } }
    self.BranchGroupUID = ko.observable('some text title from knockout bind');

    function loadData() {
        grd.caption= 'Statuses: ' + self.BranchGroupUID;
        grd.databind(dataJson.data[grd.dataTable]);
    }

    //#region ------ GRID ------
    var grd = new myGrid("tblcontent");
    grd.dataAddress = '/data/AdminBranches.ashx';
    grd.reload = loadData;
    grd.dataTable = 'Branches';
    //#endregion ------ END GRID ------

    var col = grd.column();
    col.id = 'id';
    col.name = '#';
    col.type = grd.columns.types.command;
    col.css.class = 'col-xs-1';
    grd.columns.add(col);

    col = grd.column();
    col.id = 'Code';
    col.name = 'Code';
    col.type = grd.columns.types.input;
    col.css.class = 'col-xs-1';
    grd.columns.add(col);

    col = grd.column();
    col.id = 'Name';
    col.name = 'Name';
    col.type = grd.columns.types.input;
    col.css.class = 'col-xs-3';
    grd.columns.add(col);

    col = grd.column();
    col.id = 'Notes';
    col.name = 'Notes';
    col.type = grd.columns.types.input;
    col.css.class = 'col-xs-3';
    grd.columns.add(col);

    col = grd.column();
    col.id = 'SortOrder';
    col.name = 'Sort';
    col.dataType = grd.columns.dataTypes.integer;
    col.type = grd.columns.types.input;
    col.css.class = 'col-xs-1';
    grd.columns.add(col);

    col = grd.column();
    col.id = 'Active';
    col.name = 'Active';
    col.type = grd.columns.types.checkbox;
    col.css.class = 'col-xs-1';
    grd.columns.add(col);

    col = grd.column();
    col.id = 'CreatedOn';
    col.name = 'Created';
    col.css.class = 'col-xs-2';
    col.type = grd.columns.types.input;
    grd.columns.add(col);

    grd.init();
}