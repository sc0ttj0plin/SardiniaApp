import React, { PureComponent } from "react";
import { StyleSheet, View, Text, Image, ActivityIndicator, PixelRatio } from "react-native";
import ScrollableContainerTouchableOpacity from "../map/ScrollableContainerTouchableOpacity";
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from "../others/CustomText";
import ShimmerWrapper from "../loading/ShimmerWrapper"
import AnimatedImage from "../others/AnimatedImage";


/**
 * List item element that represents a category
 */
class CategoryListItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      width: 0
    };
    this._fontScale = PixelRatio.getFontScale();
  }

  componentDidMount () {

  }

  _renderBottomBox = (title, showBoxes, opacityBackground, bgColor) => {
    let backgroundColor = (`rgba(255, 255, 255, 0.80)`);

    return (
      <LinearGradient style={[styles.titleContainer]}
            colors={[backgroundColor, 'rgba(240,240,240,1)']}>
              <CustomText style={[styles.title]}>
                  {title}
              </CustomText>
      </LinearGradient>
    );
  }

  render() {
    var image = this.props.image;



    return (
      <ScrollableContainerTouchableOpacity onPress={this.props.onPress} activeOpacity={0.7} style={[styles.container, this.props.style]} >
       <ShimmerWrapper shimmerStyle={styles.shimmer} />
       <View style={[styles.fill]}>
        <AnimatedImage
            image={image}
            style={styles.image}
            animated={true}>
          </AnimatedImage>
          {this._renderBottomBox(this.props.title, true, 0.8)}
        </View>
      </ScrollableContainerTouchableOpacity>
      );
    }
}

const styles = StyleSheet.create({
    fill: {
      width: "100%",
      height: "100%",
    },
    container: {
      flex: 1,
      borderRadius: 8,
      overflow: "hidden",
      height: 160,
      marginTop: 0,
      flexDirection: "column",
      justifyContent: 'center',
      alignItems: 'center',
      position: "relative",
      textAlignVertical: "center",
    },
    shimmer: {
      width: "100%",
      height: "100%",
      position: "absolute"
    },
    image: {
      resizeMode: "cover",
      position: "absolute",
      backgroundColor: "transparent",
      width: "100%",
      height: "100%",
    },
    title: {
      fontSize: 18,
      color: "black",
      fontFamily: "montserrat-bold",
      padding: 10,
      textAlign: "center",
    },
    titleContainer:  {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 40,
      position: "absolute",
      bottom: 0
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

export default CategoryListItem;
