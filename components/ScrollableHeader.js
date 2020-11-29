import React, { useState, PureComponent } from "react";
import { Animated, Platform, StatusBar, StyleSheet, Text, View, TouchableOpacity, UIManager } from 'react-native';
import Layout from '../constants/Layout';
import CustomText from "./CustomText";


if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const tclStateEnum = { Hide: 'hide', Top: 'top', Full: 'full'}; //top content layout state

/**
 * ScrollableHeader defines the PlacesScreen topmost component and delivers 
 * a scrollable effect on scroll-down. It takes renderHeaderBarContent, renderTopContent and data in input
 * Additionally it makes the header look like it is increasing in size whilst scrolling downwards.
 */
class ScrollableHeader extends PureComponent {

    constructor(props) {
        super(props);
        _props = props;

        this._updateLayout(300);

        this.state = { 
            scrollY: new Animated.Value(
            // iOS has negative initial scroll value because content inset...
            Platform.OS === 'ios' ? -this.HEADER_MAX_HEIGHT : 0,
            ),
            refreshing: false,
            topContentLayoutState: tclStateEnum.Top,
            statusbarHeight: 0,
            listItem: {}
        };

        if(props.numColumns && props.numColumns > 1) {
          this.state.listItem = {
            width: (Layout.window.width - Layout.list.vPadding*2 - Layout.list.gridInnerVPadding*(props.numColumns-1)) / props.numColumns,
            gridInnerVPadding: Layout.list.gridInnerVPadding,
            gridInnerHPadding: Layout.list.gridInnerHPadding
          }
        }

        this.AnimatedComponent = Animated.createAnimatedComponent(props.scrollView);
    }

    _updateLayout(height) { 
        this._layoutHeight = height;
        this.STATUSBAR_HEIGHT = Layout.statusbarHeight;
        this.HEADER_MAX_HEIGHT = height;
        this.HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 66 + this.STATUSBAR_HEIGHT : (56 + this.STATUSBAR_HEIGHT); 
        this.HEADER_SCROLL_DISTANCE = this.HEADER_MAX_HEIGHT - this.HEADER_MIN_HEIGHT;

    }

    componentDidMount() {

    }

    _onTopContentLayout(layout) {
        this.updateLayout(layout.height);
    }

    _renderHeaderBarContent() {
        if(!this.props.renderHeaderBarContent)
            return (
                <View></View>
            )
        else
            return this.props.renderHeaderBarContent();
    }

    _renderTopContent() {
        if(!this.props.renderTopContent)
            return (
                <View></View>
            )
        else
            return this.props.renderTopContent(); 
    }  

    _renderListItem(item) {
      var {index} = item;
      if(this.props.numColumns && this.props.numColumns > 1) {
        var marginLeft = (index % this.props.numColumns) == 0 ? 0 : this.state.listItem.gridInnerVPadding/2;
        var marginRight = (index % this.props.numColumns) == this.props.numColumns - 1 ? 0 : this.state.listItem.gridInnerVPadding/2;
        var marginBottom = this.state.listItem.gridInnerHPadding;
        return (
          <>
          { index == 0 && this.props.listTitle &&
            <>
            <Text style={[this.props.listTitleStyle, {
              width: this.state.listItem.width * 2
            }]}>{this.props.listTitle}</Text>
            </>
          }
          <View style={{width: this.state.listItem.width, height: this.state.listItem.width, marginRight: marginRight, marginBottom: marginBottom, ...this.props.listItemStyle}}>
            {this.props.renderItem(item)}
          </View>
          </>
        )
      }
      else
        return (
          <>
            { index == 0 && this.props.listTitle &&
              <Text style={this.props.listTitleStyle}>{this.props.listTitle}</Text>
            }
            {this.props.renderItem(item)}
          </>
        )
    }
    

    render() {
        // Because of content inset the scroll value will be negative on iOS so bring
        // it back to 0.
        if(!this.state || this.state.scrollY === null) 
            return (<View></View>);

        const scrollY = Animated.add(
          this.state.scrollY,
          Platform.OS === 'ios' ? this.HEADER_MAX_HEIGHT : 0,
        ); 
        
        const topContentTranslate = scrollY.interpolate({
          inputRange: [0, this.HEADER_SCROLL_DISTANCE],
          outputRange: [0, -this.HEADER_SCROLL_DISTANCE],
          extrapolate: 'clamp',
        }); 

        const topContentBackgroundOpacity = scrollY.interpolate({
            inputRange: [0, this.HEADER_SCROLL_DISTANCE / 1.4, this.HEADER_SCROLL_DISTANCE],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
        });

        const topContentBackgroundOpacity2 = scrollY.interpolate({
          inputRange: [this.HEADER_SCROLL_DISTANCE - 200, this.HEADER_SCROLL_DISTANCE + 20],
          outputRange: [0, 1], 
          extrapolate: 'clamp',
      });

        const listTranslate = scrollY.interpolate({
          inputRange: [0, this.HEADER_MAX_HEIGHT],
          outputRange: [0, -this.HEADER_MAX_HEIGHT],
          extrapolate: 'clamp',
      });
        const parallaxTopContentTranslate = scrollY.interpolate({
          inputRange: [0, this.HEADER_SCROLL_DISTANCE],
          outputRange: [0, this.HEADER_SCROLL_DISTANCE/1.4],
          extrapolate: 'clamp',
        });
    
        const headerBarScale = scrollY.interpolate({
          inputRange: [0, this.HEADER_SCROLL_DISTANCE / 1.4, this.HEADER_SCROLL_DISTANCE],
          outputRange: [Layout.header.map.scale, Layout.header.map.scale, 1],
          extrapolate: 'clamp',
        });
        const headerBarTranslate = scrollY.interpolate({
          inputRange: [0, this.HEADER_SCROLL_DISTANCE / 1.4, this.HEADER_SCROLL_DISTANCE],
          outputRange: [Layout.header.map.top, Layout.header.map.top, 0],
          extrapolate: 'clamp',
        });

        var marginRight = this.props.numColumns && this.props.numColumns > 1 ? 0 : this.state.listItem.gridInnerVPadding/2;
        var marginBottom = this.state.listItem.gridInnerHPadding;
    
        return (
          <View>
          <View style={{ backgroundColor: "white", height: "100%"}}>

            <StatusBar
                translucent
                barStyle="light-content"
                backgroundColor="rgba(0, 0, 0, 0.251)"
                />
            

              <this.AnimatedComponent
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={1}
                ref={ref=>(this._scrollView=ref)}
                onEndReached={this.props.onEndReached}
                onEndReachedThreshold={this.props.onEndReachedThreshold}
                key={this.props.keyList}
                data={this.props.data}
                extraData={this.props.extraData}
                renderItem={this._renderListItem.bind(this)}
                keyExtractor={this.props.keyExtractor}
                ListHeaderComponent={this.props.ListHeaderComponent}
                horizontal={this.props.horizontal}
                numColumns={this.props.numColumns}
                bodyContainerStyle={this.props.bodyContainerStyle}
                refreshing={this.props.poisRefreshing}
                initialNumToRender={2} // Reduce initial render amount
                updateCellsBatchingPeriod={4000} // Increase time between renders
                windowSize={10} // Reduce the window size
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                  {
                      useNativeDriver: true,
                  } 
                )}
                
                contentInset={{
                  top: this.HEADER_MAX_HEIGHT,
                }}
                
                contentOffset={{
                  y: -this.HEADER_MAX_HEIGHT, 
                }}

                contentContainerStyle={[{paddingTop: Platform.OS === 'ios' ? 0 : this.HEADER_MAX_HEIGHT,  ...this.props.listStyle }]} 

                style={[this.props.bodyContainerStyle]}
              >
              </this.AnimatedComponent>
            { this.props.renderTopContent &&

            <Animated.View
              style={[
                styles.topContent,
                this.props.topContentStyle,
                { transform: [{ translateY: topContentTranslate }] },
              ]}
            >


            
                <Animated.View
                  style={[
                    styles.topContentInnerContainer,
                    this.props.topContentInnerStyle,
                    {
                      transform: [{ translateY: parallaxTopContentTranslate }],
                    }
                  ]}
                > 
                  <TouchableOpacity 
                      onPress={this.props.topContentPressed}
                      style={[styles.fill]}
                      activeOpacity={0.7}>

                          <View
                              style={[styles.fill, styles.transparent]}
                              pointerEvents="none">

                              {this._renderTopContent()}

                          </View>

                  </TouchableOpacity>
                  
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.topContentBackground,
                  {
                    opacity: topContentBackgroundOpacity,
                    transform: [{ translateY: parallaxTopContentTranslate }],
                  }
                ]}>
                
            </Animated.View>
            </Animated.View>
          }


            <Animated.View style={[{
                backgroundColor: "white",
                height: 100,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",

                transform: [
                  { translateY: -20 },
                  { scale: headerBarScale },
                ],
                opacity: topContentBackgroundOpacity2
              }]}></Animated.View>
            
              
          </View>

          <Animated.View
              style={[
                styles.bar,
                {
                  transform: [
                    { scale: headerBarScale },
                  ],
                }, 
                {
                },
                this.props.headerComponentStyle
              ]}
            >
              {this._renderHeaderBarContent()}

            </Animated.View>   
          </View>
        );
      }  
    }
    
    const styles = StyleSheet.create({
      fill: {
        flex: 1,
      },
      content: {
        flex: 1,
      },
      topContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        height: 300
      },
      topContentBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        height: "100%",
        backgroundColor: "white"
      },
      transparent: {
        backgroundColor: 'transparent'
      },
      topContentInnerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: null,
        height: "100%",
        resizeMode: 'cover',

      },

      bar: {
        width: "100%",
        flex: 1,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      },
      headerLogo: {
        height: 30,
        resizeMode: "contain",
      },
      imageTop: {
        width: "100%",
        height: "100%",
        resizeMode: "contain"
      },
      scrollViewContent: {
      }
});
    

export default ScrollableHeader;