import axios from 'axios'

export default client = axios.create({
    baseURL: 'https://sardegnaturismo.it',
    responseType: 'json'
  });