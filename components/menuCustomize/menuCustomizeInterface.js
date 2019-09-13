const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

ipcRenderer.on('elementsList', (event, args) => {
    if (args.length > 0) {

        let leftContainer = document.getElementById('leftContainer');

        console.log(leftContainer);
        

        for(let i = 0; i < args.length; i++) {
            let el = document.createElement('div');
            el.id = args[i].id;
            el.setAttribute('data-name', args[i].name);
            el.setAttribute('data-type', args[i].type);
            
            // add the text
            let txt = document.createTextNode(args[i].name);
            el.appendChild(txt);

            el.addEventListener('click', function elClick(ev) {
                deselectAllNewItems();
                this.style.backgroundColor = '#0078d7';
                this.style.color = 'white';
                this.setAttribute('data-selected', 'true');
            });

            leftContainer.appendChild(el);
        }
    }
});

function deselectAllNewItems()
{
    let leftContainer = document.getElementById('leftContainer');
    let allElements = leftContainer.querySelectorAll('div');

    for (let i = 0; i < allElements.length; i++) {
        allElements[i].style.backgroundColor = 'white';
        allElements[i].style.color = 'black';
        allElements[i].setAttribute('data-selected', 'false');
    }
}

// document ready
document.addEventListener("DOMContentLoaded", function(event) { 
  
    let save = document.getElementById('saveMenu');
    let cancel = document.getElementById('cancelMenu');
    let reset = document.getElementById('resetMenu');
    let updateDialogList = document.getElementById('updateDialogList');

    // save settings
    save.addEventListener('click', function(event){
        console.log('save');
        
        // let data = {};
        // let defaultLang = document.getElementById('defaultLanguage');

        // data.defaultLanguage = defaultLang.options[defaultLang.selectedIndex].value;
        
        // ipcRenderer.send('saveMenu', data);
    });

    // cancel settings
    cancel.addEventListener('click', function(event){
        let window = BrowserWindow.getFocusedWindow();
        window.close();
    });
    
    updateDialogList.addEventListener('click', function(event){
        ipcRenderer.send('rebuildDialogList');
    });
    reset.addEventListener('click', function(event){
        ipcRenderer.send('resetMenuToDefault');
    });

    let newItemCategory = document.getElementById('newItemCategory');
    newItemCategory.addEventListener('change', function newItemCatChange(event){
        let selectedV = this.options[this.selectedIndex].value;
        let leftContainer = document.getElementById('leftContainer');
        let allElements = leftContainer.querySelectorAll('div');
        
        for (let i = 0; i < allElements.length; i++) {
            // reset selection
            allElements[i].setAttribute('data-selected', 'false');
            allElements[i].style.backgroundColor = 'white';
            allElements[i].style.color = 'black';
            
            if ( selectedV !== 'all') {   
                if ( allElements[i].getAttribute('data-type') !== selectedV) {
                    allElements[i].style.display = 'none';
                } else {
                    allElements[i].style.display = 'block';
                }
            } else {
                allElements[i].style.display = 'block';
            }
        }

    });

});