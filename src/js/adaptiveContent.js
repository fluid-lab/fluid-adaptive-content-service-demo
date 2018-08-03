fluid.defaults("fluid.adaptiveContentDemo.markupAppender",{
    gradeNames: ["fluid.viewComponent"],
    // Must specify
    markup: null,
    events: {
        "onMarkupAppended": null
    },
    listeners: {
        "onCreate.appendMarkup": {
            "this": "{that}.container",
            "method": "append",
            "args": ["{that}.options.markup"]
        },
        "onCreate.fireOnMarkupAppended": {
            "func": "{that}.events.onMarkupAppended.fire",
            "priority": "after:appendMarkup"
        }
    }
});

fluid.defaults("fluid.adaptiveContentDemo.serviceRequest", {
    gradeNames: ["fluid.component"],
        // url: "http://localhost:8080/v1/translation/translate/%langCode",
        directModel: {
        },
        events: {
            onRequestSuccessful: null
        },
        listeners: {
            "onRequestSuccessful.log": {
                "this": "console",
                "method": "log",
                "args": "{arguments}.0"
            }
        },
        invokers: {
            post: {
                funcName: "fluid.adaptiveContentDemo.serviceRequest.makeRequest",
                args: ["{that}.options.url", "{that}.options.directModel", "{arguments}.0", "{that}.events.onRequestSuccessful", "post"]
            },
            get: {
                funcName: "fluid.adaptiveContentDemo.serviceRequest.makeRequest",
                args: ["{that}.options.url", "{that}.options.directModel", null, "{that}.events.onRequestSuccessful", "get"]
            }
        }
});

fluid.defaults("fluid.adaptiveContentDemo.serviceRequest.translate", {
    gradeNames: ["fluid.adaptiveContentDemo.serviceRequest"],
        url: "http://localhost:8080/v1/translation/translate/%langCode",
        directModel: {
            langCode: "en"
        }
});

fluid.defaults("fluid.adaptiveContentDemo.serviceRequest.tag", {
    gradeNames: ["fluid.adaptiveContentDemo.serviceRequest"],
        url: "http://localhost:8080/v1/nlp/compromise/tags"
});

fluid.defaults("fluid.adaptiveContentDemo.serviceRequest.dictionary", {
    gradeNames: ["fluid.adaptiveContentDemo.serviceRequest"],
        url: "http://localhost:8080/v1/dictionary/%thirdPartyService/%langCode/%function/%word",
        directModel: {
            langCode: "en",
            function: "definition",
            word: "dog",
            thirdPartyService: "oxford"
        }
});

fluid.adaptiveContentDemo.serviceRequest.makeRequest = function (url, directModel, body, successEvent, method) {
    var completeUrl = fluid.stringTemplate(url, directModel);

    $[method](completeUrl, body, function (data) {
        successEvent.fire(data);
    });
};

fluid.defaults("fluid.adaptiveContentDemo", {
    gradeNames: ["fluid.component"],
    events: {
        subcomponentContainerMarkupReady: null
    },
    components: {
        subcomponentContainerMarkupAppender: {
            type: "fluid.adaptiveContentDemo.markupAppender",
            container: ".fluidc-adaptiveContentDemo",
            options: {
                markup: "<div class='fluidc-adaptiveContentDemo-controls'></div>",
                listeners: {
                    "onMarkupAppended.escalate": {
                        "func": "{adaptiveContentDemo}.events.subcomponentContainerMarkupReady.fire"
                    }
                }
            }
        },
        controls: {
            type: "fluid.adaptiveContentDemo.userControls",
            createOnEvent: "{adaptiveContentDemo}.events.subcomponentContainerMarkupReady",
            container: ".fluidc-adaptiveContentDemo-controls",
        }
    }
});

fluid.defaults("fluid.adaptiveContentDemo.userControls", {
    gradeNames: ["fluid.adaptiveContentDemo.markupAppender"],
    selectors: {
        inputTextArea: ".fluidc-adaptiveContentDemo-controlsTextArea",
        translateButton: ".fluidc-adaptiveContentDemo-controlsFormTranslateButton",
        targetTranslationLanguageSelect: ".fluidc-adaptiveContentDemo-controlsFormTargetTranslationLanguageSelect",
        tagButton: ".fluidc-adaptiveContentDemo-controlsFormTagButton",
        dictionaryButton: ".fluidc-adaptiveContentDemo-controlsFormDictionaryButton",
        outputTextArea: ".fluidc-adaptiveContentDemo-outputTextArea"
    },
    translationLanguages: {
        "en": "English",
        "fr": "French",
        "de": "German",
        "pt": "Portugese",
        "pl": "Polish",
        "es": "Spanish"
    },
    markup: "<form class='fluidc-adaptiveContentDemo-controlsForm'><h1><label for='inputTextArea'>Input</label></h1><textarea id='inputTextArea'  class='fluidc-adaptiveContentDemo-controlsTextArea'></textarea><p><button type='button' class='fluidc-adaptiveContentDemo-controlsFormTranslateButton'>Translate</button> <label for='targetTranslationLanguage'>Target Language</label> <select id='targetTranslationLanguage' class='fluidc-adaptiveContentDemo-controlsFormTargetTranslationLanguageSelect'></select></p><p><button type='button' class='fluidc-adaptiveContentDemo-controlsFormTagButton'>Tag Parts of Speech</button></p><p><button type='button' class='fluidc-adaptiveContentDemo-controlsFormDictionaryButton'>Dictionary</button></p><h1>Output</h1><p   class='fluidc-adaptiveContentDemo-outputTextArea'></p>",
    events: {
        "onTranslationRequested": null,
        "onTagRequested": null,
        "onDictionaryRequested": null
    },
    listeners: {
        "onMarkupAppended.addTargetTranslationLanguages": {
            "func": "fluid.adaptiveContentDemo.userControls.addTargetTranslationLanguages",
            args: ["{that}", "{that}.options.translationLanguages"]

        },
        "onMarkupAppended.bindTranslateButtonClick": {
            "this": "{that}.dom.translateButton",
            "method": "click",
            "args": ["{that}.events.onTranslationRequested.fire"]
        },
        "onMarkupAppended.bindTagButtonClick": {
            "this": "{that}.dom.tagButton",
            "method": "click",
            "args": ["{that}.events.onTagRequested.fire"]
        },
        "onMarkupAppended.bindDictionaryButtonClick": {
            "this": "{that}.dom.dictionaryButton",
            "method": "click",
            "args": ["{that}.events.onDictionaryRequested.fire"]
        },
        "onTranslationRequested.translateInput": {
            "funcName": "fluid.adaptiveContentDemo.userControls.translateInput",
            "args": ["{that}"]
        },
        "onTagRequested.tagInput": {
            "funcName": "fluid.adaptiveContentDemo.userControls.tagInput",
            "args": "{that}"
        },
        "onDictionaryRequested.dictionaryInput": {
            "funcName": "fluid.adaptiveContentDemo.userControls.dictionaryInput",
            "args": "{that}"
        }
    }
});

fluid.adaptiveContentDemo.userControls.addTargetTranslationLanguages = function (userControls, languages) {
    var languageSelect = userControls.locate("targetTranslationLanguageSelect");
    fluid.each(languages, function (languageName, languageCode) {
        var optionMarkup = fluid.stringTemplate("<option value='%languageCode'>%languageName</option>", {languageName: languageName, languageCode: languageCode});
        languageSelect.append(optionMarkup);
    });
};

fluid.adaptiveContentDemo.userControls.dictionaryInput = function (userControls) {
    var inputText = userControls.locate("inputTextArea").val();
    var dictionaryRequest = fluid.adaptiveContentDemo.serviceRequest.dictionary({
        directModel: {
            function: "definition",
            word: inputText
        },
        listeners: {
            "onRequestSuccessful.display": {
                funcName: "fluid.adaptiveContentDemo.userControls.displayDictionary",
                args: [userControls, "{arguments}.0"]
            }
        }
    });
    dictionaryRequest.get();
};

fluid.adaptiveContentDemo.userControls.displayDictionary = function (userControls, resultData) {
    var word = resultData.jsonResponse.word;
    var resultsMarkup = "";
    var entries = resultData.jsonResponse.entries;
    fluid.each(entries, function (entry) {
        resultsMarkup = resultsMarkup + fluid.stringTemplate("<h2>%word - %category</h2>", {word: word, category: entry.category});
        var listEntriesMarkup = "";
        fluid.each(entry.definitions, function (definition) {
            listEntriesMarkup = listEntriesMarkup + fluid.stringTemplate("<li>%definition</li>", {definition: definition});
        });
        var listMarkup = "<ul>" + listEntriesMarkup + "</ul>";
        resultsMarkup = resultsMarkup + listMarkup;
    });
    userControls.locate("outputTextArea").html(resultsMarkup);
};

fluid.adaptiveContentDemo.userControls.tagInput = function (userControls) {
    var inputText = userControls.locate("inputTextArea").val();
    var tagRequest = fluid.adaptiveContentDemo.serviceRequest.tag({
        listeners: {
            "onRequestSuccessful.display": {
                funcName: "fluid.adaptiveContentDemo.userControls.displayTags",
                args: [userControls, "{arguments}.0"]
            }
        }
    });
    tagRequest.post({sentence: inputText});
};

fluid.adaptiveContentDemo.userControls.displayTags = function (userControls, resultData) {
    var taggedString = "";
    var terms = resultData.jsonResponse.termsArray,
        tags = resultData.jsonResponse.tagsArray;

    fluid.each(terms, function (term, idx) {
        var tag = "<span class='fluid-adaptiveContentDemo-taggedSpeechTagSequence'>" + tags[idx].reverse().join(" / ") + "</span>";
        var combined = term + " (" + tag + ") ";
        taggedString = taggedString + combined;
    });

    userControls.locate("outputTextArea").html(taggedString);
};

fluid.adaptiveContentDemo.userControls.translateInput = function (userControls) {
    var inputText = userControls.locate("inputTextArea").val();
    var targetLanguageCode = userControls.locate("targetTranslationLanguageSelect").val();

    var translationRequest = fluid.adaptiveContentDemo.serviceRequest.translate({
        directModel: {
            langCode: targetLanguageCode
        },
        listeners: {
            "onRequestSuccessful.display": {
                funcName: "fluid.adaptiveContentDemo.userControls.displayTranslation",
                args: [userControls, "{arguments}.0"]
            }
        }
    });

    translationRequest.post({text: inputText});

};

fluid.adaptiveContentDemo.userControls.displayTranslation = function (userControls, resultData) {
    var translated = resultData.jsonResponse.translatedText[0];
    userControls.locate("outputTextArea").html(translated);
};
