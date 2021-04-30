import React, { Component } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ExtraItem,
  AsyncOperationStatusIndicator,  
  ConnectedHeader, 
  ConnectedScreenErrorBoundary,
  LoadingLayoutEntitiesFlatlist,
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';

const USE_DR = false;
class ExtrasScreen extends Component {

  constructor(props) {
    super(props); 

    this.state = {
      render: USE_DR ? false : true,
      //
      extras: [],
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.setMainScreenMounted(true); /* tell that the main screen has mounted (used by ConnectedSplashLoader) */
    this.props.actions.getPois({uuids: Constants.SCREENS.extras.defaultUuids});
  }

  componentDidUpdate(prevProps) {
    if(prevProps.pois !== this.props.pois){
      // Replace title with temporary custom title
      const { extrasLiveTheSea, extrasWildNature, extrasMythIsland, extrasTradition, extrasCulture, extrasStarredPlaces } = this.props.locale.messages;
      const titles = [extrasStarredPlaces, extrasLiveTheSea, extrasWildNature, extrasMythIsland, extrasTradition, extrasCulture];
      const { lan } = this.props.locale;
      let extras = [];
      Constants.SCREENS.extras.defaultUuids.forEach((uuid, index) => {
        let poi = this.props.pois.data[uuid];
        const newTitle = titles[index]; 
        let title = { [lan]: [{ value: newTitle }] };
        extras.push({ ...poi, title });
      });
      this.setState({ extras });
    }
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => this.props.pois.success;
  _isLoadingData  = () => this.props.pois.loading;
  _isErrorData    = () => this.props.pois.error;  


  /********************* Render methods go down here *********************/
  _renderItem = (item , index) => {
    const { lan } = this.props.locale;
    const { findOutMore } = this.props.locale.messages;
    const title = _.get(item.title, [lan, 0, "value"], null);
    if(item.uuid == "fdabb67f-fc45-40fc-83da-ac3ab6f4672e") {
      item.image = "https://www.sardegnaturismo.it/sites/default/files/styles/top_pagina/public/petalirossi_saramadura_0.jpg?itok=N3tibLym"
    }
    if (title)
      return (
        <ExtraItem 
          onPress={ () => this.props.navigation.navigate(Constants.NAVIGATION.NavExtraScreen, { item })}
          title={title}
          image={item.image}
          btnTitle={findOutMore}
        />
      )
    else
      return null;
  } 

  _renderContent = () => {
     return (
      <AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        retryFun={() => {}} 
        loadingLayout={
          <LoadingLayoutEntitiesFlatlist 
            vertical={true} 
            numColumns={1} 
            itemStyle={styles.item} 
            style={styles.listStyle} 
            bodyContainerStyle={styles.listContainer}/>}
        >
          <FlatList 
            key={1}
            keyExtractor={item => item.uuid}
            data={this.state.extras}
            renderItem={({item, index}) => this._renderItem(item, index)}
            style={styles.fill}
            ItemSeparatorComponent={() => <View style={{height:2}}></View>}
          />
      </AsyncOperationStatusIndicator>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <ConnectedScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader />
          {render && this._renderContent()}
        </View>
      </ConnectedScreenErrorBoundary>
    )
  }
  
}


ExtrasScreen.navigationOptions = {
  title: 'Extras',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white",
    width: "100%"
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  item: {
    height: 450,
    width: "100%",
    marginBottom: 2,
    borderRadius: 0
  },
});


function ExtrasScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExtrasScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //graphql
    pois: state.poisState,
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
})(ExtrasScreenContainer)