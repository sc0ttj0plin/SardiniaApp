import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import _ from 'lodash';
import NetInfo from "@react-native-community/netinfo";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../actions';
import Layout from '../constants/Layout';
import * as Constants from '../constants';
import Colors from '../constants/Colors';
import LoadingDots from './LoadingDots';
import CustomText from './CustomText';

const USE_DR = true;
const DR_TIMEOUT = 1000;
const RESTART_DELAY = 2000;

class ConnectedNetworkChecker extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      render: USE_DR ? false : true,
      loginData: null,
      isLoggedIn: false,
      url: null,
      //
      modalVisible: true,
      modalAction: null,
      //
      isConnected: true
    };

    this._unsubscribeNetInfo = null;
    // Subscribe
    this._unsubscribeNetInfo = NetInfo.addEventListener(state => {
      this.setState({ isConnected: state.isConnected });
      this.props.actions.setNetworkStatus(state);
    });
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), DR_TIMEOUT))};
    // const netResult = await Network.getNetworkStateAsync();
    //{ type: Network.StateType.CELL ULAR,isConnected: true,isInternetReachable: true,}
  }

  componentWillUnmount() {
    // Unsubscribe
    this._unsubscribeNetInfo();
  }

  _onPressed = () => {
    NetInfo.fetch().then(state => {
      this.setState({ isConnected: state.isConnected });
      this.props.actions.setNetworkStatus(state);
    });
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { isConnected } = this.state;
    const { disconnected, pleaseConnect, retry } = this.props.locale.messages;
    if (!isConnected) 
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!isConnected}
          onRequestClose={() => { }}>
            <View 
              style={styles.modalView} >
              <TouchableWithoutFeedback>
                <View style={styles.modalWindow}>
                  <Text style={styles.modalTitle}>{disconnected}</Text>
                  <Text style={styles.modalDescription}>{pleaseConnect}</Text>
                  <TouchableOpacity activeOpacity={0.7} style={[styles.modalBtn, Constants.styles.shadow]} onPress={this._onPressed}>
                    <CustomText style={[styles.modalBtnText]}>{retry}</CustomText>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
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


ConnectedNetworkChecker.navigationOptions = {
  title: 'ConnectedNetworkChecker',
};


const styles = StyleSheet.create({
  modalView: {
    flex: 1, 
    width: '100%', 
    height: '100%', 
    zIndex: 1, 
    position: 'absolute',
    left: 0, 
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "10%"
  },
  modalWindow: { 
    padding: 28.5,
    backgroundColor: "white", 
    zIndex: 2,
    flexDirection: "column",
    borderRadius: 4,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 15,
    marginBottom: 14,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  modalDescription: {
    fontSize: 12,
    fontFamily: "montserrat-regular",
    textAlign: "justify",
    marginBottom: 30,
  },
  loadingDotsView1: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  loadingDotsView2: {
    width: 100,
    height: 30
  },
  modalBtn: {
    minWidth: 106,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    display: "flex",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  modalBtnText: {
    color: "white",
    fontFamily: "montserrat-bold",
    width: "100%",
    textAlign: "center",
    textTransform: "uppercase"
  },
});


function ConnectedNetworkCheckerContainer(props) {
  const store = useStore();

  return <ConnectedNetworkChecker 
    {...props}
    store={store} />;
}


const mapStateToProps = state => {
  return {
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
})(ConnectedNetworkCheckerContainer)