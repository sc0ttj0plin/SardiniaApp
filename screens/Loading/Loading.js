import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { AsyncOperationStatusIndicator} from "../../components";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import actions from '../../actions';
import * as Linking from 'expo-linking';
import * as Constants from '../../constants';


class LoadingScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loginData: null,
      isLoggedIn: false,
      url: null,
    };
    this.authSubscription = () => {};
  }

  //////////////////////////////////////
  async componentDidMount() {
    //Get received url (app is closed)
    const url = await Linking.getInitialURL();
    if (url) {
      this.props.actions.setUrl(url);
      this._parseUrl(url);
    }
    //or app is opened 
    Linking.addEventListener('url', ({ url }) => {
      this.props.actions.setUrl(url);
      this._parseUrl(url);
    });

    await this._checkEmail();
  }

  //////////////////////////////////////
  _parseUrl = async (url) => {
    //Login url type
    if (url.indexOf("apiKey") >=0)
      this.props.actions.passwordLessLinkHandler(url);
  }


  ////////////////////////////////////////////////////////
  _checkEmail = async () => {
    //Tries login first ()
    const email = await AsyncStorage.getItem('email');
    if (email)
      this.props.actions.passwordLessLogin();
    else 
      this.props.navigation.navigate("SignInUp");
  }
  

  ////////////////////////////////////////////////////////
  async componentDidUpdate(prevProps) {
    //auth is updated by passwordLessLogin action
    if (this.props.auth !== prevProps.auth)
      this._verifyLoginState();
  }

  ////////////////////////////////////////////////////////
  _verifyLoginState = () => {
    if (!this.props.auth.loading) {
      if (this.props.auth.success) {
        this.props.navigation.navigate(Constants.NAVIGATION.NavTabNavigator);
      } else {
        this.props.navigation.navigate("SignInUp");  //Signup
      }
    }
  }

  //////////////////////////////////////
  _isSuccessData = () => this.props.auth.success;
  _isLoadingData = () => this.props.auth.loading;
  _isErrorData = () => this.props.auth.error;

  //////////////////////////////////////
  _renderLoadingOutcome = () =>
      <AsyncOperationStatusIndicator 
        size={"large"} 
        loading={true} 
        retryText="Retry"
        error={this._isErrorData()} 
        success={this._isSuccessData()} 
      />;

  //////////////////////////////////////
  render() {
    return (
      <View style={styles.fill}>
        {this._renderLoadingOutcome()}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  fill: {
    flex:1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  loadingOutcome : {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});


function LoadingScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <LoadingScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    locale: state.localeState,
    auth: state.authState,
    other: state.otherState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(LoadingScreenContainer)


