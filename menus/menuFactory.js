const { Menu } = require('electron');

const mainMenuTemplate = require('./mainMenuTemplate');

const menuBuilder = (app, mainWindow, i18next) => {
    
    // console.log(JSON.stringify({'name': {'name': 'Meniu1', 'title': 'Meniu 1'}}));
    //TODO --- think of how the menu json should look


    return Menu.buildFromTemplate(mainMenuTemplate(app, mainWindow, i18next));

};

module.exports = menuBuilder;