import * as Constants from '../constants';

export function getNodes(query, props) {
  return {
    type: Constants.GET_NODES,
    query: query,
    ...props
  };
}

export function getNearestNodesByType(query) {
  return {
    type: Constants.GET_NEAREST_NODES_BY_TYPE,
    query: query,
  };
}