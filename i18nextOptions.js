const i18nextOptions = {
    language: 'en',

    setLanguage(lng)
    {
        this.language = lng;
    },

    getOptions: function()
    {
        return {
            lng: this.language,
            fallbackLng: 'en',
            debug: false,
            saveMissing: true,
            preload: [this.language],
            backend:{
                // path where resources get loaded from
                loadPath: './locales/{{lng}}/{{ns}}.json',

                // path to post missing resources
                addPath: './locales/{{lng}}/{{ns}}.missing.json',

                // jsonIndent to use when storing json files
                jsonIndent: 2,

                // custom parser
                // parse: function(data) { return data; }
            }
        };
    }
};

module.exports = i18nextOptions;