import * as Constants from '../constants';

export function getClusters(query, props) {
  return {
    type: Constants.GET_CLUSTERS,
    query: query,
    ...props
  };
}

export function getNearestAccomodations(query) {
  return {
    type: Constants.GET_NEARESTACCOMODATIONS,
    query: query,
  };
}

export function getNearestAccomodationsImages(query, tid) {
  return {
    type: Constants.GET_NEARESTACCOMODATIONSIMAGES,
    query: query
  };
}

export function getAccomodations(query, props) {
  return {
    type: Constants.GET_ACCOMODATIONS,
    query: query,
    ...props
  };
}

export function getAccomodation(query, props) {
  return {
    type: Constants.GET_ACCOMODATION,
    query: query,
    ...props
  };
}

export function getAccomodationsById(query, props) {
  return {
    type: Constants.GET_ACCOMODATIONS_BY_ID,
    query: query,
    ...props
  };
}