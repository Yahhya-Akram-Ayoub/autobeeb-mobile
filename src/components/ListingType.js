import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Languages} from '../common';

class ListingType extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderCatImg(index) {
    switch (index) {
      case 0:
        return require('../images/Cars.png');
      case 1:
        return require('../images/trucks.png');
      case 2:
        return require('../images/equipment.png');
      case 3:
        return require('../images/bus.png');
      case 4:
        return require('../images/trailer.png');
      case 5:
        return require('../images/sparparts.png');
      default:
        return require('../images/trucks.png');
    }
  }

  renderTintColor(index) {
    switch (index) {
      case 0:
        return '#C20037';
      case 1:
        return '#018404';
      case 2:
        return '#FFBF00';
      case 3:
        return '#9D4E01';
      case 4:
        return '#795091';
      case 5:
        return '#636363';
      default:
        return '#C20037';
    }
  }

  render() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={this.props.types || []}
        numColumns={2}
        //  style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        renderItem={({item, index}) => {
          let url = '../images/' + item.img;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                this.props.onClick(item);
              }}
              style={{
                // elevation: 2,
                //   elevation: 1,
                //  borderWidth: 1,
                width: Dimensions.get('screen').width * 0.45,
                marginHorizontal: 5,
                marginVertical: 5,
                height: Dimensions.get('screen').width * 0.45,
                //  flex: 1,
                //    borderColor: "#eee",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ccc',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 100,
                  height: 90,
                  //  tintColor: Color.secondary
                  tintColor: this.renderTintColor(index),
                }}
                resizeMode={'contain'}
                source={{
                  uri:
                    'https://autobeeb.com/' +
                    item.FullImagePath +
                    '_115x115.png',
                }}
              />
              {item.ID != 32 ? (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 18,
                    //    color: "#fff"
                    //  color: Color.secondary
                    color: '#000',
                  }}>
                  {item.Name}
                </Text>
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 18,
                    //    color: "#fff"
                    // color: Color.secondary
                    color: '#000',
                  }}>
                  {item.Name + '\n' + Languages.AndPlates}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    );
  }
}

export default ListingType;
