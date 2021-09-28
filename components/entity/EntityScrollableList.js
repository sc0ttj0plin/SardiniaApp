import React, {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import _ from 'lodash';
import {FlatList} from "react-native-gesture-handler"
import LoadingLayoutEntitiesFlatlist from "../layouts/LoadingLayoutEntitiesFlatlist";
import AccomodationItem from '../items/AccomodationItem';
import AsyncOperationStatusIndicator from "../loading/AsyncOperationStatusIndicator";
import CustomText from "../others/CustomText";
import {Button, Icon} from "react-native-elements";
import Colors from "../../constants/Colors";
import * as Constants from "../../constants";
import {EntityItem} from "./index";
import {useNavigation, useRoute} from "@react-navigation/native";
import {VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS} from "../../constants";

class EntityScrollableList extends PureComponent {

  constructor(props) {
    super(props)
  }

  _renderItem = ({item, index}) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "")

    const isAccomodations = item.type === Constants.NODE_TYPES.accomodations;

    if (isAccomodations) {
      return (
        <AccomodationItem
          index={index}
          keyItem={item.nid}
          horizontal
          sizeMargins={20}
          title={title}
          extraStyle={styles.item}
          term={termName}
          stars={item.stars}
          location={item.location}
          distance={item.distanceStr}
          onPress={() => this._openItem(item)}
        />
      )
    }

    return (
      <EntityItem
        index={index}
        keyItem={item.nid}
        backgroundTopRightCorner={VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[item.type].backgroundTopRightCorner}
        iconColor={'white'}
        listType={item.type}
        onPress={() => this._openItem(item)}
        title={title}
        extraStyle={styles.item}
        subtitle={termName}
        image={item.image}
        distance={item.distanceStr}
        horizontal={true}
        animated={true}
      />
    )
  }

  _openItem = (item) => {
    switch (item.type) {
      case Constants.NODE_TYPES.places:
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, {item, mustFetch: true});
        break;
      case Constants.NODE_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, {item, mustFetch: true});
        break;
      case Constants.NODE_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, {item, mustFetch: true})
        break;
      case Constants.NODE_TYPES.inspirers:
        this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, {item, mustFetch: true})
        break;
      case Constants.NODE_TYPES.accomodations:
        this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, {item, mustFetch: true})
        break;
      default:
        break;
    }
  }

  render() {
    const {
      title,
      listTitle,
      data,
      actionButtonTitle,
      onActionButtonPress,
      backgroundColor
    } = this.props;

    return (
      <View style={[styles.fill, styles.mainView, {backgroundColor}]}>
        {title && <CustomText style={styles.title}>{title}</CustomText>}
        <AsyncOperationStatusIndicator
          loading={true}
          success={data && data.length > 0}
          error={false}
          loadingLayout={
            <LoadingLayoutEntitiesFlatlist
              horizontal={true}
              style={styles.contentContainerStyle}
              title={listTitle}
              titleStyle={this.props.listTitleStyle}
              error={false}
            />
          }
        >
          <FlatList
            horizontal
            key={listTitle + "-1"}
            keyExtractor={(item, index) => index}
            data={data}
            renderItem={this._renderItem}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={6} // Reduce initial render amount
            updateCellsBatchingPeriod={400} // Increase time between renders
            windowSize={10} // Reduce the window size
          />
          <Button
            style={styles.actionButton}
            buttonStyle={styles.actionButtonContainer}
            titleStyle={styles.actionButtonTitle}
            title={actionButtonTitle}
            icon={
              <Icon
                containerStyle={styles.actionButtonIcon}
                raised
                type='font-awesome'
                name={"chevron-right"}
                size={13}
                color={Colors.black}
              />
            }
            onPress={onActionButtonPress}
            iconRight
          />
        </AsyncOperationStatusIndicator>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  fill: {
    height: 'auto',
    width: '100%'
  },
  mainView: {
    paddingTop: 32,
    paddingBottom: 30,
    paddingLeft: 15,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: 20,
    fontFamily: "montserrat-bold",
    color: "black",
    marginBottom: 0,
    paddingBottom: 10
  },
  contentContainerStyle: {
    paddingLeft: 30
  },
  actionButton: {
    marginTop: 16,
    marginRight: 15,
  },
  actionButtonContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'flex-start',
    height: 32,
    padding: 0,
    borderRadius: 16,
  },
  actionButtonTitle: {
    paddingLeft: 20,
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    color: Colors.black,
    fontFamily: "montserrat-bold",
    textTransform: 'uppercase'
  },
  actionButtonIcon: {
    marginRight: -6
  },
  item: {
    marginRight: 10
  }
});

export default (props) => {
  const navigation = useNavigation();

  return <EntityScrollableList {...props} navigation={navigation} />;
}
