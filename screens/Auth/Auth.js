import React, { Component } from 'react';
import {  Platform, KeyboardAvoidingView, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { ConnectedHeader, CustomText } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { View, Form, Item, Input, Picker, DatePicker } from 'native-base';
import { validateFields } from '../../helpers/utils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import Colors from '../../constants/Colors';
import * as Constants from '../../constants';
import itCountries from "world_countries_lists/data/it/countries.json";
// import enCountries from "world_countries_lists/data/en/countries.json";


// console.log("itcountries", itCountries)
const INITIAL_AUTH_FSM_STATE = "emailInput"; /* Possible states: emailInput, emailSent, selectedEntity, loginError, logout */
class Login extends Component {

  constructor(props) {

    super(props);
    this.state = {
      email: "",
      authFSM: "selectedEntity", 
      isVerifyingEmail: false,
      username: "",
      usernameError: false,
      name: "",
      nameError: false,
      surname: "",
      surnameError: false,
      birth: "",
      birthError: false,
      country: "",
      countryError: false,
      sex: "",
      sexError: false,
      countries: []
    };
  }

  componentDidMount() {
    if (this.props.auth.user)
    {
      if(this.props.auth.user.info) {
        this.setState({ authFSM: "logout" });
      } else {
        this._setCountries();
        this.setState({ authFSM: "selectedEntity" });
      }
    }
    else
      this.setState({ authFSM: "emailInput" });
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth !== prevProps.auth)
      this._verifyLoginState();
  }

  _setCountries = () => {
    var countries = [];
    countries.push({});
    var italy = null;
    var italyKey = null;
    itCountries.map((country, key) => {
      if(country.alpha2 == "it") {
        italy = {...country};
        italyKey = key;
      } else {
        countries.push({...country});
      }
    });
    if(italy) {
      countries[0] = italy;
    }
    this.setState({ countries: countries});
  }
  
  _verifyLoginState = async () => {
    if (this.props.auth.success) {
      this._setCountries();
      this.setState({ authFSM: "selectedEntity" });
    }
    else if (this.props.auth.error) {
      this.setState({ authFSM: "loginError" });
    }
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
    const { username, name, surname, birth, country, sex, } = this.state;
    const { country: countryText, sex: sexText, birth: birthText } = this.props.locale.messages;
    let nameError = false 
    let surnameError = false 
    let usernameError = false
    let birthError = false 
    let countryError = false 
    let sexError = false

    /*if(!this._validateName(name)){
      nameError = true;
    }
    if(!this._validateName(surname)){
      surnameError = true;
    }*/

    if(!this._validateUserName(username)){
      usernameError = true;
    }
    if(birth == "" || birth == birthText){
      birthError = true;
    }
    if(country == "" || country == countryText){
      countryError = true;
    }
    if(sex == "" || sex == sexText){
      sexError = true;
    }

    if(!usernameError && /*!nameError && !surnameError &&*/ !birthError && !countryError && !sexError){
      const userData = { username, /*name, surname,*/ birth, country, sex, };
      this.props.actions.editUser(userData);
      this.props.navigation.goBack();
    }
    else{
      this.setState({
        nameError,  
        surnameError, 
        birthError, 
        countryError, 
        sexError,
        usernameError
      })

    }

  }

  _onLogoutPress = () => {
    this.props.actions.logout();
    this.props.navigation.goBack();
  }

  _onBackPress = () => {
    const { authFSM } = this.state;
    if (authFSM === "emailInput" || authFSM === "logout" || authFSM === "selectedEntity") 
      this.props.navigation.goBack();
    else 
      this.setState({ authFSM: "emailInput" });
  }

  _validateName = (value) => {
    let pattern = null;
    if(value && value.length <= 1)
      pattern = new RegExp("^[A-Z, a-z]{0,30}$");
    else
      pattern = new RegExp("^[A-Z, a-z]{2,30}$");
    let validation = pattern.exec(value);
    if(validation !== null){
      return true;
    }
    else
      return false
  }

  _validateUserName = (value) => {
    let pattern = null;
    pattern = new RegExp("^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$");
    let validation = pattern.exec(value);
    if(validation !== null){
      return true;
    }
    else
      return false
  }


  _setNameField = (stateField, stateFieldError, value) => {
    if(this._validateName(value) || value == ""){
      this.setState({
        [stateField]: value,
        [stateFieldError]: false
      })
    }
  }

  _setUsernameField = (stateField, stateFieldError, value) => {
    if(this._validateUsername(value)){
      this.setState({
        [stateField]: value,
        [stateFieldError]: false
      })
    }
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
  
  _renderSelectedEntity = () => {
    const { username, name, surname, birth, country, sex, confirm, fillInformation, man, woman } = this.props.locale.messages;
    const {nameError, surnameError, usernameError, birthError, countryError, sexError} = this.state;

      return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1s}>
          <CustomText style={styles.text0}>{fillInformation}</CustomText> 
          <Form>
            <Item style={[styles.item1, usernameError ? styles.itemError : {}]} regular>
              <Input placeholder={username}  style={{fontFamily: "montserrat-regular"}} value={this.state.username} onChangeText={(text) => this._setNameField("username", "usernameError",text)} />
            </Item>
            <Item style={[styles.item1, birthError ? styles.itemError : {}]} regular>
              {/* <Input placeholder={birth} onChangeText={(text) => this.setState({birth: text})} /> */}
              <DatePicker
                minimumDate={new Date(1900, 1, 1)}
                maximumDate={new Date()}
                locale={"it"}
                timeZoneOffsetInMinutes={undefined}
                modalTransparent={false}
                animationType={"fade"}
                androidMode={"default"}
                placeHolderText={birth}
                placeHolderTextStyle={{width: Layout.window.width - 50, fontFamily: "montserrat-regular"}}
                textStyle={{ color: "black", width: Layout.window.width - 50, fontFamily: "montserrat-bold"}}
                onDateChange={(date) => this.setState({birth: date, birthError: false})}
                disabled={false}/>
                
            </Item>
            <Item style={[styles.item1, countryError ? styles.itemError : {}]} regular>
              <Picker
                  mode="dropdown"
                  style={{ width: undefined, fontFamily: "montserrat-regular" }}
                  placeholder={country}
                  textStyle={{fontFamily: "montserrat-regular"}}
                  placeholderStyle={{ color: "#bfc6ea", fontFamily: "montserrat-regular" }}
                  selectedValue={this.state.country}
                  onValueChange={(value) => this.setState({country: value, countryError: false})}>
                  <Picker.Item label={country} value={country} />
                  {
                      this.state.countries.map( country => {
                       return <Picker.Item label={country.name} value={country.name} />
                      })
                  }
                </Picker>
            </Item>
            <Item style={[styles.item1, sexError ? styles.itemError : {}]} regular>
              {/* <Input placeholder={sex} onChangeText={(text) => this.setState({sex: text})} /> */}
              <Picker
                  mode="dropdown"
                  style={{ width: undefined, fontFamily: "montserrat-regular" }}
                  placeholder={sex}
                  textStyle={{fontFamily: "montserrat-regular"}}
                  placeholderStyle={{ color: "#bfc6ea", fontFamily: "montserrat-regular" }}
                  selectedValue={this.state.sex}
                  onValueChange={(value) => this.setState({sex: value, sexError: false})}>
                    <Picker.Item label={sex} value={sex} />
                    <Picker.Item label={woman} value={woman} />
                    <Picker.Item label={man} value={man} />
              </Picker>
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
                <Input autoCapitalize={'none'} placeholder="Email" onChangeText={(email) => this.setState({email: email.toLowerCase()})} />
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
    } else if (this.props.auth.success && authFSM === "selectedEntity") {
      return (
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} />
          {this._renderSelectedEntity()}
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
    backgroundColor: 'white',
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
  itemError: {
    borderColor: "red",
    borderBottomColor: "red",
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2
  }
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



