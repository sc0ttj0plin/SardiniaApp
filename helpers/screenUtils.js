/**
 * This file contains utilities functions that are bound to the screens logic.
 * Functions declared here can assume to know the logical linking between screens and queries.
 * In particular we intend to use this module to simplify fetching data and navigation
 */

import * as Constants from '../constants';

/**
 * openRelatedEntity navigates to screen using navigator param (can be push or navigate depending on pushOrNavigate)
 * @param type one of Constants.NAVIGATION.*
 * @param navigator the navigator instance
 * @param pushOrNavigate if push then uses navigator.push, else use navigator.navigate
 * @param screenNavOpts navigation options for the destination screen
 */
export const openRelatedEntity = (type, navigator, pushOrNavigate, screenNavOpts) => {
  console.log('open entity')
  let navFun = navigator.push;
  if (pushOrNavigate == "navigate")
    navFun = navigator.navigate;
  switch(type) {
    case Constants.NODE_TYPES.places:
      navFun(Constants.NAVIGATION.NavPlaceScreen, screenNavOpts);
      break;
    case Constants.NODE_TYPES.turisticLocation:
      console.log('turistic')
      navFun(Constants.NAVIGATION.NavPlaceScreen, screenNavOpts);
      break;
    case Constants.NODE_TYPES.events:
      navFun(Constants.NAVIGATION.NavEventScreen, screenNavOpts);
      break;
    case Constants.NODE_TYPES.itineraries:
      navFun(Constants.NAVIGATION.NavItineraryScreen, screenNavOpts)
      break;
    case Constants.NODE_TYPES.inspirers:
      navFun(Constants.NAVIGATION.NavInspirerScreen, screenNavOpts)
      break;
    default:
      break;
  }
}
