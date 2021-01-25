import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { 
  CategoryListItem, 
  EntityItem,
  AsyncOperationStatusIndicator,  
  ConnectedHeader, 
  CustomText
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { shuffleArray } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLVerticalItemsFlatlist } from "../../components/loadingLayouts";
import sampleVideos from '../../constants/_sampleVideos';
import sampleVrModels from '../../constants/_sampleVrModels';
import {MEDIA_TYPES} from '../Media/Media';
import EntityRelatedList from '../../components/EntityRelatedList';
import { useSafeArea } from 'react-native-safe-area-context';
import EntityItemInGrid from '../../components/EntityItemInGrid'; 
import {LLEntitiesFlatlist} from "../../components/loadingLayouts/";

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
const PADDING = 3;

class GalleryScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      itemSize: {
        width: (Layout.window.width-PADDING*3)/2,
        height: (Layout.window.width-PADDING*3)/2,
      }
      //
    };
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.checkForUpdates();

    var uuids = [];
    sampleVrModels.map((obj) => uuids.push(obj.uuid));
    sampleVideos.map((obj) => uuids.push(obj.uuid));

    shuffleArray(uuids);

    this._videoUuids = uuids;

    setTimeout(() => this.props.actions.getPois({ uuids: uuids }), 1);
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    setTimeout(() => {
        if (prevProps.pois !== this.props.pois) {
            this._getPois(this._videoUuids).then(({pois, gridItems}) => {
              this.setState({pois, gridItems});
            });
        }
    }, 1);
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/




  /**
   * Get more pois when the user changes position and/or 
   * we reach the end of the category tree . 
   * Pois are loaded in order of distance from the user and are "categorized"
   * to load pois in the bottom scrollable container list (not header)
   * uuids controls the category of the pois
   */
  _loadMore = () => {
    
  }

  /**
   * Open single inspirer screen
   * @param {*} item: item list
   */
  _openMedia = (item) => {
    if(item.media_url)
      this.props.navigation.navigate(Constants.NAVIGATION.NavMediaScreen, { source: item.media_url, type: item.mediaType, item: item });
  }

  _isSuccessData  = () => this.props.pois.success;
  _isLoadingData  = () => this.props.pois.loading; 
  _isErrorData    = () => this.props.pois.error;   


  _getPois = (uuids) => {

    return new Promise((res,rej) => {

      var videos = [];
      sampleVideos.map(mediaItem => {
        videos.push({...mediaItem});
      });
      var vrModels = [];
      sampleVrModels.map(mediaItem => {
        vrModels.push({...mediaItem});
      });

      let pois = [];
      uuids.map( (uuid, index) => {
        if(this.props.pois.data[uuid]) {
          var poi = {...this.props.pois.data[uuid]};
          
          videos.map((mediaItem, index) => {
            if(mediaItem.uuid === poi.uuid && !mediaItem.assigned && !poi.media_url) {
                poi.media_url = mediaItem.video_url;
                poi.mediaType = MEDIA_TYPES.VIDEO;
                poi.uuid_media = uuid + "_" + MEDIA_TYPES.VIDEO;
                mediaItem.assigned = true;
            }
          })

          vrModels.map((mediaItem, index) => {
            if(mediaItem.uuid === poi.uuid && !mediaItem.assigned && !poi.media_url) {
                poi.media_url = mediaItem.vr_url;
                poi.mediaType = MEDIA_TYPES.VIRTUAL_TOUR;
                poi.uuid_media = uuid + "_" + MEDIA_TYPES.VIRTUAL_TOUR;
                mediaItem.assigned = true;
            }
          });

          pois.push(poi);
        }
      })
      var gridItems = this._prepareGridItems(pois);

      res({pois, gridItems})
    
    })
  }


  _prepareGridItems = (pois) => {
    var windowWidth = Layout.window.width;
    var itemSize = this.state.itemSize;
    var gridItems = [];
    var currentIndex = 0;
    var mainItemIndex = 0;
    while(pois.length - currentIndex > 0) {
      var random = Math.random();
      var rowItem = {};
      rowItem.itemSize = itemSize;
      rowItem.items = [];
      if(pois.length - currentIndex >= 3 && random > 0.5) {
        rowItem.items.push(this._parseEntity(pois[currentIndex++]));
        rowItem.items.push(this._parseEntity(pois[currentIndex++]));
        rowItem.items.push(this._parseEntity(pois[currentIndex++]));
        rowItem.mainItemIndex = mainItemIndex == 0 ? 0 : 2;
        rowItem.index = gridItems.length;
        gridItems.push(rowItem);
        mainItemIndex=(mainItemIndex+1)%2;
      }
      else {
        if(pois[currentIndex]) {
          rowItem.items.push(this._parseEntity(pois[currentIndex]));
          currentIndex++;
        }
        if(pois[currentIndex]) {
          rowItem.items.push(this._parseEntity(pois[currentIndex]));
          currentIndex++;
        }
        rowItem.index = gridItems.length;
        gridItems.push(rowItem);
      }
    }
    return gridItems;
  }


  _parseEntity = (item) => {
    const title = item.title && _.get(item.title, [this.props.locale.lan, 0, "value"], "");
    const subtitle = item && item.term ? item.term.name : "";
    const image = item.image;
    const media_url = item.media_url, mediaType = item.mediaType, uuid_media = item.uuid_media;
    return {title, subtitle, image, media_url, mediaType, uuid_media};
  }

  /********************* Render methods go down here *********************/


  _renderRow = ({item, index}) => {
    return <EntityItemInGrid
      itemSize={item.itemSize}
      items={item.items}
      mainItemIndex={item.mainItemIndex}
      keyItem={index}
      onPressItem={this._openMedia}
      padding={PADDING}
    />;
  }

  _renderLoadingLayout = () => {
    return <LLEntitiesFlatlist 
        itemStyle={{
          width: this.state.itemSize.width,
          height: this.state.itemSize.height,
          borderRadius: 0
        }}
        numColumns={2}
        horizontal={false} 
        style={[styles.fill, styles.listStyle]} 
        contentContainerStyle={styles.contentContainerStyle}
        error={false}
        disableSeparator={false}
        separatorSize={{width: PADDING, height: PADDING}}
        />
  }

  _renderContent = () => {
    const {videoAnd3D} = this.props.locale.messages;
    const data = this.state.gridItems;

    return (
      <View style={{flex: 1}} onLayout={this._onLayout}>   
        <CustomText style={[styles.sectionTitle]}>{videoAnd3D}</CustomText>
          <AsyncOperationStatusIndicator
              loading={true}
              success={data && data.length > 0}
              error={false}
              loadingLayout={this._renderLoadingLayout()}>
          <FlatList
              data={data}
              keyExtractor={item => item.index}
              showsHorizontalScrollIndicator={false}
              numColumns={1}
              contentContainerStyle={[styles.contentContainerStyle, {paddingBottom: this.props.insets.bottom}]}
              style={[styles.listStyle]}
              renderItem={this._renderRow}
              />
        </AsyncOperationStatusIndicator>
      </View>
    );
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader 
          onBackPress={this._backButtonPress}
          iconTintColor={Colors.colorGalleryScreen}  
          backButtonVisible={this.props.others.inspirersTerms.length > 0}
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


GalleryScreen.navigationOptions = {
  title: 'GalleryScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  listStyle: {
    backgroundColor: "transparent",
    paddingHorizontal: 3
  },
  contentContainerStyle: {
    paddingTop: PADDING
  },
  sectionTitle: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    width: "100%"
  },
});


function GalleryScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const isFocused = useIsFocused();
  const insets = useSafeArea();

  return <GalleryScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    isFocused={isFocused}
    insets={insets} />;
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
})(GalleryScreenContainer)