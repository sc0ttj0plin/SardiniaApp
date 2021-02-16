import { HttpLink } from 'apollo-link-http';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from "apollo-cache-inmemory";
import { getUserToken } from '../helpers/utils';
import ExpoConstants from 'expo-constants';

/**
 * Dynamic apollo client reconfiguration:
 * We start apollo client without a user token since we don't want make the user wait for fetching data.
 * As soon as the user token is ready (either from firebase (is logged) or from device info (not logged))
 * we add auth information to the header through a context.
 * It might happen that the first time the user is logged in we still send null x-user-firebase-token.
 * This problem solves after the second (authenticated) execution.
 * That is the reason why we always include the device token, i.e. to cross reference the two and point to the same user.
 */

const authLink = setContext(async (_, { headers }) => {
  const { userDeviceToken, userFirebaseToken } = await getUserToken();
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // authorization: token ? `Bearer ${userToken}` : "", //Classic auth header
      'x-user-device-token': `${userDeviceToken}`,
      'x-user-firebase-token': `${userFirebaseToken}`,
    }
  }
});


const makeApolloClient = (authToken) => {
  // create an apollo link instance, a network interface for apollo client
  const httpLink = new HttpLink({
    uri: ExpoConstants.manifest.extra.apiUrl,
    headers: {
      'x-hasura-admin-secret': `${authToken}`,
      'content-type': 'application/json',
    }
  });
  // create an inmemory cache instance for caching graphql data
  const cache = new InMemoryCache()
  // instantiate apollo client with apollo link instance and cache instance
  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache
  });
  return client;
}
export default makeApolloClient;