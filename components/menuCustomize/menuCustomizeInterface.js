const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

// TODO -- replace alert with dialog

var menuTopTarget = [];
var menuSubTarget = [];

ipcRenderer.on('elementsList', (event, args) => {
    
    let newItemList = args.newItemList;
    let menu = args.currentMenu;

    if (newItemList.length > 0) {

        let leftContainer = document.getElementById('leftContainer');       

        for(let i = 0; i < newItemList.length; i++) {
            let el = document.createElement('div');
            // el.id = newItemList[i].id;
            el.setAttribute('data-id', newItemList[i].id);
            el.setAttribute('data-name', newItemList[i].name);
            el.setAttribute('data-type', newItemList[i].type);
            // data-visible used for searching
            el.setAttribute('data-visible', 1);
            
            // add the text
            let txt = document.createTextNode(newItemList[i].name);
            el.appendChild(txt);

            el.addEventListener('click', function elClick(ev) {
                // call deselect all items
                deselectAllNewItems('leftContainer');
                this.style.backgroundColor = '#0078d7';
                this.style.color = 'white';
                this.setAttribute('data-selected', 'true');
            });

            leftContainer.appendChild(el);
        }
    }

    let menuTopItems = {};
    let menuSubItems = {};
    
    if (menu.length > 0) {
        for(let i = 0; i < menu.length; i++) {
            // top menu
            let parentName = menu[i].name;
            menuTopItems[parentName] = menu[i];
            // position and name
            menuTopTarget[menu[i].position] = {name: parentName, type: 'top', parent: ''};

            // subitems
            menuSubItems[parentName] = [];
            menuSubTarget[parentName] = [];
            if (menu[i].subitems.length > 0) {
                for(let j = 0; j < menu[i].subitems.length; j++) {
                    
                    menuSubItems[parentName].push(menu[i].subitems[j]);
                    // position and name
                    if (menu[i].subitems[j].type === 'submenu') {
                        let submenuName = parentName + ' | ' + menu[i].subitems[j].name;
                        menuTopTarget.splice(menu[i].position+1, 0, {name: submenuName, type: 'top', parent: parentName});
                        parseSubMenu(menu[i].subitems[j].subitems, submenuName);
                    }
                    menuSubTarget[parentName][menu[i].subitems[j].position] = menu[i].subitems[j];                    
                }
            }
        }

        // initial setup
        makeMenuTopItems(menuTopTarget);        
        // load first element in list
        makeMenuSubItems(menuSubTarget[menuTopTarget[0].name]);
    }
});

ipcRenderer.on('newItemName', (event, args) => {
    
    let oldTopName = args.main + ' | ' + args.oldName;
    let isSubmenu = false;

    for (let i = 0; i < menuTopTarget.length; i++) {
        if (menuTopTarget[i].name === oldTopName) {
            menuTopTarget[i].name = args.main + ' | ' + args.newName;
        }
    }

    if (menuSubTarget[args.main] !== void 0) {
        for (let i = 0; i < menuSubTarget[args.main].length; i++) {
            if (menuSubTarget[args.main][i].name == args.oldName) {
                menuSubTarget[args.main][i].name = args.newName;
                if ( menuSubTarget[args.main][i].type === 'submenu') {
                    isSubmenu = true;
                }
            }
        }
    }
    
    if (isSubmenu) {
        for (let item in menuSubTarget) {
            if (item === oldTopName) {
                menuSubTarget[args.main + ' | ' + args.newName] = menuSubTarget[item];
                delete menuSubTarget[item];
            }            
        }
    }
    // remake menu
    makeMenuTopItems(menuTopTarget);
    makeMenuSubItems(menuSubTarget[args.main]);

    // reset the target category value
    if (isSubmenu) {
        document.getElementById('targetCategory').value = args.main + ' | ' + args.newName;
    } else {
        document.getElementById('targetCategory').value = args.main;
    }
});

// menu subitems recursion
function parseSubMenu(items, parentName)
{
    if (items.length > 0) {
        menuSubTarget[parentName] = [];
        for(let j = 0; j < items.length; j++) {
            
            // position and name
            if (items[j].type === 'submenu') {
                let submenuName = parentName + ' | ' + items[j].name;
                let pos = menuTopTarget.indexOf(parentName);
                menuTopTarget.splice(pos+1, 0, submenuName);
                parseSubMenu(items[j].subitems, submenuName);
            } else {
                menuSubTarget[parentName][items[j].position] = items[j];                    
            }
        }
    }
}
// make targent top menu
function makeMenuTopItems(nameList)
{    
    // getting the element
    let targetCategory = document.getElementById('targetCategory');    
    targetCategory.innerHTML = '';
    // new loop for ordered items
    for(let i = 0; i < nameList.length; i++) {
        let el = document.createElement('option');
        el.value = nameList[i].name;
        // el.setAttribute('data-name', nameList[i]);
        el.innerHTML = nameList[i].name;
        targetCategory.appendChild(el);
    }
}
// make target sub item menu
function makeMenuSubItems(nameList)
{
    console.trace(nameList);
    
    let rightContainer = document.getElementById('rightContainer');
    rightContainer.innerHTML = "";   
    for(let i = 0; i < nameList.length; i++) {

        let el = document.createElement('div');
        
        let innerTxt = nameList[i].name;
        let elId = nameList[i].id;
        // element type is separator
        if (nameList[i].name === '') {
            innerTxt = '----------------------------------------';
            elId = nameList[i].id.substring(0,9) + '-' + i;
        }
        // element type is submenu
        let testID = nameList[i].id.substring(0,7);
        if (testID === 'submenu') {
            // if item is separator - rebuid ID
            elId = testID + '-' + i;
        }

        el.setAttribute('data-id', elId);
        el.setAttribute('data-name', nameList[i].name);
        el.setAttribute('data-type', nameList[i].type);
        el.setAttribute('data-position', i);
        // data-visible used for searching
        el.setAttribute('data-visible', 1);

        if (nameList[i].type === 'submenu') {
            el.className = 'submenuArrow';
        }
        
        // add the text
        let txt = document.createTextNode(innerTxt);
        el.appendChild(txt);
        el.addEventListener('click', function elClick(ev) {
            // call deselect all items
            deselectAllNewItems('rightContainer');
            this.style.backgroundColor = '#0078d7';
            this.style.color = 'white';
            this.setAttribute('data-selected', 'true');
        });
        rightContainer.appendChild(el);
    }
}
// add item to top menu
// updates top variable
function addItemToTopMenu(mainItem, child)
{
    for(let i = 0; i < menuTopTarget.length; i++) {
        if (menuTopTarget[i].name === mainItem) {
            menuTopTarget.splice(i+1, 0, {name: mainItem + ' | '+ child, type: 'submenu', parent: mainItem});
        }
    }    
    makeMenuTopItems(menuTopTarget);
}
// deselect all items
function deselectAllNewItems(side)
{
    let theContainer = document.getElementById(side);    
    let allElements = theContainer.querySelectorAll('div');

    for (let i = 0; i < allElements.length; i++) {  
        allElements[i].style.backgroundColor = 'white';
        allElements[i].style.color = 'black';
        allElements[i].setAttribute('data-selected', 'false');
    }
}

// reassign positions
function reassignPositions(arr)
{
    for (let i = 0; i < arr.length; i++) {
        arr[i].position = i;
    }
    return arr;
}
// document ready
document.addEventListener("DOMContentLoaded", function(event) { 
  
    // save settings
    let save = document.getElementById('saveMenu');
    save.addEventListener('click', function(event){
        console.log('--- saving ---');
        
        console.log(menuTopTarget);
        console.log(menuSubTarget);

    });

    // cancel settings
    let cancel = document.getElementById('cancelMenu');
    cancel.addEventListener('click', function(event){
        let window = BrowserWindow.getFocusedWindow();
        window.close();
    });
    
    // update available dialog list
    let updateDialogList = document.getElementById('updateDialogList');
    updateDialogList.addEventListener('click', function(event){
        ipcRenderer.send('rebuildDialogList');
    });
    
    // reset menu to default
    let reset = document.getElementById('resetMenu');
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
        let leftContainer = document.getElementById('leftContainer');
        let itemList = leftContainer.querySelectorAll("div[data-visible ='1']");
        let toFind = searchNewElement.value;
        if(toFind.length >= 3){
            // deselect all items
            deselectAllNewItems('leftContainer');
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

    // target menu top on change
    let targetCategory = document.getElementById('targetCategory');
    targetCategory.addEventListener('change', function elClick(ev) {
        let selectedV = this.options[this.selectedIndex].value;               
        deselectAllNewItems('rightContainer');        
        makeMenuSubItems(menuSubTarget[selectedV]);    
    });


    let insertMenu = document.getElementById("insertMenu");
    insertMenu.addEventListener('click', function toggleDropDown(event){
        document.getElementById('inserMenuDropdown').classList.toggle("show");      
    });

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('#insertMenu')) {
            var dropdowns = document.getElementsByClassName("dropdown-menu");
            for (let i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    };

    let insertSeparator = document.getElementById('insertSeparator');
    insertSeparator.addEventListener('click', function insertS(event) {
        // get topMenu
        let topMenuIs = document.getElementById('targetCategory');
        let topM = topMenuIs.options[topMenuIs.selectedIndex].value;
        
        let rightContainer = document.getElementById('rightContainer');
        // is something selected ?
        let selected = rightContainer.querySelectorAll("div[data-selected='true']");
        let selectedPosition;

        if ( selected.length > 0 && selected[0]) {
            selectedPosition = selected[0].getAttribute('data-position');
            menuSubTarget[topM].splice(selectedPosition, 0, {id:'separator', name: '', type:'system', position: selectedPosition});
        } else {
            menuSubTarget[topM].splice(0, 0, {id:'separator', name: '', type:'system', position: 0});
        }
        
        makeMenuSubItems(menuSubTarget[topM]);
    });

    // insert submenu new submenu
    let insertSubmenu = document.getElementById('insertSubmenu');
    insertSubmenu.addEventListener('click', function(event){
        // get topMenu
        let topMenuIs = document.getElementById('targetCategory');
        let topM = topMenuIs.options[topMenuIs.selectedIndex].value;
        
        let rightContainer = document.getElementById('rightContainer');
        // is something selected ?
        let selected = rightContainer.querySelectorAll("div[data-selected='true']");
        let selectedPosition;
        let newTopMenuItemName = topM + ' | SubMenu';
        if (menuSubTarget[newTopMenuItemName] === void 0) {
            // insert the new subitem to the list so it can have element
            menuSubTarget[newTopMenuItemName] = [];

            // add the subitem to the current selection/subitem
            if ( selected.length > 0 && selected[0]) {
                selectedPosition = selected[0].getAttribute('data-position');
                menuSubTarget[topM].splice(selectedPosition, 0, {id:'submenu', name: 'SubMenu', type:'submenu', position: selectedPosition});
            } else {
                menuSubTarget[topM].splice(0, 0, {id:'submenu', name: 'SubMenu', type:'submenu', position: 0});
            }
            addItemToTopMenu(topM, 'SubMenu');
            makeMenuSubItems(menuSubTarget[topM]);
            document.getElementById('targetCategory').value = topM;
        } else {
            alert('Submenu already exists!');
        }
    });

    // rename submenu item
    let renameItem = document.getElementById('renameItem');
    renameItem.addEventListener('click', function renameItem(event){
        let rightContainer = document.getElementById('rightContainer');
        // is something selected ?
        let selected = rightContainer.querySelectorAll("div[data-selected='true']");
        if ( selected.length > 0 && selected[0]) {
            let currentName = selected[0].getAttribute('data-name');
            let currentType = selected[0].getAttribute('data-type');
            if (currentName !== '' && currentType !== 'separator') {
                // get topMenu
                let topMenuIs = document.getElementById('targetCategory');
                let topM = topMenuIs.options[topMenuIs.selectedIndex].value;
                ipcRenderer.send('renameItem', {'main': topM, 'name': currentName});
            } else {
                alert('This type of item cannot be renamed');
            }
        } else {
            alert('Please select at least one item.');
        }
    });

    // left arrow - remove element
    let leftArrow = document.getElementById('leftArrow');
    leftArrow.addEventListener('click', function removeEl(event){
        // get topMenu
        let topMenuIs = document.getElementById('targetCategory');
        let topM = topMenuIs.options[topMenuIs.selectedIndex].value;
        
        let rightContainer = document.getElementById('rightContainer');
        // is something selected ?
        let selected = rightContainer.querySelectorAll("div[data-selected='true']");
        let selectedPosition;
        let selectedName;
        let selectedType;

        if ( selected.length > 0 && selected[0]) {
            selectedPosition = selected[0].getAttribute('data-position');
            selectedType = selected[0].getAttribute('data-type');
            selectedName = selected[0].getAttribute('data-name');
            menuSubTarget[topM].splice(selectedPosition, 1);
        } else {
            alert('Please select at least an item to remove.');
        }
        
        
        if (selectedType === 'submenu') {
            delete menuSubTarget[selectedName];
            for (let i = 0; i < menuTopTarget.length; i++) {
                if (menuTopTarget[i].name == topM + ' | ' + selectedName) {
                    menuTopTarget.splice(i, 1);
                }
            }
        }
        makeMenuSubItems(menuSubTarget[topM]);
        makeMenuTopItems(menuTopTarget);
        document.getElementById('targetCategory').value = topM;
    });

    // right arrow add element to top menu
    let rightArrow = document.getElementById('rightArrow');
    rightArrow.addEventListener('click', function addEl(event){
        // get topMenu
        let topMenuIs = document.getElementById('targetCategory');
        let topM = topMenuIs.options[topMenuIs.selectedIndex].value;

        let leftContainer = document.getElementById('leftContainer');
        let selectedL = leftContainer.querySelectorAll("div[data-selected='true']");
        let newId;
        let newName;
        let newType;

        if ( selectedL.length > 0 && selectedL[0]) { 

            // get the id and check if already exists
            newId = selectedL[0].getAttribute('data-id');
            
            let alreadyThere = rightContainer.querySelectorAll("div[data-id='"+ newId +"']");

            if (alreadyThere.length > 0) {
                alert('Element already in the list');
            } else {
                // get the name and the type
                newName = selectedL[0].getAttribute('data-name');
                newType = selectedL[0].getAttribute('data-type');

                // is something selected on the right side?
                let rightContainer = document.getElementById('rightContainer');
                let selectedR = rightContainer.querySelectorAll("div[data-selected='true']");
                let selectedRPosition;

                // TODO -- add to main list? we will see
                if ( selectedR.length > 0 && selectedR[0]) {
                    selectedRPosition = selectedR[0].getAttribute('data-position');
                    // insert at position
                    menuSubTarget[topM].splice(selectedRPosition, 0, {id: newId, name: newName, position: selectedRPosition, type: newType});
                } else {
                    // insert at the begining of the list
                    menuSubTarget[topM].splice(0, 0, {id: newId, name: newName, position: 0, type: newType});
                    menuSubTarget[topM] = reassignPositions(menuSubTarget[topM]);
                }
            }
        } else {
            alert('Please select an element to add');
        }

        makeMenuSubItems(menuSubTarget[topM]);
    });

    // move item up -> upArrow
    let upArrow = document.getElementById('upArrow');
    upArrow.addEventListener('click', function moveItemUp(event){
        // get topMenu
        let topMenuIs = document.getElementById('targetCategory');
        let topM = topMenuIs.options[topMenuIs.selectedIndex].value;

        let rightContainer = document.getElementById('rightContainer');
        // is something selected ?
        let selected = rightContainer.querySelectorAll("div[data-selected='true']");
        let selectedPosition;
        let sId;
        let sName;

        if ( selected.length > 0 && selected[0]) 
        {    
            selectedPosition = parseInt(selected[0].getAttribute('data-position'));
            sId = selected[0].getAttribute('data-id');
            sName = selected[0].getAttribute('data-name');
            let sType = selected[0].getAttribute('data-type');
    
            menuSubTarget[topM].splice(selectedPosition, 1);
            // setting new position
            selectedPosition = (selectedPosition-1 <= 0) ? 0 : selectedPosition-1; 
            menuSubTarget[topM].splice(selectedPosition, 0, {id: sId, name: sName, position: selectedPosition, type: sType});
            menuSubTarget[topM] = reassignPositions(menuSubTarget[topM]);
        } else {
            alert('Please select at least an item first.');
        }
        makeMenuSubItems(menuSubTarget[topM]);
        // reselect item
        if (sName === '') {
            // if item is separator - rebuid ID
            sId = sId.substring(0,9) + '-' + selectedPosition;
        }
        let testID = sId.substring(0,7);
        if (testID === 'submenu') {
            // if item is separator - rebuid ID
            sId = testID + '-' + selectedPosition;
        }
        let rItem = rightContainer.querySelectorAll("div[data-id='"+ sId +"']");
        if (rItem[0]) {
            rItem[0].style.backgroundColor = '#0078d7';
            rItem[0].style.color = 'white';
            rItem[0].setAttribute('data-selected', 'true');
        }
    });

    // move item down -> downArrow
    let downArrow = document.getElementById('downArrow');
    downArrow.addEventListener('click', function moveItemDown(event){
        // get topMenu
        let topMenuIs = document.getElementById('targetCategory');
        let topM = topMenuIs.options[topMenuIs.selectedIndex].value;

        let rightContainer = document.getElementById('rightContainer');
        // is something selected ?
        let selected = rightContainer.querySelectorAll("div[data-selected='true']");
        let selectedPosition;
        let sId;
        let sName;

        if ( selected.length > 0 && selected[0]) 
        {
            selectedPosition = parseInt(selected[0].getAttribute('data-position'));    
            sId = selected[0].getAttribute('data-id');
            sName = selected[0].getAttribute('data-name');
            let sType = selected[0].getAttribute('data-type');
            
            menuSubTarget[topM].splice(selectedPosition, 1);
            // setting new position            
            selectedPosition = (selectedPosition+1 >= menuSubTarget[topM].length) ? menuSubTarget[topM].length : selectedPosition+1;             
            menuSubTarget[topM].splice(selectedPosition, 0, {id: sId, name: sName, position: selectedPosition, type: sType});
            menuSubTarget[topM] = reassignPositions(menuSubTarget[topM]);
        } else {
            alert('Please select at least an item first.');
        }
        makeMenuSubItems(menuSubTarget[topM]);
        // reselect item
        if (sName === '') {
            // if item is separator - rebuid ID
            sId = sId.substring(0,9) + '-' + selectedPosition;
        }
        let testID = sId.substring(0,7);
        if (testID === 'submenu') {
            // if item is separator - rebuid ID
            sId = testID + '-' + selectedPosition;
        }
        let rItem = rightContainer.querySelectorAll("div[data-id='"+ sId +"']");
        if (rItem[0]) {
            rItem[0].style.backgroundColor = '#0078d7';
            rItem[0].style.color = 'white';
            rItem[0].setAttribute('data-selected', 'true');
        }
    });
});