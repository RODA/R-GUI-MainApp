const i18nextOptions = {
    language: 'en',
    namespace: 'en-US',

    setLanguage(lng, ns)
    {
        this.language = lng;
        this.namespace = ns;
    },

    getOptions: function(env)
    {
        if (env == 'production') {
            return {
                lng: this.language,
                ns: ['en-US', this.namespace],
                defaultNS: this.namespace,
                fallbackLng: 'en',
                fallbackNS: 'en-US',
                load: 'languageOnly',
                preload: [this.language],
                backend:{
                    // path where resources get loaded from
                    loadPath: './locales/{{ lng }}/{{ ns }}.json',
                    // path to post missing resources
                    addPath: './locales/{{ lng }}/{{ ns }}.missing.json',
                    // jsonIndent to use when storing json files
                    jsonIndent: 2,
                }
            };
        } else {
            // console.log(this.language);
            // console.log(this.namespace);
            return {
                lng: this.language,
                ns: ['en-US', this.namespace],
                defaultNS: this.namespace,
                fallbackLng: 'en',
                fallbackNS: 'en-US',
                load: 'languageOnly',
                preload: [this.language],
                // debug: true,
                saveMissing: true,
                saveMissingTo: 'current',
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
    }
};

module.exports = i18nextOptions;