import React, { Component } from 'react';
import {  Platform, KeyboardAvoidingView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { ConnectedHeader, CustomText } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { View, Form, Item, Input } from 'native-base';
import { validateFields } from '../../helpers/utils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import Colors from '../../constants/Colors';
import * as Constants from '../../constants';


class Login extends Component {

  constructor(props) {

    super(props);
    this.state = {
      email: "",
      authFSM: "emailInput", /* Possible states: emailInput, emailSent, loginSuccess, loginError */
      isVerifyingEmail: false,
    };
  }

  componentDidMount() {
    if (this.props.auth.user) {
      Alert.alert(
        "Auth",
        "Logout?",[{
            text: "Cancel",
            onPress: () => this.props.navigation.goBack(),
            style: "cancel"
          }, { 
            text: "OK", 
            onPress: () => {
              this.props.actions.logout();
              this.props.navigation.goBack();
            },
        }],
        { cancelable: false }
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth !== prevProps.auth)
      this._verifyLoginState();
  }
  
  _verifyLoginState = async () => {
    if (this.props.auth.success)
      this.setState({ authFSM: "loginSuccess" });
    else if (this.props.auth.error)
      this.setState({ authFSM: "loginError" });
  }

  _validateForm = async () => {
    const { email } = this.state;
    if (!Constants.VALIDATORS.email.test(email)) {
      alert('Invalid email');
    } else {
      this.props.actions.passwordLessSignup(email);
      this.setState({ authFSM: "emailSent" });
    }
  }

  renderAuthOutcome = () => {
    if (this.props.auth.loading) return (<Text style={styles.errorBox}>Login in corso..</Text>);
    if (this.props.auth.error) return (<Text style={styles.errorBox}>Errore: {this.props.auth.error}</Text>);
    if (this.props.auth.success) return (<Text style={styles.errorBox}>Autenticazione riuscita!</Text>);
  }

  _renderLoginSuccess = () => {
    return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1}>
              <Text style={styles.text0}>
                Registration successful
              </Text>
              <Text style={styles.text1}>
                Now loading...
              </Text>
          </View>
        </View>
      </View>
    )
  }

  _renderMailInput = () => {
    const { isVerifyingEmail } = this.state;
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view01}>
            <Text style={styles.loginText}>Email</Text>
            <Form>
              <Item style={styles.item} regular>
                <View style={{marginLeft: 20, marginRight: 10}}>
                </View>
                <Input placeholder="Email" style={{ letterSpacing: 1 }}  onChangeText={(email) => this.setState({email: email.toLowerCase()})} />
              </Item>
            </Form>
            <TouchableOpacity style={styles.signInButton} onPress={this._validateForm}>
              {isVerifyingEmail ? 
              <ActivityIndicator animating={isVerifyingEmail} size={"small"} color={Colors.tintColor}/>
              :
              <Text style={styles.registerTxt}>Mandami il link</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  _renderMailSent = () => {
    return (
      <View style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view1}>
            <Text style={styles.text0}>
              Ti abbiamo mandato un link
            </Text> 
            <Text style={styles.text1}>
              Check your inbox
            </Text>
          </View>
        </View>
      </View>
    );
  }

  _renderLoginError = () => {
    return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1}>
              <Text style={styles.text0}>
                We are sorry but the login was unsuccessful
              </Text>
              <TouchableOpacity style={styles.signInButton} onPress={() => this.setState({ authFSM: "emailInput" })}>
                <Text style={styles.registerTxt}>RETRY</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  render() {
    if (!this.props.auth.user) {
      ///contain, cover, stretch, center, repeat.
      const { authFSM } = this.state;
      return (
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader />
          {authFSM === "emailInput" && this._renderMailInput()}
          {authFSM === "emailSent" && this._renderMailSent()}
          {authFSM === "loginError" && this._renderLoginError()}
          {authFSM === "loginSuccess" && this._renderLoginSuccess()}
        </View>
      )
    } else {
      return null;
    }
  }
}


const styles = StyleSheet.create({
  maxContentWith: 250,
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  screen: {
    flex:1, 
    backgroundColor: 'white', 
    marginTop: Layout.statusbarHeight
  },
  view0: { 
    flex: 1, 
    alignItems: 'center' 
  },
  view01: {
    width: Layout.window.width - 40, 
    alignItems: 'center', 
    marginTop: 20, 
    justifyContent: 'center' 
  },
  mainView: {
    flex:1, 
    backgroundColor: 'white' 
  },
  view1: {
    width: Layout.window.width - 50, 
    alignItems: 'center', 
    marginTop: 30, 
    justifyContent: 'center' 
  },
  text0: { 
    textAlign: 'center', 
    fontSize: 17, 
    letterSpacing: 1,
    color: "#3E3E3D",
    marginBottom: 20
  },
  text1: { 
    textAlign: 'center', 
    fontSize: 15, 
    letterSpacing: 1,
    color: "#3E3E3D",
    marginBottom: 40
  },
  logoView: {
    alignItems: "center", 
    marginBottom: 20
  },
  logoSavengr: {
    width: 59,
    height: 15,
    resizeMode: "contain"
  },
  poweredByText: {
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 1,
  },
  emailIcon: { 
    width: 20,
    height: 14,
    resizeMode: "contain"
  },
  logo: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
    marginTop: 25,
    marginBottom: 15
  },
  loginText: {
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 1,
    marginBottom: 20,
    fontWeight: "300"
  },
  registerTxt: {
    letterSpacing: 1,
    color: Colors.tintColor,
  },
  reporterText: {
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 1,
    color: '#fff'
  },
  socialButton: {
    width: 46,
    height: 46,
    marginTop: 15,
    justifyContent: 'center',
    borderRadius: 23,
  },
  socialIcon: {
    color: '#fff'
  },
  signInButton: {
    width: '100%',
    backgroundColor: 'white',
    height: 50,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.2,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  bottomText: { 
    letterSpacing: 1,
    fontSize: 14,
    lineHeight: 18,
    color: Colors.blue 
  },
  registerButton: {
    width: '100%',
    justifyContent: 'center',
    height: 45,
    marginTop: 5
  },
  forgotPswButton: {
    width: '100%',
    justifyContent: 'center',
    height: 50,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 17,
    letterSpacing: 1,
  },
  forgotPswText: {
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 1,
  },
  reporterButton: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 5
  },
  item: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: 55,
    marginTop: 10,
    marginBottom: 20,
    borderColor: Colors.tintColor,
    backgroundColor: 'transparent'
  },
  text: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    letterSpacing: 1,
    maxWidth: '100%',
  },
  errorBox: {
    backgroundColor: 'transparent',
    maxWidth: 250, //avoid form resize!
    textAlign: 'center',
    fontSize: 15,
    letterSpacing: 1,
    marginBottom: 10
  },
  content: {
    width: 250,
    paddingLeft: 10,
    paddingRight: 10,
  },
  image0: { 
    marginTop: 20, 
    alignSelf: 'center', 
    width: 120, 
    height: 120, 
    resizeMode: "contain", 
    borderRadius: 60 
  },
});


function LoginContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <Login 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    auth: state.authState,
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
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
})(LoginContainer)



