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
const RESTART_DELAY = 2000;

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

  _reloadApp = () => setTimeout(async () => await Updates.reloadAsync(), RESTART_DELAY);

  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { updating } = this.state;
    const { updateInProgressText, updateFinishedText } = this.props.locale.messages;
    const showUpdate = updating && !__DEV__;
    if (showUpdate) 
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showUpdate}
          onRequestClose={() => { }}>
            <View style={[styles.fill]}>
            <View style={styles.loadingDotsView1}>
              <View style={styles.loadingDotsView2}>
                <LoadingDots />
              </View>
            </View>
            <View 
              style={styles.modalView} 
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalWindow}>
                  {showUpdate ? 
                    <Text style={styles.modalTitle}>{updateInProgressText}</Text> 
                    :
                    <Text style={styles.modalTitle}>{updateFinishedText}</Text> 
                  }
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


UpdateHandler.navigationOptions = {
  title: 'UpdateHandler',
};


const styles = StyleSheet.create({
  fill: {
    // position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0, 0.5)",
    zIndex: 10,
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
    width: "100%",
    textAlign: "center"
  },
  buttonsSeparator: {
    width: 11
  },
  loadingDotsView1: {
    position: "absolute",
    zIndex: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center"
  },
  loadingDotsView2: {
    width: 100
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