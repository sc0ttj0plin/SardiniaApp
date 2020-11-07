import * as Constants from '../constants';

const INITIAL_STATE = {
  events: {},
  itineraries: {},
  places: {},
  inspirers: {},
  accomodations: {},
}


export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //FAVOURITES
    case Constants.TOGGLE_FAVOURITE:
      switch (action.payload.type) {
        case Constants.ENTITY_TYPES.events:
          let newEvents = { ...state.events };
          if (newEvents[action.payload.id])
            delete newEvents[action.payload.id];
          else 
            newEvents[action.payload.id] = true;
          return { 
            ...state, 
            events: newEvents
          };
        case Constants.ENTITY_TYPES.itineraries: 
          let newItineraries = { ...state.itineraries };
          if (newItineraries[action.payload.id])
            delete newItineraries[action.payload.id];
          else 
            newItineraries[action.payload.id] = true;
          return { 
            ...state, 
            itineraries: newItineraries
          };
        case Constants.ENTITY_TYPES.places:
          let newPlaces = { ...state.places };
          if (newPlaces[action.payload.id])
            delete newPlaces[action.payload.id];
          else 
            newPlaces[action.payload.id] = true;
          return { 
            ...state, 
            places: newPlaces
          };
        case Constants.ENTITY_TYPES.inspirers:
          let newInspirers = { ...state.inspirers };
          if (newInspirers[action.payload.id])
            delete newInspirers[action.payload.id];
          else 
            newInspirers[action.payload.id] = true;
          return { 
            ...state, 
            inspirers: newInspirers
          };
        case Constants.ENTITY_TYPES.accomodations:
          let newAccomodations = { ...state.accomodations };
          if (newAccomodations[action.payload.id])
            delete newAccomodations[action.payload.id];
          else 
            newAccomodations[action.payload.id] = true;
          return { 
            ...state, 
            accomodations: newAccomodations
          };
      }
    default:
      return state;
  }
}