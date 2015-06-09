var myGrid = (function () {
    'use strict';

    var api = function (container) {
        this.container = container;
    };

    api.prototype = {
        data: [],
        dataAddress: undefined,
        dataTable: undefined,
        reload: undefined,
        container: '',
        columns: { list: [] },
        css: getCSS(),
        options: {
            showFilters: true,
            allowDetails: true,
            allowEdit: true,
            allowDelete: true,
            allowNew: true
        },
        filters: { columns: Object, page: 1, pagesize: 10, pagetotal: 1, sort: '' },
        events: {}
    };

    //---------------------------------------------------------------------------------------
    //                      CSS
    //---------------------------------------------------------------------------------------
    function getCSS() {
        var css = {
            table: { 'class': 'table table-striped table-bordered table-oneline ', style: 'margin-top:10px;' },
            header: { 'class': '', style: '' },
            body: { 'class': '', style: '' },
            footer: { 'class': '', style: '' },
            pagination: { 'class': 'pagination pagination-sm', style: 'margin:0; display:block' },
            pagesize: { 'class': 'btn btn-primary btn-sm', style: '' },
            filter: { 'class': '', style: 'padding:2px;font-weight:100;' },
            controls: {
                textarea: { 'class': 'form-control', style: 'resize: vertical' },
                input: { 'class': 'form-control', style: '' },
                checkbox: { 'class': 'glyphicon glyphicon-remove', style: '' },
                checkbox_on: { 'class': 'glyphicon glyphicon-ok', style: '' },
                select: { 'class': 'form-control', style: '' },
                text: { 'class': '', style: '' },
                rowDetails: { 'class': 'btn btn-link bpop', style: '' }
            }

        };
        //datagrid.css = css;
        return css;
    }

    //---------------------------------------------------------------------------------------
    //                      EVENTS
    //---------------------------------------------------------------------------------------

    api.prototype.events.pagination = {};
    api.prototype.events.ColumnSort = undefined;
    api.prototype.events.ColumnFilter = undefined;

    api.prototype.events.onDeleteRow = function (data, onSuccess, onError) {
        //this function must be override
        if (data.ID !== undefined) {

            data = data.ID;

        } else if (data.UID !== undefined) {

            data = data.UID;
        }

        console.log('missing onDeleteRow Function definition in grid declaration');
        external.onDeleteRow(data, onSuccess, onError);
    };

    api.prototype.events.onAddNewRow = function (data, onSuccess, onError) {

        external.onAddNewRow(data, onSuccess, onError);
    };

    api.prototype.events.onEditRow = function (data, onSuccess, onError) {

        external.onEditRow(data, onSuccess, onError);
    };

    api.prototype.events.onDetailRow = function (data, onSuccess, onError) {
        //this function must be override
    };


    //datagrid.events = events;

    //---------------------------------------------------------------------------------------
    //                      INIT
    //---------------------------------------------------------------------------------------

    var _datagrid = {};
    api.prototype.init = function () {
        //init parents
        _datagrid = this;
        _worker.createHTML();

        //attach events
        $('#' + this.container).off("click", ' th[data-coltype="sort"] ').on("click", ' th[data-coltype="sort"] ', this.filters.events.onColumnSort);
        $('#' + this.container).off("keydown change", ' [data-coltype="filter"] ').on("keydown change", ' [data-coltype="filter"] ', this.filters.events.onColumnFilter);
        $('#' + this.container).off("click", ' a[data-btn="page"] ').on("click", ' a[data-btn="page"] ', _pagination.events.onBtnPage);
        $('#' + this.container).off("click", ' a[data-btn="pagenext"] ').on("click", ' a[data-btn="pagenext"] ', { nav: 1 }, _pagination.events.onBtnNextPage);
        $('#' + this.container).off("click", ' a[data-btn="pageprev"] ').on("click", ' a[data-btn="pageprev"] ', { nav: -1 }, _pagination.events.onBtnPrevPage);
        $('#' + this.container).off("click", ' li a[data-btn="pagesize"] ').on("click", ' li a[data-btn="pagesize"] ', _pagination.events.onBtnPageSize);

        //init helper functions in tools
        _tools.init();

        //init the data if not using external function
        if (this.reload === undefined) {
            this.reload = external.loadData;
            this.reload();
        } else {
            this.reload();
        }
    };

    //datagrid.databind
    api.prototype.databind = function (data) {
        _datagrid.data = data;

        var page_count = 1;
        if ((_datagrid.data.length > 0) && (data[0] !== undefined) && (data[0].PageCnt !== undefined)) {
            page_count = data[0].PageCnt;
        }
        _datagrid.filters.pagetotal = page_count;

        if ($('#' + _datagrid.container + ' table').length) {
            _worker.createTblBody(false);
            _worker.createTblFooter(false);

        } else {
            _worker.createHTML();
        }

    };

    var _worker = {};
    _worker.createHTML = function () {
        var css = 'class="' + _datagrid.css.table.class + '" style="' + _datagrid.css.table.style + '" ';
        var strHTML = '<table id="tbl' + _datagrid.container + '" ' + css + ' >';
        strHTML += '<thead class="tblHeader">';
        strHTML += this.createTblHeader(true);
        strHTML += '</thead>';
        strHTML += '<tbody>';
        strHTML += this.createTblBody(true);
        strHTML += '</tbody>';
        strHTML += '<tfoot>';
        strHTML += this.createTblFooter(true);
        strHTML += '</tfoot>';
        strHTML += '</table>';
        //create holders for the modals
        strHTML += '<div id="eModal"></div><div id="dModal"></div>';
        $("#" + _datagrid.container).html(strHTML);
    }; //end .createHTML

    _worker.createTblHeader = function (isNew) {

        var tHead = _datagrid.columns.getHeaderHTML();

        //filters
        if (_datagrid.options.showFilters) {
            tHead += _datagrid.filters.getHeaderHTML();
        }

        if (isNew) {
            return tHead;
        } else {
            $('#' + _datagrid.container + ' thead').html(tHead);
        }
    };

    _worker.createTblBody = function (isNew) {

        var tBody = '';
        for (var i = 0, len = _datagrid.data.length; i < len; ++i) {
            tBody += '<tr>';
            for (var col = 0, collen = _datagrid.columns.list.length; col < collen; ++col) {
                var cCol = _datagrid.columns.list[col];
                tBody += _columns.create(i, _datagrid.data[i], cCol, _createdFor.body);
            }
            tBody += '</tr>';
        }

        if (isNew) {
            return tBody;
        } else {
            $('#' + _datagrid.container + ' tbody').html(tBody);
        }
    };

    _worker.createTblFooter = function (isNew) {

        var tFoot = _pagination.getHTML();

        if (isNew) {
            return tFoot;
        } else {
            $('#' + _datagrid.container + ' tfoot').html(tFoot);
        }
    };

    //---------------------------------------------------------------------------------------
    //                      Pagination
    //---------------------------------------------------------------------------------------
    //api.prototype.worker = {};
    //api.prototype.worker.pagination = {};
    var _pagination = {};
    _pagination.events = {};

    _pagination.events.onBtnPage = function (e, o) {
        _datagrid.filters.page = $(e.target).data('page');
        _datagrid.reload();
    };
    _pagination.events.onBtnNextPage = function (e, o) {
        if (_datagrid.filters.page === _datagrid.filters.pagetotal) {
            //do nothing we are at the last page
        } else {
            _datagrid.filters.page = _datagrid.filters.page + e.data.nav;
            _datagrid.reload();
        }
    };
    _pagination.events.onBtnPrevPage = function (e, o) {
        if (_datagrid.filters.page === 1) {
            //do nothing we are at the first page
        } else {
            _datagrid.filters.page = _datagrid.filters.page + e.data.nav;
            _datagrid.reload();
        }
    };
    _pagination.events.onBtnPageSize = function (e, o) {
        _datagrid.filters.page = 1;
        _datagrid.filters.pagesize = $(e.target).data('value');
        _datagrid.reload();
    };

    _pagination.getHTML = function () {
        var pages = '';
        var pagecurrent = _datagrid.filters.page; // Math.round(datagrid.filters.pagetotal/2);
        var arrPages = [];
        var totalpages = _datagrid.filters.pagetotal;

        if (totalpages < 15) {
            for (var i = 0 ; i < totalpages; ++i) {
                pages += addItem(i + 1);
            }
        } else {
            arrPagespush(1);
            arrPagespush(2);
            arrPagespush(3);

            if (pagecurrent < 7) {
                arrPagespush(4);
                arrPagespush(5);
                arrPagespush(6);
                arrPagespush(7);
            }

            if ((pagecurrent > 2) && (pagecurrent < _datagrid.filters.pagetotal)) {
                arrPagespush(pagecurrent - 1);
                arrPagespush(pagecurrent);
                arrPagespush(pagecurrent + 1);
            }


            //if (pagecurrent > (datagrid.filters.pagetotal - 6)) {
            //    arrPagespush(datagrid.filters.pagetotal - 6);
            //    arrPagespush(datagrid.filters.pagetotal - 5);
            //    arrPagespush(datagrid.filters.pagetotal - 4);
            //    arrPagespush(datagrid.filters.pagetotal - 3);
            //}

            arrPagespush(_datagrid.filters.pagetotal - 2);
            arrPagespush(_datagrid.filters.pagetotal - 1);
            arrPagespush(_datagrid.filters.pagetotal);

            var idx = 1;
            for (var a = 0 ; a < arrPages.length; ++a) {
                if (arrPages[a] !== idx) {
                    pages += '<li><span style="padding:6px 6px;text-align:center;min-width:34px">...</span></li>';
                    idx = arrPages[a];
                }
                pages += addItem(arrPages[a]);
                ++idx;
            }

        }

        var css = ' class="' + _datagrid.css.pagesize.class + '" style="' + _datagrid.css.pagesize.style + '" ';

        var pagesize = '<div class="dropdown pull-right dropup" data-placement="left" data-toggle="tooltip"  title="Page Size Options." >' +
                    '   <button type="button" ' + css + '  data-toggle="dropdown" data-target="#">' +
                    '      <span>' + (_datagrid.filters.pagesize === 999 ? 'All' : _datagrid.filters.pagesize) + '</span>' +
                    '      <span class="caret"></span>' +
                    '   </button>' +
                    '   <ul class="dropdown-menu " role="menu" aria-labelledby="dLabel"  style="min-width:15px;z-index:1000;">' +
                    '      <li><a role="menuitem" href="#" data-btn="pagesize" data-value="10">10</a></li>' +
                    '      <li><a role="menuitem" href="#" data-btn="pagesize" data-value="20">20</a></li>' +
                    '      <li><a role="menuitem" href="#" data-btn="pagesize" data-value="30">30</a></li>' +
                    '      <li><a role="menuitem" href="#" data-btn="pagesize" data-value="40">40</a></li>' +
                    '      <li><a role="menuitem" href="#" data-btn="pagesize" data-value="50">50</a></li>' +
                    '      <li role="menuitem" class="divider"></li>' +
                    '      <li><a role="menuitem" href="#" data-btn="pagesize" data-value="999">All</a></li>' +
                    '   </ul>' +
                    '</div>';

        css = ' class="' + _datagrid.css.pagination.class + '" style="' + _datagrid.css.pagination.style + '" ';
        var str = '<tr><td colspan="' + _datagrid.columns.list.length + '" style="padding:5px;">' +
                  '<ul ' + css + '>' +
                  '  <li>' +
                  '    <a href="#" aria-label="Previous" data-btn="pageprev" ><span aria-hidden="true">&laquo;</span></a>' +
                  '  </li>' +
                  pages +
                  '  <li>' +
                  '    <a href="#" aria-label="Next" data-btn="pagenext"><span aria-hidden="true">&raquo;</span></a>' +
                  '  </li>' +
                  '</ul>' +
                   pagesize +
                  '</td></tr>';
        return str;

        function arrPagespush(num) {
            if (arrPages.indexOf(num) > -1) {
                return;
            }
            arrPages.push(num);
        }

        function addItem(num) {
            var liclass = '';
            var style = '';

            if (num === _datagrid.filters.page) { liclass = 'active'; }  //sets the color for the active page
            return '<li class="' + liclass + '"><a href="#"   data-btn="page" data-page="' + (num) + '">' + (num) + '</a></li>';
        }
    };

    //---------------------------------------------------------------------------------------
    //                      Columns
    //---------------------------------------------------------------------------------------
    var _createdFor = { body: 'body', title: 'title', filter: 'filter', editform: 'editform' };
    var _colTypes = { text: 'text', input: 'input', checkbox: 'checkbox', textarea: 'textarea', select: 'select', command: 'command', rowDetails: 'rowDetails', btnDetails: 'btnDetails' };
    var _colDataTypes = { text: 'varchar', integer: 'int', float: 'float' };

    var _columns = {};
    _columns.renderType = { 'headerTytle': 'headerTytle', 'headerFilter': 'headerFilter', };

    _columns.create = function (idx, data, column, createFor) {

        var strReturn, vType = column.type;
        switch (vType) {
            case _colTypes.rowDetails:
                strReturn = _columns.rowDetails(data, column, createFor);
                break;
            case _colTypes.command:
                strReturn = _columns.command(idx, data, column, createFor);
                break;
            case _colTypes.input:
                strReturn = _columns.input(data[column.id], column, createFor);
                break;
            case _colTypes.checkbox:
                strReturn = _columns.checkbox(data[column.id], column, createFor);
                break;
            case _colTypes.textarea:
                strReturn = _columns.textarea(data[column.id], column, createFor);
                break;
            case _colTypes.select:
                strReturn = _columns.select(data[column.id], column, createFor);
                break;
            case _colTypes.btnDetails:
                strReturn = _columns.btnDetails(idx, data, column, createFor);
                break;
            default:
                strReturn = _columns.text(data[column.id], column, createFor);
        }

        return strReturn;
    };

    //col types
    _columns.rowDetails = function (data, column, created_for) {
        var r = '';
        var element = '<div ><table class="table table-striped table-condensed"  style="width:300px"><tbody>';
        if (data.Notes !== undefined) {
            element += '<tr><td colspan="2">Notes: <br/><b>' + data.Notes + '</b></td></tr>';
        }
        if (data.FromTime !== undefined) {
            element += '<tr><td class="text-right" data-i18n="From Time">From Time: </td><td class="text-left"><b>' + data.FromTime + '</b></td></tr>';
        }
        if (data.ToTime !== undefined) {
            element += '<tr><td class="text-right">To Time: </td><td class="text-left"><b>' + data.ToTime + '</b></td></tr>';
        }
        element += '<tr><td class="text-right" style="width:100px" >Created On: </td><td><b>' + moment(data.CreatedOn).format('YYYY-MMM-DD HH:mm:ss') + '</b></td></tr>'
            + '<tr><td class="text-right">Created By: </td><td><b>' + data.CreatedBy + '</b></td></tr>'
            + '<tr><td class="text-right">Last Edit On: </td><td><b>' + moment(data.LastEditOn).format('YYYY-MMM-DD HH:mm:ss') + '</b></td></tr>'
            + '<tr><td class="text-right">Last Edit By: </td><td><b>' + data.LastEditBy + '</b></td></tr>'
            + '</tbody></table></div>';

        var re = new RegExp('[\"]+', 'g');
        element = element.replace(re, '&quot;');


        switch (created_for) {
            case _createdFor.body:
                r += '<td class="' + column.css.class + '" style="' + column.css.style + '">' +
                    '<button type="button" class="btn btn-link " style="padding:0"  data-content="' + element + '"  data-toggle="popover" >' +
                    moment(data[column.id]).format('DD-MMM-YYYY') +
                    '</button>' +
                    '</td>';
                break;
            case _createdFor.editform:
                r = '<button type="button" class="btn btn-link " style="padding:4px 0px"  data-content="' + element + '"  data-toggle="popover" >' +
                    moment(data[column.id]).format('DD-MMM-YYYY') +
                    '</button>';
                break;
            case _createdFor.filter:
                r = '<th class="' + _datagrid.css.filter.class + '" style="' + _datagrid.css.filter.style + '">' +
                    ' </th>';
                break;
            case _createdFor.title:
                r = '<th data-coltype="sort" data-col="' + column.id + '" class="' + _datagrid.css.header.class + '" style="min-width:100px;width:100px;' + _datagrid.css.header.style + '" >';
                r += column.name;
                r += _datagrid.columns.sorting.directionIcon(column.id);
                r += '</th>';
                break;
            default:
                r = '<button type="button" class="btn btn-link " style="padding:0"  data-content="' + element + '"  data-toggle="popover" >' +
                    moment(data[column.id]).format('DD-MMM-YYYY') +
                    '</button>';
        }

        return r;
    };

    _columns.btnDetails = function (idx, data, column, created_for) {

        var r = '';
        switch (created_for) {
            case _createdFor.body:
                r += '<td class="' + column.css.class + '" style="padding:4px;' + column.css.style + '">';
                r += genBtnDetails();
                r += '</td>';
                break;
            case _createdFor.title:
                r = '<th  data-col="' + column.id + '" class="' + column.css.class + '" style="min-width:64px;width:64px;text-align:center;padding-left:2px;padding-right:2px;' + column.css.style + '" >';
                r += column.name;
                r += '</th>';
                break;
            default:
        }

        function genBtnDetails() {
            var p = '';
            // edit button html

            if (datagrid.options.allowDetails) {
                p += '<a id="btnItemDetails' + idx + '"  data-index="' + idx + '" href="#" class="btn btn-icon blue btn-xs rw" style="margin:1px 2px;" data-toggle="tooltip" title="" data-original-title="Item Details">' +
                    '<i class="glyphicon glyphicon-list"></i>' +
                    '</a>';
                $('#' + _datagrid.container).off("click", '#btnItemDetails' + idx).on("click", '#btnItemDetails' + idx, data, _datagrid.events.onDetailRow);
            }
            return p;
        }

        return r;
    };

    _columns.command = function (idx, data, column, created_for) {
        var r = '';

        switch (created_for) {
            case _createdFor.body:
                r += '<td class="' + column.css.class + '" style="padding:4px;' + column.css.style + '">';
                r += genBtnEdit();
                r += genBtnDel();
                r += '</td>';
                break;
            case _createdFor.title:
                r = '<th  data-col="' + column.id + '" class="' + column.css.class + '" style="min-width:60px;width:60px;padding:3px;' + column.css.style + '" >';
                r += genBtnNew();
                r += '</th>';
                break;
            default:
        }

        return r;

        function genBtnEdit() {
            var r = '';
            // edit button html

            if (_datagrid.options.allowEdit) {
                r += '<a id="btnEditItem' + idx + '"  data-index="' + idx + '" href="#" class="btn btn-icon green btn-xs rw" style="margin:1px 2px;" data-toggle="tooltip" title="" data-original-title="Edit Item">' +
                    '<i class="glyphicon glyphicon-edit"></i>' +
                    '</a>';
                $('#' + _datagrid.container).off("click", '#btnEditItem' + idx).on("click", '#btnEditItem' + idx, data, _modal.edit.show);
            }
            return r;
        }

        function genBtnDel() {
            var r = '';
            // delete button html
            if (_datagrid.options.allowDelete) {
                r += '<a id="btnDeleteItem' + idx + '" data-index="' + idx + '" href="#" class="btn btn-icon red btn-xs rw" style="margin:1px 2px;" data-toggle="tooltip" title="" data-original-title="Delete Item">' +
                    '<i class="glyphicon glyphicon-trash"></i>' +
                    '</a>';
                // attach event 'click' to button 'delete' in column command
                $('#' + _datagrid.container).off("click", '#btnDeleteItem' + idx).on("click", '#btnDeleteItem' + idx, data, _modal.delete.show);
            }
            return r;
        }

        function genBtnNew() {
            var r = '';
            // new button html

            if (_datagrid.options.allowNew) {
                r += '<a id="btnAddNew" class="btn btn-primary btn-sm btn-block" style="padding: 4px 10px;" href="#" role="button" >New</a>';
                // attach event 'click' to button 'new' in column command
                $('#' + _datagrid.container).off("click", '#btnAddNew').on("click", '#btnAddNew', _modal.addnew.show);
            }
            return r;
        }


    };  //END_datagrid.worker.columns.command

    _columns.text = function (data, column, created_for) {
        var row = '';
        var element = '<span class="' + column.css.class + ' style="' + column.css.style + '" ">' + data[column.id] + '</span>' ;

        switch (created_for) {
            case _createdFor.body:
                row += '<td class="' + column.css.class + '" style="' + column.css.style + '">' +
                    element +
                    '</td>';
                break;
            case _createdFor.editform: break;
            case _createdFor.title:
                row = '<th data-coltype="sort" data-col="' + column.id + '" class="' + column.css.class + '" style="' + column.css.style + '" >';
                row += column.name;
                row += _datagrid.columns.sorting.directionIcon(column.id);
                row += '</th>';
                break;
            default:
                row = element;
        }

        return row;
    };

    _columns.input = function (data, column, created_for) {
        var r = '';
        var cssClass = _datagrid.css.controls.input.class;
        var cssStyle = _datagrid.css.controls.input.style;
        var eValue = data;
        if (eValue === undefined || eValue === null) {

            eValue = '';
        }

        var ctl = '<input id="id' + column.id + '" type="text"  class="' + cssClass + ' style="' + cssStyle + '" " data-dataType="' + column.dataType + '" value="' + eValue + '" data-bind-is="' + column.id + '" />';
        var ro_ctl = '<span>' + eValue + '</span>';

        switch (created_for) {
            case _createdFor.body:
                r = '<td class="' + column.css.class + '" style="' + column.css.style + '">' +
                    ro_ctl +
                    '</td>';
                break;
            case _createdFor.editform:
                r = ctl;
                break;
            case _createdFor.filter:
                r = '<th class="' + _datagrid.css.filter.class + '" style="' + _datagrid.css.filter.style + '">' +
                    ' <input type="text" data-coltype="filter" placeholder="' + column.name + ' filter" style="width:100%;border:none;padding:5px;" data-col="' + column.id + '"  />' +
                    ' </th>';
                break;
            case _createdFor.title:
                r = '<th data-coltype="sort" data-col="' + column.id + '" class="' + column.css.class + '" style="' + column.css.style + '" >';
                r += column.name;
                r += _datagrid.columns.sorting.directionIcon(column.id);
                r += '</th>';
                break;
            default:
                r = ctl;
        }

        return r;
    };

    _columns.checkbox = function (data, column, created_for) {
        var isActive = '';
        if (data > 0) isActive = 'active';
        var r = '';
        //var ctrl = '<div class="btn-group" data-toggle="buttons">' +
        var ctrl = '<div class="btn-check ' + isActive + '">' +
            '<input id="id' + column.id + '" type="checkbox" value="' + data + '"  data-bind-is="' + column.id + '" />' +
            '<span class="glyphicon glyphicon-ok"></span>' +
            '<span class="glyphicon glyphicon-remove"></span>' +
            '</div>';
        //   '</div>';
        //var ro_element = '<span class="' + column.css.controls.checkbox.class + ' style="' + column.css.controls.checkbox.style + '" ">' + data[column.id] + '</span>';

        switch (created_for) {
            case _createdFor.body:
                var cssclass = _datagrid.css.controls.checkbox.class;
                if (data > 0) cssclass = _datagrid.css.controls.checkbox_on.class;
                r += '<td class="text-center ' + column.css.class + '" style="' + column.css.style + '">' +
                    '<i class="' + cssclass + '"></i>' +
                    '</td>';
                break;
            case _createdFor.editform:
                r = ctrl;
                break;
            case _createdFor.filter:
                var ddList = [
                    { name: 'All', id: '' },
                    { name: '<span class="glyphicon glyphicon-ok"></span>', id: 1 },
                    { name: '<span class="glyphicon glyphicon-remove"></span>', id: 0 },
                ];
                //var a = new myDropDown('filter' + column.id, ddList, 'data-coltype="filter" data-col="' + column.id + '" ', ddList[0]);
                r = '<th class="' + _datagrid.css.filter.class + '" style="' + _datagrid.css.filter.style + '">' +
                        //'<input id="filter' + column.id + '" type="text" data-coltype="filter" placeholder="' + column.name + ' filter" style="width:100%;border:none;padding:5px;" data-col="' + column.id + '"  />' +
                        //'<div class="dropdown">' +
                        //'<button class="btn btn-default dropdown-toggle btn-sm" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">' +
                        //'<span id="filter' + column.id + '" data-coltype="filter" data-col="' + column.id + '" value="" >All</span> <span class="caret"></span> ' +
                        //'</button>' +
                        //a.getHTML();
                        // '</div>' +
                    '</th>';

                //$('#' +_datagrid.container).off("click", ' #filterDropdown').on("click", ' #filterDropdown', 'filter' + column.id, function (e) {
                //    $(obj).text = 11111;
                //});

                break;
            case _createdFor.title:
                r = '<th data-coltype="sort" data-col="' + column.id + '" class="' + column.css.class + '" style="min-width:64px;width:64px;text-align:center;padding-left:2px;padding-right:2px;' + column.css.style + '" >';
                r += column.name;
                r += _datagrid.columns.sorting.directionIcon(column.id);
                r += '</th>';
                break;
            default:
                r = ctrl;
        }

        return r;
    };

    _columns.textarea = function (data, column) {
        var r = '<td class="' + column.css.class + '" style="' + column.css.style + '">' +
            '<textarea id="id' + column.id + '" class="' + column.css.controls.textarea.class + '"  style="' + column.css.controls.textarea.style + '" rows="' + column.options.textarea.rows + '" data-datatype="' + column.dataType + '" ' + (column.options.editMode.editable === false ? 'disabled' : '') + '>' + data[column.id] + '</textarea>' +
            '</td>';
        return r;

    };

    _columns.select = function (data, column) {

        var r, t = '';

        for (var i = 0; i < column.options.select.data.length; i++) {
            t += '<option value="' + column.options.select.data[i][column.options.select.value] + '">' + column.options.select.data[i][column.options.select.text] + '</option>';
        }

        r = '<td class="' + column.css.class + '" style="' + column.css.style + '">' +
            '<select id="id' + column.id + '" class="' + column.css.controls.select.class + ' style="' + column.css.controls.select.style + '" ' + (column.options.editMode.editable === false ? 'disabled' : '') + '>' + t + '</select>' +
            '</td>';

        var a = new myDropDown('select' + column.id, ddList, 'data-coltype="filter" data-col="' + column.id + '" ', ddList[0]);


        var ctrl = '';
        var ro_ctl = '<span>' + eValue + '</span>';

        switch (created_for) {
            case _createdFor.body:
                r = '<td class="' + column.css.class + '" style="' + column.css.style + '">' +
                    ro_ctl +
                    '</td>';
                break;
            case _createdFor.editform:
                r = ctrl;
                break;
            case _createdFor.filter:

                var a = new myDropDown('filter' + column.id, ddList, 'data-coltype="filter" data-col="' + column.id + '" ', ddList[0]);
                r = '<th class="' + _datagrid.css.filter.class + '" style="' + _datagrid.css.filter.style + '">' +
                    a.getHTML();
                '</th>';


                break;
            case _createdFor.title:
                r = '<th data-coltype="sort" data-col="' + column.id + '" class="' + column.css.class + '" style="min-width:64px;width:64px;text-align:center;padding-left:2px;padding-right:2px;' + column.css.style + '" >';
                r += column.name;
                r += _datagrid.columns.sorting.directionIcon(column.id);
                r += '</th>';
                break;
            default:
                r = ctrl;
        }

        return r;
    };

    api.prototype.columns.types = _colTypes;
    api.prototype.columns.dataTypes = _colDataTypes;
    api.prototype.column = function () {
        return {
            id: '',
            name: '',
            visible: true,
            type: _colTypes.input,
            dataType: _colDataTypes.text,
            dataTypeSettings: {
                select: {
                    dataList: []
                },
                textarea: {
                    rows: 3
                }

            },
            editMode: {
                type: _colTypes.text,
                editable: true,
                visible: true,
                glypicon: 'glyphicon glyphicon-pencil',
                glyp: false
            },
            insertMode: {
                type: _colTypes.text,
                editable: true,
                visible: true,
                glypicon: 'glyphicon glyphicon-pencil',
                glyp: false
            },
            validation: {
                isRequired: { val: true, errtext: 'fild is required!' },
                minLen: { val: 0, errtext: 'min lenght is: ' + this.val },
                maxLen: { val: 99, errtext: 'to many symbols!' },
                customFunc: undefined

            },
            isValid: function (data) {
                return _datagrid.columns.validate(this.name, data);

            },
            css: {
                'class': '',
                style: ''
            }
        };
    }; ///END_datagrid.column definition

    /**
     * @param {datagrid.column}_datagrid_column The_datagrid.column object
     * {
        id: '',
        name: '',
        visible: true,
        type:_datagrid.columns.types.input,
        cssclass: cssClass,
        cssstyle: cssStyle
        }
     */
    api.prototype.columns.add = function (datagrid_column) {
        this.list.push(datagrid_column);
    };

    api.prototype.columns.getHeaderHTML = function () {
        var columns = this;
        var tHead = '<tr>';

        for (var i = 0, len = columns.list.length; i < len; ++i) {
            var coltype = '';
            var minwidth = '';
            if (columns.list[i].type === columns.types.command) {
                coltype = ''; //empty the colltype so the sort event is not going to be trigered
                //  minwidth = '';
            }
            if (columns.list[i].type === columns.types.rowDetails) {
                minwidth = '';
            }
            if (columns.list[i].type === columns.types.checkbox) {
                minwidth = '';
            }

            tHead += _columns.create(0, {}, columns.list[i], _createdFor.title);
        }

        tHead += '</tr>';

        return tHead;
    };

    api.prototype.columns.sorting = {
        colname: '',
        direction: '',
        clear: function () { this.colname = ''; this.direction = ''; },
        getForSQL: function () { return this.colname + this.direction; },
        directionIcon: function (colName) {
            var r = '';
            if (colName === _datagrid.columns.sorting.colname) {
                if (_datagrid.columns.sorting.direction === ' ASC') {
                    r = '<i class="glyphicon glyphicon-sort-by-attributes"></i>';
                } else {
                    r = '<i class="glyphicon glyphicon-sort-by-attributes-alt"></i>';
                }

            } else {
                r = '';
            }
            return r;
        }
    };

    api.prototype.columns.validate = function (colname, colvalue) {
        var r = { result: true, text: '' };
        for (var i = 0; i < _datagrid.columns.list.length; i++) {
            var col = _datagrid.columns.list[i];
            if (col.name !== colname) continue; //jump next if columnn dont match

            if ((col.validation.isRequired) && (colvalue === null) || (colvalue === undefined)) {
                return r;
            }
            if (colvalue.length < col.validation.minLen.val) {
                r.result = false;
                r.text = col.validation.minLen.errtext;
            } else if (colvalue.length > col.validation.maxLen) {
                r.result = false;
                r.text = col.validation.maxLen.errtext;
            }

        }//end for
        return r;
    };//end_datagrid.columns.validate

    //---------------------------------------------------------------------------------------
    //                      Filters
    //---------------------------------------------------------------------------------------

    api.prototype.filters.events = {};

    api.prototype.filters.get = function () {
        var f = {
            columns: _datagrid.filters.columns(),
            pager: { page: _datagrid.filters.page, pagesize: _datagrid.filters.pagesize },
            sort: _datagrid.filters.sort
        };
        return f;
    };

    api.prototype.filters.columns = function () {
        var filters = [];
        $('#' + _datagrid.container + ' [data-coltype="filter"] ').each(function (idx, obj) {
            var name = $(obj).data().col;
            var value = $(obj).val();
            var ret = {}; ret[name] = value;
            filters.push(ret);
        });

        return filters;
    };

    api.prototype.filters.clear = function () {
        $('#' + _datagrid.container + ' [data-coltype="filter"] ').each(function (idx, obj) {
            $(obj).val('');
            $(obj).change();
        });
        _datagrid.reload();
    };

    api.prototype.filters.getHeaderHTML = function () {

        var tHead = '<tr>';
        for (var i = 0, len = _datagrid.columns.list.length; i < len; ++i) {
            if (_datagrid.columns.list[i].type === _datagrid.columns.types.command) {
                tHead += '<th style="padding:3px;"><a class="btn btn-default btn-sm btn-block" style="padding: 4px 10px;" href="#" role="button" id="btnClearFilter" >Clear</a></th>';
                $('#' + _datagrid.container).off("click", '#btnClearFilter').on("click", ' #btnClearFilter', _datagrid.filters.clear);
            } else if (_datagrid.columns.list[i].type === _datagrid.columns.types.text) {
                tHead += '<th class="' + _datagrid.css.filter.class + '" style="' + _datagrid.css.filter.style + '">' +
                        ' <input type="text" data-coltype="filter" placeholder="filter by ' + _datagrid.columns.list[i].name + '" style="width:100%;border:none;padding:5px;" data-col="' + _datagrid.columns.list[i].id + '"  />' +
                        ' </th>';
            } else if (_datagrid.columns.list[i].type === _datagrid.columns.types.btnDetails) {
                tHead += '<th class="' + _datagrid.css.filter.class + '" style="' + _datagrid.css.filter.style + '"></th>';
            } else {
                tHead += _columns.create(i, '', _datagrid.columns.list[i], _createdFor.filter);
            }

        }
        tHead += '</tr>';

        return tHead;
    };

    api.prototype.filters.events.onColumnFilter = function (e, o) {
        if ((e.keyCode === 13 || e.keyCode === 9)) {
            //if (e.keyCode === 13)  e.preventDefault();

            _datagrid.reload();
        } else {

                //todo
        }

    };

    api.prototype.filters.events.onColumnSort = function (e, o) {

        var sort;
        _datagrid.columns.sorting.colname = $(e.target).data('col');

        if ($(e.target.children).hasClass('glyphicon-sort-by-attributes')) {
            _datagrid.columns.sorting.direction = ' DESC';
        } else if ($(e.target.children).hasClass('glyphicon-sort-by-attributes-alt')) {
            _datagrid.columns.sorting.clear();
        } else {
            _datagrid.columns.sorting.direction = ' ASC';
        }

        _datagrid.filters.sort = _datagrid.columns.sorting.getForSQL();
        _worker.createTblHeader(false); //regenerates the header HTML
        _datagrid.reload();
    };

    //---------------------------------------------------------------------------------------
    //                      Modals
    //---------------------------------------------------------------------------------------

    var _modal = {};
    //---------------------------------------------------------------------------------------
    //                      Modals ADD NEW
    //---------------------------------------------------------------------------------------
    _modal.addnew = {};
    _modal.addnew.events = {};
    _modal.addnew.isValid = true;

    _modal.addnew.events.onAddNewRow = function (e) {
        var data = e.data;
        var isValid = true;

        $('#' + _datagrid.container + ' #cAddNewPopUp [data-bind-is]').each(function (idx, obj) {
            var name = obj.attributes.getNamedItem('data-bind-is');
            data[name.value] = obj.value;
            var v = _datagrid.columns.validate(name.value, obj.value);
            if (v.result !== true) {
                isValid = false;
            }
        });

        if (isValid) {
            _datagrid.events.onAddNewRow(data, function (data) {
                //on success
                $("#cAddNewPopUp").remove();
                _datagrid.reload();
            }, function (data) {
                //on error
                _modal.addnew.showErr(data.errorDescription);
            });
        } else {
            var strForm = _datagrid.modal.addnew.createForm(data);
            $("#" + _datagrid.container + " #formholder").html(strForm);
        }
    };

    _modal.addnew.show = function (e) {
        var dataEditFrm = ko.observable(e.data);
        e.data = {};
        for (var i = 0; i < _datagrid.columns.list.length; i++) {

            if (_datagrid.columns.list[i].id !== undefined) {

                e.data[_datagrid.columns.list[i].id] = '';
                if (_datagrid.columns.list[i].dataType === _datagrid.columns.dataTypes.integer) {
                  e.data[_datagrid.columns.list[i].id] = 0;
                }
                //delete e.data['id'];
                //delete e.data['uid'];
            }
        }//end for

        if (_datagrid.options.allowNew) {
            _modal.addnew.createAddNewModal(e.data);
            $('#cAddNewPopUp').modal('show');
        }
    };

    _modal.addnew.createAddNewModal = function (data) {
        var r = '';
        var strForm = _modal.addnew.createForm(data);

        r = '<div class="modal small fade" id="cAddNewPopUp" tabindex="-1">' +
            '   <div class="modal-dialog">' +
            '      <div class="modal-content">' +
            '         <div class="modal-header">' +
            '             <button type="button" class="close" data-dismiss="modal" aria-hidden="true" tabindex="-1">x</button>' +
            '             <h4 class="modal-title">Add New</h4>' +
            '         </div>' +
            '         <div class="modal-body">' +
            '            <div id="formholder" class="container-fluid form-horizontal" ></div>' +
            '         </div>' +
            '         <div class="modal-footer">' +
            '             <button id="onBtnCancel" type="button" class="btn" data-dismiss="modal" aria-hidden="true" data-i18n="Cancel">Cancel</button>' +
            '             <button id="onBtnOk" type="button" class="btn btn-success rw" data-i18n="Save">Save</button>' +
            '<div id="errHolder" class="alert alert-danger alert-dismissible" style="margin-top:10px;display:none" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<span id="errText"></span>' +
            '</div>' +
            '         </div>' +
            '      </div>' +
            '   </div>' +
            '</div>';

        $("#" + _datagrid.container + " #eModal").html(r);
        $("#" + _datagrid.container + " #formholder").html(strForm);

        // attach events to buttons in modal 'ADD NEW'
        $('#' + _datagrid.container).off("click", ' #cAddNewPopUp #onBtnOk ').on("click", ' #cAddNewPopUp #onBtnOk ', data, _modal.addnew.events.onAddNewRow);
        $('#' + _datagrid.container).off("hide.bs.modal", '#cAddNewPopUp').on("hide.bs.modal", '#cAddNewPopUp', function () { $("#eModal").html(''); }); //del the addnew popup

    };

    _modal.addnew.createForm = function (data) {
        var r = '';
        var inputIcon = '';

        if (data === undefined) {
            data = {};
            for (var col = 0; col < _datagrid.columns.list.length; ++col) {
                var cCol = _datagrid.columns.list[col].id;
                data[cCol] = '';
            }
        }

        for (var i = 0; i < _datagrid.columns.list.length; i++) {
            var column = _datagrid.columns.list[i];
            if ((column.type === _datagrid.columns.types.command) || (column.type === _datagrid.columns.types.rowDetails)) {
                continue;  //scyp command and rowdetails on insert new
            }
            var colValue;
            if (data !== undefined) colValue = data[column.name];

            var editMode = _datagrid.columns.list[i].editMode;
            if (editMode.icon !== undefined) {
                inputIcon = '<span class="input-group-addon "><span class="' + editMode.icon + '"></span></span>';
            }

            if ((editMode.editable) && (editMode.visible)) {
                var errorIcon = '';
                var has_error = '';

                var err = column.isValid(colValue);
                if (err.result !== true) {
                    errorIcon = '<span class="input-group-btn ">' +
                                '<button type="button" class="btn btn-danger" data-container="body" data-toggle="popover" data-placement="top" data-content="' + err.text + '"><span class="glyphicon glyphicon-warning-sign"></span></button>' +
                                '</span>';
                    has_error = 'has_error';
                }

                r += '<div class="form-group  ' + has_error + '">' +
                     '<label class="control-label col-sm-2 text-right" for="id' + column.id + '" data-i18n="' + column.name + '">' + column.name + '</label>' +
                     '<div class="input-group  col-sm-10" id="id' + column.id + '" >' +
                     inputIcon +
                    _columns.create(0, data, column, _createdFor.editform) +
                     errorIcon +
                     '</div>' +
                     '</div>';
            }
        }//end FOR

        return r;
    };

    _modal.addnew.showErr = function (err) {
        $('#' + _datagrid.container + ' #errHolder').css('display', 'block');
        $('#' + _datagrid.container + ' #errHolder #errText').html(err);
    };

    //---------------------------------------------------------------------------------------
    //                      Modals EDIT
    //---------------------------------------------------------------------------------------
    _modal.edit = {};
    _modal.edit.events = {};
    _modal.edit.isValid = true;

    _modal.edit.events.onEditRow = function (e) {
        var data = e.data;
        var isValid = true;
        $('#' + _datagrid.container + ' #cEditPopUp [data-bind-is]').each(function (idx, obj) {
            var name = obj.attributes.getNamedItem('data-bind-is');
            data[name.value] = obj.value;
            var v = _datagrid.columns.validate(name.value, obj.value);
            if (v.result !== true) {
                isValid = false;
                _datagrid.modal.edit.showErr(v.text);
            }
        });

        if (isValid) {
            _datagrid.events.onEditRow(data, function (data) {
                //on success
                $("#cEditPopUp").remove();
                _datagrid.reload();
            }, function (data) {
                //on error
                _modal.edit.showErr(data);
            });
        } else {
            var strForm = _datagrid.modal.edit.createForm(data);
            $("#" + _datagrid.container + " #formholder").html(strForm);
        }
    };

    _modal.edit.show = function (e) {
        //var dataEditFrm = ko.observable(e.data);
        var data = e.data;
        if (_datagrid.options.allowEdit) {
            _modal.edit.createEditModal(e.data);
            $('#cEditPopUp').modal('show');
        }
    };

    _modal.edit.createEditModal = function (data) {
        var row = '';
        var strForm = _modal.edit.createForm(data);

        row = '<div class="modal small fade" id="cEditPopUp" tabindex="-1">' +
            '   <div class="modal-dialog">' +
            '      <div class="modal-content">' +
            '         <div class="modal-header">' +
            '             <button type="button" class="close" data-dismiss="modal" aria-hidden="true" tabindex="-1">x</button>' +
            '             <h4 class="modal-title">Edit:' + data.Name + '</h4>' +
            '         </div>' +
            '         <div class="modal-body">' +
            '            <div id="formholder" class="container-fluid form-horizontal" ></div>' +
            '         </div>' +
            '         <div class="modal-footer">' +
            '             <button id="onBtnCancel" type="button" class="btn" data-dismiss="modal" aria-hidden="true" data-i18n="Cancel">Cancel</button>' +
            '             <button id="onBtnOk" type="button" class="btn btn-success rw" data-i18n="Save">Save</button>' +
            '<div id="errHolder" class="alert alert-danger alert-dismissible" style="margin-top:10px;display:none" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<span id="errText"></span>' +
            '</div>' +
            '         </div>' +
            '      </div>' +
            '   </div>' +
            '</div>';

        $("#" + _datagrid.container + " #eModal").html(row);
        $("#" + _datagrid.container + " #formholder").html(strForm);

        // attach events to buttons in modal 'EDIT'
        $('#' + _datagrid.container).off("click", ' #cEditPopUp #onBtnOk ').on("click", ' #cEditPopUp #onBtnOk ', data, _modal.edit.events.onEditRow);
        $('#' + _datagrid.container).off("hide.bs.modal", '#cEditPopUp').on("hide.bs.modal", '#cEditPopUp', function () { $("#eModal").html(''); }); //del the edit popup

    };

    _modal.edit.createForm = function (data) {
        var r = '';
        var inputIcon = '';
        var column, editMode;

        for (var i = 0; i < _datagrid.columns.list.length; i++) {

            column = _datagrid.columns.list[i];
            editMode = _datagrid.columns.list[i].editMode;
            if (editMode.icon !== undefined) {
                inputIcon = '<span class="input-group-addon "><span class="' + editMode.icon + '"></span></span>';
            }

            if ((editMode.editable) && (editMode.visible) && (column.type !== _datagrid.columns.types.command)) {
                var errorIcon = '';
                var has_error = '';

                var err = column.isValid(data[column.name]);
                if (err.result !== true) {
                    errorIcon = '<span class="input-group-btn ">' +
                            '<button type="button" class="btn btn-danger" data-container="body" data-toggle="popover" data-placement="top" data-content="' + err.text + '"><span class="glyphicon glyphicon-warning-sign"></span></button>' +
                            '</span>';
                    has_error = 'has_error';
                }

                r += '<div class="form-group  ' + has_error + '">' +
                '<label class="control-label col-sm-2 text-right" for="id' + column.id + '" data-i18n="' + column.name + '">' + column.name + '</label>' +
                '<div class="input-group  col-sm-10" id="id' + column.id + '" >' +
                inputIcon +
               _columns.create(0, data, column, _createdFor.editform) +
                errorIcon +
                '</div>' +
                '</div>';
            }
        }//end FOR

        return r;
    };

    _modal.edit.showErr = function (err) {
        $('#' + _datagrid.container + ' #errHolder').css('display', 'block');
        $('#' + _datagrid.container + ' #errHolder #errText').html(err);
    };

    //---------------------------------------------------------------------------------------
    //                      Modals DELETE
    //---------------------------------------------------------------------------------------
    _modal.delete = {};
    _modal.delete.events = {};
    _modal.delete.events.onDeleteRow = function (e) {

        _datagrid.events.onDeleteRow(e.data, function (data) {
            //on success
            $("#cDelConfirmPopup").remove();
            _datagrid.reload();
        }, function (data) {
            //on error
            _datagrid.modal.edit.showErr(data);
        });
    };

    _modal.delete.GetConfirmationText = function (data) {

        var text = '';
        for (var i = 0; _datagrid.columns.list.length > i; i++) {

            if (_datagrid.columns.list[i].visible) {

                if (_datagrid.columns.list[i].type === _datagrid.columns.types.input) {

                    text = data.Name;
                    break;
                }
            }
        }

        return text;
    }
    _modal.delete.show = function (e) {
        _modal.delete.createDeleteModal(e.data);
        $('#cDelConfirmPopup').modal('show');
    };

    _modal.delete.createDeleteModal = function (data) {
        var ConfirmationText = _modal.delete.GetConfirmationText(data);
        var r = '<div class="modal small fade" id="cDelConfirmPopup" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
                    '   <div class="modal-dialog">' +
                    '      <div class="modal-content">' +
                    '         <div class="modal-header">' +
                    '            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                    '            <h4 class="modal-title" data-i18n="Delete Confirmation">Delete Confirmation</h4>' +
                    '         </div>' +
                    '         <div class="modal-body">' +
                    '            <p><b data-i18n="You are about to delete">You are about to delete: </b>' +
                                    ConfirmationText +
                    '            </p>' +
                    '            <p class="error-text" data-i18n="DeleteQuest"> Are you sure you want to delete this record? </p>' +
                    '         </div>' +
                    '         <div class="modal-footer">' +
                    '            <button id="onBtnCancel" class="btn" data-dismiss="modal" aria-hidden="true" data-i18n="Cancel" title="Cancel delete item">Cancel</button>' +
                    '            <button id="onBtnOk" class="btn btn-danger" data-i18n="Delete" title="Delete item">Delete</button>' +
                    '            <div id="errorMsg" style="display:none!important" class="alert alert-danger white text-left" style="margin-top: 5px" ></div>' +
                    '         </div>' +
                    '      </div>' +
                    '   </div>' +
                    '</div>';

        $("#" + _datagrid.container + " #dModal").html(r);

        // attach events to buttons in modal 'delete'
        $('#' + _datagrid.container).off("click", ' #cDelConfirmPopup #onBtnOk ').on("click", ' #cDelConfirmPopup #onBtnOk ', data, _modal.delete.events.onDeleteRow);
        $('#' + _datagrid.container).off("hide.bs.modal", '#cDelConfirmPopup').on("hide.bs.modal", function () { $("#dModal").html(''); });

    };

    //---------------------------------------------------------------------------------------
    //                      Tools
    //---------------------------------------------------------------------------------------
    //make numeric only input
    var _tools = {};

    _tools.init = function () {
        //data-datatype="int" validations
        $('#' + _datagrid.container).off("keydown", ' [data-datatype="int"]').on("keydown", '[data-datatype="int"]', function (event) {
            if (event.keyCode === 32 || (event.keyCode > 57 && event.keyCode < 96) || event.keyCode > 105) {
                event.preventDefault();
            }
        });//END data-datatype="int" validations


        //data-datatype="float" validations
        $('#' + _datagrid.container).off("keydown", ' [data-datatype="float"]').on("keydown", '[data-datatype="float"]', function (event) {
            if (event.keyCode === 32 || (event.keyCode > 57 && event.keyCode < 96) || event.keyCode > 105 && event.keyCode !== 190) {
                event.preventDefault();
            }
            //prevent starting and repeating '.'
            if (event.keyCode === 190) {
                if ((event.currentTarget.value.length === 0) || (event.currentTarget.value.indexOf('.') > -1)) {
                    event.preventDefault();
                }
            }
        }); //END data-datatype="float" validations

        $('#' + _datagrid.container).off("click", '.btn-check ').on("click", '.btn-check ', function (event) {
            var btn = $(event.currentTarget);

            if (btn.hasClass('active')) {
                btn.removeClass('active');
                $(event.currentTarget).find('input').val(0);
            } else {
                btn.addClass('active');
                $(event.currentTarget).find('input').val(1);
            }
        });
    };

    //---------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------
    //                      GENERAL JS dependat functions
    //---------------------------------------------------------------------------------------
    //---------------------------------------------------------------------------------------

    var external = {};

    external.onAddNewRow = function (data, onSuccess, onError) {
        var params = service.sendparams('Commit', data);
        service.call(_datagrid.dataAddress, params, onSuccess, onError, 'commiting data to server...');
    };

    external.onEditRow = function (data, onSuccess, onError) {
        var params = service.sendparams('Commit', data);
        service.call(_datagrid.dataAddress, params, onSuccess, onError, 'commiting data to server...');
    };

    external.onDeleteRow = function (data, onSuccess, onError) {
        var params = service.delparams('delID', data);
        service.call(_datagrid.dataAddress, params, onSuccess, onError, 'commiting data to server...');
    };

    external.loadData = function () {
        var params = service.getparams('getAll', _datagrid.filters.get());
        service.call(_datagrid.dataAddress, params, function (data) {
            _datagrid.databind(data.data[_datagrid.dataTable]);
        }, null, 'Loading data...');
    };

    return api;
})();