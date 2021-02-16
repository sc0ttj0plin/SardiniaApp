
const deploymentEnv = "dev"; /* "dev" or "stage" or "prod" */

const firebase = {
  "dev": {
    apiKey: "AIzaSyDHmzZVf_Q5a8NoKdvcMhNAtqQAGwbEx5M",
    authDomain: "sinnos-849e5.firebaseapp.com",
    databaseURL: "https://sinnos-849e5.firebaseio.com",
    projectId: "sinnos-849e5",
    storageBucket: "sinnos-849e5.appspot.com",
    messagingSenderId: "284346803308",
    appId: "1:284346803308:web:664528d31419ace7fee449",
    measurementId: "G-C36CVS5SZN"
  },
  "stage": {},
  "prod": {}
}

const firebasePassLessAuthLinkProxy = {
  "dev": 'https://wt-6e2a5f000b93f69e1b65cf98021e1945-0.sandbox.auth0-extend.com/firebase-authentication-link-redirect',
  "stage": 'https://wt-6e2a5f000b93f69e1b65cf98021e1945-0.sandbox.auth0-extend.com/firebase-authentication-link-redirect',
  "prod": 'https://wt-6e2a5f000b93f69e1b65cf98021e1945-0.sandbox.auth0-extend.com/firebase-authentication-link-redirect',
}

const apiUrl = {
  "dev": "http://sinnos.andreamontaldo.com:81/hasura-Te7BEYo8VwbYFUDH/v1/graphql",
  "stage": "",
  "prod": "",
}

const apolloKey = {
  "dev": "XeHJjvSB8eRryWJf",
  "stage": "XeHJjvSB8eRryWJf",
  "prod": "XeHJjvSB8eRryWJf",
}

const apiImagesUrl = {
  "dev": "http://sinnos.andreamontaldo.com:81/img",
  "stage": "",
  "prod": "",
}

const websiteUrl = {
  "dev": "https://www.sardegnaturismo.it/",
  "stage": "https://www.dev.sardegnaturismocloud.it",
  "prod": "",
}

const websiteDomain = {
  "dev": "sardegnaturismo.it",
  "stage": "dev.sardegnaturismocloud.it",
  "prod": "sardegnaturismo.it",
}

// This object is merged with app.json and all its props must be stored in an inner object ("extra")
export default {
  extra: {
    deploymentEnv, 
    apiUrl: apiUrl[deploymentEnv],
    firebase: firebase[deploymentEnv],
    firebasePassLessAuthLinkProxy: firebasePassLessAuthLinkProxy[deploymentEnv],
    apiUrl: apiUrl[deploymentEnv],
    apiImagesUrl: apiImagesUrl[deploymentEnv],
    websiteUrl: websiteUrl[deploymentEnv],
    websiteDomain: websiteDomain[deploymentEnv],
    apolloKey: apolloKey[deploymentEnv],
  }
};