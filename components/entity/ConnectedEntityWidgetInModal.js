import React, { PureComponent } from "react";
import { StyleSheet, View, } from "react-native";
// import { Image } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import {distance, distanceToString} from '../../helpers/maps';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from '../../actions';
import { apolloQuery } from '../../apollo/queries';
import * as Constants from "../../constants"
import _ from 'lodash';
import AccomodationItem from "../items/AccomodationItem"
import EntityItemInModal from "../entity/EntityItemInModal";
import Colors from "../../constants/Colors"

/**
 * ConnectedEntityWidgetInModal 
 */
class ConnectedEntityWidgetInModal extends PureComponent {  

  constructor(props) { 
    super(props);

    var { entity, entityType, coords } = props;

    /* Only for entityType == 'places' and 'accomodations', for 'event' or 'itinerary' we already have data in props.entity, owt we need to load it */
    this._isClusteredEntity = (/*entityType === Constants.ENTITY_TYPES.places || */entityType === Constants.ENTITY_TYPES.accomodations); // TODO: removed 'places' because now there are POIs that are not clustered, to be changed

    this.state = {
      entity,
    };
  }

  componentDidMount() {
    const {entity} = this.state;
    this._parseEntity(entity);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.entity !== this.props.entity) {
      this.setState({ entity: this.props.entity }, () => {
        this._parseEntity(this.state.entity);
      });
    }
  }

  _parseEntity = (entity) => {
    const {coords, lan} = this.props;

    if(entity) {
      if (this._isClusteredEntity) 
        this._fetchEntity();
      else {
        if(this.props.getCoordsFun) {
          const coordinates = this.props.getCoordsFun(entity);
          if (coordinates && coords.latitude && coords.longitude) {
            entity.distanceStr = distanceToString(distance(coords.latitude, coords.longitude, coordinates.latitude, coordinates.longitude));
          }
        }
        entity.loaded = true;
        this.setState({...entity});
      }
    }
  }


  _computeDistance = (entity, coords) => {
    return distance(coords.longitude, coords.latitude, entity.centroid.coordinates[0], entity.centroid.coordinates[1]);
  }

  _fetchEntity = () => {
    // If is cluster (pois + accomodation) we don't have any data and we must fetch details, else we already have data and we show directly
    if(this.props.entity) {
      if (this._isClusteredEntity) {
        // Get real entity from the cluster object (i.e. inside terms_objs[0])
        let query, params;
        const entity = this.props.entity.terms_objs[0];
        if (this.props.entityType === Constants.ENTITY_TYPES.accomodations) {
          query = actions.getAccomodationsById;
          params = { uuids: [entity.uuid] };
        } else if (this.props.entityType === Constants.ENTITY_TYPES.places) {
          query = actions.getPoi;
          params = { uuid: entity.uuid };
        }
        // Report interaction
        this.props.actions.reportAction({ 
          analyticsActionType: Constants.ANALYTICS_TYPES.userPartialEntityAccess, 
          uuid: this.props.entity.uuid, 
          entityType: 'node', 
          entitySubType: this.props.entityType
        });

        // Launch the query to get the real entity from the cluster
        apolloQuery(query(params)).then((data) => {
          let entity = data[0];
          entity.distance = this._computeDistance(this.props.entity, this.props.coords);
          entity.distanceStr = entity.distance ? distanceToString(entity.distance) : null
          entity.loaded = true
          this.setState({ entity });
        }).catch(e => {
          console.error(e.message);
        });
      }
    }
  }

  _openEntity = (entity) => {
    if(!entity.loaded)
      return;
    switch(this.props.entityType) {
      case Constants.ENTITY_TYPES.places:
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item: entity, mustFetch: entity.loaded ? false : true } );
        break;
      case Constants.ENTITY_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item: entity });
        break;
      case Constants.ENTITY_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item: entity })
        break;
      case Constants.ENTITY_TYPES.accomodations:
        this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, { item: entity, mustFetch: entity.loaded ? false : true })
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
          extraStyle={[{
            width: '100%',
            borderColor: Colors.lightGray,
            borderWidth: 1,
            marginLeft: 0,
            height: 160,
          },this.props.extraStyle]}
          title={title}
          term={termName}
          stars={entity.stars}
          onPress={null}
          location={entity.location}
          distance={entity.distanceStr}
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
      // console.log("entity details", title, termName)
      let distance = entity.distanceStr || null;

      return(
        <EntityItemInModal
          keyItem={entity.nid}
          listType={this.props.entityType}
          onPress={() => this._openEntity(entity)}
          title={title}
          image={entity.image}
          distance={distance}
          subtitle={termName}
          extraStyle={this.props.extraStyle}
          coords={this.props.coords}
        />
      )
    }
    else
      return null;
  }
  
  _renderEntity = () => {
    switch(this.props.entityType) {
      case Constants.ENTITY_TYPES.places:
      case Constants.ENTITY_TYPES.events:
      case Constants.ENTITY_TYPES.itineraries:
        return this._renderPoi();
      case Constants.ENTITY_TYPES.accomodations:
        return this._renderAccomodation();
      default:
        break;
    }
  }

  render() { 
    return (
      <View style={[styles.container, this.props.containerStyle]}>
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


function ConnectedEntityWidgetInModalContainer(props) {
  const store = useStore();
  const navigation = useNavigation();
  const route = useRoute();

  return <ConnectedEntityWidgetInModal 
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
})(ConnectedEntityWidgetInModalContainer)
