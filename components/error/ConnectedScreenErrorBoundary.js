import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import actions from '../../actions';
import _ from 'lodash';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import CustomText from "../others/CustomText";

/**
 * We have two kinds of error boudaries: Redux & Screen,
 * Redux error boundary deals with failing actions, Screen error boundary deals with on-screen failures (components failures + api calls)
 * This component implements Screen error boundary and catches the on screen errors (component failures + api calls that throw)
 * Compared to ConnectedErrorBoundary this component accept a retry function and doesn't use actions nor redux.
 * In rare cases the retry function can be a full app restart.
 * To test this mechanism add in Places.js > componentDidMount the following piece of code:
 *   setTimeout(() => {throw new Error('Test')}, 6000); or setTimeout(() => { this._____() }, 6000);
 */
class ConnectedScreenErrorBoundary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { 
      hasErrored: false, //true if one of the child components has errored
      error: null,
      modalVisible: false,
    };
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  static getDerivedStateFromError(error) {
    console.log("Did catch")
    return { modalVisible: true, hasErrored: true, error };  
  }

  // componentDidCatch(error, errorInfo) {
  //   this.setState({ modalVisible: true, hasErrored: true, error });
  // }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _onRetry = () => {
    this.setState({ modalVisible: false, hasErrored: false, error: null });
    if (this.props.retryFun)
      this.props.retryFun();
  }

  _onSkip = () => { 
    this.setState({ modalVisible: false, hasErrored: false, error: null });
  }

  /********************* Render methods go down here *********************/

  _renderContent = () => {
    const { modalVisible } = this.state;
    const { retry, cancel, screenErrorTitle, screenErrorBody } = this.props.locale.messages;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}>
          <View 
            style={styles.modalView} 
          >
              <View style={styles.modalWindow}>
                <CustomText style={styles.modalTitle}>{screenErrorTitle}</CustomText>
                <CustomText style={styles.modalDescription}>{screenErrorBody}</CustomText>
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
    if (this.state.hasErrored) {
      return (
        <>
          {/* {this.props.children} */}
          {this._renderContent()}
        </>
      )
    }
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

function ScreenErrorBoundaryContainer(props) {
  const store = useStore();

  return <ConnectedScreenErrorBoundary 
    {...props}
    store={store} />;
}

const mapStateToProps = state => ({ 
  locale: state.localeState,
  others: state.othersState,
});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ScreenErrorBoundaryContainer)

