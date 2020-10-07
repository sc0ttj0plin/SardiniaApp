import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import {distanceToString} from '../helpers/maps'

/**
 * Similar to PoiItemsList but with geographical information 
 */
class GeoRefHListItem extends PureComponent{ 
  constructor(props){
    super(props);
    this.state = {
      width: 160,
      height: 160
    }
  }
  render() {
    return (
      <View style={[styles.container, this.props.style]} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) }}>
          <Image source={{ uri: this.props.image }} style={styles.image, {width: this.state.width, height: this.state.height}} PlaceholderContent={<ActivityIndicator />}>
            <View style={styles.textContainer}>
              <Text
              numberOfLines={1}
              ellipsizeMode='tail'
              style={styles.title}>{this.props.title}
              </Text>
              { this.props.place &&
                <Text 
                numberOfLines={1}
                ellipsizeMode='tail'
                style={styles.place}>{this.props.place}
                </Text>
              }
              { this.props.distance &&
                (
                  <Text 
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    style={styles.distance}>{distanceToString(this.props.distance * 100)}
                    </Text>
                )
              }
            </View>
          </Image>
      </View>
      );
    }
}

const styles = StyleSheet.create({  
    container: {
      backgroundColor: "#F5FCFF",
      alignItems: "flex-start",
      borderRadius: 10,
      overflow: "hidden"
    },
    title: {
      fontSize: 12,
      fontWeight: "bold"
    },
    place: {
      fontSize: 10
    },
    distance: {
      fontSize: 10,
      fontWeight: "bold",
    },
    image: {
      resizeMode: "cover",
      width: 160,
      height: 160
    },
    textContainer: {
      position: "absolute",
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.7)",
      padding: 5,
      width: "100%"
    }
});

export default GeoRefHListItem;