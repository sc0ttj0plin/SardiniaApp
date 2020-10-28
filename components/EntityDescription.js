import React, {PureComponent} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Constants from '../constants';
import HTML from 'react-native-render-html';

export default class EntityDescription extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { text, title, color } = this.props;
    return (
      <>
        { text != "" && text &&(
          <View style={[Constants.styles.innerText, styles.container]}>
            <Text style={[styles.title, {
              color: color || "black"
            }]}>{title}</Text>
            {/* <View style={styles.borderLine}></View> */}
            <HTML html={"<font style=\"" + Constants.styles.html.longText + "\">" + text + "</font>"} />
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
    height: 7,
    width: 100,
    alignSelf: "center",
    backgroundColor: "#F59F1C", 
    width: 60, 
    marginTop: -5, 
    marginBottom: 25
  },
  title: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    // opacity: 0.6,
    color: "black",
    fontWeight: "bold"
  },
  container: {
    flexDirection: "column"
  }
});