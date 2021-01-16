import React, { Component } from 'react';
import {  Platform, KeyboardAvoidingView, StyleSheet, ActivityIndicator, BackHandler, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { ConnectedHeader, CustomText } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { View, Form, Item, Input, Picker, DatePicker } from 'native-base';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import Colors from '../../constants/Colors';
import * as Constants from '../../constants';
import itDbCountries from "world_countries_lists/data/it/countries.json";
import enDbCountries from "world_countries_lists/data/en/countries.json";
import * as Validate from '../../helpers/validate';
import moment from "moment";

const AUTH_STATES = {
  INIT: "INIT",
  LINK_SENT: "LINK_SENT",
  PROFILE_REMOVE: "PROFILE_REMOVE",
  PROFILE_EDIT: "PROFILE_EDIT",
  PROFILE_SHOW: "PROFILE_SHOW",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR"
}
class Login extends Component {

  constructor(props) {

    moment.locale(Constants.DEFAULT_LANGUAGE);

    super(props);
    this.state = {
      email: "",
      loginStep: AUTH_STATES.INIT, 
      isVerifyingEmail: false,
      username: "",
      usernameError: false,
      birth: "",
      birthError: false,
      country: "",
      countryError: false,
      sex: "",
      sexError: false,
      countries: []
    };

    this._onHardwareBackButtonClick = this._onHardwareBackButtonClick.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._onHardwareBackButtonClick);

    this._setCountries();
    
    if (this.props.auth.error) {
      console.log("AUTH_STATES.ERROR");
      this.setState({ loginStep: AUTH_STATES.ERROR });
    }
    else if (this.props.auth.success && this.props.auth.user)
    {
      if(this.props.auth.user.info) {
        const {info} = this.props.auth.user;
        this.setState({
          loginStep: AUTH_STATES.PROFILE_SHOW,
          username: info.username,
          birth: new Date(info.birth),
          country: info.country,
          sex: info.sex
        })
      } else {
        this._setCountries();
        this.setState({ loginStep: AUTH_STATES.PROFILE_EDIT });
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
      this.setState({
        loginStep: AUTH_STATES.PROFILE_SHOW,
        username: info.username,
        birth: new Date(info.birth),
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

  _setCountries = () => {
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
    this.setState({ countries: countries});
  }

  _validateForm = async () => {
    const { email } = this.state;
    if (!Validate.email(email)) {
      alert('Invalid email');
    } else {
      this.props.actions.passwordLessSignup(email);
      this.setState({ loginStep: AUTH_STATES.LINK_SENT });
    }
  }

  _setUserData = () => {
    const { username, birth, country, sex, } = this.state;
    const { country: countryText, sex: sexText, birth: birthText } = this.props.locale.messages;
    let usernameError = false
    let birthError = false 
    let countryError = false 
    let sexError = false

    if(!Validate.username(username)){
      usernameError = true;
    }
    if(!birth || birth == birthText){
      birthError = true;
    }
    if(!country || country == countryText){
      countryError = true;
    }
    if(!sex || sex == sexText){
      sexError = true;
    }

    if(!usernameError && !birthError && !countryError && !sexError){
      const userData = { username, birth: birth.getTime(), country, sex, };
      this.props.actions.editUser(userData);
      this.setState({ loginStep: AUTH_STATES.PROFILE_SHOW });
    }
    else{
      this.setState({
        birthError, 
        countryError, 
        sexError,
        usernameError
      })

    }

  }

  _removeProfile = () => {
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
    this.setState({loginStep: AUTH_STATES.PROFILE_EDIT})
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
              <TouchableOpacity style={styles.button} onPress={this._logout}>
                <CustomText style={styles.buttonText}>{logoutBtn}</CustomText>
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
              <TouchableOpacity style={styles.button} onPress={this._removeProfile}>
                <CustomText style={styles.buttonText}>{removeProfileBtn}</CustomText>
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

      
    const { editProfileBtn, logoutBtn, removeProfileBtn } = this.props.locale.messages;
    const { user } = this.props.auth;

    return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1s}>
          <CustomText style={[styles.userInfo, {fontSize: 20, marginBottom: 20, fontFamily: "montserrat-bold"}]}>{user.info.username}</CustomText>
            <CustomText style={styles.userInfo}>{user.email}</CustomText> 
            <CustomText style={styles.userInfo}>{moment(user.info.birth).format('DD-MM-YYYY')}</CustomText>
            <CustomText style={styles.userInfo}>{user.info.country}</CustomText>
            <CustomText style={styles.userInfo}>{user.info.sex}</CustomText>
          </View>
          <TouchableOpacity style={[styles.button]} onPress={this._onProfileEditPress}>
              <CustomText style={styles.buttonText}>{editProfileBtn}</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, {marginTop: 10}]} onPress={this._onProfileRemovePress}>
              <CustomText style={styles.buttonText}>{removeProfileBtn}</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, {marginTop: 10}]} onPress={this._onLogoutPress}>
              <CustomText style={styles.buttonText}>{logoutBtn}</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  _renderProfileEdit = () => {
    var { username, birth, country, sex, confirm, fillInformation, man, woman } = this.props.locale.messages;
    const {usernameError, birthError, countryError, sexError} = this.state;

      return (
      <View style={styles.mainView}>
        <View style={styles.view0}>
          <View style={styles.view1s}>
          <CustomText style={styles.text0}>{fillInformation}</CustomText> 
          <Form>
            <Item style={[styles.item1, usernameError ? styles.itemError : {}]} regular>
              <Input placeholder={username}  style={{fontFamily: "montserrat-regular"}} value={this.state.username} onChangeText={(text) => this._setUsernameField("username", "usernameError",text)} />
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
                placeHolderText={!this.state.birth && birth}
                placeHolderTextStyle={{width: "100%", fontFamily: "montserrat-regular"}}
                textStyle={{ color: "black", width: "100%", fontFamily: "montserrat-bold"}}
                onDateChange={(date) => this.setState({birth: date, birthError: false})}
                disabled={false}
                style={{width: "100%"}}
                defaultDate={this.state.birth}/>
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
          <TouchableOpacity style={styles.button} onPress={this._setUserData}>
              <CustomText style={styles.buttonText}>{confirm}</CustomText>
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
            </Form>
            <TouchableOpacity style={styles.button} onPress={this._validateForm}>
              {isVerifyingEmail ? 
              <ActivityIndicator animating={isVerifyingEmail} size={"small"} color={Colors.tintColor}/>
              :
              <CustomText style={styles.buttonText}>{next}</CustomText>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }

  _renderLinkSent = () => {
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
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} />
          <CustomText style={styles.title}>{register}</CustomText>
          {loginStep === AUTH_STATES.INIT && this._renderInit()}
          {loginStep === AUTH_STATES.LINK_SENT && this._renderLinkSent()}
          {loginStep === AUTH_STATES.ERROR && this._renderError()}
          {/*this._renderAuthOutcome()*/}
        </View>
      )
    } else if (this.props.auth.success) {
      const { profile } = this.props.locale.messages;
      return (
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} />
          <CustomText style={styles.title}>{profile}</CustomText>
          {loginStep === AUTH_STATES.PROFILE_REMOVE && this._renderProfileRemove()}
          {loginStep === AUTH_STATES.PROFILE_EDIT && this._renderProfileEdit()}
          {loginStep === AUTH_STATES.PROFILE_SHOW && this._renderProfileShow()}
          {loginStep === AUTH_STATES.ERROR && this._renderError()}
          {loginStep === AUTH_STATES.LOGOUT && this._renderLogout()}
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
    justifyContent: 'center' 
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
    color: "white",
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
    backgroundColor: "black",
    display: "flex",
    minWidth: "50%",
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
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5
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



