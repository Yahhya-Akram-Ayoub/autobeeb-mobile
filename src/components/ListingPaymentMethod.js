import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from 'react-native';
import {Constants} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';

class ListingPaymentMethod extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.FindStep();
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
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={this.props.types || []}
        style={{flex: 1, backgroundColor: '#f8f8f8'}}
        // contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={() => {
                if (!this.props.isEditing) {
                  this.props.onClick(item);
                } else {
                  this.props.onEditingClick(item);
                }
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {item.FullImagePath && (
                  <Image
                    style={{
                      width: 40,
                      height: 40,
                      // tintColor: "#636363"
                    }}
                    resizeMode={'contain'}
                    source={{
                      uri:
                        'https://autobeeb.com/' +
                        item.FullImagePath +
                        '_50x50.png',
                    }}
                  />
                )}
                <Text
                  style={{
                    color: '#333',
                    marginLeft: 20,
                    fontSize: Constants.mediumFont,
                  }}>
                  {item.Name}
                </Text>
              </View>
              <IconEn
                name={
                  I18nManager.isRTL
                    ? 'chevron-small-left'
                    : 'chevron-small-right'
                }
                size={30}
                color="#80B7CC"
              />
            </TouchableOpacity>
          );
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  whiteContainer: {
    //  marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
});
export default ListingPaymentMethod;
