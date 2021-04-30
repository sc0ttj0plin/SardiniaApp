import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import _ from 'lodash';
import CustomText from "./CustomText";

/**
 * ExtraItem is a list item component used in the Extra screen 
 */
class SectionTitle extends PureComponent{ 
  constructor(props) {
    super(props);
  }
  
  render() {
    const { text, style, textStyle, numberOfLines } = this.props;
    return (
      <View style={[styles.sectionTitleView, style]}>
        <CustomText numberOfLines={numberOfLines} style={[styles.sectionTitle, textStyle]}>{text}</CustomText>
      </View>
      );
    }
}

const styles = StyleSheet.create({ 
  sectionTitleView: {
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    color: "black",
    fontFamily: "montserrat-bold",
    textAlign: "center"
  }

});

export default SectionTitle;