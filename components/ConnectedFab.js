import React, { PureComponent, Component } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import * as othersActions from '../actions/others';
import * as favouritesAction from '../actions/favourites';
import { Icon } from "react-native-elements";
import Colors from '../constants/Colors';
import _ from 'lodash';

/**
 * Connected fab component used for rendering a set of actions 
 * represented as button and hidden until press
 */
class ConnectedFab extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      direction: props.direction ? props.direction : "up"
    };
  }

  render() {
    return (
      <View style={{
        width: 55,
        backgroundColor: "transparent",
      }}>
      <TouchableOpacity 
        style={[styles.btn1, {backgroundColor: this.props.color}]}
        onPress={() => this.setState({ active: !this.state.active })} 
        activeOpacity={0.8}>
            <Icon name="add" size={25} color={"white"} />

      </TouchableOpacity>
      { this.state.active &&      
        <View style={styles.fabView}>
          {this.props.children}
        </View>
      }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  btn1: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: 55,
    width: 55,
    borderRadius: 50
  },
  fabView: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
    width: 55,
    backgroundColor: "transparent",
    marginTop: 15
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
    // top: 10,
    // right: 10,
  },
  fabStyle: {
    backgroundColor: Colors.tintColor
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
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions, ...othersActions, ...favouritesAction}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedFabContainer)

