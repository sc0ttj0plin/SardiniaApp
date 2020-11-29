import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomText from "./CustomText";

/**
 * Box with text component, used in PlacesScreen to show pois categories (e.g. Art..)
 */
class BoxWithText extends PureComponent { 
  constructor(props) {
    super(props);
    this.state = {
      width: 0
    };
  }

  hexToRgb = (hex, opacity) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let r =  parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    let color;
    if(opacity >= 0 && opacity <= 1)
      color = `rgba(${r}, ${g}, ${b}, ${opacity})}`;
    else 
      color = `rgb(${r}, ${g}, ${b})}`;
    return color;
  }
  

  render() {
    let backgroundColor = this.props.opacityBackground ? (`rgba(60, 66, 72, ${this.props.opacityBackground})`) : "";

    if(this.props.backgroundColor)
      backgroundColor = this.hexToRgb(this.props.backgroundColor, this.props.opacityBackground);

    return (
        <View style={[styles.titleContainer, this.props.extraStyle]}>
            <View style={[styles.titleContainerBackground, {
              backgroundColor: backgroundColor
              }]}>
                <Text style={[styles.title, this.props.titleStyle]}>
                    {this.props.title}
                </Text>
                {
                  this.props.visibleBoxes &&
                  <View style={styles.boxes}>
                      <View style={styles.box1}></View>
                      <View style={styles.box2}></View>
                      <View style={styles.box3}></View>
                      <View style={styles.box4}></View>
                  </View>
                }
            </View>
        </View>
      );
    }
}

const styles = StyleSheet.create({ 
    title: {
      fontSize: 16,
      color: "#ffffff",
      padding: 10,
      textAlign: "center",
      fontWeight: "300"
    },
    titleContainer: {
      width: "100%",
      height: "60%",
      alignSelf: "flex-end",
      justifyContent: "flex-end",
      alignItems: "flex-end"
    },
    titleContainerBackground:  {
      width: "100%",
      backgroundColor: "rgba(60,66,72, 0.8)"
    },
    boxes: {
        position: "absolute",
        width: "117%",
        alignSelf: "center",
        height: 10,
        backgroundColor: "white",
        flexDirection: "row",
        marginTop: -10
    },
    box1: {
        backgroundColor: "#154A7D",
        flex: 1
    },
    box2: {
        backgroundColor: "#F59F1C",
        flex: 1
    },
    box3: {
        backgroundColor: "#50712A",
        flex: 1
    },
    box4: {
        backgroundColor: "#D95620",
        flex: 1
    }
});

export default BoxWithText;