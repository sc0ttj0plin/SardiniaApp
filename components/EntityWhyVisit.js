import React, {PureComponent} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Constants from '../constants';
import HTML from 'react-native-render-html';
import CustomText from "./CustomText";

export default class EntityWhyVisit extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { text, title } = this.props;
    let show = text != "" && text != null ? true : false
    return (
      <>
        { text != "" && text &&(
          <View style={[Constants.styles.innerText, styles.container]}>
            <CustomText style={styles.title}>{title}</CustomText>
            {/* <View style={styles.borderLine}></View> */}
            <HTML html={"<font style=\"" + Constants.styles.html.shortTextSecondary + "\">" + text + "</font>"} />
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  borderLine: {
    backgroundColor: "white",
    height: 7,
    width: 60,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 25
  },
  title: {
    alignSelf: "center",
    color: "#174A7C",
    fontFamily: "montserrat-bold",
    marginBottom: 16,
    fontSize: 18,
    opacity: 1
  },
  container: {
    width: "100%",
    marginTop: 30,
    backgroundColor: "white",
    flexDirection: "column",
    paddingBottom: 20
  }
});