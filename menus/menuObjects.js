const defaultMenu = [
    {
        'name': 'File',
        'position': 1,
        'subitems': [
            {
                'id': 'mainAppLoadData',
                'name': 'Load Data',
                'type': 'system'
            },
            {
                'id': 'separator',
                'name': '',
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
            }
        ]
    },
    {
        'name': 'Edit',
        'position': 2,
        'subitems': [
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
                'id': 'separator',
                'name': '',
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
                'id': 'separator',
                'name': '',
                'type': 'system'
            },
            {
                'id': 'mainAppSettings',
                'name': 'Settings',
                'type': 'system'
            },
        ]
    },
    {
        'name': 'Info',
        'position': 3,
        'subitems': [
            {
                'id': 'mainAppAbout',
                'name': 'About',
                'type': 'system'
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