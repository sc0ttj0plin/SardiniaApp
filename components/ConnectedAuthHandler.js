import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import AsyncStorage from '@react-native-community/async-storage';
import actions from '../actions';
import * as Constants from '../constants';
import Colors from '../constants/Colors';
import CustomText from "./CustomText";
import { LLEntitiesFlatlist } from "../components/loadingLayouts";

const USE_DR = true;
const DR_TIMEOUT = 1000;
class ConnectedAuthHandler extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      render: USE_DR ? false : true,
      loginData: null,
      isLoggedIn: false,
      url: null,
      //
      modalVisible: true,
      modalTitle: "",
      modalDescription: "",
      modalBtnTitle: "",
      modalAction: null,
    };
    this.authSubscription = () => {};
  }

  //////////////////////////////////////
  async componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), DR_TIMEOUT))};
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidUpdate(prevProps) {
    //auth is updated by passwordLessLogin action
    if (this.props.auth !== prevProps.auth)
      if (this.props.auth.success) {
        console.log("AUTH SUCCESS")
      }
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData = () => this.props.auth.success;
  _isLoadingData = () => this.props.auth.loading;
  _isErrorData = () => this.props.auth.error;

  _onRegister = () => {
    this.setState({ modalVisible: false });
    this.props.navigation.navigate(Constants.NAVIGATION.NavAuthScreen);
  }

  _onSkip = () => { 
    const { loginOptional = false } = this.props;
    this.setState({ modalVisible: false });
    if (!loginOptional)
      this.props.navigation.goBack();
  }

  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { modalVisible, modalTitle, modalDescription } = this.state;
    const { locale, loginOptional = false} = this.props;
    const { user } = this.props.auth;
    const { access, skip, login, loginText } = locale.messages;

    if (!user)
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => { }}>
            <View style={[styles.fill]}>
            <View 
              style={styles.modalView} 
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalWindow}>
                  <CustomText style={styles.modalTitle}>{login}</CustomText>
                  <CustomText style={styles.modalDescription}>{loginText}</CustomText>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, styles.loginButton, Constants.styles.shadow]} onPress={this._onRegister}>
                      <CustomText style={[styles.modalBtnText, styles.loginButtonText]}>{access}</CustomText>
                    </TouchableOpacity>
                    <View style={styles.buttonsSeparator} />
                    <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, styles.skipButton, Constants.styles.shadow]} onPress={this._onSkip}>
                      <CustomText style={[styles.modalBtnText, styles.skipButtonText]}>{skip}</CustomText>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
            </View>
        </Modal>
      )
    else 
      return null;
}


  render() {
    const { render } = this.state;
    return render && this._renderContent();
  }
  
}


ConnectedAuthHandler.navigationOptions = {
  title: 'ConnectedAuthHandler',
};


const styles = StyleSheet.create({
  fill: {
    position: "absolute",
    width: Layout.window.width,
    height: Layout.window.height,
    backgroundColor: "rgba(0,0,0, 0.5)",
    zIndex: 11,
  },
  fab: {
    position: "absolute",
    zIndex: 1,
    top: 25,
    right: 20,
    height: 50,
    width: 50
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 30, 
    marginTop: -30,
    borderTopColor: "#f2f2f2",
    borderTopWidth: 2,
    borderRightColor: "#f2f2f2",
    borderRightWidth: 2
  },
  sectionTitle: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    fontFamily: "montserrat-bold",
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  separator: {
    width: "100%",
    height: 8,
    backgroundColor: "#F2F2F2",
    marginVertical: 32
  },
  itemStyle: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f2f2f2",
    borderRadius: 10
  },
  starsView: {
    marginTop: -5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    flex: 1, 
    width: '100%', 
    height: '100%', 
    zIndex: 1, 
    position: 'absolute', 
    top: Layout.statusbarHeight, 
    left: 0, 
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWindow: { 
    paddingHorizontal: 28.5,
    paddingTop: 20,
    backgroundColor: "white", 
    zIndex: 2, 
    width: 280, 
    height: 200,
    flexDirection: "column",
    borderRadius: 4
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
    marginBottom: 14,
  },
  modalDescription: {
    fontSize: 12,
    color: "#333333"
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    height: 36,
    marginTop: 21
  },
  modalBtn: {
    minWidth: 106,
    height: 36,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    display: "flex",
  },
  loginButton: {
    alignSelf: "flex-start"
  },
  skipButton: {
    alignSelf: "flex-end",
    backgroundColor: Colors.lightGray
  },
  skipButtonText: {
    color: "black"
  },
  modalBtnText: {
    color: "white",
    fontFamily: "montserrat-bold",
    width: "100%",
    textAlign: "center"
  },
  buttonsSeparator: {
    width: 11
  }
});


function ConnectedAuthHandlerContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ConnectedAuthHandler 
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
})(ConnectedAuthHandlerContainer)