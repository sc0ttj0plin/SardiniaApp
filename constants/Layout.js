import { Dimensions, Platform, NativeModules } from 'react-native';
const { StatusBarManager } = NativeModules;

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const diagonal = Math.sqrt(width*width + height+height);

export default {
  window: {
    width: width,
    height: height,
    vPadding: 10,
    diagonal: diagonal
  },
  list: {
    vPadding: 10,
    gridInnerVPadding: 10,
    gridInnerHPadding: 10
  },
  statusbarHeight: Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT,
  header:{
    height: Platform.OS === 'ios' ? 66 : 56,
    map: {
      scale: 0.95,
      top: 8
    }
  },
  isSmallDevice: width < 375,
  map: {
    markerPixels: 200,
    card: {
      width: 220,
      height: 150,
      paddingVertical: 10
    }
  },
  
};

