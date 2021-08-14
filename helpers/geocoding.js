import Geocoder from "react-native-geocoding";

export const GeoInfo = (x,y) =>
{
   

Geocoder.init("AIzaSyA5YkfcNGR6dX062bFqhaZ1Asdr2uaNFJo"); //api key da abilitare
Geocoder.from(41.89, 12.49)
  .then((json) => {
    var addressComponent = json.results[0].address_components[0];
    console.log(addressComponent);
    return;
  })
  .catch((error) => console.warn(error)
  );
}
