import * as Constants from '../constants';

export function getClusters(query, props) {
  return {
    type: Constants.GET_CLUSTERS,
    query: query,
    ...props
  };
}

export function getNearestAccomodations(query, tid) {
  return {
    type: Constants.GET_NEARESTACCOMODATIONSIMAGES,
    query: query,
    tid: tid
  };
}

export function getNearestAccomodationsImages(query, tid) {
  return {
    type: Constants.GET_NEARESTACCOMODATIONSIMAGES,
    query: query,
    tid: tid
  };
}

export function getAccomodations(query, props) {
  return {
    type: Constants.GET_ACCOMODATIONS,
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