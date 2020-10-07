import * as Constants from '../constants';

export function getInspirers(query, props) {
  return {
    type: Constants.GET_INSPIRERS,
    query: query,
    ...props
  };
}

export function getInspirer(query, props) {
  return {
    type: Constants.GET_INSPIRER,
    query: query,
    ...props
  };
}