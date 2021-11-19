import React, {Component} from "react";
import {
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    ActivityIndicator,
    BackHandler,
    TouchableOpacity,
    PixelRatio,
    Text,
    Alert
} from "react-native";
import {
    useNavigation,
    useRoute,
    useIsFocused,
} from "@react-navigation/native";
import {
    ConnectedHeader,
    CustomText,
    ConnectedScreenErrorBoundary,
} from "../../components";
import {connect, useStore} from "react-redux";
import {bindActionCreators} from "redux";
import actions from "../../actions";
import {View, Form, Item, Input, Picker} from "native-base";
import _ from "lodash";
import Layout from "../../constants/Layout";
import Colors from "../../constants/Colors";
import * as Constants from "../../constants";
import itDbCountries from "world_countries_lists/data/it/countries.json";
import enDbCountries from "world_countries_lists/data/en/countries.json";
import * as Validate from "../../helpers/validate";
import * as profile from "../../helpers/profile";
import {Ionicons, FontAwesome} from "@expo/vector-icons";
import {MaskedTextInput, MaskedText} from "react-native-mask-text";

const AUTH_STATES = {
    INIT: "INIT",
    LOGIN: "LOGIN",
    LINK_SENT: "LINK_SENT",
    LOGIN_REQUEST: "LOGINREQ",
    PROFILE_REMOVE: "PROFILE_REMOVE",
    USER_REGISTER: "USER_REGISTER",
    PROFILE_EDIT: "PROFILE_EDIT",
    PROFILE_EDIT_FIRST: "PROFILE_EDIT_FIRST",
    PROFILE_EDIT_LAST: "PROFILE_EDIT_LAST",
    PROFILE_SHOW: "PROFILE_SHOW",
    COMPLETED: "COMPLETED",
    ERROR: "ERROR",
    LOGOUT: "LOGOUT",
    PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
    PASSWORD_RESET_REQUEST_DONE: "PASSWORD_RESET_REQUEST_DONE",
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            loginStep: AUTH_STATES.INIT,
            isVerifyingEmail: false,
            username: "",
            name: "",
            surname: "",
            password: "",
            usernameError: false,
            age: "",
            ageError: false,
            country: "",
            countryError: false,
            sex: "",
            sexError: false,
            countries: [],
            firstForm: true,
            validationError: false,
            date: "GG-MM-AAAA",
            dateError: false,
        };
        this._fontScale = PixelRatio.getFontScale();

        this._onHardwareBackButtonClick = this._onHardwareBackButtonClick.bind(
            this
        );
    }
    componentDidUpdate(prevProps) {
        if (this.props.auth !== prevProps.auth) this._loginStateChanged();
        //if (this.props.auth.userInfo !== prevProps.auth.userInfo) this._loginStateChanged();
       
    }
    componentDidMount() {
        BackHandler.addEventListener(
            "hardwareBackPress",
            this._onHardwareBackButtonClick
        );

        this.setState({
            countries: this._generateCountries(),
            ages: profile.populateAges(
                Constants.PROFILE.MIN_AGE,
                Constants.PROFILE.MAX_AGE
            ),
            sexs: this._generateSex(),
        });
        if (this.props.auth.error) {
            console.log('log error')
            this.setState({loginStep: AUTH_STATES.ERROR});
        } else if (this.props.auth.success && this.props.auth.user) {
            if (this.props.auth.userInfo) {
                const {userInfo} = this.props.auth;
                this.setState({
                    name: userInfo.name,
                    surname: userInfo.surname,
                    date: userInfo.date,
                    country: userInfo.country,
                    sex: userInfo.sex
                })
                this.setState({
                    loginStep: AUTH_STATES.PROFILE_SHOW,})
            } else {
                this.setState({
                    loginStep: AUTH_STATES.PROFILE_EDIT,
                });
            }
        } else {
            this.setState({loginStep: AUTH_STATES.INIT});
        }
    }


    _onHardwareBackButtonClick = () => {
        if (this.props.isFocused) {
            this._onBackPress();
            return true;
        }
        return false;
    };

    _loginStateChanged = async () => {
        if (this.props.auth.user && this.props.auth.userInfo) {
          const {userInfo} = this.props.auth;
          console.log(userInfo);
          console.log('dentro login state changed')
                this.setState({
                    loginStep: AUTH_STATES.PROFILE_SHOW,
                    name: userInfo.name,
                    surname: userInfo.surname,
                    date: userInfo.date,
                    country: userInfo.country,
                    sex: userInfo.sex
                })
        } else if (this.props.auth.success) {
            this.setState({loginStep: AUTH_STATES.PROFILE_EDIT});
        } else if (this.props.auth.error) {
            console.log("AUTH_STATES.ERROR");
            this.setState({loginStep: AUTH_STATES.ERROR});
        }
    };

    _sexToString = (sex) => {
        var {man, woman, sexNotDefined} = this.props.locale.messages;
        if (sex == profile.SEX.MAN) return man;
        else if (sex == profile.SEX.WOMAN) return woman;
        else if (sex == profile.SEX.NOT_DEFINED) return sexNotDefined;
        return "";
    };

    _generateSex = () => {
        var sex = [];
        var {man, woman, sexNotDefined} = this.props.locale.messages;
        sex.push({value: profile.SEX.MAN, label: man});
        sex.push({value: profile.SEX.WOMAN, label: woman});
        sex.push({value: profile.SEX.NOT_DEFINED, label: sexNotDefined});
        return sex;
    };

    _generateCountries = () => {
        var countries = [];
        countries.push({});
        var italy = null;
        var italyKey = null;
        const dbCountries =
            this.props.locale.lan == "it" ? itDbCountries : enDbCountries;
        dbCountries.map((country, key) => {
            if (country.alpha2 == "it") {
                italy = {...country};
                italyKey = key;
            } else {
                countries.push({...country});
            }
        });
        if (italy) {
            countries[0] = italy;
        }
        return countries;
    };

    _validateForm = async () => {
        const {email, password} = this.state;
        if (!Validate.email(email)) {
            alert("Invalid email");
        } else {
            this.props.actions.passwordSignup(email, password);
            this.setState({loginStep: AUTH_STATES.PROFILE_SHOW});
        }
    };

    _resetPasswordForm = async () => {
        const {email} = this.state;
        if (!Validate.email(email)) {
            alert("Invalid email");
        } else {
            this.props.actions.passwordReset(email);
            Alert.alert(
                'Title',
                'Msg',
                [
                    {text: 'OK', onPress: () => this._onBackPress()},
                ],
                {cancelable: false},
            );
        }
    };

    _notImplemented = async () => {
        alert("Not Implemented");
    };

    _setRegisterLast = () => {
        this._validateFirst();
    };

    _RegisterUser = () => {
        this._validateRegister();
    };

    _validateRegister = async () => {
        const {
            name,
            surname,
            email,
            password,
            age,
            date,
            country,
            sex,
        } = this.state;
        const userData = {
            name,
            surname,
            email,
            date,
            country,
            sex,
            updateDate: new Date().getTime(),
        };
        const {country: countryText, sex: sexText} = this.props.locale.messages;
        let countryError = false;
        let sexError = false;
        let dateError = false;
        if (!Validate.date(date)) {
            alert("Invalid birthdate");
            dateError = true;
        }

        if (!country || country == countryText) {
            countryError = true;
            alert("Invalid country");
        }
        if (!sex || sex == sexText) {
            sexError = true;
            alert("Invalid sex");
        }

        this.setState({
            countryError,
            sexError,
            dateError,
        });

        if (!countryError && !dateError && !sexError) {
            this.props.actions.registerAndSignup(email, password, userData);
            this.props.actions.reportAction({
                analyticsActionType: Constants.ANALYTICS_TYPES.userUpdatesProfile,
                meta: userData
            });

            this.setState({loginStep: AUTH_STATES.PROFILE_SHOW});
        }
    };

    _validateFirst = () => {
        const {name, surname, email, password, firstForm} = this.state;
        let nameError = false;
        let validationError = false;
        let emailError = false;
        let surnameError = false;
        let passwordError = false;
        if (firstForm) {
            if (!Validate.email(email)) {
                emailError = true;
                validationError = true;
                alert("Invalid email");
            }
            if (!Validate.name(name)) {
                nameError = true;
                validationError = true;
                alert("Invalid name");
            }
            if (!Validate.name(surname)) {
                surnameError = true;
                validationError = true;
                alert("Invalid surname");
            }
            if (!Validate.password(password)) {
                passwordError = true;
                validationError = true;
                alert("Invalid password");
            }
            if (!nameError && !surnameError && !emailError && !passwordError) {
                this.setState({
                    firstForm: false,
                });
            }
        }

        this.setState({
            nameError,
            emailError,
            passwordError,
            surnameError,
            validationError,
        });
    };

    _setUserData = () => {
        const {name, surname, date, country, sex,} = this.state;
        
        const {country: countryText, sex: sexText, date: dateText} = this.props.locale.messages;
        let nameError = false
        let surnameError = false
        let dateError = false
        let countryError = false
        let sexError = false

        if (!Validate.name(name)) {
            nameError = true;
        }
        if (!Validate.name(surname)) {
            surnameError = true;
        }
        if (!Validate.date(date)) {
          
            dateError = true;
        }
        if (!country || country == countryText) {
            countryError = true;
        }
        if (!sex || sex == sexText) {
            sexError = true;
        }

        if (!nameError && !nameError && !dateError && !countryError && !sexError) {
          
          const updateDate = new Date;
          const userData = {
            name,
            surname,
            date,
            country,
            sex,
            updateDate: updateDate.getTime(),
        };
        
            this.props.actions.editUser(userData);
            this.props.actions.reportAction({
                analyticsActionType: Constants.ANALYTICS_TYPES.userUpdatesProfile,
                meta: userData
            });
            this.setState({loginStep: AUTH_STATES.PROFILE_SHOW});
        } else {
            this.setState({
                dateError,
                countryError,
                sexError,
                nameError,
                surnameError
            })

        }

    }

    _removeProfile = () => {
        const {username, age, country, sex} = this.state;
        const userData = {
            username,
            age,
            country,
            sex,
            updateDate: new Date().getTime(),
        };
        this.props.actions.reportAction({
            analyticsActionType: Constants.ANALYTICS_TYPES.userRemovesProfile,
            meta: userData,
        });
        this.props.actions.removeUser();
        this._goBackScreen();
    };

    _logout = () => {
        this.props.actions.logout();
        this._goBackScreen();
    };

    _goBackScreen = () => {
        BackHandler.removeEventListener(
            "hardwareBackPress",
            this._onHardwareBackButtonClick
        );
        this.props.navigation.goBack();
    };

    _onBackPress = () => {
        if (this.state.loginStep === AUTH_STATES.PROFILE_REMOVE)
            this.setState({loginStep: AUTH_STATES.PROFILE_SHOW})
        else if (this.state.loginStep === AUTH_STATES.PROFILE_EDIT && !this.props.auth.user.info) /* user has pressed back without completing profile */
            this._goBackScreen();
        else if (this.state.loginStep === AUTH_STATES.PROFILE_EDIT)
            if (this.props.auth.user.info)
                this.setState({loginStep: AUTH_STATES.PROFILE_SHOW})
            else
                this._goBackScreen();
        else if (this.state.loginStep === AUTH_STATES.LOGOUT)
            this.setState({loginStep: AUTH_STATES.PROFILE_SHOW})
        else
            this._goBackScreen();
    }


    _onSkip = () => {
        this.setState({modalVisible: false});
        this.props.navigation.goBack();
    };

    _onProfileEditPress = () => {
     

        const {userInfo} = this.props.auth;
                this.setState({
                    loginStep: AUTH_STATES.PROFILE_EDIT,
                    name: userInfo.name,
                    surname: userInfo.surname,
                    date: userInfo.date,
                    country: userInfo.country,
                    sex: userInfo.sex
                })
        
    };

    _onRegisterPress = () => {
        this.setState({loginStep: AUTH_STATES.PROFILE_EDIT_FIRST});
    };

    _onPasswordResetPress = () => {
        this.setState({loginStep: AUTH_STATES.PASSWORD_RESET_REQUEST})
    }

    _onLastStep = () => {
        this.setState({loginStep: AUTH_STATES.PROFILE_EDIT_LAST});
    };

    _onLoginPress = () => {
        this.setState({loginStep: AUTH_STATES.LOGIN});
    };

    _onProfileRemovePress = () => {
        this.setState({loginStep: AUTH_STATES.PROFILE_REMOVE});
    };

    _onLogoutPress = () => {
        this.setState({loginStep: AUTH_STATES.LOGOUT});
    };

    _setUsernameField = (stateField, stateFieldError, value) => {
        if (Validate.username(value) || value.length < 4) {
            this.setState({
                [stateField]: value,
                [stateFieldError]: false,
            });
        }
    };

    _renderAuthOutcome = () => {
        const {
            successfullLogin,
            loggingIn,
            loginError,
        } = this.props.locale.messages;
        if (this.props.auth.loading)
            return <CustomText style={styles.errorBox}>{loggingIn}</CustomText>;
        if (this.props.auth.error)
            return (
                <CustomText style={styles.errorBox}>
                    {loginError} {this.props.auth.error}
                </CustomText>
            );
        if (this.props.auth.success)
            return (
                <CustomText style={styles.errorBox}>{successfullLogin}</CustomText>
            );
    };

    _renderLogout = () => {
        const {logoutMsg, logoutBtn} = this.props.locale.messages;
        return (
            <View style={styles.screen}>
                <View style={styles.view0}>
                    <View style={styles.view1}>
                        <CustomText style={styles.text0}>{logoutMsg}</CustomText>
                        <View>
                            <TouchableOpacity
                                style={styles.defaultBtn}
                                onPress={this._logout}
                            >
                                <CustomText style={styles.defaultBtnText}>
                                    {logoutBtn}
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    _renderProfileRemove = () => {
        const {removeProfileMsg, removeProfileBtn} = this.props.locale.messages;
        return (
            <View style={styles.screen}>
                <View style={styles.view0}>
                    <View style={styles.view1}>
                        <CustomText style={styles.text0}>{removeProfileMsg}</CustomText>
                        <View>
                            <TouchableOpacity
                                style={styles.defaultBtn}
                                onPress={this._removeProfile}
                            >
                                <CustomText style={styles.defaultBtnText}>
                                    {removeProfileBtn}
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    _renderProfileShow = () => {
        let userInfo = {}
        if(!this.props.auth.user.info){
            console.log(this.props.auth.user.info)
            userInfo = this.props.auth.userInfo;
        }
            
        else{
            userInfo = this.props.auth.user.info;
        }

        const {
            editProfileBtn,
            logoutBtn,
            removeProfileBtn,
            informations,
            ageText,
            birthDate,
            countryText,
            sexText,
            privacy,
        } = this.props.locale.messages;
        const {user} = this.props.auth;

        

        return (
            <View style={styles.mainView}>
                <View style={styles.view0}>
                    <View style={[styles.view1s, styles.userInformations]}>
                        <CustomText style={[styles.userName]}>
                            {userInfo.name} {userInfo.surname}
                        </CustomText>
                        <CustomText style={styles.userEmail}>{userInfo.email}</CustomText>
                        {/* <CustomText style={styles.userInformationsText}>
              {informations}
            </CustomText> */}
                        <View style={styles.informationsRow}>
                            <CustomText style={styles.informationsRowText}>
                                {ageText}
                            </CustomText></View>
                        <View style={styles.informationsRow}>
                            <CustomText style={styles.userAge}>
                                {userInfo.date}
                            </CustomText></View>

                        <View style={styles.informationsRow}>
                            <CustomText style={styles.informationsRowText}>
                                {countryText}
                            </CustomText></View><View style={styles.informationsRow}>
                        <CustomText style={styles.userLocation}>
                            {userInfo.country}
                        </CustomText>
                    </View>
                        <View style={styles.informationsRow}>
                            <CustomText style={styles.informationsRowText}>
                                {sexText}
                            </CustomText></View><View style={styles.informationsRow}>
                        <CustomText style={styles.userSex}>
                            {this._sexToString(userInfo.sex)}
                        </CustomText>
                    </View>
                    </View>
                    <View style={styles.buttonsView, {marginTop: 20}}>

                        <TouchableOpacity
                            style={[styles.defaultBlackBtn]}
                            onPress={this._onLogoutPress}
                        >
                            <CustomText style={styles.buttonWhiteText}>{logoutBtn}</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {marginTop: 10}]}
                            onPress={this._onProfileRemovePress}
                        >
                            <CustomText style={styles.buttonText}>
                                {removeProfileBtn}
                            </CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {marginTop: 10}]}
                            onPress={this._onProfileEditPress}
                        >
                            <CustomText style={styles.buttonText}>
                                {editProfileBtn}
                            </CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button]}
                            onPress={() => this.props.navigation.navigate("PrivacyScreen")}
                        >
                            <CustomText style={styles.buttonText}>{privacy}</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    _renderRegisterWithEmail = () => {
        var {
            username,
            name,
            surname,
            age,
            country,
            sex,
            confirm,
            register,
            birth,
            next,
        } = this.props.locale.messages;
        const {
            nameError,
            surnameError,
            emailError,
            passwordError,
            dateError,
            countryError,
            sexError,
            firstForm,
        } = this.state;

        return (
            <>
                <>
                    <View>
                        <CustomText style={styles.title}>{register}</CustomText>
                    </View>
                </>
                <View style={styles.mainView}>
                    <View style={styles.view0}>
                        {firstForm ? (
                            <>
                                <View style={styles.view1s}>
                                    {/* <CustomText style={styles.text0}>{fillInformation}</CustomText>  */}
                                    <Form>
                                        <Item
                                            style={[styles.item1, nameError ? styles.itemError : {}]}
                                            regular
                                        >
                                            <Input
                                                placeholder={name}
                                                style={{fontFamily: "montserrat-regular"}}
                                                value={this.state.name}
                                                onChangeText={(text) => this.setState({name: text})}
                                            />
                                        </Item>
                                        <Item
                                            style={[
                                                styles.item1,
                                                surnameError ? styles.itemError : {},
                                            ]}
                                            regular
                                        >
                                            <Input
                                                placeholder={surname}
                                                style={{fontFamily: "montserrat-regular"}}
                                                value={this.state.surname}
                                                onChangeText={(text) =>
                                                    this.setState({surname: text})
                                                }
                                            />
                                        </Item>
                                        <Item
                                            style={[styles.item1, emailError ? styles.itemError : {}]}
                                            regular
                                        >
                                            <Input
                                                autoCapitalize={"none"}
                                                placeholder="Email"
                                                onChangeText={(email) =>
                                                    this.setState({email: email.toLowerCase()})
                                                }
                                            />
                                        </Item>
                                        <Item
                                            style={[
                                                styles.item1,
                                                passwordError ? styles.itemError : {},
                                            ]}
                                            regular
                                        >
                                            <Input
                                                autoCapitalize={"none"}
                                                secureTextEntry={true}
                                                placeholder="Password"
                                                onChangeText={(password) =>
                                                    this.setState({password: password})
                                                }
                                            />
                                        </Item>
                                    </Form>
                                </View>
                                <TouchableOpacity
                                    style={styles.defaultBtn}
                                    onPress={() => this._setRegisterLast()}
                                >
                                    <CustomText style={styles.defaultBtnText}>{next}</CustomText>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.view1s}>
                                    <Item
                                        style={[styles.item1, dateError ? styles.itemError : {}]}
                                        regular
                                    >
                                        <MaskedTextInput
                                            mask="99/99/9999"
                                            placeholder={birth}
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                this.setState({date: text});
                                            }}
                                            style={styles.input}
                                        />
                                    </Item>
                                    <Item
                                        style={[styles.item1, countryError ? styles.itemError : {}]}
                                        regular
                                    >
                                        <Picker
                                            mode={"dialog"}
                                            style={{
                                                width: "100%",
                                                fontFamily: "montserrat-regular",
                                            }}
                                            placeholder={country}
                                            textStyle={{fontFamily: "montserrat-regular"}}
                                            placeholderStyle={{
                                                color: "#bfc6ea",
                                                fontFamily: "montserrat-regular",
                                            }}
                                            selectedValue={this.state.country}
                                            onValueChange={(value) =>
                                                this.setState({country: value, countryError: false})
                                            }
                                        >
                                            <Picker.Item label={country} value={country}/>
                                            {this.state.countries.map((country) => {
                                                return (
                                                    <Picker.Item
                                                        label={country.name}
                                                        value={country.name}
                                                    />
                                                );
                                            })}
                                        </Picker>
                                    </Item>
                                    <Item
                                        style={[styles.item1, sexError ? styles.itemError : {}]}
                                        regular
                                    >
                                        {/* <Input placeholder={sex} onChangeText={(text) => this.setState({sex: text})} /> */}
                                        <Picker
                                            mode={"dialog"}
                                            style={{
                                                width: "100%",
                                                fontFamily: "montserrat-regular",
                                            }}
                                            placeholder={sex}
                                            textStyle={{fontFamily: "montserrat-regular"}}
                                            placeholderStyle={{
                                                color: "#bfc6ea",
                                                fontFamily: "montserrat-regular",
                                            }}
                                            selectedValue={this.state.sex}
                                            onValueChange={(value) =>
                                                this.setState({sex: value, sexError: false})
                                            }
                                        >
                                            <Picker.Item label={sex} value={sex}/>
                                            {this.state.sexs.map((sex) => {
                                                return (
                                                    <Picker.Item label={sex.label} value={sex.value}/>
                                                );
                                            })}
                                        </Picker>
                                    </Item>
                                </View>
                                <TouchableOpacity
                                    style={styles.defaultBtn}
                                    onPress={() => this._RegisterUser()}
                                >
                                    <CustomText style={styles.defaultBtnText}>
                                        {register}
                                    </CustomText>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </>
        );
    };

    _renderProfileEdit = () => {
      if (!this.props.auth.userInfo) return;
      const {userInfo} = this.props.auth
      
        var {
            name,
            surname,
            birth,
            country,
            sex,
            confirm,
            fillInformation,
        } = this.props.locale.messages;
        const {nameError, surnameError, dateError, countryError, sexError} = this.state;

        return (
            <View style={styles.mainView}>
                <View style={styles.view0}>
                    <View style={styles.view1s}>
                        <CustomText style={styles.text0}>{fillInformation}</CustomText>
                        <Form>
                            <Item
                                style={[styles.item1, nameError ? styles.itemError : {}]}
                                regular
                            >
                                <Input 
                                    placeholder={name}
                                    style={{fontFamily: "montserrat-regular"}}
                                    //value={userInfo.name}
                                    onChangeText={(text) => this.setState({name: text})}
                                />
                            </Item>
                            <Item
                                style={[
                                    styles.item1,
                                    surnameError ? styles.itemError : {},
                                ]}
                                regular
                            >
                                <Input
                                    placeholder={surname}
                                    style={{fontFamily: "montserrat-regular"}}
                                    //value={userInfo.surname}
                                    onChangeText={(text) =>
                                        this.setState({surname: text})
                                    }
                                />
                            </Item>
                            <Item
                                style={[styles.item1, dateError ? styles.itemError : {}]}
                                regular
                            >
                                <MaskedTextInput
                                    mask="99/99/9999"
                                    placeholder={birth}
                                    //value={userInfo.date}
                                    keyboardType="numeric"
                                    onChangeText={(text) => {
                                        this.setState({date: text});
                                    }}
                                    style={styles.input}
                                />
                            </Item>
                            <Item
                                style={[styles.item1, countryError ? styles.itemError : {}]}
                                regular
                            >
                                <Picker
                                    mode={"dialog"}
                                    style={{width: "100%", fontFamily: "montserrat-regular"}}
                                    placeholder={country}
                                    textStyle={{fontFamily: "montserrat-regular"}}
                                    placeholderStyle={{
                                        color: "#bfc6ea",
                                        fontFamily: "montserrat-regular",
                                    }}
                                    selectedValue={this.state.country}
                                    onValueChange={(value) =>
                                        this.setState({country: value, countryError: false})
                                    }
                                >
                                    <Picker.Item label={country} value={country}/>
                                    {this.state.countries.map((country) => {
                                        return (
                                            <Picker.Item label={country.name} value={country.name}/>
                                        );
                                    })}
                                </Picker>
                            </Item>
                            <Item
                                style={[styles.item1, sexError ? styles.itemError : {}]}
                                regular
                            >
                                {/* <Input placeholder={sex} onChangeText={(text) => this.setState({sex: text})} /> */}
                                <Picker
                                    mode={"dialog"}
                                    style={{width: "100%", fontFamily: "montserrat-regular"}}
                                    placeholder={sex}
                                    textStyle={{fontFamily: "montserrat-regular"}}
                                    placeholderStyle={{
                                        color: "#bfc6ea",
                                        fontFamily: "montserrat-regular",
                                    }}
                                    selectedValue={this.state.sex}
                                    onValueChange={(value) =>
                                        this.setState({sex: value, sexError: false})
                                    }
                                >
                                    <Picker.Item label={sex} value={sex}/>
                                    {this.state.sexs.map((sex) => {
                                        return <Picker.Item label={sex.label} value={sex.value}/>;
                                    })}
                                </Picker>
                            </Item>
                        </Form>
                    </View>
                    <TouchableOpacity
                        style={styles.defaultBtn}
                        onPress={this._setUserData}
                    >
                        <CustomText style={styles.defaultBtnText}>{confirm}</CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    _renderInit = () => {
        const {isVerifyingEmail} = this.state;
        const {
            next,
            signin,
            landingtextlogin,
            registeremail,
            loginfacebook,
            logingoogle,
            skip,
        } = this.props.locale.messages;
        return (
            <>
                <View
                    style={{flex: 1, justifyContent: "center", alignItems: "center"}}
                >
                    <TouchableOpacity onPress={this._onLoginPress}>
                        <CustomText style={styles.loginText}>{landingtextlogin}</CustomText>
                    </TouchableOpacity>

                    <CustomText style={styles.text1}></CustomText>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : "height"}
                    style={styles.screen}
                >
                    <View style={styles.view0}>
                        <View style={styles.view01}>
                            <>
                                <TouchableOpacity
                                    style={styles.defaultBtn}
                                    onPress={this._onRegisterPress}
                                >
                                    {isVerifyingEmail ? (
                                        <ActivityIndicator
                                            animating={isVerifyingEmail}
                                            size={"small"}
                                            color={Colors.tintColor}
                                        />
                                    ) : (
                                        <CustomText style={styles.defaultBtnTextbold}>
                                            <FontAwesome
                                                name="at"
                                                size={20}
                                                iconStyle={{marginRight: 100}}
                                                color="grey"
                                            />{" "}
                                            {registeremail}
                                        </CustomText>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.defaultBtn}
                                    onPress={this._notImplemented}
                                >
                                    {isVerifyingEmail ? (
                                        <ActivityIndicator
                                            animating={isVerifyingEmail}
                                            size={"small"}
                                            color={Colors.tintColor}
                                        />
                                    ) : (
                                        <CustomText style={styles.defaultBtnText}>
                                            <FontAwesome
                                                name="facebook"
                                                size={20}
                                                iconStyle={{marginRight: 100}}
                                                color="grey"
                                            />{" "}
                                            {loginfacebook}
                                        </CustomText>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.defaultBtn}
                                    onPress={this._notImplemented}
                                >
                                    {isVerifyingEmail ? (
                                        <ActivityIndicator
                                            animating={isVerifyingEmail}
                                            size={"small"}
                                            color={Colors.tintColor}
                                        />
                                    ) : (
                                        <CustomText style={styles.defaultBtnText}>
                                            <FontAwesome
                                                name="google"
                                                size={20}
                                                iconStyle={{marginRight: 100}}
                                                color="grey"
                                            />{" "}
                                            {logingoogle}
                                        </CustomText>
                                    )}
                                </TouchableOpacity>
                            </>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.defaultBlackBtn}
                            onPress={this._onSkip}
                        >
                            <CustomText style={styles.buttonWhiteText}>{skip}</CustomText>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </>
        );
    };

    _renderLogin = () => {
        const {isVerifyingEmail} = this.state;
        const {next, signin, forgotpassword} = this.props.locale.messages;
        return (
            <>
                <View>
                    <CustomText style={styles.title}>{signin}</CustomText>
                    <TouchableOpacity onPress={this._onPasswordResetPress}
                    >
                        <CustomText style={styles.loginText}>{forgotpassword}</CustomText>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : "height"}
                    style={styles.screen}
                >
                    <View style={styles.view0}>
                        <View style={styles.view01}>
                            <Form>
                                <Item style={styles.item} regular>
                                    <View style={{marginLeft: 20, marginRight: 10}}></View>
                                    <Input
                                        autoCapitalize={"none"}
                                        placeholder="Email"
                                        onChangeText={(email) =>
                                            this.setState({email: email.toLowerCase()})
                                        }
                                    />
                                </Item>
                                <Item style={styles.item} regular>
                                    <View style={{marginLeft: 20, marginRight: 10}}></View>
                                    <Input
                                        autoCapitalize={"none"}
                                        secureTextEntry={true}
                                        placeholder="Password"
                                        onChangeText={(password) =>
                                            this.setState({password: password})
                                        }
                                    />
                                </Item>
                            </Form>
                            <TouchableOpacity
                                style={styles.defaultBlackBtn}
                                onPress={this._validateForm}
                            >
                                {isVerifyingEmail ? (
                                    <ActivityIndicator
                                        animating={isVerifyingEmail}
                                        size={"small"}
                                        color={Colors.tintColor}
                                    />
                                ) : (
                                    <CustomText style={styles.buttonWhiteText}>
                                        {signin}
                                    </CustomText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </>
        );
    };

    _renderPasswordReset = () => {
        const {isVerifyingEmail} = this.state;
        const {
            confirm,
            forgotpassword,
            forgotpasswordtext,
            resetpassword,
        } = this.props.locale.messages;
        return (
            <>
                <View>
                    <CustomText style={styles.title}>{resetpassword}</CustomText>
                    <CustomText style={styles.loginText}>{forgotpassword}</CustomText>
                    <CustomText style={styles.loginText}>{forgotpasswordtext}</CustomText>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS == "ios" ? "padding" : "height"}
                    style={styles.screen}
                >
                    <View style={styles.view0}>
                        <View style={styles.view01}>
                            <Form>
                                <Item style={styles.item} regular>
                                    <View style={{marginLeft: 20, marginRight: 10}}></View>
                                    <Input
                                        autoCapitalize={"none"}
                                        placeholder="Email"
                                        onChangeText={(email) =>
                                            this.setState({email: email.toLowerCase()})
                                        }
                                    />
                                </Item>
                            </Form>
                            <TouchableOpacity
                                style={styles.defaultBlackBtn}
                                onPress={this._resetPasswordForm}
                            >
                                {isVerifyingEmail ? (
                                    <ActivityIndicator
                                        animating={isVerifyingEmail}
                                        size={"small"}
                                        color={Colors.tintColor}
                                    />
                                ) : (
                                    <CustomText style={styles.buttonWhiteText}>
                                        {confirm}
                                    </CustomText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </>
        );
    };

    _renderLinkSent = () => {
        const {loginok, gotohome} = this.props.locale.messages;
        return (
            <View style={styles.screen}>
                <View style={styles.view0}>
                    <View style={styles.view1}>
                        <CustomText style={styles.text0}>{loginok}</CustomText>
                        <CustomText style={styles.text1}>{gotohome}</CustomText>
                    </View>
                </View>
            </View>
        );
    };

    _renderError = () => {
        const {
            unsuccessfulLogin,
            retry,
            possibleCauses,
            reusedOldLink,
            alreadyLoggedIn,
            connectionIssues,
        } = this.props.locale.messages;
        return (
            <View style={styles.mainView}>
                <View style={styles.view0}>
                    <View style={styles.view1}>
                        <CustomText style={styles.text0}>{unsuccessfulLogin}</CustomText>
                        <View style={styles.view2}>
                            <CustomText style={styles.text0}>{possibleCauses}</CustomText>
                            <CustomText style={styles.text0}>{reusedOldLink}</CustomText>
                            <CustomText style={styles.text0}>{alreadyLoggedIn}</CustomText>
                            <CustomText style={styles.text0}>{connectionIssues}</CustomText>
                        </View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => this.setState({loginStep: AUTH_STATES.INIT})}
                        >
                            <CustomText style={styles.buttonText}>{retry}</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    render() {
        const {loginStep} = this.state;
        if (!this.props.auth.success) {
            return (
                <ConnectedScreenErrorBoundary>
                    <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
                        <ConnectedHeader onBackPress={this._onBackPress}/>

                        {loginStep === AUTH_STATES.INIT && this._renderInit()}
                        {loginStep === AUTH_STATES.LOGIN && this._renderLogin()}
                        {loginStep === AUTH_STATES.ERROR && this._renderError()}
                        {loginStep === AUTH_STATES.PROFILE_EDIT_FIRST && this._renderRegisterWithEmail()}
                        {loginStep === AUTH_STATES.PASSWORD_RESET_REQUEST && this._renderPasswordReset()}
                    </View>
                </ConnectedScreenErrorBoundary>
            );
        } else if (this.props.auth.success) {
            const {profile} = this.props.locale.messages;
            return (
                <ConnectedScreenErrorBoundary>
                    <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
                        <ConnectedHeader onBackPress={this._onBackPress}/>
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
        backgroundColor: "white",
    },
    title: {
        textAlign: "center",
        paddingTop: 10,
        paddingBottom: 10,
        color: "#000000E6",
        backgroundColor: "#F2F2F2",
        fontSize: 15,
        fontFamily: "montserrat-bold",
        textTransform: "uppercase",
    },
    screen: {
        flex: 1,
        backgroundColor: "white",
        //marginTop: Layout.statusbarHeight
    },
    view0: {
        flex: 1,
        alignItems: "center",
    },
    view01: {
        width: "90%",
        alignItems: "center",
        marginTop: 0,
        justifyContent: "center",
    },
    mainView: {
        flex: 1,
        backgroundColor: "white",
    },
    view1: {
        width: "90%",
        alignItems: "center",
        marginTop: 30,
        justifyContent: "center",
    },
    view1s: {
        width: "90%",
        alignItems: "center",
        marginTop: 50,
        justifyContent: "center",
    },
    view2: {
        marginTop: 20,
    },
    text0: {
        textAlign: "center",
        fontSize: 17,
        color: "#3E3E3D",
        marginBottom: 20,
    },
    text1: {
        textAlign: "center",
        fontSize: 15,
        color: "#3E3E3D",
        marginBottom: 0,
        marginTop: 0,
    },
    textbold: {
        textAlign: "center",
        fontSize: 15,
        fontFamily: "montserrat-bold",
        fontWeight: "bold",
        color: "#3E3E3D",
        marginBottom: 40,
    },
    text2: {
        fontSize: 17,
        color: "#3E3E3D",
        marginBottom: 20,
    },
    logoView: {
        alignItems: "center",
        marginBottom: 20,
    },
    logoSavengr: {
        width: 59,
        height: 15,
        resizeMode: "contain",
    },
    poweredByText: {
        marginTop: 20,
        marginBottom: 5,
        textAlign: "center",
        fontSize: 15,
    },
    emailIcon: {
        width: 20,
        height: 14,
        resizeMode: "contain",
    },
    logo: {
        resizeMode: "contain",
        width: 100,
        height: 100,
        marginTop: 25,
        marginBottom: 15,
    },
    loginText: {
        textAlign: "center",
        fontSize: 15,
        marginBottom: 20,
        marginTop: 50,
        //fontWeight: "300",
        fontFamily: "montserrat-bold",
    },
    buttonText: {
        color: "black",
        fontFamily: "montserrat-bold",
        fontSize: 14,
        textTransform: "uppercase",
    },
    buttonWhiteText: {
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
        backgroundColor: Colors.lightGray,
        display: "flex",
        minWidth: "50%",
    },

    awbutton: {
        marginBottom: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
        display: "flex",
        width: "98%",
    },
    defaultBtn: {
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightGray,
        display: "flex",
        width: "98%",
    },
    defaultBlackBtn: {
        marginTop: 40,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        display: "flex",
        // width: "60%",
    },
    defaultBtnText: {
        color: "black",
        fontFamily: "montserrat-regular",
        fontSize: 14,
    },
    defaultBtnTextbold: {
        color: "black",
        fontFamily: "montserrat-bold",
        fontSize: 14,
    },
    buttonsView: {
        flex: 1,
        justifyContent: "flex-end",

    },
    bottomText: {
        fontSize: 14,
        lineHeight: 18,
        color: Colors.blue,
    },
    forgotPswButton: {
        width: "100%",
        justifyContent: "center",
        height: 50,
    },
    registerText: {
        textAlign: "center",
        fontSize: 17,
    },
    forgotPswText: {
        textAlign: "center",
        fontSize: 15,
    },
    reporterButton: {
        width: "100%",
        height: 30,
        justifyContent: "center",
        borderRadius: 5,
        marginTop: 5,
    },
    item1: {
        width: "100%",
        backgroundColor: "white",
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
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.75)",
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
        textAlign: "center",
        color: "#fff",
        fontSize: 15,
        maxWidth: "100%",
    },
    errorBox: {
        backgroundColor: "transparent",
        maxWidth: 250, //avoid form resize!
        textAlign: "center",
        fontSize: 15,
        marginBottom: 10,
    },
    content: {
        width: 250,
        paddingLeft: 10,
        paddingRight: 10,
    },
    image0: {
        marginTop: 20,
        alignSelf: "center",
        width: 120,
        height: 120,
        resizeMode: "contain",
        borderRadius: 60,
    },
    itemError: {
        borderColor: "red",
        borderBottomColor: "red",
        borderBottomWidth: 2,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
    },
    userInformations: {
        alignItems: "flex-start",
        marginTop: 50,
        alignItems: "center",
    },
    userInformationsText: {
        fontSize: 12,
        textTransform: "capitalize",
        color: Colors.mediumGray,
        marginBottom: 19,
    },
    informationsRow: {
        flexDirection: "row",
    },
    informationsRowText: {
        fontSize: 15,
        fontFamily: "montserrat-regular",
        color: "black",
    },
    userEmail: {
        color: Colors.mediumGray,
        fontSize: 14,
        marginBottom: 40,
    },
    userName: {
        fontFamily: "montserrat-bold",
        fontSize: 20,
        textAlign: "left",
    },
    userAge: {
        fontFamily: "montserrat-bold",
        fontSize: 15,
    },
    userLocation: {
        fontFamily: "montserrat-bold",
        fontSize: 15,
    },
    userSex: {
        fontFamily: "montserrat-bold",
        fontSize: 15,
    },
    input: {
        width: "100%",
        margin: 12,
        borderWidth: 0,
    },
});

function LoginContainer(props) {
    const navigation = useNavigation();
    const route = useRoute();
    const store = useStore();
    const isFocused = useIsFocused();

    return (
        <Login
            {...props}
            navigation={navigation}
            route={route}
            store={store}
            isFocused={isFocused}
        />
    );
}

const mapStateToProps = (state) => {
    return {
        auth: state.authState,
        //mixed state
        others: state.othersState,
        //language
        locale: state.localeState,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {...bindActionCreators({...actions}, dispatch)};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    (stateProps, dispatchProps, props) => {
        return {
            ...stateProps,
            actions: dispatchProps,
            ...props,
        };
    }
)(LoginContainer);
