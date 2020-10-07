import { GET_ENTITIES, GET_ENTITY, GET_CATEGORIES } from '../constants';

export function getEntities(type) {
  return {
    type: GET_ENTITIES,
    payload: {
      request: {
        url: `/rest/node.json/?parameters[type]=${type}`
      }
    }
  };
}

export function getEntity(uuid) {
  return {
    type: GET_ENTITY,
    payload: {
      request: {
        url: `/rest/node/${uuid}.json`
      }
    }
  };
}

