//TODO: language should be part of the app state (I've partially implemented it)
let _language = "it";

export let setLanguage = (l) => {
    _language = l;
}

export let getLanguage = () => _language;