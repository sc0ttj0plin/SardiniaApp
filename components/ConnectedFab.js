import React, { PureComponent, Component } from "react";
import { Text, View, StyleSheet, Platform, Linking } from "react-native";
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
import * as Constants from '../constants';
import _ from 'lodash';

class ConnectedFab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      direction: props.direction ? props.direction : "up",
      nid: props.nid,
      isFavourite: props.favourites.places[props.nid]
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.nid !== this.props.nid){
      this.setState({
        nid: this.props.nid
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



  _renderButton = (backgroundColor, iconName, onPress) => {

    return(
      <TouchableOpacity
        activeOpacity={0.7} 
        style={[styles.button]} 
        onPress={onPress}>
        <FontAwesome name={iconName} size={20} color={backgroundColor} /> 
      </TouchableOpacity>
    )
  }

  render() {
    const isFavourite = this.props.favourites.places[this.state.nid];
    const { shareLink, coordinates, color, title } = this.props;
    const backgroundColor = color || Colors.colorPlacesScreen;
    return (
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
              this._renderButton(backgroundColor, "share-alt", () => Linking.openURL(shareLink))
            }
            { this.state.nid != "" && this.state.nid &&
              this._renderButton(backgroundColor, isFavourite ? "heart" : "heart-o", () => this.props.actions.toggleFavourite({ type: "places", id: this.state.nid }))
            }
            {coordinates && (
              this._renderButton(backgroundColor, "location-arrow", () => this._openNavigator(title, coordinates))
            )}
          </View>
        }
      </View>
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
    backgroundColor: "red",
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

