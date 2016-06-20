/*jslint es5:true*/
/*global chrome:false*/
(function (window, undefined) {
    'use strict';

    function $(id) {
        return document.getElementById(id);
    }

    function enableSave() {
        $('saveButton').disabled = false;
    }

    function disableSave() {
        $('saveButton').disabled = true;
    }

    function setUseBg() {
        if ($('useBg').checked) {
            chrome.permissions.request({
                permissions: ['background']
            });
        } else {
            chrome.permissions.remove({
                permissions: ['background']
            });
        }
    }

    function reset() {
        var pathNew = ((localStorage.pathNew || localStorage.pathNew === '') ? localStorage.pathNew : 'www.facebook.com/messages').split('/'),
            pathMsg = ((localStorage.pathMsg || localStorage.pathMsg === '') ? localStorage.pathMsg : 'www.messenger.com/').split('/'),
            pathFbn = ((localStorage.pathFbn || localStorage.pathFbn === '') ? localStorage.pathFbn : 'www.facebook.com/notifications').split('/'),
            pathZero = ((localStorage.pathZero || localStorage.pathZero === '') ? localStorage.pathZero : 'www.facebook.com/').split('/');

        $('hostNew').value = pathNew[0] + '/';
        $('hostMsg').value = pathMsg[0] + '/';
        $('hostFbn').value = pathFbn[0] + '/';
        $('hostZero').value = pathZero[0] + '/';
        $('pathNew').value = pathNew[1];
        $('pathMsg').value = pathMsg[1];
        $('pathFbn').value = pathFbn[1];
        $('pathZero').value = pathZero[1];
        $('showFbn').checked = (localStorage.showFbn) ? (localStorage.showFbn === 'yes') : true;
        $('useHttps').checked = (localStorage.useHttps) ? (localStorage.useHttps === 'yes') : false;
        $('alwaysNew').checked = (localStorage.alwaysNew) ? (localStorage.alwaysNew === 'yes') : false;
        $('showZero').checked = (localStorage.showZero) ? (localStorage.showZero === 'yes') : false;
        $('playSound').checked = (localStorage.playSound) ? (localStorage.playSound === 'yes') : true;
        $('showNoti').checked = (localStorage.showNoti) ? (localStorage.showNoti === 'yes') : true;
        $('refreshInterval').value = (parseInt(localStorage.refreshInterval, 10)) ? String(parseInt(localStorage.refreshInterval, 10) / 60000) : '5';
        disableSave();
        chrome.permissions.contains({
            permissions: ['background']
        }, function (result) {
            $('useBg').checked = result;
        });
    }

    function clear() {
        if (window.confirm('Restore all data to default?\nThis can\'t be undone...')) {
            localStorage.clear();
            reset();
            chrome.extension.getBackgroundPage().reset();
        }
    }

    function save() {
        localStorage.pathNew = $('hostNew').value + $('pathNew').value;
        localStorage.pathMsg = $('hostMsg').value + $('pathMsg').value;
        localStorage.pathFbn = $('hostFbn').value + $('pathFbn').value;
        localStorage.pathZero = $('hostZero').value + $('pathZero').value;

        localStorage.showFbn = $('showFbn').checked ? 'yes' : 'no';
        localStorage.useHttps = $('useHttps').checked ? 'yes' : 'no';
        localStorage.alwaysNew = $('alwaysNew').checked ? 'yes' : 'no';
        localStorage.showZero = $('showZero').checked ? 'yes' : 'no';
        localStorage.playSound = $('playSound').checked ? 'yes' : 'no';
        localStorage.showNoti = $('showNoti').checked ? 'yes' : 'no';

        localStorage.refreshInterval = (!isNaN($('refreshInterval').value) && parseInt($('refreshInterval').value, 10) > 0) ? parseInt($('refreshInterval').value, 10) * 60000 : 300000;

        reset();
        chrome.extension.getBackgroundPage().reset();
    }

    function load() {
        $('hostNew').addEventListener('change', enableSave);
        $('hostMsg').addEventListener('change', enableSave);
        $('hostFbn').addEventListener('change', enableSave);
        $('hostZero').addEventListener('change', enableSave);
        $('pathNew').addEventListener('input', enableSave);
        $('pathMsg').addEventListener('input', enableSave);
        $('pathFbn').addEventListener('input', enableSave);
        $('pathZero').addEventListener('input', enableSave);
        $('showFbn').addEventListener('click', enableSave);
        $('useHttps').addEventListener('click', enableSave);
        $('alwaysNew').addEventListener('click', enableSave);
        $('showZero').addEventListener('click', enableSave);
        $('playSound').addEventListener('click', enableSave);
        $('showNoti').addEventListener('click', enableSave);
        $('refreshInterval').addEventListener('click', enableSave);
        $('saveButton').addEventListener('click', save);
        $('restoreButton').addEventListener('click', clear);
        $('useBg').addEventListener('click', setUseBg);
        reset();
    }

    window.addEventListener('load', load);
}(window));
