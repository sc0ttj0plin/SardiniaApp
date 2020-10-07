import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { GeoRefHListItem, CategoryListItem, ScrollableHeader, Header, AsyncOperationStatusIndicator} from "../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import Colors from '../constants/Colors';
import * as Constants from '../constants';

class LanguageScreen extends Component {

  constructor(props) {
    super(props);

    //let { someNavProps } = props.route.params; 

    this.state = {

    };
      
  }

  componentDidMount() {

  }

  _onPress = (lan) => {
    this.props.actions.changeLocale(lan);
    this.props.navigation.navigate(Constants.NAVIGATION.NavTabNavigator);
  }


  _renderContent = () => {
    const { lanItalian, lanEnglish } = this.props.locale.messages;
    return (
      <View style={styles.fill}>
        <View style={styles.container}>
          <Button 
            type="outline" 
            backgroundColor={Colors.tintColor} 
            buttonStyle={styles.btn} 
            title={lanEnglish}
            containerViewStyle={styles.btnView} 
            onPress={() => this._onPress('en')}/>
          <Button 
            type="outline" 
            backgroundColor={Colors.tintColor} 
            buttonStyle={styles.btn} 
            title={lanItalian} 
            containerViewStyle={styles.btnView}
            onPress={() => this._onPress('it')}/>
        </View>
      </View>
    );
  }


  render() {
    return (
      <View style={styles.fill}>
        {this._renderContent()}
      </View>
    )
  }
  
}


LanguageScreen.navigationOptions = {
  title: 'Language',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    backgroundColor: "white"
  },
  container: {
  },
  btn: {
    marginBottom: 30,
    width: Layout.window.width / 2,
    height: 50,
    borderRadius: 10,
    borderColor: Colors.tintColor,
  },
  btnView: {
  }
});


function LanguageScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <LanguageScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    // someState: state.graphqlState.someState,
    // someStateError: state.graphqlState.someStateError,
    // someStateLoading: state.graphqlState.someStateLoading,
    locale: state.localeState,
    // error: state.restState.error,
    // loading: state.restState.loading
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(LanguageScreenContainer)