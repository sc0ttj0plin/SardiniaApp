import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";
import { DrawerItem } from '@react-navigation/drawer';
import Layout from '../constants/Layout';
import Colors from '../constants/Colors'; 
import _ from 'lodash';
import { useNavigation, useRoute } from '@react-navigation/native';
import actions from '../actions';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DrawerActions } from '@react-navigation/native';
import CustomText from "./CustomText";

/**
 * Used in the drawer view, it shows all the different languages available for translation
 */
class ConnectedLanguageList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  _onPress = (lan) => {
    this.props.actions.changeLocale(lan);
    this.props.navigation.dispatch(DrawerActions.toggleDrawer());
  }


  render() {
    return (
      <View style={styles.fill}>
        <DrawerItem
          label="🇬🇧"
          labelStyle={styles.labelStyle}
          style={styles.itemStyle}
          onPress={() => this._onPress('en-gb')}
        />
        <DrawerItem
          label="🇮🇹"
          labelStyle={styles.labelStyle}
          style={styles.itemStyle}
          onPress={() => this._onPress('it')}
        />
      </View>
    );
  }
}



function ConnectedLanguageListContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ConnectedLanguageList 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemStyle: {
  },
  header: {
    backgroundColor: "white"
  },
  container: {
  },
  labelStyle: {
    textAlign: 'center',
    fontSize: 25,
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


const mapStateToProps = state => ({ locale: state.localeState });
const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedLanguageListContainer)

