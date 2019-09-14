const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

ipcRenderer.on('elementsList', (event, args) => {
    
    let newItemList = args.newItemList;
    let menu = args.currentMenu;
    
    if (newItemList.length > 0) {

        let leftContainer = document.getElementById('leftContainer');       

        for(let i = 0; i < newItemList.length; i++) {
            let el = document.createElement('div');
            el.id = newItemList[i].id;
            el.setAttribute('data-name', newItemList[i].name);
            el.setAttribute('data-type', newItemList[i].type);
            // data-visible used for searching
            el.setAttribute('data-visible', 1);
            
            // add the text
            let txt = document.createTextNode(newItemList[i].name);
            el.appendChild(txt);

            el.addEventListener('click', function elClick(ev) {
                // call deselect all items
                deselectAllNewItems();
                this.style.backgroundColor = '#0078d7';
                this.style.color = 'white';
                this.setAttribute('data-selected', 'true');
            });

            leftContainer.appendChild(el);
        }
    }

    let menuCategories = [];
    // let menuCategories = [];
    let targetCategory = document.getElementById('targetCategory');
    if (menu.length > 0) {
        for(let i = 0; i < menu.length; i++) {
            menuCategories[menu[i].position] = menu[i].name;
        }
        // new loop for ordered items
        for(let i = 0; i < menuCategories.length; i++) {
            let el = document.createElement('option');
            el.value = menu[i].name;
            el.innerHTML = menu[i].name;
            targetCategory.appendChild(el);
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
    // left & right arrow
    let rightArrow = document.getElementById('rightArrow');
    let leftArrow = document.getElementById('leftArrow');

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
    // update available dialog list
    updateDialogList.addEventListener('click', function(event){
        ipcRenderer.send('rebuildDialogList');
    });
    // reset menu to default
    reset.addEventListener('click', function(event){
        ipcRenderer.send('resetMenuToDefault');
    });

    // filter by category change
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
                    allElements[i].setAttribute('data-visible', 0);
                } else {
                    allElements[i].setAttribute('data-visible', 1);
                    allElements[i].style.display = 'block';
                }
            } else {
                allElements[i].setAttribute('data-visible', 1);
                allElements[i].style.display = 'block';
            }
        }
        // reset search box
        document.getElementById('searchNewElement').value = '';
    });

    // search element by name
    let searchNewElement = document.getElementById('searchNewElement');
    searchNewElement.addEventListener('keyup', function searchNEl() {
        let itemList = document.querySelectorAll("div[data-visible ='1']");
        let toFind = searchNewElement.value;
        if(toFind.length >= 3){
            // deselect all items
            deselectAllNewItems();
            for(let i = 0; i < itemList.length; i++) {
                let item = itemList[i].getAttribute('data-name');
                let exp = new RegExp(toFind, 'i');
                if (item.search(exp) !== -1){
                    itemList[i].style.display = "block";

                }else{
                    itemList[i].style.display = "none";
                }
            }
        } else {            
            for(let i = 0; i < itemList.length; i++) {
                itemList[i].style.display = "block";
            }
        }
    });
});