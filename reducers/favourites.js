import * as Constants from '../constants';

const INITIAL_STATE = {
  events: {},
  itineraries: {},
  places: {},
  inspirers: {},
}


export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //FAVOURITES
    case Constants.TOGGLE_FAVOURITE:
      switch (action.payload.type) {
        case "events":
          let newEvents = { ...state.events };
          if (newEvents[action.payload.id])
            delete newEvents[action.payload.id];
          else 
          newEvents[action.payload.id] = true;
          return { 
            ...state, 
            events: newEvents
          };
        case "itineraries": 
          let newItineraries = { ...state.itineraries };
          if (newItineraries[action.payload.id])
            delete newItineraries[action.payload.id];
          else 
          newItineraries[action.payload.id] = true;
          return { 
            ...state, 
            itineraries: newItineraries
          };
        case "places":
          let newPlaces = { ...state.places };
          if (newPlaces[action.payload.id])
            delete newPlaces[action.payload.id];
          else 
          newPlaces[action.payload.id] = true;
          return { 
            ...state, 
            places: newPlaces
          };
        case "inspirers":
          let newInspirers = { ...state.inspirers };
          if (newInspirers[action.payload.id])
            delete newInspirers[action.payload.id];
          else 
          newInspirers[action.payload.id] = true;
          return { 
            ...state, 
            inspirers: newInspirers
          };
      }
    default:
      return state;
  }
}