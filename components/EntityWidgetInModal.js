import React, { PureComponent } from "react";
import { StyleSheet, Text, View, ImageBackground, Image } from "react-native";
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import { ActivityIndicator } from 'react-native';
// import { Image } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import {distance, distanceToString} from '../helpers/maps';
import actions from '../actions';
import { apolloQuery } from '../apollo/queries';
import * as Constants from "../constants"
import _ from 'lodash';
import AccomodationItem from "./AccomodationItem"
import EntityItemInModal from "./EntityItemInModal";
import Colors from "../constants/Colors"
import CustomText from "./CustomText";

/**
 * EntityWidgetInModal 
 */
class EntityWidgetInModal extends PureComponent {  
  constructor(props){ 
    super(props);

    var {coords, cluster} = props;
    this._loaded = false;
    var entity = cluster.terms_objs[0];
    if(cluster.centroid)
      entity.distance = this._computeDistance(cluster, coords);
    
    this.state = {
      entity
    };
  }

  componentDidMount() {
    this._fetchEntity(), 2000;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cluster !== this.props.cluster) {
      this._fetchEntity();
    }
  }

  _computeDistance = (cluster, coords) => {
    return distance(coords.longitude, coords.latitude, cluster.centroid.coordinates[0], cluster.centroid.coordinates[1]);
  }

  _fetchEntity = () => {
    const { isAccomodationItem } = this.props;
    if(this.props.cluster){
      const entity = this.props.cluster.terms_objs[0];
      var query, params;

      if(isAccomodationItem) {
        query = actions.getAccomodationsById;
        params = { uuids: [entity.uuid] };
      }
      else {
        query = actions.getPoi;
        params = { nid: entity.nid };
      }

      apolloQuery(query(params)).then((data) => {
        this._loaded = true;
        let entity = data[0];
        entity.distance = this._computeDistance(this.props.cluster, this.props.coords); 
        entity.distanceString = entity.distance ? distanceToString(entity.distance) : null
        this.setState({ entity });
      }).catch(e => {
        console.error(e.message);
      });
    }
  }


  /**
   * Navigate to entity screen
   * @param {*} item: poi
   */
  _openEntity(item) {
    console.log("GOTO ENTITY!", item.uuid);
    const { isAccomodationItem } = this.props;
    let screen = isAccomodationItem ? Constants.NAVIGATION.NavAccomodationScreen : Constants.NAVIGATION.NavPlaceScreen;
    this.props.navigation.navigate(screen, {
      item, mustFetch: !this._loaded
    }) 
  }

  /* Renders a poi in Header */
  _renderAccomodationItem = () => {
    const { entity } = this.state;
    const title = _.get(entity.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(entity, "term.name", "")
    return (
      <AccomodationItem
        keyItem={entity.nid}
        extraStyle={{
          width: '100%',
          borderColor: Colors.lightGray,
          borderWidth: 1,
          marginLeft: 0,
          height: 160,
        }}
        title={title}
        term={termName}
        stars={entity.stars}
        onPress={null}
        location={entity.location}
        distance={entity.distanceString}
        onPress={() => this._openEntity(entity)}
      />
  )}

  _renderPoi = () => {
    var {entity} = this.state;
    const title = _.get(entity.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(entity, "term.name", "")

    return(
      <EntityItemInModal
        keyItem={entity.nid}
        listType={Constants.ENTITY_TYPES.places}
        onPress={() => this._openEntity(entity)}
        title={`${title}`}
        image={`${entity.image}`}
        distance={entity.distanceString}
        subtitle={termName}
        extraStyle={this.props.extraStyle}
        coords={this.props.coords}
      />
    )
  }
  _renderEntity = () => {
    const { isAccomodationItem } = this.props;
    if(isAccomodationItem)
      return this._renderAccomodationItem()
    else
      return this._renderPoi()
  }

  render() { 
    const { isAccomodationItem } = this.props;
    const {entity} = this.state;
    return (
      <View style={[styles.container]}>
        {this._renderEntity()}
      </View>
      );
    }
}
    
const styles = StyleSheet.create({  
  fill: {
    flex: 1
  },
  container: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden"
  },
});


export default function EntityWidgetInModalContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();

  return <EntityWidgetInModal 
    {...props}
    navigation={navigation}
    route={route}/>;
}
