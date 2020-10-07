import React, { PureComponent } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from "react-native-elements";
import { Placeholder, PlaceholderMedia, PlaceholderLine, Fade } from "rn-placeholder";

/**
 * Same as AsyncOperationStatusIndicator but using placeholders rather than spinners
 */
class AsyncOperationStatusIndicatorPlaceholder extends PureComponent {
  render() {
    if (this.props.loading)
      return (
        <Placeholder
          Left={PlaceholderMedia}
          Right={PlaceholderMedia}
          Animation={Fade}>
          <PlaceholderLine width={80} />
          <PlaceholderLine />
          <PlaceholderLine width={30} />
        </Placeholder>
      );
    else if (this.props.error) {
      if (this.props.retry || this.props.retryFun)
        return (
          <View style={styles.view}>
            <Text style={[styles.text, this.props.errorStyle]}>{this.props.error}</Text>
            <Button 
              titleStyle={[styles.btnTitle, this.props.btnTitleStyle]} 
              buttonStyle={[styles.btn, this.props.btnStyle]} 
              type="outline" 
              onPress={this.props.retryFun} 
              title={this.props.retryText} 
            />
          </View>
        );
      else 
        return (
          <Text style={styles.text}>{this.props.error}</Text>
        )
    }
    else
      return this.props.children;
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  text: {
    marginBottom: 30, 
    color: "black"
  },
  btnTitle: {
    color: "black"
  },
  btn: {
    marginBottom: 30,
    width: 150,
    height: 50,
    borderRadius: 10,
    borderColor: "black",
  },
});


export default AsyncOperationStatusIndicatorPlaceholder;
