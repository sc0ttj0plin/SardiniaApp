import * as Constants from '../constants';
import { processEntity, _tmpAddMockPois } from "./utils";
import { apolloClient } from '../store';
import * as Queries from './queryTemplates';

/**
 * This file contains queries that are meant to be used outside redux scope
 * e.g. in screens that don't have to propagate their status to other screens
 * 
 */
export function apolloQuery(action) {
  if (action.type === Constants.GET_NEARPOIS) {
      return apolloClient.query({
          query: Queries.getNearPois,
          variables: action.query
      }).then((resp) => {
          var pois = resp.data.nodes;
          pois.forEach((e) => processEntity(e, action.query.coords));
          return pois;
      })
  } else if (action.type === Constants.GET_NEARESTPOIS) {
      return apolloClient.query({
          query: Queries.getNearestPois,
          variables: action.query
      }).then((resp) => {
          var pois = resp.data.nearest_neighbour_no_limits;
          pois.forEach((e) => processEntity(e, action.coords));
          return pois;
      })
  } else if (action.type === Constants.GET_NEARESTPOISIMAGES) {
      return apolloClient.query({
          query: Queries.getNearestPoisImages,
          variables: action.query
      }).then((resp) => {
          var pois = resp.data.nearest_neighbour_no_limits;
          pois.forEach((e) => processEntity(e, action.coords));
          return pois;
      })
  } else if (action.type === Constants.GET_POIS) {
      return apolloClient.query({
          query: Queries.getPois,
          variables: action.query
      }).then((resp) => {
          var pois = resp.data.nodes;
          pois.forEach((e) => processEntity(e, action.coords));
          return pois;
      })
  } else if (action.type === Constants.GET_INSPIRERS) {
    return apolloClient.query({
        query: Queries.getInspirers,
        variables: action.query
    }).then((resp) => {
        var pois = resp.data.nodes;
        pois.forEach(e => e.term = e.nodes_terms[0].term);
        pois.forEach((e) => processEntity(e));
        return pois;
    })
  } else if (action.type === Constants.GET_NODES) {
    return apolloClient.query({
        query: Queries.getNodes,
        variables: action.query
    }).then((resp) => {
        var pois = resp.data.nodes;
        if(pois){
            pois.forEach(e => {
                if(e.nodes_terms && e.nodes_terms[0])
                    e.term = e.nodes_terms[0] ? e.nodes_terms[0].term : null
            });
            pois.forEach((e) => processEntity(e));
            return pois;
        }
        else
            return null
    })
  } else if (action.type === Constants.GET_EXTRAS) {
    return apolloClient.query({
        query: Queries.getPois,
        variables: action.query
    }).then((resp) => {
        var pois = resp.data.nodes;
        pois.forEach((e) => processEntity(e, action.coords));
        return pois;
    })

  }  else if (action.type === Constants.GET_CLUSTERS) {
      return apolloClient.query({
          query: Queries.getClusters,
          variables: action.query
      }).then((resp) => {
          var clusters = resp.data.clusters;
          clusters.forEach((e) => processEntity(e, action.coords));
          return clusters;
      })
  }
  else if (action.type === Constants.GET_POI) {
      return apolloClient.query({
          query: Queries.getPoi,
          variables: action.query
      }).then((resp) => {
          processEntity(resp.data.nodes[0]);
          return resp.data.nodes;
      })
  } else if (action.type === Constants.GET_EVENT_TYPES) {
      return apolloClient.query({
          query: Queries.getEventTypes,
          variables: action.query
      }).then((resp) => {
          processEntity(resp.data.nodes[0]);
          return resp.data.nodes;
      })
  }
}