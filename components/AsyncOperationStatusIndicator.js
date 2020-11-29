import React, { PureComponent } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Button } from "react-native-elements";
import CustomText from "./CustomText";

/**
 * Displays a spinner while loading, on error shows a message and optionally renders a retry button
 */
class AsyncOperationStatusIndicator extends PureComponent {
  constructor(props){
    super(props)
    const { loading, success, error } = props
    this.state = {
      loading: loading,
      success: success,
      error: error
    }
  }

  componentDidUpdate(prevProps){
    if(prevProps.loading !== this.props.loading)
      this.setState({loading: this.props.loading})
    if(prevProps.success !== this.props.success){
      this.setState({success: this.props.success})
    }
    if(prevProps.error !== this.props.error)
      this.setState({error: this.props.error})
  }

  render() {
    const { loading, success, error } = this.state;
    if (loading && this.props.loadingLayout && !success){
      return this.props.loadingLayout
    }
    else if(loading && !this.props.loadingLayout)
      return <ActivityIndicator animating={loading} size={this.props.size || "small"} color={this.props.color || 'grey'}></ActivityIndicator>
    else if (error) {
      if (this.props.retry || this.props.retryFun)
        return (
          <View style={styles.view}>
            {this.props.loadingLayout}
            <Text style={[styles.text, this.props.errorStyle]}>{error}</Text>
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
          <View style={styles.view}>
            {this.props.loadingLayout}
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
            </View>
          </View>
        )
    }
    else if(success){
      return(
        <>
          {this.props.children}
        </>
      ) 
    }
    else
      return null;
  }
}


const styles = StyleSheet.create({
  view: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    position: "relative"
  },
  text: {
    marginBottom: 30, 
    color: "black"
  },
  error: {
    fontSize: 16,
    color: "red",
    fontFamily: "montserrat-bold",
    alignSelf: "center"
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
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


export default AsyncOperationStatusIndicator;
