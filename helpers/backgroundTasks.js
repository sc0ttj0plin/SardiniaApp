import * as TaskManager from 'expo-task-manager';
import * as Constants from '../constants';
import { LocationGeofencingEventType } from 'expo-location';

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
    console.log("backgroundTask", locations);
  }
});

TaskManager.defineTask(Constants.GEOLOCATION.geolocationFenceTaskName, ({ data: { eventType, region }, error }) => {
  if (error) {
    // check `error.message` for more details.
    return;
  }
  if (eventType === LocationGeofencingEventType.Enter) {
    console.log("You've entered region:", region);
  } else if (eventType === LocationGeofencingEventType.Exit) {
    console.log("You've left region:", region);
  }
});