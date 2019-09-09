const { Menu } = require('electron');
const fs = require('fs');
const path = require('path');

const menuLibrary = require('./menuLibrary');

const menuBuilder = (app, mainWindow, i18next) => {

    let menuTemplate;
    let menuData = fs.readFileSync(path.resolve('./menus/menu.json'));
    try {
        menuData = JSON.parse(menuData);
    } catch (error) {
        console.log('Error loading menu', error);
        return [];
    }

    if ( menuData !== void 0) {
        menuTemplate = makeTemplate(menuData, app, i18next, mainWindow);               
    }
    if ( menuTemplate !== void 0) {

        // Add developer tools item if not in production
        if(process.env.NODE_ENV !== 'production'){
            menuTemplate.push({
                label: "Developer Tools",
                submenu: [
                    {
                        label: "Toggle DevTools",
                        accelerator: "CommandOrControl+I",
                        click(item, focusedWindow){
                            focusedWindow.toggleDevTools();        
                        }
                    },
                    {
                        role: 'reload'
                    }
                ]
            });
        }
        return Menu.buildFromTemplate(menuTemplate);
    }
     return null;
};

const makeTemplate = function(data, app, i18next, mainWindow)
{
    // set the translations and the window for the menu
    menuLibrary.initialize(app, i18next, mainWindow);

    let menuTemplate = [];
    
    for (let mainItem = 0; mainItem < data.length; mainItem++) {
        let thisItem = data[mainItem];
        // adding & in front af the main labels so we can acces them with alt + first leter in the name
        let tmpMenu = {
            label: i18next.t('&' + thisItem.name),
        };
        
        // the menu has subitems
        if (thisItem.subitems.length > 0) {           
            tmpMenu.submenu = [];
            for (let subItem = 0; subItem < thisItem.subitems.length; subItem++) {
                if (thisItem.subitems[subItem].type === 'system') {
                    if ( typeof menuLibrary[thisItem.subitems[subItem].id] === 'function') {
                        tmpMenu.submenu[subItem] = menuLibrary[thisItem.subitems[subItem].id](thisItem.subitems[subItem].name);
                    }
                } else if (thisItem.subitems[subItem].type === 'dialog') {
                    tmpMenu.submenu[subItem] = menuLibrary.menuForDialog(thisItem.subitems[subItem].id, thisItem.subitems[subItem].name);
                }
            }
        }
        menuTemplate[thisItem.position] = tmpMenu;
    }
    return menuTemplate;
};

module.exports = menuBuilder;