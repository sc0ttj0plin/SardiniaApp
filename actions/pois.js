import * as Constants from '../constants';

export function getClusters(query, props) {
  return {
    type: Constants.GET_CLUSTERS,
    query: query,
    ...props
  };
}

export function getNearestPois(query, tid) {
    return {
      type: Constants.GET_NEARESTPOIS,
      query: query,
      tid: tid
    };
}

export function getNearestPoisImages(query, tid) {
  return {
    type: Constants.GET_NEARESTPOISIMAGES,
    query: query,
    tid: tid
  };
}

export function getNearPois(query, tid) {
  return {
    type: Constants.GET_NEARPOIS,
    query: query,
    tid: tid
  };
}

export function getPois(query, props) {
  return {
    type: Constants.GET_POIS,
    query: query,
    ...props
  };
}

export function getExtras(query, props) {
  return {
    type: Constants.GET_EXTRAS,
    query: query,
    ...props
  };
}

export function getPoi(query, props) {
  return {
    type: Constants.GET_POI,
    query: query,
    ...props
  };
}