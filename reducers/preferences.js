import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Preferences have categories + other reducers dedicated to the recommendation system
 */
const INITIAL_STATE = {
  //categories
  categories: {}, /* categories is keyed by vid (e.g. places: 36, inspirers: 46) */
  categoriesSuccess: false, 
  categoriesError: null,
  categoriesLoading: false,
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.GET_CATEGORIES_PREFERENCES_PREFERENCES:
      return { 
        ...state, 
        categoriesSuccess: false,
        categoriesError: null, 
        categoriesLoading: true 
      };
    case Constants.GET_CATEGORIES_PREFERENCES_SUCCESS:
      return { 
        ...state, 
        categoriesSuccess: true,
        categoriesError: null, 
        categories: {...state.categories, ...action.payload.terms}, /* hierarchy is preserved e.g. { 36: [ {name: "Archeologia e Arte", uuid: ...} ], 46: [ ... ] } */
        categoriesLoading: false
      };
    case Constants.GET_CATEGORIES_PREFERENCES_FAIL:
      return { 
        ...state, 
        categoriesSuccess: false,
        categoriesLoading: false, 
        categoriesError: 'Error while fetching categories' 
      };
    default:
      return state;
    }
  }