import * as Constants from '../constants';


export function getCategoriesPreferences(query) {
  return {
    type: Constants.GET_CATEGORIES_PREFERENCES,
    query: query,
  }
}