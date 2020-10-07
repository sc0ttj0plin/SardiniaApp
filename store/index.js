import { createStore, applyMiddleware, combineReducers } from 'redux';
import axiosMiddleware from 'redux-axios-middleware';
import restReducer from '../reducers/rest';
import localeReducer from '../reducers/locale';
import othersReducer from '../reducers/others';
import favouritesReducer from '../reducers/favourites';
import categoriesReducer from '../reducers/categories';
import categoriesInspirersReducer from '../reducers/categoriesInspirers';
import eventsReducer from '../reducers/events';
import inspirersReducer from '../reducers/inspirers';
import itinerariesReducer from '../reducers/itineraries';
import nodesReducer from '../reducers/nodes';
import poisReducer from '../reducers/pois';
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
    categoriesInspirersState: categoriesInspirersReducer,
    eventsState: eventsReducer,
    inspirersState: inspirersReducer,
    itinerariesState: itinerariesReducer,
    nodesState: nodesReducer,
    poisState: poisReducer,
    searchAutocompleteState: searchAutocompleteReducer,
  }
);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2, //Store up to two level nesting
  whitelist: ['favouritesState'], //only store whitelisted reducers
};

//Create the apollo client
var apolloClient = makeApolloClient(Config.APOLLO_KEY);

//Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const configureStore;
export const apolloClient;
export const store = createStore(persistedReducer, applyMiddleware(axiosMiddleware(restClient), apolloMiddleware(apolloClient)));
export const persistor = persistStore(store);