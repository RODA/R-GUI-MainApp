const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;

ipcRenderer.on('elementData', (ev, args) => {
    
    if (args.length > 0) {
        
        let itemList = document.getElementById('itemList');        

        for(let i = 0; i < args.length; i++) {
            let el = document.createElement('div');
            // el.id = args.id;
            el.setAttribute('data-name', args[i].name);
            el.setAttribute('data-type', args[i].type);
            el.setAttribute('data-selected', 'false');
            
            // add the text
            let txt = document.createTextNode(args[i].name);
            el.appendChild(txt);

            el.addEventListener('click', function elClick(ev) {
                // call deselect all items
                deselectAllItems();
                this.style.backgroundColor = '#0078d7';
                this.style.color = 'white';
                this.setAttribute('data-selected', 'true');
            });

            itemList.appendChild(el);
        }
    }

});

function deselectAllItems()
{
    let theContainer = document.getElementById('itemList');    
    let allElements = theContainer.querySelectorAll('div');

    for (let i = 0; i < allElements.length; i++) {  
        allElements[i].style.backgroundColor = 'white';
        allElements[i].style.color = 'black';
        allElements[i].setAttribute('data-selected', 'false');
    }
}

// document ready
document.addEventListener("DOMContentLoaded", function(event) { 
  
    // save settings
    let save = document.getElementById('save');
    save.addEventListener('click', function(event){
        console.log('--- saving ---');
        
        console.log(menuTopTarget);
        console.log(menuSubTarget);

    });

    // cancel settings
    let cancel = document.getElementById('cancel');
    cancel.addEventListener('click', function(event){
        let window = BrowserWindow.getFocusedWindow();
        window.close();
    });

        // move item up -> upArrow
        let upArrow = document.getElementById('arrowUp');
        upArrow.addEventListener('click', function moveItemUp(event){
            // get topMenu
            // let topMenuIs = document.getElementById('targetCategory');
            // let topM = topMenuIs.options[topMenuIs.selectedIndex].value;
    
            // let rightContainer = document.getElementById('rightContainer');
            // // is something selected ?
            // let selected = rightContainer.querySelectorAll("div[data-selected='true']");
            // let selectedPosition;
            // let sId;
            // let sName;
    
            // if ( selected.length > 0 && selected[0]) 
            // {    
            //     selectedPosition = parseInt(selected[0].getAttribute('data-position'));
            //     sId = selected[0].getAttribute('data-id');
            //     sName = selected[0].getAttribute('data-name');
            //     let sType = selected[0].getAttribute('data-type');
        
            //     menuSubTarget[topM].splice(selectedPosition, 1);
            //     // setting new position
            //     selectedPosition = (selectedPosition-1 <= 0) ? 0 : selectedPosition-1; 
            //     menuSubTarget[topM].splice(selectedPosition, 0, {id: sId, name: sName, position: selectedPosition, type: sType});
            //     menuSubTarget[topM] = reassignPositions(menuSubTarget[topM]);
            // } else {
            //     alert('Please select at least an item first.');
            // }
            // makeMenuSubItems(menuSubTarget[topM]);
            // // reselect item
            // if (sName === '') {
            //     // if item is separator - rebuid ID
            //     sId = sId.substring(0,9) + '-' + selectedPosition;
            // }
            // let testID = sId.substring(0,7);
            // if (testID === 'submenu') {
            //     // if item is separator - rebuid ID
            //     sId = testID + '-' + selectedPosition;
            // }
            // let rItem = rightContainer.querySelectorAll("div[data-id='"+ sId +"']");
            // if (rItem[0]) {
            //     rItem[0].style.backgroundColor = '#0078d7';
            //     rItem[0].style.color = 'white';
            //     rItem[0].setAttribute('data-selected', 'true');
            // }
        });
    
        // move item down -> downArrow
        let downArrow = document.getElementById('arrowDown');
        downArrow.addEventListener('click', function moveItemDown(event){
            // get topMenu
            // let topMenuIs = document.getElementById('targetCategory');
            // let topM = topMenuIs.options[topMenuIs.selectedIndex].value;
    
            // let rightContainer = document.getElementById('rightContainer');
            // // is something selected ?
            // let selected = rightContainer.querySelectorAll("div[data-selected='true']");
            // let selectedPosition;
            // let sId;
            // let sName;
    
            // if ( selected.length > 0 && selected[0]) 
            // {
            //     selectedPosition = parseInt(selected[0].getAttribute('data-position'));    
            //     sId = selected[0].getAttribute('data-id');
            //     sName = selected[0].getAttribute('data-name');
            //     let sType = selected[0].getAttribute('data-type');
                
            //     menuSubTarget[topM].splice(selectedPosition, 1);
            //     // setting new position            
            //     selectedPosition = (selectedPosition+1 >= menuSubTarget[topM].length) ? menuSubTarget[topM].length : selectedPosition+1;             
            //     menuSubTarget[topM].splice(selectedPosition, 0, {id: sId, name: sName, position: selectedPosition, type: sType});
            //     menuSubTarget[topM] = reassignPositions(menuSubTarget[topM]);
            // } else {
            //     alert('Please select at least an item first.');
            // }
            // makeMenuSubItems(menuSubTarget[topM]);
            // // reselect item
            // if (sName === '') {
            //     // if item is separator - rebuid ID
            //     sId = sId.substring(0,9) + '-' + selectedPosition;
            // }
            // let testID = sId.substring(0,7);
            // if (testID === 'submenu') {
            //     // if item is separator - rebuid ID
            //     sId = testID + '-' + selectedPosition;
            // }
            // let rItem = rightContainer.querySelectorAll("div[data-id='"+ sId +"']");
            // if (rItem[0]) {
            //     rItem[0].style.backgroundColor = '#0078d7';
            //     rItem[0].style.color = 'white';
            //     rItem[0].setAttribute('data-selected', 'true');
            // }
        });

});