/**
 * This file contains utilities functions that are bound to the screens logic.
 * Functions declared here can assume to know the logical linking between screens and queries.
 * In particular we intend to use this module to simplify fetching data and navigation
 */

import * as Constants from '../constants';

/**
 * openRelatedEntity navigates to screen depending 
 * @param type one of Constants.NAVIGATION.*
 * @param navOpts navigation options for the destination screen
 */
export const openRelatedEntity = (type, navigator, navOpts) => {
  switch(type) {
    case Constants.NODE_TYPES.places:
      navigator.push(Constants.NAVIGATION.NavPlaceScreen, navOpts);
      break;
    case Constants.NODE_TYPES.events:
      navigator.navigate(Constants.NAVIGATION.NavEventScreen, navOpts);
      break;
    case Constants.NODE_TYPES.itineraries:
      navigator.navigate(Constants.NAVIGATION.NavItineraryScreen, navOpts)
      break;
    case Constants.NODE_TYPES.inspirers:
      navigator.navigate(Constants.NAVIGATION.NavInspirerScreen, navOpts)
      break;
    default:
      break;
  }
}
