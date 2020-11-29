import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import Colors from '../constants/Colors';
import BoxWithText from "./BoxWithText"; 
import { TouchableOpacity } from "react-native-gesture-handler";
import _ from 'lodash';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from "./CustomText";

class ExtrasListItem extends PureComponent{ 
  constructor(props) {
    super(props);
    this.state = {
      width: 0,
    };
  }

  onPress = () => {}
  
  render() {
    let title =  _.get(this.props.item, "title", null);
    let image =  _.get(this.props.item, "image", "https://via.placeholder.com/300x150");
    // console.log("image and title", image, title, this.props.item)
    return (
      <View style={styles.container} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width }); }}>
          <Image 
            source={{ uri: image }} 
            style={[styles.image, { width: this.state.width, height: this.state.height }, this.props.imageStyle]} 
            PlaceholderContent={<ActivityIndicator style={styles.spinner} color={"white"} />}
            >
        <View style={{
            width: "100%",
            backgroundColor: "transparent",
            justifyContent: "center",
            alignItems: "center"
        }}>
          <Text style={{
                color: "white",
                textTransform: "uppercase",
                fontFamily: "montserrat-bold",
                fontSize: 28,
                lineHeight: 26,
                alignSelf: "center",
                width: 200,
                textAlign: "center",
                marginBottom: 30,
            }}>
                {title}
            </Text>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={this.props.onPress ? this.props.onPress : this.onPress}
                style={{
                    justifyContent: "center",
                    alignSelf: "center",
                    backgroundColor: "#00000055",
                    marginTop: 100
                }}>
                    <Text style={{
                        color: "white",
                        borderColor: "white",
                        borderWidth: 2,
                        padding: 5,
                        paddingHorizontal: 15,
                        fontFamily: "montserrat-bold",
                    }}>APPROFONDISCI</Text>
            </TouchableOpacity>


        </View>
          </Image>
      </View>
      );
    }
}

const styles = StyleSheet.create({ 
    spinner: {
      marginTop: 40
    },
    container: {
      overflow: "hidden",
      height: 450,
      marginBottom: 2,
      flexDirection: "column",
      justifyContent: 'center',
      alignItems: 'center',
      position: "relative",
      textAlignVertical: "center",
    },
    titlePrefix: {
      fontSize: 15,
      color: "#ffffff",
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10,
      textAlign: "center",
    },
    title: {
      fontSize: 20,
      color: "#ffffff",
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10,
      padding: 10,
      textAlign: "center"
    },
    image: {
      resizeMode: "cover",
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    titleContainer: {
      width: "60%",
      height: "60%",
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center"
    },
    titleContainerBackground:  {
      width: 200,
      backgroundColor: "rgba(60,66,72, 0.8)",
      paddingVertical: 25,
      paddingHorizontal: 15
    }

});

export default ExtrasListItem;