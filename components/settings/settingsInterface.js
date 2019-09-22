const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;
const EventEmitter = require('events');

const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nextOptions = require("../../i18nextOptions");

ipcRenderer.on('settingsLoaded', (event, args) => {
    
    console.log(args);
    
    let wWidth = args.wWidth;
    let wHeight = args.wHeight;

    let settings = args.systemS;
    let data = args.data;

    i18nextOptions.setLanguage(settings.language, settings.languageNS);
    i18next.use(Backend).init(i18nextOptions.getOptions(process.env.NODE_ENV));
    
    // create paper and background
    let paper = Raphael('paperSettings', wWidth, wHeight);
    paper.rect(0, 0, wWidth, wHeight).attr({fill: '#FFFFFF', stroke: '#FFFFFF'});

    // Default language
    paper.text(15, 25, i18next.t('Default language')).attr({'fill': '#000000', "font-size": '13px', "font-family": 'Arial', 'text-anchor': 'start', "cursor": "default"});

    // select default language
    drawSelect(paper, 15, 40, ['emilian']);



    let buttonsX = wWidth - 155;
    let buttonsY = wHeight - 40;
    // save button
    paper.rect(buttonsX, buttonsY, 50, 25).attr({fill: "#FFFFFF", "stroke": "#5d5d5d", "stroke-width": 1});
    paper.text(buttonsX + 10, buttonsY + 12, i18next.t('Save')).attr({'fill': '#000000', "font-size": '13px', "font-family": 'Arial', 'text-anchor': 'start', "cursor": "default"});
    paper.rect(buttonsX, buttonsY, 50, 25).attr({fill: "#FFFFFF", stroke: "none", "fill-opacity": 0, "cursor": "pointer"}).click(function saveSettings(){
        alert('saving...');
    });
    // cancel button - try to close the window
    paper.rect(buttonsX + 65, buttonsY, 65, 25).attr({fill: "#FFFFFF", "stroke": "#5d5d5d", "stroke-width": 1});
    paper.text(buttonsX + 75, buttonsY + 12, i18next.t('Cancel')).attr({'fill': '#000000', "font-size": '13px', "font-family": 'Arial', 'text-anchor': 'start', "cursor": "default"});
    paper.rect(buttonsX + 65, buttonsY, 65, 25).attr({fill: "#FFFFFF", stroke: "none", "fill-opacity": 0, "cursor": "pointer"}).click(function saveSettings(){
        BrowserWindow.getFocusedWindow().close();
    });
});

ipcRenderer.on('settingsSaved', (event, args) => {
    BrowserWindow.getFocusedWindow().close();
});

// make a select element
function drawSelect(paper, x, y, data)
{
    let eventMe = new EventEmitter();

    let dataWidth = 175;

    // create the div with the 
    let div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = dataTop + 'px';
    div.style.left = dataLeft + 'px';
    // div.style.backgroundColor = '#FF0000';
    div.style.width = (dataWidth + 10) + 'px';
    div.style.height = '32px';

    // initialy paper is small - allow ather elements to be clickable
    let newPaper = Raphael(div, dataWidth + 10, 32);

    let p = document.getElementById('paper');
    p.appendChild(div);

    select.element.rect = newPaper.rect(5, 5, dataWidth, 25).attr({fill: "#FFFFFF", "stroke": "#333333", "stroke-width": 0.2});  


    // show / hide selected    
    // ===============================================================================
    eventMe.on('selected', function(data) {
        // check if we have an element | if yes remove it
        if(typeof select.selected.remove === "function") {
            select.selected.remove();                
        }
        select.selected = newPaper.text(13, 18, data).attr({"text-anchor": "start",fill: "#333333", "font-size": "14px"});
        select.value = data;
    });
    eventMe.on('deSelected', function(data) {
        select.selected.remove();
        select.value = '';
    });


    // draw visibel rectangle
    paper.rect(x, y, dataWidth, 25).attr({fill: "#FFFFFF", "stroke": "#5d5d5d", "stroke-width": 1});  
    // Open / close element list
    paper.path([
        ["M", x + dataWidth - 15 , y + 8],
        ["l", 8, 0],
        ["l", -4, 8],
        ["z"]
    ]).attr({fill: "#5d5d5d", "stroke-width": 0});
    paper.path([
        ["M", x + dataWidth - 15 , y + 15 ],
        ["l", 8, 0],
        ["l", -4, -8],
        ["z"]
    ]).attr({fill: "#5d5d5d", "stroke-width": 0}).hide();
}