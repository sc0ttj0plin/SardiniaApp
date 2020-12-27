//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import { getCenter } from 'geolib';

export function distance(lat1, lon1, lat2, lon2, unit = "K") {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
	}
	else {
    var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
      dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

export function distanceToString(distance, unit = "K") {
    if (unit === "K") {
        if(distance > 1) {
            return distance.toFixed(1) + " km";
        } else {
            distance *= 1000;
            return distance.toFixed(1) + " m";
        }
    } else if (unit === "m") {
      distance *= 1000;
      return distance.toFixed(1) + " Km";
    }

    return distance.toString();
}

export function getCenterFromPoints(points, getCoordsFun) {
  let coordsArray = [];
	points.forEach((p, index) => {
    let coords = getCoordsFun(p);
    coordsArray.push({ latitude: coords[1], longitude: coords[0] }); 
  });
  let center = getCenter(coordsArray);
  return center;
}


// Generates a bounding rectangle ready for use in google maps [[lng0, lat0], [lng1, lat1], ..., [lngN, latN]]
export function boundingRect(points, center, getCoordsFun, zoomOutMultiplicator=2.5) {
  let _center = center;
	let arrayLength = points.length;
	let trIndex = 0;
	let blIndex = 0;
	let tr = bl = getCoordsFun(points[0]);
	let coordsArray = []; // If there's no center compute it from points (uncomment if needed)
		
	points.forEach((p, index) => {
		let coords = getCoordsFun(p);
		coordsArray.push({ latitude: coords[1], longitude: coords[0] }); // If there's no center compute it from points (uncomment if needed)
		if(coords[0] < bl[0] || coords[1] < bl[1]) {
      		bl=coords;
			blIndex = index;
		}
		if(coords[0] > tr[0] || coords[1] > tr[1]) {
      		tr=coords;
			trIndex = index;
		}
	})
	// console.log("coords array", coordsArray, points)  
	// If there's no center compute it from points (uncomment if needed)
	if (!_center && coordsArray && coordsArray.length > 0) { 
		_center = getCenter(coordsArray);
		_center = [_center.longitude, _center.latitude];
	}

	let maxLonDelta = Math.max(Math.max(Math.abs(_center[0]-tr[0]), Math.abs(_center[0]-bl[0])), 0.0001);
	let maxLatDelta = Math.max(Math.max(Math.abs(_center[1]-tr[1]), Math.abs(_center[1]-bl[1])), 0.0001);
	
	// console.log("max lon delta", _center[0]-tr[0], _center[0]-bl[0])
	return {
		longitude: _center[0],
		latitude: _center[1],
		longitudeDelta: maxLonDelta * zoomOutMultiplicator,
		latitudeDelta: maxLatDelta * zoomOutMultiplicator
	}
}


export function regionToPoligon(region) {
	var polygon = [];
	try {
		polygon[0] = [region.longitude + region.longitudeDelta, region.latitude + region.latitudeDelta];
		polygon[1] = [region.longitude - region.longitudeDelta, region.latitude + region.latitudeDelta];
		polygon[2] = [region.longitude - region.longitudeDelta, region.latitude - region.latitudeDelta];
		polygon[3] = [region.longitude + region.longitudeDelta, region.latitude - region.latitudeDelta];
		polygon[4] = polygon[0];
	} catch (ex) {
		console.log(ex);
	}
	return polygon;
}

export function regionToCoords(region) {
	var coords = [];
	try {
		coords[0] = region.longitude;
		coords[1] = region.longitude;
	} catch (ex) {
		console.log(ex);
	}
	return coords;
}

export function coordsInBound(coords) {
	if (coords.latitude > 38.862172 && coords.latitude < 41.329934 && coords.longitude > 7.941310 && coords.longitude < 9.920187)
		return true;
	return false;
}

export function regionDiagonalKm(region) {
	var d = -1;
	try {
		var polygon = [];
		polygon[0] = [region.longitude + region.longitudeDelta/2, region.latitude + region.latitudeDelta/2];
		polygon[1] = [region.longitude - region.longitudeDelta/2, region.latitude + region.latitudeDelta/2];
		polygon[2] = [region.longitude - region.longitudeDelta/2, region.latitude - region.latitudeDelta/2];
		polygon[3] = [region.longitude + region.longitudeDelta/2, region.latitude - region.latitudeDelta/2];
		polygon[4] = polygon[0];
		d = distance(polygon[0][1], polygon[0][0], polygon[2][1], polygon[2][0]);
	} catch (ex) {
		console.log(ex);
	}
	return d;
}