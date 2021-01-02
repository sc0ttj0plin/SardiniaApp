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

  constructor(props) { 
    super(props);

    var { entity, entityType } = props;

    /* Only for entityType == 'places' and 'accomodations', for 'event' or 'itinerary' we already have data in props.entity */
    this._isClusteredEntity = (entityType === Constants.ENTITY_TYPES.places || entityType === Constants.ENTITY_TYPES.accomodations); 
    
    this.state = {
      entity,
      isEntityLoaded: this._isClusteredEntity ? false : true,
    };
  }

  componentDidMount() {
    if (this._isClusteredEntity && this.props.entity) 
      this._fetchEntity();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.entity !== this.props.entity) {
      this.setState({ entity: this.props.entity });
      this._fetchEntity();
    }
  }


  _computeDistance = (entity, coords) => {
    return distance(coords.longitude, coords.latitude, entity.centroid.coordinates[0], entity.centroid.coordinates[1]);
  }

  _fetchEntity = () => {
    // If is cluster (pois + accomodation) we don't have any data and we must fetch details, else we already have data and we show directly
    if(this.props.entity) {
    
      let query, params;
      if (this._isClusteredEntity) {
        // Get real entity from the cluster object (i.e. inside terms_objs[0])
        const entity = this.props.entity.terms_objs[0];
        if (this.props.entityType === Constants.ENTITY_TYPES.accomodations) {
          query = actions.getAccomodationsById;
          params = { uuids: [entity.uuid] };
        } else if (this.props.entityType === Constants.ENTITY_TYPES.places) {
          query = actions.getPoi;
          params = { uuid: entity.uuid };
        }
        // Launch the query to get the real entity from the cluster
        apolloQuery(query(params)).then((data) => {
          this._isEntityLoaded = true;
          let entity = data[0];
          entity.distance = this._computeDistance(this.props.entity, this.props.coords); 
          entity.distanceString = entity.distance ? distanceToString(entity.distance) : null
          this.setState({ entity });
        }).catch(e => {
          console.error(e.message);
        });
      }
    }
  }

  _openEntity = (entity) => {
    switch(this.props.entityType) {
      case Constants.ENTITY_TYPES.places:
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { entity });
        break;
      case Constants.ENTITY_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { entity });
        break;
      case Constants.ENTITY_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { entity })
        break;
      case Constants.ENTITY_TYPES.accomodations:
        this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, { entity })
        break;
      default:
        break;
    }
  } 

  /* Renders a poi in Header */
  _renderAccomodation = () => {
    const { entity } = this.state;
    if (entity) {
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
      )
    }
  }

  _renderPoi = () => {
    var { entity } = this.state;

    if (entity) {
      const title = _.get(entity.title, [this.props.locale.lan, 0, "value"], null);
      const termName = _.get(entity, "term.name", "")
      return(
        <EntityItemInModal
          keyItem={entity.nid}
          listType={this.props.entityType}
          onPress={() => this._openEntity(entity)}
          title={title}
          image={entity.image}
          distance={entity.distanceString}
          subtitle={termName}
          extraStyle={this.props.extraStyle}
          coords={this.props.coords}
        />
      )
    }
  }
  
  _renderEntity = () => {
    switch(this.props.entityType) {
      case Constants.ENTITY_TYPES.places:
      case Constants.ENTITY_TYPES.events:
        return this._renderPoi();
        // this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { entity });
        break;
      case Constants.ENTITY_TYPES.itineraries:
        // this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { entity });
        break;
      case Constants.ENTITY_TYPES.accomodations:
        return this._renderAccomodation();
      default:
        break;
    }
  }

  render() { 
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
