import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, Pressable,
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules, Easing, PixelRatio } from "react-native";

import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import AsyncOperationStatusIndicator from './AsyncOperationStatusIndicator';
import ClusteredMapViewTop from './ClusteredMapViewTop';
import ScrollableContainer from './ScrollableContainer';
import CustomText from './CustomText';
import SectionTitle from './SectionTitle';
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../helpers/maps';
import MapView from "react-native-map-clustering";
import ScrollableAnimatedHandle from '../components/ScrollableAnimatedHandle';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { apolloQuery } from '../apollo/queries';
import _, { set } from 'lodash';
import Layout from '../constants/Layout';
import actions from '../actions';
import * as Constants from '../constants';
import Colors from '../constants/Colors';
import { LLHorizontalItemsFlatlist } from "../components/loadingLayouts";
import { Button } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
const { Value, event, interpolate } = Animated;
import {Modalize} from 'react-native-modalize';
import BottomSheet from 'reanimated-bottom-sheet';
import EntityWidgetInModal from "../components/EntityWidgetInModal";
import * as Location from 'expo-location';

/**
 * Map:             Clusters + pois that update with user map's interaction
 *                    can be filtered by category *same filter of Categories&Pois (redux)
 * NearToYou:       near to the user's location (all categories) rendered in the top header
 *                    called at mount + when user changes position (_fetchNearestPois)
 * Categories&Pois: List of Categories and Pois that are in the list
 *                    called when the user reaches the end of the category tree 
 *                    using current selected category + user location (_loadMorePois)
 */

const USE_DR = false;
const MODAL_STATES = { explore: 'explore', extraModal: 'extraModal', selectedEntity: 'selectedEntity' };

class ConnectedMapScrollable extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};
    this._modalState;
    this._fontScale = PixelRatio.getFontScale();

    this.state = {
      render: USE_DR ? false : true,
      coords: {},
      region: Constants.MAP.defaultRegion,
      scrollableSnap: 1,
      snapPoints: [],
      //
      selectedEntity: null 
    };
      
    this._pageLayoutHeight = Layout.window.height;
    this._filterList = null;
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  async componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
  }

  /**
   * Update component based on prev props
   * @param {*} prevProps
   */
  componentDidUpdate(prevProps) {
    // if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
    //   // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
    //   this._onUpdateCoords(this.props.others.geolocation.coords);
    // }
  }


  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * Used to compute snap points
   * @param {*} event layout event
   */
  _onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    this._pageLayoutHeight = height;
    //height of parent - Constants.COMPONENTS.header.height (header) - Constants.COMPONENTS.header.bottomLineHeight (color under header) - 24 (handle) - 36 (header text) - 160 (entityItem) - 10 (margin of entityItem) - 36 (whereToGo text)
    // this.setState({ snapPoints: [height - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight, 72 * this._fontScale, 0] });
    this.setState({ snapPoints: [height - Constants.COMPONENTS.header.bottomLineHeight, 72 * this._fontScale, 0] });
  }; 

  /**
   * 
   */
  _onSettleIndex = (index) => {
    //Set global snap index for the current entityType
    this.setState({ snapIndex: index });
  }

  /********************* Modal control methods go down here *********************/
  /**
   * Set a generic modal state based on the current modal state
   * scrollableSnap = 1 -> snap index of show main scrollable
   * scrollableSnap = 2 -> snap index of main scrollable being completely closed
   * These indexes are linked to the state's variable snapPoints set on _onPageLayout
   */
  _setModalState = (state) => {
    this._modalState = state;
    // Explore (main)
    if(state == MODAL_STATES.explore) {
      this.setState({ scrollableSnap: 1 });
      this._refs["extraModalRef"].close(); this._refs["extraModalRef"].close();
      this._refs["selectedEntityModalRef"].close(); this._refs["selectedEntityModalRef"].close();
    } 
    // Extra modal
    else if(state == MODAL_STATES.extraModal)
      this.setState({ scrollableSnap: 2 }, () => {
        this._openModal(this._refs["selectedEntityModalRef"], false);
        this._openModal(this._refs["extraModalRef"], true);
      });
    // Selected entity on map
    else if(state == MODAL_STATES.selectedEntity)
      this.setState({ scrollableSnap: 2 }, () => {
        this._openModal(this._refs["selectedEntityModalRef"], true);
        this._openModal(this._refs["extraModalRef"], false);
      });
  }

  /**
   * Selected entity on map modal state setter.
   * Invoked also to clean the currently selected entity (on map move for instance)
   */
  _onSelectedEntity = (entity) => {
    if (this.props.mapEntityWidgetOnPress)
      this.props.mapEntityWidgetOnPress(entity);
    else 
      this.setState({ selectedEntity: entity });

    if (entity)
      this._setModalState(MODAL_STATES.selectedEntity);
    else
      if(this._modalState == MODAL_STATES.selectedEntity)
        this._setModalState(MODAL_STATES.explore);
  }

  /**
   * On show extra modal
   */
  _showExtraModal = () => {
    this._setModalState(MODAL_STATES.extraModal);
  }

  /**
   * On main scrollable close
   */
  _onScrollableClosed = () => {
    if(this._modalState == MODAL_STATES.explore)
      this.setState({ scrollableSnap: 1 });
  }

  /**
   * Open a modal referenced by ref
   */
  _openModal = (ref, state) => {
    if (state && ref) {
      ref.open();
      ref.open();
    } else if (ref) {
      ref.close();
    }
  }

  /**
   * On extra modal close
   */
  _onExtraModalClosed = () => {
    if(this._modalState == MODAL_STATES.extraModal) 
      this._setModalState(MODAL_STATES.explore);
  }

  /**
   * On selected entity close
   */
  _onSelectedEntityModalClosed = () => {
    if(this._modalState == MODAL_STATES.selectedEntity)
      this._setModalState(MODAL_STATES.explore);
  }

  /********************* Render methods go down here *********************/

  /**
   * Renders default extra component list item
   */
  _renderDefaultExtraComponentListItem = (item) => {
    const { onPress, iconProps } = this.props.scrollableExtraComponentProps;
    return (
      <TouchableOpacity style={styles.categorySelectorBtn} onPress={() => onPress(item)} activeOpacity={0.7}>
        <View style={styles.icon}>
            <Ionicons
              size={13}
              style={styles.cornerIcon}
              {...iconProps}
            />
        </View>
        <CustomText style={styles.categorySelectorBtnText}>{item.name}</CustomText>
      </TouchableOpacity>
    )
  }

  /**
   * Renders default extra component (a list with icons)
   */
  _renderDefaultExtraComponent = () => {
    const { data = [], keyExtractor } = this.props.scrollableExtraComponentProps; 
    return(
      <FlatList
        horizontal={true}
        renderItem={({item}) => this._renderDefaultExtraComponentListItem(item)}
        data={data}
        extraData={this.props.locale}
        ref={(ref)=>this._filterList = ref}
        keyExtractor={keyExtractor}
        style={styles.filtersList}
        ItemSeparatorComponent={this._renderHorizontalSeparator}
        contentContainerStyle={styles.listContainerHeader}
        showsHorizontalScrollIndicator={false}
      />
    )
  }

  /**
   * Render single entity when user presses on an entity in a map
   * NOTE: overridable with renderMapEntityWidget
   */
  _renderDefaultEntityWidget = () => {
    return (
      <EntityWidgetInModal
        {...this.props.mapEntityWidgetProps}
        locale={this.props.locale} 
        cluster={this.state.selectedEntity} 
      />
    )
  }

  /**
   * Renders the top component over the scrollable
   */
  _renderTopComponent = () => {
    if (this.props.topComponentType === "ClusteredMapViewTop") {
      const { term, coords, region, entityType, types, childUuids } = this.props.topComponentCMVTProps;
      return (
        <ClusteredMapViewTop
          term={term}
          coords={coords}
          region={region}
          entityType={entityType}
          types={types}
          uuids={childUuids}
          style={{flex: 1}}
          mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
          onSelectedEntity={this._onSelectedEntity}
          showNearEntitiesOnPress={this._showExtraModal}
          paddingBottom={this.state.snapPoints[1]} /* set padding as the height of the first snap point */
        />
      )
    } else if (this.props.topComponentType === "MapView") {
      //TODO
    } else {
      if (!this.props.topComponentRender) {
        throw new Error("If topComponentType is not one of ClusteredMapViewTop or MapView topComponentRender prop must be passed.")
      } else {

      }
    }
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 10, flex: 1 }}></View>;

  /**
   * Render extra content
   */
  _renderDefaultExtraModal = () => {
    const { data, keyExtractor, renderItem, title, onEndReached } = this.props.extraModalProps;
    return (
        <View style={styles.listExtraModalView}>
          <AsyncOperationStatusIndicator
            loading={true}
            success={data && data.length > 0}
            loadingLayout={<LLHorizontalItemsFlatlist horizontal={true} contentContainerStyle={styles.listContainerHeader} title={title} titleStyle={styles.sectionTitle}/>}
          >
            <View>  
              <SectionTitle text={title} />
              <FlatList
                horizontal={true}
                renderItem={renderItem}
                data={data}
                extraData={this.props.locale}
                keyExtractor={keyExtractor}
                onEndReachedThreshold={0.5} 
                onEndReached={onEndReached}
                ItemSeparatorComponent={this._renderHorizontalSeparator}
                contentContainerStyle={styles.listContainerHeader}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={3} // Reduce initial render amount
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={4000} // Increase time between renders
                windowSize={5} // Reduce the window size
              />
            </View>
          </AsyncOperationStatusIndicator>
        </View>
    )
  }


  _renderScrollable = () => {
    const renderExtraComponent = this.props.scrollableRenderExtraComponent ? this.props.scrollableRenderExtraComponent : this._renderDefaultExtraComponent;
    const renderHeaderTextComponent = this.props.scrollableHeaderTextComponent ? this.props.scrollableHeaderTextComponent : this.props.scrollableHeaderText;

    //scrollable props
    const { show, entityType, data, onEndReached, renderItem, keyExtractor } = this.props.scrollableProps;
    
    if (show)
      return (
        <ScrollableContainer 
          entityType={entityType}
          topComponent={this._renderTopComponent}
          extraComponent={renderExtraComponent}
          pageLayoutHeight={this._pageLayoutHeight}
          data={data}
          snapPoints={this.state.snapPoints}
          initialSnapIndex={1}
          closeSnapIndex={1}
          onEndReached={onEndReached}
          numColumns={1}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onSettleIndex={this._onSettleIndex}
          HeaderTextComponent={renderHeaderTextComponent}
          ref={(ref) => this._refs["ScrollableContainer"] = ref}
          snapTo={this.state.scrollableSnap}
          onCloseEnd={this._onScrollableClosed}
          isClosable={this.state.scrollableSnap!=1}
        />
      )
    return null;
  }

  _renderMapEntityModal = () => {
    const renderMapEntityWidget = this.props.renderMapEntityWidget ? this.props.renderMapEntityWidget : this._renderDefaultEntityWidget;

    return (
      <Modalize 
        ref={(ref) => this._refs["selectedEntityModalRef"] = ref}
        adjustToContentHeight={true}
        withOverlay={false}
        modalStyle={styles.modal}
        closeAnimationConfig={{timing: { duration: 800, easing: Easing.ease }} }
        onClosed={this._onSelectedEntityModalClosed}
        velocity={1000}
      >
        {renderMapEntityWidget()}
      </Modalize>
    )
  }

  _renderExtraModal = () => {
    const renderExtraModal = this.props.renderExtraModal ? this.props.renderExtraModal : this._renderDefaultExtraModal;

    return (
      <Modalize 
        ref={(ref) => this._refs["extraModalRef"] = ref}
        adjustToContentHeight={true}
        withOverlay={false}
        modalStyle={styles.modal}
        closeAnimationConfig={{timing: { duration: 800, easing: Easing.ease }} }
        onClosed={this._onExtraModalClosed}
        velocity={1000}
      >
        {renderExtraModal()}
      </Modalize>
    )
  }

  /* Render content */
  _renderContent = () => {
    return (
      <View style={styles.fill} onLayout={this._onPageLayout}>
        {this._renderScrollable()}
        {this._renderMapEntityModal()}
        {this._renderExtraModal()}
      </View>
    )
  }


  render() {
    const { render } = this.state;
    return (
      <>
        {render && this._renderContent()}
      </>
    )
  }
  
}


ConnectedMapScrollable.navigationOptions = {
  title: 'ConnectedMapScrollable',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.colorPlacesScreen,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  listContainer: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%"
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  listStyle: {
    paddingHorizontal: 10,
    paddingBottom: 25,
  },
  listPois: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%",
    paddingHorizontal: 10,
  },
  categorySelectorBtn: {
    height: 32, 
    paddingVertical: 7, 
    backgroundColor: "white", 
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingRight: 15,
    paddingLeft: 5
  },
  categorySelectorBtnText: {
    color: "#000000DE",
    fontSize: 14
  },
  filtersList: {
    width: "100%", 
    height: 40,
    zIndex: 0, 
    // backgroundColor: "red"
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.colorPlacesScreen,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  listExtraModalView: {
    marginBottom: 10
  },
  modal: {
    borderTopRightRadius: 16, borderTopLeftRadius: 16
  },
});


function ConnectedMapScrollableContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ConnectedMapScrollable 
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
    categories: state.categoriesState,
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
})(ConnectedMapScrollableContainer)