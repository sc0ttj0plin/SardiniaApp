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

const INITIAL_AUTH_FSM_STATE = "emailInput"; /* Possible states: emailInput, emailSent, loginSuccess, loginError, logout */
class Login extends Component {

  constructor(props) {

    super(props);
    this.state = {
      email: "",
      authFSM: INITIAL_AUTH_FSM_STATE, 
      isVerifyingEmail: false,
      name: "",
      surname: "",
      birth: "",
      country: "",
      sex: "",
    };
  }

  componentDidMount() {
    if (this.props.auth.user)
      this.setState({ authFSM: "logout" });
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

  _setUserData = () => {
    const { name, surname, birth, country, sex, } = this.state;
    const userData = { name, surname, birth, country, sex, };
    this.props.actions.editUser(userData);
    this.props.navigation.goBack();
  }

  _onLogoutPress = () => {
    this.props.actions.logout();
    this.props.navigation.goBack();
  }

  _onBackPress = () => {
    const { authFSM } = this.state;
    if (authFSM === "emailInput" || authFSM === "logout") 
      this.props.navigation.goBack();
    else 
      this.setState({ authFSM: "emailInput" });
  }

  renderAuthOutcome = () => {
    if (this.props.auth.loading) return (<CustomText style={styles.errorBox}>Login in corso..</CustomText>);
    if (this.props.auth.error) return (<CustomText style={styles.errorBox}>Errore: {this.props.auth.error}</CustomText>);
    if (this.props.auth.success) return (<CustomText style={styles.errorBox}>Autenticazione riuscita!</CustomText>);
  }

  _renderLogout = () => {
    const { logoutMsg, logoutBtn } = this.props.locale.messages;
    return (
      <View style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view1}>
            <CustomText style={styles.text0}>{logoutMsg}</CustomText> 
            <View>
              <TouchableOpacity style={styles.signInButton} onPress={this._onLogoutPress}>
                <CustomText style={styles.registerTxt}>{logoutBtn}</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderLoginSuccess = () => {
    const { name, surname, birth, country, sex, confirm, fillInformation } = this.props.locale.messages;
      return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1s}>
          <CustomText style={styles.text0}>{fillInformation}</CustomText> 
          <Form>
            <Item style={styles.item1} regular>
              <Input placeholder={name} onChangeText={(text) => this.setState({name: text})} />
            </Item>
            <Item style={styles.item1} regular>
              <Input placeholder={surname} onChangeText={(text) => this.setState({surname: text})} />
            </Item>
            <Item style={styles.item1} regular>
              <Input placeholder={birth} onChangeText={(text) => this.setState({birth: text})} />
            </Item>
            <Item style={styles.item1} regular>
              <Input placeholder={country} onChangeText={(text) => this.setState({country: text})} />
            </Item>
            <Item style={styles.item1} regular>
              <Input placeholder={sex} onChangeText={(text) => this.setState({sex: text})} />
            </Item>
          </Form>
          </View>
          <TouchableOpacity style={styles.signInButton} onPress={this._setUserData}>
              <CustomText style={styles.registerTxt}>{confirm}</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _renderMailInput = () => {
    const { isVerifyingEmail } = this.state;
    const { next } = this.props.locale.messages;
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view01}>
            <Form>
              <Item style={styles.item} regular>
                <View style={{marginLeft: 20, marginRight: 10}}>
                </View>
                <Input placeholder="Email" onChangeText={(email) => this.setState({email: email.toLowerCase()})} />
              </Item>
            </Form>
            <TouchableOpacity style={styles.signInButton} onPress={this._validateForm}>
              {isVerifyingEmail ? 
              <ActivityIndicator animating={isVerifyingEmail} size={"small"} color={Colors.tintColor}/>
              :
              <CustomText style={styles.registerTxt}>{next}</CustomText>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  _renderMailSent = () => {
    const { sentLink, checkInbox } = this.props.locale.messages;
    return (
      <View style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view1}>
            <CustomText style={styles.text0}>
              {sentLink}
            </CustomText> 
            <CustomText style={styles.text1}>
              {checkInbox}
            </CustomText>
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
              <CustomText style={styles.text0}>
                We are sorry but the login was unsuccessful
              </CustomText>
              <TouchableOpacity style={styles.signInButton} onPress={() => this.setState({ authFSM: "emailInput" })}>
                <CustomText style={styles.registerTxt}>RETRY</CustomText>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  render() {
    ///contain, cover, stretch, center, repeat.
    const { authFSM } = this.state;
    if (!this.props.auth.success) {
      // Not yet authenticated (input -> sent -> error)
      const { register } = this.props.locale.messages;
      return (
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} />
          <CustomText style={styles.title}>{register}</CustomText>
          {authFSM === "emailInput" && this._renderMailInput()}
          {authFSM === "emailSent" && this._renderMailSent()}
          {authFSM === "loginError" && this._renderLoginError()}
        </View>
      )
    } else if (this.props.auth.success && authFSM === "loginSuccess") {
      return (
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} />
          {this._renderLoginSuccess()}
        </View>
      );
    } else if (this.props.auth.user) {
      // Authenticated but yet in emailInput (initial state) logout
      return (
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} />
          {this._renderLogout()}
        </View>
      );
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
  title: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    height: 40,
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
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
  view1s: {
    width: Layout.window.width - 50, 
    alignItems: 'center', 
    marginTop: 50, 
    justifyContent: 'center' 
  },
  text0: { 
    textAlign: 'center', 
    fontSize: 17, 
    color: "#3E3E3D",
    marginBottom: 20
  },
  text1: { 
    textAlign: 'center', 
    fontSize: 15, 
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
    marginBottom: 20,
    fontWeight: "300"
  },
  registerTxt: {
    color: "white",
    fontFamily: "montserrat-bold"
  },
  reporterText: {
    textAlign: 'center',
    fontSize: 15,
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
    marginTop: 40,
    minWidth: 203,
    height: 36,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    display: "flex",
  },
  bottomText: { 
    fontSize: 14,
    lineHeight: 18,
    color: Colors.blue 
  },
  forgotPswButton: {
    width: '100%',
    justifyContent: 'center',
    height: 50,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 17,
  },
  forgotPswText: {
    textAlign: 'center',
    fontSize: 15,
  },
  reporterButton: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 5
  },
  item1: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: 55,
    marginTop: 5,
    marginBottom: 5,
    borderColor: "white",
    borderBottomColor: "black",
    backgroundColor: Colors.lightGray,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  item: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: 55,
    marginTop: 10,
    marginBottom: 20,
    borderColor: "white",
    borderBottomColor: "black",
    backgroundColor: Colors.lightGray,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  text: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    maxWidth: '100%',
  },
  errorBox: {
    backgroundColor: 'transparent',
    maxWidth: 250, //avoid form resize!
    textAlign: 'center',
    fontSize: 15,
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



