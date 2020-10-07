import React, { PureComponent } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Color from '../../constants/Colors';

export default class NumberedMarker extends PureComponent {
  
  constructor() {
    super();
    this.state = {
      tracksViewChanges: true,
    };
  }

  render() {
    const { tracksViewChanges } = this.state;
    return (
        <Marker
          {...this.props}
          tracksViewChanges={false}
        >
          <View style={styles.marker}>
            <Text style={styles.text}>{this.props.num}</Text>
          </View>
        </Marker>
      );
  }
}



const styles = StyleSheet.create({
  marker: {
    transform: [
      { rotateZ: "-45deg" },  
    ],
    width: 30,
    height: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: Color.orange,
    borderColor: 'black',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text:{
    transform: [
      { rotateZ: "45deg" },  
    ],
    alignSelf: 'center'
  }

});

