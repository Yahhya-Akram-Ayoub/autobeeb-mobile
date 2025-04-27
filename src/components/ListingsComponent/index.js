//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
// create a component
class ListingsComponent extends Component {
  render() {
    //alert(JSON.stringify(this.props.item));
    return <Card item={this.props.item} navigation={this.props.navigation} />;
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2c3e50"
  }
});

//make this component available to the app
export default ListingsComponent;
