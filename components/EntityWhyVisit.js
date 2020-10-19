import React, {PureComponent} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Constants from '../constants';
import HTML from 'react-native-render-html';

export default class EntityWhyVisit extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { text, title } = this.props;
    return (
      <>
        { text &&(
          <View style={[Constants.styles.innerText, styles.container]}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.borderLine}></View>
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
    marginTop: 25,
    color: "white",
    fontWeight: "bold"
  },
  container: {
    width: "100%",
    marginTop: 30,
    backgroundColor: "#24467C",
    flexDirection: "column",
    paddingBottom: 20
  }
});