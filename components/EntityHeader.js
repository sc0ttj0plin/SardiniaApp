import React, {PureComponent} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';
import CustomText from "./CustomText";

export default class EntityHeader extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { term, title, borderColor } = this.props;
    return (
      <>
        <View style={styles.topLineContainer}>
          <View style={styles.topLine}/>  
        </View>
        { term != "" && term &&(
          <View style={[styles.categoryContainer]}>
            <CustomText style={[styles.category]}>{term}</CustomText>
            <View style={[styles.borderLine, {backgroundColor: borderColor || Colors.blue}]}></View>
          </View>
        )}
        <CustomText style={[styles.title]}>{title}</CustomText>
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  categoryContainer: {
    flexDirection: "column",
    justifyContent: "center"
  },
  borderLine: {
    height: 4,
    width: 61,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 16
  },
  category: {
    fontSize: 15,
    flex: 1,
    textAlign: "center",
    fontFamily: "montserrat-bold",
    opacity: 0.8,
    color: "#666666"
  },
  title: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    color: "#000000E6",
    fontFamily: "montserrat-bold",
    paddingHorizontal: 30
  },
  topLineContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  topLine: {
    width: 32,
    height: 4,
    backgroundColor: "#0000001A",
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 16
  }
});