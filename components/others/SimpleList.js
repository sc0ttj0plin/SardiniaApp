import React from "react";
import { Text, StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
//import ToggleSwitch from "toggle-switch-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  ConnectedText,
  ConnectedLanguageList,
  TabBar,
  CustomDrawer,
  ConnectedAuthText,
  TabBarIcon,
} from "../../components";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Constants from "../../constants";
export default function MenuList(props) {
  var { navigation } = useNavigation();
  let flag;
  const { data, title} = props;
  console.log(props.navigation)
 // console.log(props)
  return (
    <FlatList
      data={data}
      renderItem={({ item}) => (
  <>
    <TouchableOpacity onPress={() => {
      
                                       props.navigation.navigate(Constants.NAVIGATION.NavInfoDetailsScreen, {
                                         item,
                                         mustFetch: true,
                                       });
                                     }}>
      <Item title={item.title} data={item} />
    </TouchableOpacity>
  </>
) }
      keyExtractor={(item) => item.id}
      navigation={navigation}
    />
  );
}
// const onItemPress = (item) =>
// console.log(item)
//   // props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, {
//   //   item,
//   //   mustFetch: true,
//   // });
// const renderItem = ({ item,props}) => (
//   <>
//     <TouchableOpacity onPress={() => {
//       console.log(item)
//                                       //  navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, {
//                                       //    item,
//                                       //    mustFetch: true,
//                                       //  });
//                                      }}>
//       <Item title={item.title} data={item} />
//     </TouchableOpacity>
//   </>
// ); 
const Item = ({ title ,data}) => (
  
  <>
    
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.element}>{title}</Text>
        <FontAwesome5
          style={styles.chevron}
          name="angle-right"
          size={25}
          color="black"
        />
      </View>
      <View
        style={{
          paddingStart: 10,
          justifyContent: "center",
          alignItems: "center",
          //width: "95%",
          borderBottomColor: "#F2F2F2",
          borderBottomWidth: 1,
        }}
      />
  
  </>
);

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "white",
  },
  container: {
    padding: 10,
  },
  title: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase",
  },
  element: {
    textAlign: "left",
    paddingTop: 24,
    paddingStart: 25,
    paddingBottom: 24,
    color: "black",
    //backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-regular",
    //textTransform: "uppercase"
  },
  chevron: {
    textAlign: "left",
    paddingTop: 20,
    paddingEnd: 15,
    paddingBottom: 24,
    color: "black",
    //backgroundColor: "#F2F2F2",

    //textTransform: "uppercase"
  },
});
