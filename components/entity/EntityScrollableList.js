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

class EntityScrollableList extends PureComponent {

  constructor(props) {
    super(props)
  }

  _renderItem = ({item, index}) => {
    const {onItemPress} = this.props;
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "")

    return (
      <>
        <EntityItem
          index={index}
          keyItem={item.nid}
          backgroundTopLeftCorner={"white"}
          iconColor={Colors.colorPlacesScreen}
          listType={Constants.ENTITY_TYPES.places}
          onPress={() => onItemPress(item)}
          title={title}
          subtitle={termName}
          image={item.image}
          distance={item.distanceStr}
          horizontal={true}
          animated={true}
        />
        <View style={{width: 10, flex: 1}}></View>
      </>
    )
  }

  render() {
    const {
      title,
      listTitle,
      data,
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
            title="Scopri cosa fare"
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
    marginTop: 32,
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
  }
});

export default EntityScrollableList
