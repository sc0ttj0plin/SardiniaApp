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
import apolloMiddleware from '../apollo/middleware';
import AsyncStorage from '@react-native-community/async-storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'; //2lvl objects
import makeApolloClient from '../apollo/client';
import restClient from '../rest/client';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import * as Config from '../constants/Config';
// import { getUserToken } from '../helpers/utils';

/**
 * Dynamic apollo client reconfiguration:
 * We start apollo client without a user token since we don't want make the user wait for fetching data.
 * As soon as the user token is ready (either from firebase (is logged) or from device info (not logged))
 * we overwrite the exported apollo client with a new one specifying the user token and origin ('device' or 'auth').
 */
// var apolloClient = makeApolloClient(Config.APOLLO_KEY, null, null);

// const authLink = setContext(async (_, { headers }) => {
//   const { userToken, userTokenOrigin } = await getUserToken();
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     }
//   }
// });

// Retrieves the user token (either if the user is authenticated or not)
// (async () => {
//   const { userToken, userTokenOrigin } = await getUserToken();
//   console.log(`Overwriting apollo client with computed userToken: usertoken: ${userToken}, userTokenOrigin: ${userTokenOrigin}`);
//   apolloClient = makeApolloClient(Config.APOLLO_KEY, userToken, userTokenOrigin);
// })();

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
  }
);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2, //Store up to two level nesting
  whitelist: ['favouritesState', 'authState'], //only store whitelisted reducers
};


//Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);


//Create the apollo client, export 
export const apolloClient = makeApolloClient(Config.APOLLO_KEY)
export const store = createStore(persistedReducer, applyMiddleware(thunk, axiosMiddleware(restClient, axiosMiddlewareOptions), apolloMiddleware(apolloClient)));
export const persistor = persistStore(store);