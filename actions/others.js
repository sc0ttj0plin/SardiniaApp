import * as Constants from '../constants';

export const switchSearchOrAutocomplete = (payload) => ({ type: Constants.SWITCH_SEARCH_OR_AUTOCOMPLETE, payload });

export const setSearchOrAutocomplete = (payload) => ({ type: Constants.SET_SEARCH_OR_AUTOCOMPLETE, payload });

export const resetSearchAndAutocompleteStr = () => ({ type: Constants.RESET_SEARCH_AND_AUTOCOMPLETE_STR, });

export const setMapType = (payload) => ({ type: Constants.SET_MAP_TYPE, payload });

//Places
export const pushCurrentCategoryPlaces = (term) => ({ type: Constants.PUSH_CURRENT_CATEGORY_PLACES, payload: term });

export const popCurrentCategoryPlaces = () => ({ type: Constants.POP_CURRENT_CATEGORY_PLACES });

export const resetCurrentCategoryPlaces = () => ({ type: Constants.RESET_CURRENT_CATEGORY_PLACES });

//Inspirers
export const pushCurrentCategoryInspirers = (term) => ({ type: Constants.PUSH_CURRENT_CATEGORY_INSPIRERS, payload: term });

export const popCurrentCategoryInspirers = () => ({ type: Constants.POP_CURRENT_CATEGORY_INSPIRERS });

export const resetCurrentCategoryInspirers = () => ({ type: Constants.RESET_CURRENT_CATEGORY_INSPIRERS });

// Accomodations
export const pushCurrentCategoryAccomodations = (term) => ({ type: Constants.PUSH_CURRENT_CATEGORY_ACCOMODATIONS, payload: term });

export const popCurrentCategoryAccomodations = () => ({ type: Constants.POP_CURRENT_CATEGORY_ACCOMODATIONS });

export const resetCurrentCategoryAccomodations = () => ({ type: Constants.RESET_CURRENT_CATEGORY_ACCOMODATIONS });

export const setCurrentMapEntity = (entity) => ({ type: Constants.SET_CURRENT_MAP_ENTITY, payload: entity });

export const setUrl = (url, type) => ({ type: Constants.SET_URL, payload: { url, type } });

export const setScrollableSnapIndex = (id, val) => ({ type: Constants.SCROLLABLE_SET_SCROLLINDEX, payload: { id, val } });

export const setScrollablePressIn = (id, val) => ({ type: Constants.SCROLLABLE_SET_PRESSIN, payload: { id, val } });

export const setMapIsDragging = (id, val) => ({ type: Constants.MAP_SET_DRAGGING, payload: { id, val } });
 
export const setGeolocation = (geolocation, source) => ({ type: Constants.SET_GEOLOCATION , payload: { geolocation, source } });

export const checkForUpdates = () => ({ type: Constants.CHECK_FOR_UPDATES });

export const setNetworkStatus = (status) => ({ type: Constants.SET_NETWORK_STATUS, payload: status });


export const setNavigatorReady = (ready) => ({ type: Constants.SET_NAVIGATOR_READY, payload: ready });

/**
 * Used to set the main screen mounting status only once (used by SplashLoader to prompt any modal after the mounting event)
 * @param {*} mounted true or false
 */
export const setMainScreenMounted = (mounted) => ({ type: Constants.SET_MAIN_SCREEN_MOUNTED, payload: mounted });

/**
 * Used to set the main screen shown status: waits for setMainScreenMounted + Splash screen delay
 * @param {*} shown true or false
 */
export const setMainScreenIsShown = (shown) => ({ type: Constants.SET_MAIN_SCREEN_SHOWN, payload: shown });


/**
 * Set/unset a global error (with the corresponding action)
 * This action is to be used in the apollo middleware + rest middleware to notify about failed actions 
 * @param {*} error The error generated during an action
 * @param {*} action The action that caused the error (for retry purposes)
 */
export const setReduxError = (error, sourceAction) => ({ type: Constants.SET_ERROR, payload: { error, sourceAction } });
export const unsetReduxError = () => ({ type: Constants.UNSET_ERROR });

/**
 * Send an action to redux (used to retry a possibly failed action)
 * @param {*} action The action to submit
 */
export const sendAction = (action) => ({ ...action });