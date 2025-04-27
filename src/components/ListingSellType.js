import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Color, Constants} from '../common';

class ListingSellType extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderCatImg(index) {
    switch (index) {
      case 1:
        return require('../images/Cars.png');
      case 2:
        return require('../images/trucks.png');
      case 4:
        return require('../images/equipment.png');
      case 8:
        return require('../images/bus.png');
      case 16:
        return require('../images/trailer.png');
      case 32:
        return require('../images/sparparts.png');
      default:
        return require('../images/trucks.png');
    }
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={
            this.props.listingType == 32
              ? this.props.types.filter(x => x.ID != 2)
              : this.props.types || []
          }
          // style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            //    flex: 1,
            justifyContent: 'center',
          }}
          renderItem={({item, index}) => {
            let url = '../images/' + item.img;
            return (
              <TouchableOpacity
                onPress={() => {
                  this.props.onClick(item);
                }}
                style={{
                  //  elevation: 3,
                  borderWidth: 1,
                  backgroundColor: Color.secondary,
                  width: Dimensions.get('screen').width * 0.8,
                  borderRadius: 10,
                  paddingVertical: 15,
                  marginBottom: 10,
                  alignSelf: 'center',
                  borderColor: '#eee',
                  //    height: Dimensions.get("screen").height * 0.285,
                  justifyContent: 'space-around',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: Constants.bigFont + 5,
                    fontFamily: 'Cairo-Bold',
                    //    fontWeight: "bold",
                    color: 'white',
                  }}>
                  {item.Name}
                </Text>
                <Image
                  style={{
                    width: 100,
                    height: 70,
                    //   tintColor: "#fff"
                  }}
                  resizeMode={'contain'}
                  source={item.img}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  }
}

export default ListingSellType;
