import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import {distance, distanceToString} from '../../helpers/maps'
import actions from '../../actions';
import { apolloQuery } from '../../apollo/queries';
import _ from 'lodash';

/**
 * EntityWidgetInMapView 
 */
export default class EntityWidgetInMapView extends PureComponent {  
  constructor(props){ 
    super(props);

    var {coords, cluster} = props;

    var entity = cluster.terms_objs[0];
    entity.distance = distance(coords.longitude, coords.latitude, cluster.centroid.coordinates[0], cluster.centroid.coordinates[1]);
    
    this.state = {
      width: 160,
      height: 160,
      coords: coords,
      cluster: cluster,
      entity: entity
    };
  }

  componentDidMount() {
    this._fetchPoi(this.state.entity.nid);
  }

  componentDidUpdate(prevProps) {
    var {cluster} = this.props;
    
    if(cluster.terms_objs[0].nid != prevProps.cluster.terms_objs[0].nid) {
      var entity = cluster.terms_objs[0];
      entity.distance = distance(this.state.coords.longitude, this.state.coords.latitude, cluster.centroid.coordinates[0], cluster.centroid.coordinates[1]);
      this.setState({
        entity: entity
      })
      this._fetchPoi(cluster.terms_objs[0].nid);
    }
  }

  _fetchPoi(nid) {
      apolloQuery(actions.getPoi({ 
        nid 
      })).then((data) => {
        var entity = {...this.state.entity, ...data[0]};
        this.setState({
            entity: entity
        });
      });
  }

  render() { 
    var {entity} = this.state;
    const title = _.get(entity.title, [this.props.locale.lan, 0, "value"], null);
    return (
      <View style={[styles.container, this.props.style]} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) }}>
          <Image source={{ uri: entity.image }} style={styles.image, {width: this.state.width, height: this.state.height}} PlaceholderContent={<ActivityIndicator />}>
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
          </Image>
      </View>
      );
    }
}
    
const styles = StyleSheet.create({  
  container: {
    backgroundColor: "#F5FCFF",
    alignItems: "flex-start",
    borderRadius: 10,
    overflow: "hidden"
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
    width: 160,
    height: 160
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 5,
    width: "100%"
  }
});