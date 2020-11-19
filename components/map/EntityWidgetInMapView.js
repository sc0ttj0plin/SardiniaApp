import React, { PureComponent } from "react";
import { StyleSheet, Text, View, ImageBackground, Image } from "react-native";
import ScrollableContainerTouchableOpacity from "../ScrollableContainerTouchableOpacity";
import { ActivityIndicator } from 'react-native';
// import { Image } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import {distance, distanceToString} from '../../helpers/maps'
import actions from '../../actions';
import { apolloQuery } from '../../apollo/queries';
import * as Constants from "../../constants"
import _ from 'lodash';
import AccomodationItem from "../AccomodationItem"
import Colors from "../../constants/Colors"

/**
 * EntityWidgetInMapView 
 */
class EntityWidgetInMapView extends PureComponent {  
  constructor(props){ 
    super(props);

    var {coords, cluster} = props;
    var entity = cluster.terms_objs[0];
    entity.distance = this._computeDistance(cluster, coords)
    
    this.state = {
      width: 160,
      height: 160,
      entity
    };
  }

  componentDidMount() {
    // this._fetchPoi(this.state.entity.nid);
    this._fetchEntity();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cluster !== this.props.cluster) {
      // const entity = this.props.cluster.terms_objs[0];
      // this._fetchPoi(entity.nid);
      this._fetchEntity();
    }
  }

  _computeDistance = (cluster, coords) => {
    return distance(coords.longitude, coords.latitude, cluster.centroid.coordinates[0], cluster.centroid.coordinates[1]);
  }

  _fetchEntity = () => {
    const { isAccomodationItem } = this.props;
    const entity = this.props.cluster.terms_objs[0];
    if(isAccomodationItem){
      console.log("entity", entity)
      this._fetchAccomodation(entity.uuid)
    }
    else
      this._fetchPoi(entity.nid);
  }

  _fetchPoi(nid) {
    apolloQuery(actions.getPoi({ 
      nid 
    })).then((data) => {
      let entity = data[0];
      entity.distance = this._computeDistance(this.props.cluster, this.props.coords); 
      this.setState({ entity });
    }).catch(e => {
      console.error(e.message);
    });
  }

  _fetchAccomodation(uuid) {
    apolloQuery(actions.getAccomodationsById({ 
      uuids: [uuid] 
    })).then((data) => {
      let entity = data[0];
      entity.distance = this._computeDistance(this.props.cluster, this.props.coords); 
      this.setState({ entity });
    }).catch(e => {
      console.error(e.message);
    });
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
      item, mustFetch: true
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
          borderColor: Colors.lightGrey,
          borderWidth: 1,
          marginLeft: 0,
          height: 160,
        }}
        title={title}
        term={termName}
        stars={entity.stars}
        onPress={null}
        location={entity.location}
        distance={distanceToString(entity.distance)}
        onPress={() => this._openEntity(entity)}
      />
  )}

  _renderPoi = () => {
    var {entity} = this.state;
    const title = _.get(entity.title, [this.props.locale.lan, 0, "value"], null);
    return(
      <ScrollableContainerTouchableOpacity
          style={[styles.entityButton]}
          onPress={() => this._openEntity(entity)}
          activeOpacity={0.7}>
          <Image source={{ uri: entity.image }} style={styles.image} PlaceholderContent={<ActivityIndicator />} />
          <View style={styles.textContainer}>
            <Text
            numberOfLines={1}
            ellipsizeMode='tail'
            style={styles.title}>{title}
            </Text>
            <Text 
            numberOfLines={1}
            ellipsizeMode='tail'
            style={styles.place}>{entity.term.name}
            </Text>
            <Text 
            numberOfLines={1}
            ellipsizeMode='tail'
            style={styles.distance}>{distanceToString(entity.distance)}
            </Text>
          </View>
      </ScrollableContainerTouchableOpacity>
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
      <View style={[styles.entityWidget]} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) }}>
        {this._renderEntity()}
      </View>
      );
    }
}
    
const styles = StyleSheet.create({  
  fill: {
    flex: 1
  },
  entityButton: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: Colors.lightGrey
  },
  container: {
    backgroundColor: "#F5FCFF",
    alignItems: "flex-start",
    borderRadius: 10,
    overflow: "hidden"
  },
  entityWidget: {
    width: "100%",
    height: 180,
    position: "absolute",
    bottom: 50,
    left: 0,
    padding: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold"
  },
  place: {
    fontSize: 10
  },
  distance: {
    fontSize: 10,
    fontWeight: "bold",
  },
  image: {
    resizeMode: "cover",
    width: "100%",
    height: "100%",
    borderRadius: 10
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 5,
    width: "100%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  }
});


export default function EntityWidgetInMapViewContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();

  return <EntityWidgetInMapView 
    {...props}
    navigation={navigation}
    route={route}/>;
}
