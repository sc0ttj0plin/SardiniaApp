import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import * as Updates from 'expo-updates';
import _ from 'lodash';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import CustomText from "../others/CustomText";


/**
 * We have two kinds of error boudaries: Global & Redux & Screen,
 * Global errors are basically unhandled errors and are ca
 * Redux error boundary deals with failing actions, Screen error boundary deals with on-screen failures (components failures + api calls)
 * This component implements Redux Error boundary and catches the global redux errors allowing the the user to retry a failing action.
 * The mechanism is implemented as follows:
 *  1) A generic setReduxError action is sent every time an action that can be retried fails (in our case in apollo's middleware)
 *     setReduxError registers to redux the last error object + the last action that failed: this.props.others.reduxError & this.props.others.reduxErrorSourceAction
 *  2) ConnectedErrorBoundary component listens for reduxError updates and if it isn't null it show a retry/cancel modal
 *  3) On user retry, a special action named sendAction ships the failed action (reduxErrorSourceAction) to redux again 
 *  -) on retry or cancel the global error is cleared with unsetReduxError
 * To test this modal add in Places.js > componentDidMount the following piece of code which triggers a generic error and a poi loading action
 *   setTimeout(() => {
 *     this.props.actions.sendAction({ 
 *       type: Constants.SET_ERROR,
 *       payload: {
 *         error: { message: "Test Error" },
 *         sourceAction: actions.getCategories({ vid: Constants.VIDS.poisCategories })
 *       } 
 *     })
 *   }, 6000);
 */


class ConnectedErrorBoundary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { 
      modalVisible: false,
    };

  if (!__DEV__) 
    ErrorUtils.setGlobalHandler(async (error, isFatal) => {
      console.log("[global error]", error.message);
      props.actions.reportAction({ analyticsActionType: Constants.ANALYTICS_TYPES.errorTrace, meta: error } );
      if (isFatal)
        setTimeout(Updates.reloadAsync, Constants.RESTART_DELAY);
    });
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidUpdate(prevProps) {
    if (prevProps.others.reduxError !== this.props.others.reduxError && this.props.others.reduxError) {
      //can resubmit the action with this.props.actions.sendAction(this.props.others.reduxErrorSourceAction)
      this.setState({ modalVisible: true });
      this.props.actions.reportAction({ analyticsActionType: Constants.ANALYTICS_TYPES.errorTrace, meta: this.props.others.reduxError } );
      console.log("[redux error]", this.props.others.reduxError, this.props.others.reduxErrorSourceAction);
    }
  }

  componentDidCatch(error, errorInfo) {
    // this.setState({ modalVisible: true, hasErrored: true, error });
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _onRetry = () => {
    this.setState({ modalVisible: false });
    // Clear redux error and re-send failed action
    this.props.actions.unsetReduxError();
    if (this.props.others.reduxErrorSourceAction)
      this.props.actions.sendAction(this.props.others.reduxErrorSourceAction);
  }

  _onSkip = () => { 
    this.setState({ modalVisible: false });
  }

  /********************* Render methods go down here *********************/

  _renderContent = () => {
    const { modalVisible } = this.state;
    const { retry, cancel, reduxErrorTitle, reduxErrorBody } = this.props.locale.messages;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}>
          <View 
            style={styles.modalView} 
          >
              <View style={styles.modalWindow}>
                <CustomText style={styles.modalTitle}>{reduxErrorTitle}</CustomText>
                <CustomText style={styles.modalDescription}>{reduxErrorBody}</CustomText>
                <View style={styles.modalButtons}>
                  <TouchableOpacity activeOpacity={0.7} style={[styles.modalBtn, styles.loginButton, Constants.styles.shadow]} onPress={this._onRetry}>
                    <CustomText style={[styles.modalBtnText]}>{retry}</CustomText>
                  </TouchableOpacity>
                  <View style={styles.buttonsSeparator} />
                  <TouchableOpacity activeOpacity={0.7} style={[styles.modalBtn, styles.skipButton, Constants.styles.shadow]} onPress={this._onSkip}>
                    <CustomText style={[styles.modalBtnText, styles.skipButtonText]}>{cancel}</CustomText>
                  </TouchableOpacity>
                </View>
              </View>
          </View>
      </Modal>
    );
  }

  render() {
    if (this.props.others.reduxError && this.props.others.mainScreenIsShown) 
      return (
        <>
          {this.props.children}
          {this._renderContent()}
        </>
      )

    return this.props.children; 
  }
}

const styles = StyleSheet.create({
  itemStyle: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f2f2f2",
    borderRadius: 10
  },
  modalView: {
    flex: 1, 
    width: '100%', 
    height: '100%', 
    zIndex: 1, 
    backgroundColor: "rgba(0,0,0, 0.7)",
    position: 'absolute',
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "10%"
  },
  modalWindow: {
    padding: 28.5,
    backgroundColor: "white", 
    zIndex: 2,
    flexDirection: "column",
    borderRadius: 4
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
    marginBottom: 14,
    textTransform: "uppercase"
  },
  modalDescription: {
    fontSize: 12,
    fontFamily: "montserrat-regular",
    textAlign: "justify",
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
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
  buttonsSeparator: {
    width: 11
  }
});

function ConnectedReduxErrorBoundaryContainer(props) {
  const store = useStore();

  return <ConnectedErrorBoundary 
    {...props}
    store={store} />;
}

const mapStateToProps = state => ({ 
  locale: state.localeState,
  others: state.othersState,
});

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedReduxErrorBoundaryContainer)

