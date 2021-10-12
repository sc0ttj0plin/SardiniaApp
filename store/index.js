import { createStore, applyMiddleware, combineReducers } from 'redux';
import axiosMiddleware from 'redux-axios-middleware';
import restReducer from '../reducers/rest';
import localeReducer from '../reducers/locale';
import othersReducer from '../reducers/others';
import favouritesReducer from '../reducers/favourites';
import categoriesReducer from '../reducers/categories';
import eventsReducer from '../reducers/events';
import inspirersReducer from '../reducers/inspirers';
import itinerariesReducer from '../reducers/itineraries';
import authReducer from '../reducers/auth';
import nodesReducer from '../reducers/nodes';
import poisReducer from '../reducers/pois';
import preferencesReducer from '../reducers/preferences';
import accomodationsReducer from '../reducers/accomodations';
import searchAutocompleteReducer from '../reducers/searchAutocomplete';
import settingReducer from '../reducers/settings';
import placesReducer from "../reducers/places";
import apolloMiddleware from '../apollo/middleware';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'; //2lvl objects
import makeApolloClient from '../apollo/client';
import restClient from '../rest/client';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';

// Token is fetched from the persisted store.auth.token (so when app starts we should have token stored)
const axiosMiddlewareOptions = {
  interceptors: {
    request: [
      ({getState, dispatch, getSourceAction}, req) => {
        //Redux persist-saved token
        const token = userToken;
        // console.log(token)
        if (token) 
          req.headers.common['Authorization'] = 'Bearer ' + token;
        return req;
      }
    ],
    response: []
  }
}



const rootReducer = combineReducers({
  restState: restReducer,
  authState: authReducer,
  localeState: localeReducer,
  othersState: othersReducer,
  favouritesState: favouritesReducer,
  //Graphql states
  categoriesState: categoriesReducer,
  preferencesState: preferencesReducer,
  eventsState: eventsReducer,
  inspirersState: inspirersReducer,
  itinerariesState: itinerariesReducer,
  nodesState: nodesReducer,
  poisState: poisReducer,
  accomodationsState: accomodationsReducer,
  searchAutocompleteState: searchAutocompleteReducer,
  settingsState: settingReducer,
  placesState: placesReducer
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2, //Store up to two level nesting
  whitelist: ["authState"], //only store whitelisted reducers
};


//Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);


//Create the apollo client, export 
export const apolloClient = makeApolloClient();
export const store = createStore(persistedReducer, applyMiddleware(thunk, axiosMiddleware(restClient, axiosMiddlewareOptions), apolloMiddleware(apolloClient)));
export const persistor = persistStore(store);
