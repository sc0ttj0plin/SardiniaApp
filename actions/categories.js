import * as Constants from '../constants';

export function getCategories(query) {
    return {
      type: Constants.GET_CATEGORIES,
      query: query
    };
}