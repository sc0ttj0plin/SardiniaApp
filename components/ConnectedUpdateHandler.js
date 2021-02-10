import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import _ from 'lodash';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../actions';
import Layout from '../constants/Layout';
import * as Constants from '../constants';
import LoadingDots from './LoadingDots';
import Colors from '../constants/Colors';
import * as Updates from 'expo-updates';

const USE_DR = true;
const DR_TIMEOUT = 1000;

class UpdateHandler extends PureComponent {

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
      updating: false
    };
  }


  async componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), DR_TIMEOUT))};
    !__DEV__ && this._startUpdate();
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidUpdate(prevProps) {
    if (prevProps.others.checkForUpdates !== this.props.others.checkForUpdates) 
      !__DEV__ && this._startUpdate();
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/
  _startUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        this.setState({ updating: true });
        await Updates.fetchUpdateAsync();
        this.setState({ updating: false }, this._reloadApp);
      }
    } catch(e) {
      console.error(e);
    }
  }

  _reloadApp = () => setTimeout(async () => await Updates.reloadAsync(), Constants.RESTART_DELAY);

  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { updating } = this.state;
    const { updateInProgressTitle, updateInProgressDescription} = this.props.locale.messages;
    const showUpdate = updating && !__DEV__;

    if (showUpdate) 
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showUpdate}
          onRequestClose={() => { }}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalWindow}>
                <Text style={styles.modalTitle}>{updateInProgressTitle}</Text>
                <Text style={styles.modalDescription}>{updateInProgressDescription}</Text>
                <View style={styles.loadingDotsView1}>
                  <View style={styles.loadingDotsView2}>
                    <LoadingDots isLoading={true} />
                  </View>
                </View>
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


UpdateHandler.navigationOptions = {
  title: 'UpdateHandler',
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
    marginBottom: 14,
    fontFamily: "montserrat-regular"
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
  }
});


function UpdateHandlerContainer(props) {
  const store = useStore();

  return <UpdateHandler 
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
})(UpdateHandlerContainer)