const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

ipcRenderer.on('settingsLoaded', (event, args) => {
    
    // available languages
    let defaultLangHtml = document.getElementById('defaultLanguage');
    
    for(let lang in args.languages) {
        let opt = document.createElement('option');
        opt.value = lang;
        opt.text = args.languages[lang];
        if ( lang === args.defaultLanguage ) {
            console.log(lang);
            
            opt.selected = true;
        }
        defaultLangHtml.appendChild(opt);
    }

});

ipcRenderer.on('settingsSaved', (event, args) => {
    BrowserWindow.getFocusedWindow().close();
});

document.addEventListener("DOMContentLoaded", function(event) { 
  
    let save = document.getElementById('saveSettings');
    let cancel = document.getElementById('cancelSettings');

    // save settings
    save.addEventListener('click', function(event){
        
        let data = {};
        let defaultLang = document.getElementById('defaultLanguage');

        data.defaultLanguage = defaultLang.options[defaultLang.selectedIndex].value;
        
        ipcRenderer.send('saveSettings', data);
    });

    // cancel settings
    cancel.addEventListener('click', function(event){
        let window = BrowserWindow.getFocusedWindow();
        window.close();
    });
    
});