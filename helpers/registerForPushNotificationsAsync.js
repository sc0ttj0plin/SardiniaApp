import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Colors from '../constants/Colors';

async function registerForPushNotificationsAsync(tokenOnly=false) {
  let token = 'ExponentPushToken[12345]';
  if (Constants.isDevice) {
    if (!tokenOnly) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      // only ask if permissions have not already been determined, because iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        alert('Impossibile ottenere il token per le notifiche');
        return;
      }
    }
    // Get the token that uniquely identifies this device
    token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem('expo_token', token);
  } else {
    console.log('Not a physical device but storing anyway!!');
    //TODO: remove
    await AsyncStorage.setItem('expo_token', token);
  }

  //Android only. On Android 8.0+, creates a new notification channel to which local and push notifications
  //may be posted. Channels are visible to your users in the OS Settings app as "categories", and they
  //can change settings or disable notifications entirely on a per-channel basis.
  //NOTE: after calling this method, you may no longer be able to alter the settings for this channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: Colors.tintColor,
    });
  }
  return token;
}

export default registerForPushNotificationsAsync;
