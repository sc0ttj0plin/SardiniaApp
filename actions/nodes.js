import * as Constants from '../constants';

export function getNodes(query, props) {
  return {
    type: Constants.GET_NODES,
    query: query,
    ...props
  };
}