import * as TaskManager from 'expo-task-manager';
import * as Constants from '../constants';


/**
 * Defines the background task for location fetching
 */
TaskManager.defineTask(Constants.GEOLOCATION.geolocationBackgroundTaskName, ({ data, error }) => {
  if (error) {
    console.error(error.message)
    return;
  }
  if (data) {
    const { locations } = data; //array of locations
    //send locations to backend
    console.log(locations);
  }
});