import * as Constants from '../constants';

export function getEntities(type) {
  return {
    type: Constants.GET_ENTITIES,
    payload: {
      request: {
        url: `/rest/node.json/?parameters[type]=${type}`
      }
    }
  };
}

export function getEntity(uuid) {
  return {
    type: Constants.GET_ENTITY,
    payload: {
      request: {
        url: `/rest/node/${uuid}.json`
      }
    }
  };
}

