import _ from 'lodash';
import * as Constants from '../constants';
import * as Queries from './queryTemplates';
import { processCategories, processEventTypes, processEntity, _tmpAddMockPois } from "./utils";
import actions from '../actions';

/**
 * Creates the apollo middleware to intercept actions and dispatch success/error actions through redux
 * @param {*} client: apollo client
 */
const apolloMiddleware = client => {
    return store => next => action => {
        if (action.type === Constants.GET_POI) {
          client.query({
              query: Queries.getPoi,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_POI_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              processEntity(resp.data.nodes[0]);
              dispatch.payload = { [resp.data.nodes[0].uuid]: resp.data.nodes[0] };
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_POI_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_POIS) {
          client.query({
              query: Queries.getPois,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_POIS_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              let pois = resp.data.nodes;
              pois.forEach((e) => processEntity(e, action.coords));
              //key by nid
              pois = pois.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = pois;
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_POIS_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_INSPIRER) {
          client.query({
              query: Queries.getInspirer,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_INSPIRER_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              processEntity(resp.data.nodes[0]);
              dispatch.payload = { [resp.data.nodes[0].uuid]: resp.data.nodes[0] };
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_INSPIRER_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_INSPIRERS) {
          client.query({
              query: Queries.getInspirers,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_INSPIRERS_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              let data = resp.data.nodes || [];
              data.forEach((e) => processEntity(e));
              let dataById = data.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = { dataById, data };
            }
            else
              dispatch.payload = { dataById: {}, data: [] };

            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_INSPIRERS_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_INSPIRERS_BY_ID) {
          client.query({
              query: Queries.getInspirersById,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_INSPIRERS_BY_ID_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              let data = resp.data.nodes;
              data.forEach((e) => processEntity(e));
              let dataById = data.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = { dataById, data };
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_INSPIRERS_BY_ID_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_EXTRAS) {
          client.query({
              query: Queries.getPois,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_EXTRAS_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              let pois = resp.data.nodes;
              pois.forEach((e) => processEntity(e, action.coords));
              //key by nid
              pois = pois.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = pois;
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_EXTRAS_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_CATEGORIES) {
            client.query({
                query: Queries.getCategoriesQuery,
                variables: action.query
            }).then((resp) => {
                if (resp.data) {
                    var termsMap = {};
                    var terms = processCategories(resp.data.terms, termsMap);
                    let dispatch = { 
                      type: Constants.GET_CATEGORIES_SUCCESS, 
                      payload: { 
                        vid: action.query.vid,
                        terms: { [action.query.vid]: terms }, 
                        termsMap: { [action.query.vid]: termsMap }
                      }  
                    };
                    store.dispatch(dispatch);
                }
            }).catch((e) => {
                console.log(e);
                store.dispatch({ type: Constants.GET_CATEGORIES_FAIL, payload: e });
                store.dispatch(actions.setReduxError(e, action));
            });
        }
        else if (action.type === Constants.GET_EVENTS) {
          client.query({
            query: Queries.getEvents,
            variables: action.query
          }).then((resp) => {
            // console.log('Events response:', resp.data.events.length);
            const { lb: timeMin, ub: timeMax } = action.ubLb;
            let dispatch = { 
              type: Constants.GET_EVENTS_SUCCESS, 
              payload: { events: {}, timeMin, timeMax, start: action.query.start, end: action.query.end, filtersByType: action.filtersByType, eventsById: {} } 
            }
            //Send also start/end to know which ones have been loaded correctly
            if (resp.data && resp.data.events.length > 0) {
              //also store events by id
              resp.data.events.forEach((e) => processEntity(e));
              dispatch.payload.events = resp.data.events;
            }
            else
              dispatch.payload.events = []
            //dispatch empty events but still success cause we need to fill empty dates in reducer
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.GET_EVENTS_FAIL,
              start: action.query.start, end: action.query.end,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        } 
        else if (action.type === Constants.GET_EVENTS_BY_ID) {
          client.query({
            query: Queries.getEventsById,
            variables: action.query
          }).then((resp) => {
            let dispatch = { 
              type: Constants.GET_EVENTS_BY_ID_SUCCESS, 
              payload: { } 
            }
            //Send also start/end to know which ones have been loaded correctly
            if (resp.data && resp.data.events.length > 0) {
              let events = resp.data.events;
              events = resp.data.events;
              events.forEach((e) => processEntity(e));
              //key by nid
              events = events.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = events;
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.GET_EVENTS_BY_ID_FAIL,
              start: action.query.start, end: action.query.end,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        } 
        else if (action.type === Constants.GET_EVENT_TYPES) {
          client.query({
            query: Queries.getEventTypes,
            variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_EVENT_TYPES_SUCCESS, payload: { eventTypes: [] } };
            if (resp.data && resp.data.eventTypes.nodes.length > 0) 
              dispatch.payload.eventTypes = processEventTypes(resp.data.eventTypes.nodes);
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.GET_EVENT_TYPES_FAIL,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_ITINERARIES) {
          client.query({
            query: Queries.getItineraries,
            variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_ITINERARIES_SUCCESS, payload: { } };
            if (resp.data && resp.data.itineraries.length > 0){
              let itineraries = resp.data.itineraries;
              itineraries.forEach((e) => processEntity(e));
              dispatch.payload.dataById = itineraries.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});;
              dispatch.payload.data = itineraries;
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.GET_ITINERARIES_FAIL,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_ITINERARIES_BY_ID) {
          client.query({
            query: Queries.getItinerariesById,
            variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_ITINERARIES_BY_ID_SUCCESS, payload: { } };
            if (resp.data && resp.data.itineraries.length > 0){
              let itineraries = resp.data.itineraries;
              itineraries.forEach((e) => processEntity(e));
              dispatch.payload.dataById = itineraries.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});;
              dispatch.payload.data = itineraries;
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.GET_ITINERARIES_BY_ID_FAIL,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.AUTOCOMPLETE) {
          var query = Queries.autocompleteQuery;
          var resultParam = "autocomplete";
          if(action.lan == "en"){
            query = Queries.autocompleteEnQuery;
            resultParam = "autocomplete_en";
          }
          client.query({
            query: query,
            variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.AUTOCOMPLETE_SUCCESS, payload: { autocomplete: [] } };
            if (resp.data && resp.data[resultParam] && resp.data[resultParam].length > 0) {
              dispatch.payload.autocomplete = resp.data[resultParam];
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.AUTOCOMPLETE_FAIL,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.SEARCH) {
          var query = Queries.searchQuery;
          var resultParam = "search";
          if(action.lan == "en"){
            query = Queries.searchEnQuery;
            resultParam = "search_en";
          }
          client.query({
            query: query,
            variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.SEARCH_SUCCESS, payload: { search: [] } };
            if (resp.data && resp.data[resultParam] && resp.data[resultParam].length > 0) {
              resp.data[resultParam].forEach((e) => processEntity(e.node));
              dispatch.payload.search = resp.data[resultParam];
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            store.dispatch({ 
              type: Constants.SEARCH_FAIL,
              payload: e
            });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_ACCOMODATIONS) {
          client.query({
              query: Queries.getAccomodations,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_ACCOMODATIONS_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes.length > 0) {
              let data = resp.data.nodes || [];
              data.forEach((e) => processEntity(e));
              let dataById = data.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = { dataById, data };
            }
            else
              dispatch.payload = { dataById: {}, data: [] };

            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_ACCOMODATIONS_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_ACCOMODATION) {
          client.query({
              query: Queries.getAccomodation,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_ACCOMODATION_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes && resp.data.nodes.length > 0) {
              processEntity(resp.data.nodes[0]);
              dispatch.payload = { dataById: {[resp.data.nodes[0].uuid]: resp.data.nodes[0]}, data: [resp.data.nodes[0]] };
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_ACCOMODATION_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        else if (action.type === Constants.GET_ACCOMODATIONS_BY_ID) {
          client.query({
              query: Queries.getAccomodationsById,
              variables: action.query
          }).then((resp) => {
            let dispatch = { type: Constants.GET_ACCOMODATIONS_BY_ID_SUCCESS, payload: {} };
            if (resp.data && resp.data.nodes && resp.data.nodes.length > 0) {
              let data = resp.data.nodes;
              data.forEach((e) => processEntity(e));
              let dataById = data.reduce((acc, curr) => ({ ...acc, [curr.uuid]: curr}), {});
              dispatch.payload = { dataById, data };
            }
            store.dispatch(dispatch);
          }).catch((e) => {
            console.log(e);
            //also dispatch the id which has failed
            store.dispatch({ type: Constants.GET_ACCOMODATIONS_BY_ID_FAIL, payload: e });
            store.dispatch(actions.setReduxError(e, action));
          });
        }
        next(action);
    }
};

export default apolloMiddleware;