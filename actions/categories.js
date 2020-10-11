import * as Constants from '../constants';

/**
 * Get categories: queries graphql terms, used by Places Screen and Inspirers"
 */
export function getCategories(query) {
    return {
      type: Constants.GET_CATEGORIES,
      query: query
    };
}