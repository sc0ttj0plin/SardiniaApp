import React, { PureComponent, Component } from "react";
import { Text, View, StyleSheet, Platform, Linking, Share, TouchableWithoutFeedback, Modal, TouchableOpacity as TouchableOpacityRN } from "react-native";
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import actions from '../actions';
// import { Icon, Button } from "react-native-elements";
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons'; 
import Colors from '../constants/Colors';
import Layout from "../constants/Layout"
import * as Constants from '../constants';
import _ from 'lodash';
import CustomText from "./CustomText";

class ConnectedFab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      modalVisible: false,
      direction: props.direction ? props.direction : "up",
      uuid: props.uuid,
      isFavourite: props.favourites.places[props.uuid]
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.uuid !== this.props.uuid){
      this.setState({
        uuid: this.props.uuid
      })
    }
  }

  _openNavigator = (title, coords) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${coords.latitude},${coords.longitude}`;
    const label = title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url); 
  }



  _renderButtonFontAwesome = (backgroundColor, iconName, onPress) => {

    return(
      <TouchableOpacity
        activeOpacity={0.7} 
        style={[styles.button]} 
        onPress={onPress}>
        <FontAwesome name={iconName} size={20} color={backgroundColor} /> 
      </TouchableOpacity>
    )
  }

  _renderButtonFontAwesome5 = (backgroundColor, iconName, onPress) => {

    return(
      <TouchableOpacity
        activeOpacity={0.7} 
        style={[styles.button]} 
        onPress={onPress}>
        <FontAwesome5 name={iconName} size={20} color={backgroundColor} /> 
      </TouchableOpacity>
    )
  }

  _openParkingModal = () => {
    this.setState({modalVisible: true})
  }

  _shareInApp = async (link) => {
    try {
      const result = await Share.share({
        message: link,
        title: link,
        url: link
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  _renderParkingButton = (title, backgroundColor, action) => {
    return(
      <TouchableOpacityRN activeOpacity={0.8} style={[styles.modalBtn, {
        backgroundColor
      }]} onPress={action}>
        <CustomText style={[styles.modalBtnText, {
          backgroundColor
        }]}>{title}</CustomText>
      </TouchableOpacityRN>
    )
  }

  render() {
    const isFavourite = this.props.favourites.[this.props.type][this.state.uuid];
    const { nearParks, discoverParks, findParkBtn } = this.props.locale.messages;
    const { shareLink, coordinates, color, title } = this.props;
    const backgroundColor = color || Colors.colorPlacesScreen;
    return (
      <>
        <View style={styles.fabView}>
          <TouchableOpacity 
            style={[styles.fabButton, {backgroundColor: backgroundColor}]}
            onPress={() => this.setState({ active: !this.state.active })} 
            activeOpacity={0.8}>
              <FontAwesome5 name={this.state.active ? "times" : "plus"} size={25} color={"white"} />
          </TouchableOpacity>
          { this.state.active &&      
            <View style={styles.fabChildrenContainer}>
              { shareLink != "" && shareLink &&
                this._renderButtonFontAwesome(backgroundColor, "share-alt", () => this._shareInApp(shareLink))
              }
              { this.state.uuid != "" && this.state.uuid &&
                this._renderButtonFontAwesome(backgroundColor, isFavourite ? "heart" : "heart-o", () => this.props.actions.toggleFavourite({ type: this.props.type, id: this.state.uuid }))
              }
              {coordinates && (
                this._renderButtonFontAwesome5(backgroundColor, "parking", () => this._openParkingModal())
              )}
            </View>
          }
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => { }}>
          <View style={styles.modalView}>
            <TouchableOpacityRN 
              style={styles.modalInnerView}
              onPress={() => this.setState({modalVisible: false})} /* on press outside children */
              activeOpacity={1}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalWindow}>
                  <CustomText style={styles.modalTitle}>{nearParks}</CustomText>
                  <CustomText style={styles.modalDescription}>{discoverParks}</CustomText>
                  <View style={styles.firstRow}>
                    {this._renderParkingButton(findParkBtn, Colors.black, null)}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacityRN>
          </View>
          </Modal>
      </>
    )
  }
}

const styles = StyleSheet.create({
  fabView: {
    width: 55,
    backgroundColor: "transparent",
  },
  fabContainer: { 
    width: "100%",
    height: 165,
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    flexDirection: "column"
  },
  fabStyle: {
    backgroundColor: Colors.tintColor
  },
  fabButton: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: 55,
    width: 55,
    borderRadius: 50
  },
  fabChildrenContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    width: 55,
    backgroundColor: "transparent",
    marginTop: 15
  },
  button: {
    padding: 8, 
    borderRadius: 50, 
    marginBottom: 10,
    height: 36,
    width: 36,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    shadowColor: "#000",
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
  },
  modalView: {
    position: "absolute",
    top: Constants.COMPONENTS.header.height + Constants.COMPONENTS.header.bottomLineHeight,
    left: 0,
    height: Layout.window.height - Constants.COMPONENTS.header.height,
    width: Layout.window.width,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2,
  },
  modalInnerView:{
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWindow: { 
    paddingHorizontal: 30,
    paddingTop: 20,
    backgroundColor: "white", 
    zIndex: 2, 
    width: "80%", 
    height: 185,
    flexDirection: "column",
    borderRadius: 8
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
  modalBtn: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red"
  },
  modalBtnText: {
    color: "white",
    fontFamily: "montserrat-bold"
  },
  firstRow: {
    marginTop: 30,
    flexDirection: "row",
    width: "100%",
  },
  separator: {
    width: 10,
    height: 10
  }
});

function ConnectedFabContainer(props) {
  const store = useStore();
  const navigation = useNavigation();
  const route = useRoute();

  return <ConnectedFab 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => ({ 
  locale: state.localeState,
  favourites: state.favouritesState,
});
const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedFabContainer)

