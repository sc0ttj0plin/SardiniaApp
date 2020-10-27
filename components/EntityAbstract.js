import React, {PureComponent} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Constants from '../constants';
import HTML from 'react-native-render-html';

export default class EntityAbstract extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { abstract } = this.props;
    let show = abstract != "" && abstract != null ? true : false
    return (
      <>
        { show &&(
          <HTML containerStyle={[Constants.styles.innerText]} html={"<font style=\"" + Constants.styles.html.shortText + "\">" + abstract + "</font>"} />
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  }
});