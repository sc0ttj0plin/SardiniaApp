
import React, {PureComponent} from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper"
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
class LLHorizontalItemsFlatlist extends PureComponent {

    constructor(props){
        super(props);
    }

    _renderItem = ({ item, index }) => {
        return(
            <ShimmerWrapper style={[styles.item]} shimmerStyle={[styles.item, this.props.itemStyle]}/>
        )
    }

    render(){
        let listTitle = this.props.title;
        return (
            <View> 
                { listTitle &&
                    <View style={styles.sectionTitleView}>
                        <Text style={[styles.sectionTitle, this.props.titleStyle]}>{listTitle}</Text>
                    </View>
                }
                { !this.props.error &&
                    <FlatList 
                        horizontal={this.props.horizontal ? this.props.horizontal : false}
                        data={Array.from({ length: 5 }).map((_, i) => String(i))}
                        keyExtractor={i => i}
                        numColumns={this.props.numColumns ? this.props.numColumns : 1}
                        bodyContainerStyle={this.props.bodyContainerStyle ? this.props.bodyContainerStyle : {}}
                        renderItem={this._renderItem}
                        showsHorizontalScrollIndicator={false}
                        style={this.props.style}
                        contentContainerStyle={[styles.container, this.props.contentContainerStyle]}>
                    </FlatList>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    item: {
        width: 160,
        height: 160,
        marginRight: 10,
        borderRadius: 8,
    },
    container: {
        backgroundColor: "transparent",
        marginBottom: 0
    },
    sectionTitle: {
        fontSize: 16,
        color: 'white',
        fontFamily: "montserrat-bold",
        // margin: 10
    },
    sectionTitleView: {
        paddingBottom: 10,
        justifyContent: "center",
        alignItems: "center",
      },
  });


function LLHorizontalItemsFlatlistContainer(props) {
    const store = useStore();
    return <LLHorizontalItemsFlatlist {...props} store={store} />;
}

const mapStateToProps = state => {
    return {
        locale: state.localeState,
    };
};

const mapDispatchToProps = dispatch => {
return {...bindActionCreators({}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
return {
    ...stateProps,
    actions: dispatchProps,
    ...props
}
})(LLHorizontalItemsFlatlistContainer)