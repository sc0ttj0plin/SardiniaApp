import React, { Component } from 'react';
import {  Platform, KeyboardAvoidingView, StyleSheet, ActivityIndicator, BackHandler, TouchableOpacity, PixelRatio } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { 
  ConnectedHeader, 
  CustomText,
  ConnectedScreenErrorBoundary,
} from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { View, Form, Item, Input, Picker } from 'native-base';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import Colors from '../../constants/Colors';
import * as Constants from '../../constants';
import itDbCountries from "world_countries_lists/data/it/countries.json";
import enDbCountries from "world_countries_lists/data/en/countries.json";
import * as Validate from '../../helpers/validate';
import * as profile from "../../helpers/profile";

const AUTH_STATES = {
  INIT: "INIT",
  LINK_SENT: "LINK_SENT",
  LOGIN_REQUEST:"LOGINREQ",
  PROFILE_REMOVE: "PROFILE_REMOVE",
  PROFILE_EDIT: "PROFILE_EDIT",
  PROFILE_SHOW: "PROFILE_SHOW",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR"
}


class Login extends Component {

  constructor(props) {

    super(props);
    this.state = {
      email: "",
      loginStep: AUTH_STATES.INIT, 
      isVerifyingEmail: false,
      username: "",
      password:"",
      usernameError: false,
      age: "",
      ageError: false,
      country: "",
      countryError: false,
      sex: "",
      sexError: false,
      countries: []
    };
    this._fontScale = PixelRatio.getFontScale();

    this._onHardwareBackButtonClick = this._onHardwareBackButtonClick.bind(this);
  }

  componentDidMount() {

    BackHandler.addEventListener('hardwareBackPress', this._onHardwareBackButtonClick);

    this.setState({
      countries: this._generateCountries(),
      ages: profile.populateAges(Constants.PROFILE.MIN_AGE, Constants.PROFILE.MAX_AGE),
      sexs: this._generateSex()
    });

    
    if (this.props.auth.error) {
      console.log(this.props.auth.error)
      this.setState({ loginStep: AUTH_STATES.ERROR });
    }
    else if (this.props.auth.success && this.props.auth.user)
    {
      if(this.props.auth.user.info) {
        const {info} = this.props.auth.user;
        this.setState({
          loginStep: AUTH_STATES.PROFILE_SHOW,
          username: info.username,
          age: info.age,
          country: info.country,
          sex: info.sex
        })
      } else {
        this.setState({ 
          loginStep: AUTH_STATES.PROFILE_EDIT,
        });
      }
    }
    else {
      this.setState({ loginStep: AUTH_STATES.INIT });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth !== prevProps.auth)
      this._loginStateChanged();
  }

  _onHardwareBackButtonClick = () => {
    if (this.props.isFocused) {
      this._onBackPress();
      return true;
    }
    return false;
  }
  
  _loginStateChanged = async () => {
    if (this.props.auth.user && this.props.auth.user.info) {
      const {info} = this.props.auth.user;
      console.log(info.updateDate);
      this.setState({
        loginStep: AUTH_STATES.PROFILE_SHOW,
        username: info.username,
        age: info.age,
        country: info.country,
        sex: info.sex
      })
    }
    else if (this.props.auth.success) {
      this.setState({ loginStep: AUTH_STATES.PROFILE_EDIT });
    }
    else if (this.props.auth.error) {
      console.log("AUTH_STATES.ERROR");
      this.setState({ loginStep: AUTH_STATES.ERROR });
    }
  }

  _sexToString = (sex) => {
    var {  man, woman, sexNotDefined } = this.props.locale.messages;
    if(sex == profile.SEX.MAN) return man;
    else if (sex == profile.SEX.WOMAN) return woman;
    else if (sex == profile.SEX.NOT_DEFINED) return sexNotDefined;
    return "";
  }

  _generateSex = () => {
    var sex = [];
    var {  man, woman, sexNotDefined } = this.props.locale.messages;
    sex.push({value: profile.SEX.MAN, label: man});
    sex.push({value: profile.SEX.WOMAN, label: woman});
    sex.push({value: profile.SEX.NOT_DEFINED, label: sexNotDefined});
    return sex;
  }

  _generateCountries = () => {
    var countries = [];
    countries.push({});
    var italy = null;
    var italyKey = null;
    const dbCountries = this.props.locale.lan == "it" ? itDbCountries : enDbCountries;
    dbCountries.map((country, key) => {
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
    return countries;
  }

  _validateForm = async () => {
    const { email,password } = this.state;
    if (!Validate.email(email)) {
      alert('Invalid email');
    } else {
      this.props.actions.passwordLessSignup(email,password);
      this.setState({ loginStep: AUTH_STATES.LOGIN_REQUEST });
    }
  }

  _setUserData = () => {
    const { username, age, country, sex, } = this.state;
    const { country: countryText, sex: sexText, age: ageText } = this.props.locale.messages;
    let usernameError = false
    let ageError = false 
    let countryError = false 
    let sexError = false

    if(!Validate.username(username)){
      usernameError = true;
    }
    if(!age || age == ageText){
      ageError = true;
    }
    if(!country || country == countryText){
      countryError = true;
    }
    if(!sex || sex == sexText){
      sexError = true;
    }

    if(!usernameError && !ageError && !countryError && !sexError){
      const userData = { username, age: age, country, sex, updateDate: (new Date()).getTime() };
      this.props.actions.editUser(userData);
      this.props.actions.reportAction({ 
        analyticsActionType: Constants.ANALYTICS_TYPES.userUpdatesProfile,
        meta: userData
      });
      this.setState({ loginStep: AUTH_STATES.PROFILE_SHOW });
    }
    else{
      this.setState({
        ageError, 
        countryError, 
        sexError,
        usernameError
      })

    }

  }

  _removeProfile = () => {
    const { username, age, country, sex, } = this.state;
    const userData = { username, age, country, sex, updateDate: (new Date()).getTime() };
    this.props.actions.reportAction({ 
      analyticsActionType: Constants.ANALYTICS_TYPES.userRemovesProfile,
      meta: userData
    });
    this.props.actions.removeUser();
    this._goBackScreen();
  }

  _logout = () => {
    this.props.actions.logout();
    this._goBackScreen();
  }

  _goBackScreen = () => {
    BackHandler.removeEventListener('hardwareBackPress', this._onHardwareBackButtonClick);
    this.props.navigation.goBack();
  }

  _onBackPress = () => {
    if(this.state.loginStep === AUTH_STATES.PROFILE_REMOVE)
      this.setState({loginStep: AUTH_STATES.PROFILE_SHOW})
    else if(this.state.loginStep === AUTH_STATES.PROFILE_EDIT && !this.props.auth.user.info) /* user has pressed back without completing profile */
      this._goBackScreen();
    else if(this.state.loginStep === AUTH_STATES.PROFILE_EDIT)
      if(this.props.auth.user.info)
        this.setState({loginStep: AUTH_STATES.PROFILE_SHOW})
      else
        this._goBackScreen();
    else if(this.state.loginStep === AUTH_STATES.LOGOUT)
      this.setState({loginStep: AUTH_STATES.PROFILE_SHOW})
    else
      this._goBackScreen();
  }


  _onProfileEditPress = () => {
    const {info} = this.props.auth.user;
    this.setState({
      loginStep: AUTH_STATES.PROFILE_EDIT,
      username: info.username,
      age: info.age,
      country: info.country,
      sex: info.sex
    });
  }

  _onProfileRemovePress = () => {
    this.setState({loginStep: AUTH_STATES.PROFILE_REMOVE});
  }

  _onLogoutPress = () => {
    this.setState({loginStep: AUTH_STATES.LOGOUT});
  }

  _setUsernameField = (stateField, stateFieldError, value) => {
    if(Validate.username(value) || value.length < 4){
      this.setState({
        [stateField]: value,
        [stateFieldError]: false
      })
    }
  }

  _renderAuthOutcome = () => {
    const { successfullLogin, loggingIn, loginError } = this.props.locale.messages;
    if (this.props.auth.loading) return (<CustomText style={styles.errorBox}>{loggingIn}</CustomText>);
    if (this.props.auth.error) return (<CustomText style={styles.errorBox}>{loginError} {this.props.auth.error}</CustomText>);
    if (this.props.auth.success) return (<CustomText style={styles.errorBox}>{successfullLogin}</CustomText>);
  }

  _renderLogout = () => {
    const { logoutMsg, logoutBtn } = this.props.locale.messages;
    return (
      <View style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view1}>
            <CustomText style={styles.text0}>{logoutMsg}</CustomText> 
            <View>
              <TouchableOpacity style={styles.defaultBtn} onPress={this._logout}>
                <CustomText style={styles.defaultBtnText}>{logoutBtn}</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderProfileRemove = () => {
    const { removeProfileMsg, removeProfileBtn} = this.props.locale.messages;
    return (
      <View style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view1}>
            <CustomText style={styles.text0}>{removeProfileMsg}</CustomText> 
            <View>
              <TouchableOpacity style={styles.defaultBtn} onPress={this._removeProfile}>
                <CustomText style={styles.defaultBtnText}>{removeProfileBtn}</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderProfileShow = () => {
    if(!this.props.auth.user.info) 
      return;

      
    const { editProfileBtn, logoutBtn, removeProfileBtn, informations, ageText, birthDate, countryText, sexText ,privacy} = this.props.locale.messages;
    const { user } = this.props.auth;

    return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={[styles.view1s, styles.userInformations]}>
            <CustomText style={[styles.userName]}>{user.info.username}</CustomText>
            <CustomText style={styles.userEmail}>{user.email}</CustomText> 
            <CustomText style={styles.userInformationsText}>{informations}</CustomText> 
            <View style={styles.informationsRow}>
              <CustomText style={styles.informationsRowText}>{ageText}</CustomText> 
              <CustomText style={styles.userAge}>{profile.ageToString(user.info.age)}</CustomText>
            </View>
            <View style={styles.informationsRow}>
              <CustomText style={styles.informationsRowText}>{countryText}</CustomText> 
              <CustomText style={styles.userLocation}>{user.info.country}</CustomText>
            </View>
            <View style={styles.informationsRow}>
              <CustomText style={styles.informationsRowText}>{sexText}</CustomText> 
              <CustomText style={styles.userSex}>{this._sexToString(user.info.sex)}</CustomText>
            </View>
          </View>
          <View style={styles.buttonsView}>
            <TouchableOpacity style={[styles.button]} onPress={this._onProfileEditPress}>
                <CustomText style={styles.buttonText}>{editProfileBtn}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, {marginTop: 10}]} onPress={this._onProfileRemovePress}>
                <CustomText style={styles.buttonText}>{removeProfileBtn}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.defaultBtn, {marginTop: 10}]} onPress={this._onLogoutPress}>
                <CustomText style={styles.defaultBtnText}>{logoutBtn}</CustomText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button]} onPress={() => this.props.navigation.navigate("PrivacyScreen")}>
                <CustomText style={styles.buttonText}>{privacy}</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  _renderProfileEdit = () => {
    var { username, age, country, sex, confirm, fillInformation } = this.props.locale.messages;
    const {usernameError, ageError, countryError, sexError} = this.state;

      return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1s}>
          <CustomText style={styles.text0}>{fillInformation}</CustomText> 
          <Form>
            <Item style={[styles.item1, usernameError ? styles.itemError : {}]} regular>
              <Input placeholder={username}  style={{fontFamily: "montserrat-regular"}} value={this.state.username} onChangeText={(text) => this._setUsernameField("username", "usernameError",text)} />
            </Item>
            <Item style={[styles.item1, ageError ? styles.itemError : {}]} regular>
              {/* <Input placeholder={birth} onChangeText={(text) => this.setState({birth: text})} /> */}
              <Picker
                  mode="dialog"
                  style={{ width: "100%", fontFamily: "montserrat-regular" }}
                  placeholder={age}
                  textStyle={{fontFamily: "montserrat-regular"}}
                  placeholderStyle={{ color: "#bfc6ea", fontFamily: "montserrat-regular" }}
                  selectedValue={this.state.age}
                  onValueChange={(value) => this.setState({age: value, ageError: false})}>
                  <Picker.Item label={age} value={age} />
                  {
                      this.state.ages.map( age => {
                       return <Picker.Item label={age.label} value={age.value} />
                      })
                  }
                </Picker>
            </Item>
            <Item style={[styles.item1, countryError ? styles.itemError : {}]} regular>
              <Picker
                  mode={"dialog"}
                  style={{ width: "100%", fontFamily: "montserrat-regular" }}
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
                  mode={"dialog"}
                  style={{ width: "100%", fontFamily: "montserrat-regular" }}
                  placeholder={sex}
                  textStyle={{fontFamily: "montserrat-regular"}}
                  placeholderStyle={{ color: "#bfc6ea", fontFamily: "montserrat-regular" }}
                  selectedValue={this.state.sex}
                  onValueChange={(value) => this.setState({sex: value, sexError: false})}>
                  <Picker.Item label={sex} value={sex} />
                  {
                      this.state.sexs.map( sex => {
                       return <Picker.Item label={sex.label} value={sex.value} />
                      })
                  }
              </Picker>
            </Item>
          </Form>
          </View>
          <TouchableOpacity style={styles.defaultBtn} onPress={this._setUserData}>
              <CustomText style={styles.defaultBtnText}>{confirm}</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _renderInit = () => {
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
              <Item style={styles.item} regular>
                <View style={{marginLeft: 20, marginRight: 10}}>
                </View>
                <Input autoCapitalize={'none'} secureTextEntry={true} placeholder="Password" onChangeText={(password) => this.setState({password: password})} />
              </Item>
            </Form>
            <TouchableOpacity style={styles.defaultBtn} onPress={this._validateForm}>
              {isVerifyingEmail ? 
              <ActivityIndicator animating={isVerifyingEmail} size={"small"} color={Colors.tintColor}/>
              :
              <CustomText style={styles.defaultBtnText}>{next}</CustomText>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  _renderLinkSent = () => {
    const { loginok, gotohome } = this.props.locale.messages;
    return (
      <View style={styles.screen}>
        <View style={styles.view0}>
          <View style={styles.view1}>
            <CustomText style={styles.text0}>
              {loginok}
            </CustomText> 
            <CustomText style={styles.text1}>
              {gotohome}
            </CustomText>
          </View>
        </View>
      </View>
    );
  }

  _renderError = () => {
    const { unsuccessfulLogin, retry, possibleCauses, reusedOldLink, alreadyLoggedIn, connectionIssues } = this.props.locale.messages;
    return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1}>
              <CustomText style={styles.text0}>
                {unsuccessfulLogin}
              </CustomText>
              <View style={styles.view2}>
                <CustomText style={styles.text0}>
                  {possibleCauses}
                </CustomText>
                <CustomText style={styles.text0}>
                  {reusedOldLink}
                </CustomText>
                <CustomText style={styles.text0}>
                  {alreadyLoggedIn}
                </CustomText>
                <CustomText style={styles.text0}>
                  {connectionIssues}
                </CustomText>
              </View>
              <TouchableOpacity style={styles.button} onPress={() => this.setState({ loginStep: AUTH_STATES.INIT })}>
                <CustomText style={styles.buttonText}>{retry}</CustomText>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const { loginStep } = this.state;
    if (!this.props.auth.success) {
      // Not yet authenticated (input -> sent -> error)
      const { register } = this.props.locale.messages;
      return (
        <ConnectedScreenErrorBoundary>
          <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
            <ConnectedHeader onBackPress={this._onBackPress} />
            <CustomText style={styles.title}>{register}</CustomText>
            {loginStep === AUTH_STATES.INIT && this._renderInit()}
            {loginStep === AUTH_STATES.LINK_SENT && this._renderLinkSent()}
            {loginStep === AUTH_STATES.ERROR && this._renderError()}
            {loginStep === AUTH_STATES.LOGIN_REQUEST && this._renderLinkSent()}
          </View>
        </ConnectedScreenErrorBoundary>
      )
    } else if (this.props.auth.success) {
      const { profile } = this.props.locale.messages;
      return (
        <ConnectedScreenErrorBoundary>
          <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
            <ConnectedHeader onBackPress={this._onBackPress} />
            <CustomText style={styles.title}>{profile}</CustomText>
            {loginStep === AUTH_STATES.PROFILE_REMOVE && this._renderProfileRemove()}
            {loginStep === AUTH_STATES.PROFILE_EDIT && this._renderProfileEdit()}
            {loginStep === AUTH_STATES.PROFILE_SHOW && this._renderProfileShow()}
            {loginStep === AUTH_STATES.ERROR && this._renderError()}
            {loginStep === AUTH_STATES.LOGOUT && this._renderLogout()}
          </View>
        </ConnectedScreenErrorBoundary>
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
    alignItems: 'center',
  },
  view01: {
    width: "90%", 
    alignItems: 'center', 
    marginTop: 20, 
    justifyContent: 'center' 
  },
  mainView: {
    flex:1, 
    backgroundColor: 'white' 
  },
  view1: {
    width: "90%", 
    alignItems: 'center', 
    marginTop: 30, 
    justifyContent: 'center' 
  },
  view1s: {
    width: "90%",
    alignItems: 'center', 
    marginTop: 50, 
    justifyContent: 'center',
  },
  view2: {
    marginTop: 20
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
  text2: { 
    fontSize: 17, 
    color: "#3E3E3D",
    marginBottom: 20
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
  buttonText: {
    color: "black",
    fontFamily: "montserrat-bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  button: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    display: "flex",
    minWidth: "50%",
  },
  defaultBtn: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    display: "flex",
    minWidth: "50%",
  },
  defaultBtnText: {
    color: "white",
    fontFamily: "montserrat-bold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  buttonsView: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: "20%"
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
    minHeight: 50,
    marginTop: 5,
    marginBottom: 5,
    borderColor: "white",
    borderBottomColor: "black",
    backgroundColor: "white",
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
  },
  userInformations: {
    alignItems: "flex-start",
    marginTop: 50,
    alignItems: 'center', 
  },  
  userInformationsText: {
    fontSize: 12,
    textTransform: "capitalize",
    color: Colors.mediumGray,
    marginBottom: 19
  },
  informationsRow: {
    flexDirection: "row",
  },
  informationsRowText: {
    fontSize: 15,
    fontFamily: "montserrat-regular",
    color: "black"
  },
  userEmail: {
    color: Colors.mediumGray,
    fontSize: 14,
    marginBottom: 40
  },
  userName: {
    fontFamily: "montserrat-bold",
    fontSize: 20,
    textAlign: "left"
  },
  userAge: {
    fontFamily: "montserrat-bold",
    fontSize: 15
  },
  userLocation: {
    fontFamily: "montserrat-bold",
    fontSize: 15
  },
  userSex: {
    fontFamily: "montserrat-bold",
    fontSize: 15
  }
});


function LoginContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const isFocused = useIsFocused();

  return <Login 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    isFocused={isFocused} />;
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



