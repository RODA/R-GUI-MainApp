const defaultMenu = [
    {
        'name': 'File',
        'position': 1,
        'subitems': [
            {
                "id": "mainAppLoadData",
                "name": "Load file",
                "type": "system",
                "position": 0
            },
            {
                "id": "separator",
                "name": "",
                "type": "system",
                "position": 1
            },
            {
                "id": "mainAppSettings",
                "name": "Settings",
                "type": "system",
                "position": 2
            },
            {
                "id": "separator",
                "name": "",
                "type": "system",
                "position": 3
            },
            {
                "id": "mainAppExist",
                "name": "Exit",
                "type": "system",
                "position": 4
            }
        ]
    },
    {
        'name': 'Edit',
        'position': 2,
        'subitems': [
            {
                "id": "mainAppUndo",
                "name": "Undo",
                "type": "system",
                "position": 0
            },
            {
                "id": "mainAppRedo",
                "name": "Redo",
                "type": "system",
                "position": 1
            },
            {
                "id": "separator",
                "name": "",
                "type": "system",
                "position": 2
            },
            {
                "id": "mainAppCut",
                "name": "Cut",
                "type": "system",
                "position": 3
            },
            {
                "id": "mainAppCopy",
                "name": "Copy",
                "type": "system",
                "position": 4
            },
            {
                "id": "mainAppPaste",
                "name": "Paste",
                "type": "system",
                "position": 5
            },
            {
                "id": "mainAppSelectAll",
                "name": "Select All",
                "type": "system",
                "position": 6
            }
        ]
    },
    {
        'name': 'Info',
        'position': 3,
        'subitems': [
            {
                'id': 'mainAppAbout',
                'name': 'About',
                'type': 'system',
                'position': 0
            }
        ]
    }
];

const systemElements = [
    {
        'id': 'mainAppLoadData',
        'name': 'Load Data',
        'type': 'system'
    },
    {
        'id': 'mainAppImportDialog',
        'name': 'Import dialog',
        'type': 'system'
    },
    {
        'id': 'mainAppExist',
        'name': 'Exit',
        'type': 'system'
    },
    {
        'id': 'mainAppUndo',
        'name': 'Undo',
        'type': 'system'
    },
    {
        'id': 'mainAppRedo',
        'name': 'Redo',
        'type': 'system'
    },
    {
        'id': 'mainAppCut',
        'name': 'Cut',
        'type': 'system'
    },
    {
        'id': 'mainAppCopy',
        'name': 'Copy',
        'type': 'system'
    },
    {
        'id': 'mainAppPaste',
        'name': 'Paste',
        'type': 'system'
    },
    {
        'id': 'mainAppSelectAll',
        'name': 'Select All',
        'type': 'system'
    },
    {
        'id': 'mainAppSettings',
        'name': 'Settings',
        'type': 'system'
    },
    {
        'id': 'mainAppAbout',
        'name': 'About',
        'type': 'system'
    }
];

module.exports = {
    defaultMenu: defaultMenu,
    systemElements: systemElements,
};