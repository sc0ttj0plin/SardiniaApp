import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableWithoutFeedback, Modal } from "react-native";
import _ from 'lodash';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../actions';
import { openRelatedEntity } from '../helpers/screenUtils';
import { apolloQuery } from '../apollo/queries';
import Layout from '../constants/Layout';
import * as Constants from '../constants';
import LoadingDots from './LoadingDots';
import Colors from '../constants/Colors';
import * as Updates from 'expo-updates';
import ExpoConstants from 'expo-constants';
import { navigationRef } from "../navigation/RootNavigation";

const USE_DR = false;
const DR_TIMEOUT = 1000;
const NAVIGATE_TO_LINK_SCREEN_DELAY = 2000;

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
      success: false,
      loading: false,
      error: null,
      queryStr: null,
    };
  }


  async componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), DR_TIMEOUT))};
    const url = this.props.others.url;
    if (url && url.indexOf(ExpoConstants.manifest.extra.websiteDomain)) {
      /* www.abc.com/a/b/c?querystr1=x => c */
      const lastBackslashIdx = url.lastIndexOf('/')+1; 
      const trailingQueryStr = url.substring(lastBackslashIdx, url.length).split('?')[0]; 
      this.setState({ queryStr: trailingQueryStr });
    }
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.others.navigatorReady !== this.props.others.navigatorReady && this.props.others.navigatorReady) {
      this.setState({ success: false, loading: true, error: null });
      apolloQuery(actions.autocomplete({
        queryStr: this.state.queryStr, 
        vidsInclude: [Constants.VIDS.poisCategories, Constants.VIDS.pois, Constants.VIDS.inspirersCategories, Constants.VIDS.events],
        typesExclude: [Constants.NODE_TYPES.events],
      })).then((autocompleteResults) => {
        this.setState({ success: true, loading: false, error: null });
        if (autocompleteResults.length > 0) {
          const item = autocompleteResults[0].node || {};
          console.log(item)
          setTimeout( () => openRelatedEntity(item.type, navigationRef.current, "navigate", { item, mustFetch: true }), NAVIGATE_TO_LINK_SCREEN_DELAY);
        }
      }).catch(e => {
        this.setState({ success: false, loading: false, error: e.message });
      });  
    }

  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { loadingLinkingContentTitle, loadingLinkingContentDescription} = this.props.locale.messages;
    const showModal = this.props.others.navigatorReady && this.state.loading;

    if (showModal) 
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showModal}
          onRequestClose={() => { }}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalWindow}>
                <Text style={styles.modalTitle}>{loadingLinkingContentTitle}</Text>
                <Text style={styles.modalDescription}>{loadingLinkingContentDescription}</Text>
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
    return render && this.state.queryStr && this._renderContent();
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
  // const navigation = useNavigation();
  // const route = useRoute();
  const store = useStore();

  return <UpdateHandler 
    {...props}
    // navigation={navigation}
    // route={route}
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