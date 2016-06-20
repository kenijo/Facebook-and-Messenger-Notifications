/*jslint es5:true*/
/*global Audio:false, chrome:false*/
(function (window, undefined) {
    'use strict';

    var pathNew = 'www.facebook.com/messages',
        pathMsg = 'www.messenger.com',
        pathFbn = 'www.facebook.com/notifications',
        pathZero = 'www.facebook.com',
        showFbn = true,

        counter = 0,
        fbcounter = 0,
        newNotif = false,
        protocol = 'http',
        alwaysNew = false,
        showZero = false,
        showNoti = true,
        timerVar = null,
        timerDelay = 300000,
        playSound = true,
        audio = new Audio('ding.ogg'),

        BADGE_NEW = {color: [0, 204, 51, 255]},
        BADGE_ACTIVE = {color: [204, 0, 51, 255]},
        BADGE_LOADING = {color: [204, 204, 51, 255]},
        BADGE_INACTIVE = {color: [153, 153, 153, 255]};

    function loadData() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://www.facebook.com/home.php', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                chrome.browserAction.setBadgeBackgroundColor(BADGE_INACTIVE);
                var xmlDoc = xhr.responseText,
                    fUser = '',
                    loc = xmlDoc.indexOf('profile_pic_header_'),
                    myString = '',
                    lastCounter = counter + fbcounter,
                    badgeTitle = 'Facebook Messenger',
                    notificationMessage = '';

                if (loc > 0) {
                    myString = xmlDoc.substr(loc + 70, 120);
                    //window.console.log(myString);
                    fUser = myString.substring(myString.indexOf('>') + 1, myString.indexOf('<'));
                }

                if (fUser) {
                    // Message Value
                    loc = xmlDoc.indexOf('messagesCountValue');
                    if (loc > 0) {
                        myString = xmlDoc.substr(loc, 80);
                        counter = parseInt(myString.substring(myString.indexOf('>') + 1, myString.indexOf('<')), 10);
                    }

                    // Notification Value
                    if (showFbn) {
                        loc = xmlDoc.indexOf('notificationsCountValue');
                        if (loc > 0) {
                            myString = xmlDoc.substr(loc, 80);
                            fbcounter = parseInt(myString.substring(myString.indexOf('>') + 1, myString.indexOf('<')), 10);
                        }
                    } else {
                        fbcounter = 0;
                    }

                    badgeTitle = fUser + ' - Facebook Messenger';
                    if (counter > 0) {
                        badgeTitle += '\n> ' + counter + ' Messages';
                    }
                    if (fbcounter > 0) {
                        badgeTitle += '\n> ' + fbcounter + ' Notifications';
                    }

                    chrome.browserAction.setIcon({
                        path: 'icon.png'
                    });
                    chrome.browserAction.setTitle({
                        title: badgeTitle
                    });
                    if (!showZero && counter + fbcounter === 0) {
                        chrome.browserAction.setBadgeText({
                            text: ''
                        });
                    } else if (fbcounter > 0) {
                        chrome.browserAction.setBadgeText({
                            text: (counter || '') + '+' + fbcounter
                        });
                    } else {
                        chrome.browserAction.setBadgeText({
                            text: String(counter)
                        });
                    }
                    window.console.log('Counters:', counter, lastCounter);
                    if (counter + fbcounter > lastCounter) {
                        newNotif = true;
                        if (playSound) {
                            audio.play();
                        }
                        if (showNoti) {
                            if (counter > 0) {
                                if (fbcounter > 0) {
                                    notificationMessage = 'You have ' + counter + ' new messages and ' + fbcounter + ' new notifications';
                                } else {
                                    notificationMessage = 'You have ' + counter + ' new messages';
                                }
                            } else {
                                notificationMessage = 'You have ' + fbcounter + ' new notifications';
                            }
                            chrome.notifications.create('fbmsg', {
                                type: 'basic',
                                iconUrl: 'icon128.png',
                                title: 'Messenger + Facebook Notifications',
                                message: notificationMessage
                            }, function (notificationId) {});
                        }
                    }
                    if (newNotif) {
                        chrome.browserAction.setBadgeBackgroundColor(BADGE_NEW);
                    } else if (counter + fbcounter > 0) {
                        chrome.browserAction.setBadgeBackgroundColor(BADGE_ACTIVE);
                    }
                } else {
                    chrome.browserAction.setIcon({
                        path: 'icon-.png'
                    });
                    chrome.browserAction.setTitle({
                        title: '--Disconnected--'
                    });
                    chrome.browserAction.setBadgeText({
                        text: '?'
                    });
                    return;
                }
            } else {
                return;
            }
        };
        xhr.send(null);
        window.clearTimeout(timerVar);
        timerVar = window.setTimeout(loadData, timerDelay);
    }

    function tabCallback(tab) {
        chrome.tabs.onRemoved.addListener(function (tabId) {
            if (tabId === tab.id) {
                loadData();
            }
        });
        chrome.windows.update(tab.windowId, {
            focused: true
        });
    }

    function openUrl(uri) {
        chrome.windows.getAll({
            populate: true
        }, function (windows) {
            var tabs = null,
                i = 0,
                j = 0;
            if (windows.length < 1) {
                chrome.windows.create({
                    url: uri,
                    focused: true
                });
                return;
            } else if (!alwaysNew) {
                for (i = 0; i < windows.length; i += 1) {
                    tabs = windows[i].tabs;
                    for (j = 0; j < tabs.length; j += 1) {
                        if (tabs[j].url.indexOf(uri) !== -1) {
                            chrome.tabs.update(tabs[j].id, {
                                selected: true
                            }, tabCallback); // Just Focus
                            //chrome.tabs.update(tabs[j].id,{url:uri,selected:true},tabCallback);   // Update and Focus
                            return;
                        }
                    }
                }
            }
            chrome.tabs.getSelected(null, function (tab) {
                if (tab.url === 'chrome://newtab/') {
                    chrome.tabs.update(tab.id, {
                        url: uri
                    }, tabCallback);
                } else {
                    chrome.tabs.create({
                        url: uri
                    }, tabCallback);
                }
            });
        });
    }

    function openPage() {
        if (counter > 0 && fbcounter > 0) {
            openUrl(protocol + '://' + pathNew);
        } else if (counter > 0) {
            openUrl(protocol + '://' + pathMsg);
        } else if (fbcounter > 0) {
            openUrl(protocol + '://' + pathFbn);
        } else {
            openUrl(protocol + '://' + pathZero);
        }
        newNotif = false;
        loadData();
    }

    chrome.browserAction.onClicked.addListener(function (tab) {
        openPage();
    });

    chrome.notifications.onClicked.addListener(function () {
        chrome.notifications.clear('fbmsg', function (wasCleared) {});
        openPage();
    });

    function reset() {
        window.reset = reset;
        pathNew = (localStorage.pathNew || localStorage.pathNew === '') ? localStorage.pathNew : pathNew;
        pathMsg = (localStorage.pathMsg || localStorage.pathMsg === '') ? localStorage.pathMsg : pathMsg;
        pathFbn = (localStorage.pathFbn || localStorage.pathFbn === '') ? localStorage.pathFbn : pathFbn;
        pathZero = (localStorage.pathZero || localStorage.pathZero === '') ? localStorage.pathZero : pathZero;
        showFbn = (localStorage.showFbn) ? (localStorage.showFbn === 'yes') : true;
        protocol = (localStorage.useHttps === 'yes') ? 'https' : 'http';
        alwaysNew = (localStorage.alwaysNew) ? (localStorage.alwaysNew === 'yes') : false;
        showZero = (localStorage.showZero) ? (localStorage.showZero === 'yes') : false;
        playSound = (localStorage.playSound) ? (localStorage.playSound === 'yes') : true;
        showNoti = (localStorage.showNoti) ? (localStorage.showNoti === 'yes') : true;
        timerDelay = parseInt(localStorage.refreshInterval || '300000', 10);

        chrome.browserAction.setIcon({
            path: 'icon-.png'
        });
        chrome.browserAction.setBadgeText({
            text: '...'
        });
        chrome.browserAction.setBadgeBackgroundColor(BADGE_LOADING);
        loadData();
    }

    window.addEventListener('load', reset);
}(window));
