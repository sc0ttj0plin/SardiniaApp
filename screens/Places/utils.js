import * as Location from "expo-location";
import { SectionTitle } from "../../components";
import React from "react";

export const _onRegionChanged = (region, context) => {
    if (region.latitudeDelta > 0.3) {
        context.setState({ actualCity: null });
        return;
    }
    const location = {
        latitude: region.latitude,
        longitude: region.longitude,
    }
    Location.reverseGeocodeAsync(location).then(result => {
        if (!result) {
            context.setState({ actualCity: null });
            return;
        }
        if (result[0]["city"]) {
            context.setState({ actualCity: result[0]["city"] });
        } else {
            context.setState({ actualCity: null });
        }
    })
}

export const _renderHeaderText = (context) => {
    const { whereToGo, explore } = context.props.locale.messages;
    const { actualCity } = context.state;
    const { term } = context._getCurrentTerm();
    let categoryTitle = "";
    if (term) {
        categoryTitle = `${explore} ${term.name}`;
    } else {
        if (actualCity) {
            categoryTitle = `${explore} ${actualCity}`
        } else {
            categoryTitle = whereToGo
        }
    }
    return (
        <SectionTitle text={categoryTitle} numberOfLines={1} textStyle={{fontSize: 20 }} style={{ paddingBottom: 15 }}/>
    );
}
