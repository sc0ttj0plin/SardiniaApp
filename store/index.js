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
import nodesReducer from '../reducers/nodes';
import poisReducer from '../reducers/pois';
import accomodationsReducer from '../reducers/accomodations';
import searchAutocompleteReducer from '../reducers/searchAutocomplete';
import apolloMiddleware from '../apollo/middleware';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'; //2lvl objects
import makeApolloClient from '../apollo/client';
import restClient from '../rest/client';
import { persistStore, persistReducer } from 'redux-persist';
import * as Config from '../constants/Config';

const rootReducer = combineReducers({ 
    restState: restReducer,
    localeState: localeReducer,
    othersState: othersReducer,
    favouritesState: favouritesReducer,
    //Graphql states
    categoriesState: categoriesReducer,
    eventsState: eventsReducer,
    inspirersState: inspirersReducer,
    itinerariesState: itinerariesReducer,
    nodesState: nodesReducer,
    poisState: poisReducer,
    accomodationsState: accomodationsReducer,
    searchAutocompleteState: searchAutocompleteReducer,
  }
);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2, //Store up to two level nesting
  whitelist: ['favouritesState'], //only store whitelisted reducers
};


//Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

//Create the apollo client, export 
export const apolloClient = makeApolloClient(Config.APOLLO_KEY);
export const store = createStore(persistedReducer, applyMiddleware(axiosMiddleware(restClient), apolloMiddleware(apolloClient)));
export const persistor = persistStore(store);