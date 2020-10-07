import React, { PureComponent } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { SearchBar } from 'react-native-elements';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Colors from '../constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';

function SearchBarFocus (props) {

}

class Header extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      search: '',
      searchbarVisible: false,
      backButtonVisible: props.backButtonVisible ? props.backButtonVisible : false,
      searchButtonVisible: typeof props.searchButtonVisible !== 'undefined' ? props.searchButtonVisible : true,
    };
  }
  
  _searchButtonPressed = () => {
    this.setState({
      searchbarVisible: true,
    });
  }

  _searchCloseButtonPressed = () => {
    this.setState({
      searchbarVisible: false,
    });
  }
  
  _backButtonPressed = () => {
    var {navigation} = this.props;
    navigation.goBack();
  }

  _updateSearch = search => {
    this.setState({ search });
  };

  render() {
    const { search } = this.state;

    return (
  <View style={styles.container}>
      <Button
      type="clear"
      containerStyle={[styles.buttonContainer]}
      buttonStyle={styles.button}
      onPress={() => this.props.navigation.toggleDrawer()}
      icon={
        <Ionicons
          name={Platform.OS === 'ios' ? 'ios-menu' : 'md-menu'}
          size={40}
          color={Colors.tintColor}
        />
        }
      />
    <View
      style={[styles.searchBarContainer, this.props.style]}>
      {this.state.searchbarVisible ? (
      <SearchBar
        lightTheme={true}
        placeholder="Inserisci qui..."
        onChangeText={this._updateSearch}
        value={search}
        containerStyle={styles.searchBarExternalContainer}
        inputContainerStyle={styles.searchBarInputContainer}
        inputStyle={styles.searchBarInput}
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
      />
      ) : 
      (
      <Image
        style={styles.logo} 
        source={require('../assets/images/header-logo.png')}
        />
      )
      }
      </View>
        

    {this.state.searchButtonVisible && !this.state.searchbarVisible && (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer]}
        buttonStyle={styles.button}
        onPress={this._searchButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
            size={30}
            color={Colors.tintColor}
          />
        }
      />
      )}  

    {this.state.searchButtonVisible && this.state.searchbarVisible && (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer]}
        buttonStyle={styles.button}
        onPress={this._searchCloseButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'}
            size={30}
            color={Colors.tintColor}
          />
        }
      />
      )}  

    {this.state.backButtonVisible && (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer]}
        buttonStyle={styles.button}
        onPress={this._backButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
            size={30}
            color={Colors.tintColor}
          />
        }
      />
      )}
      
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    backgroundColor: 'rgba(255,255,255,0.90)'
  },
  searchBarExternalContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0
  },
  searchBarInputContainer: {
    height: "100%",
  },
  searchBarContainer: {
    flex: 1,
    alignItems:'center',
    height: 60
  },
  buttonContainer: {
    backgroundColor: "transparent"
  },
  button: {
    height: "100%",
    width: 50
  },
  logo: {
    flex: 1,
  }
});

function HeaderContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();

  return <Header 
    {...props}
    navigation={navigation}
    route={route}/>;
}

export default HeaderContainer;