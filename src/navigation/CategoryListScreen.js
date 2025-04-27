import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  I18nManager,
} from 'react-native';
import NewHeader from '../containers/NewHeader';

import IconEn from 'react-native-vector-icons/Entypo';

import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

import IconIon from 'react-native-vector-icons/Ionicons';

let carList = [
  {make: Languages.AllMakes},
  {
    make: 'Chevrolate',
    model: 'Super Ban',
    img: 'https://lancedehmracing.com/f/2018/12/bmw-m3-sedan-in-raipur-offers-mileage-amp-features-car-banner-img.jpg',

    new: true,
    numOfImgs: 12,
    year: '2017',
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'Toyota',
    model: 'Camry',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    new: false,
    numOfImgs: 12,
    year: '2011',
    location: 'Amman',
    price: 17900,
    premium: true,
    online: false,
  },
  {
    make: 'Chevrolate',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'BMW',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'HONDA',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'FERRARI',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'BMW',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'HONDA',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
  {
    make: 'FERRARI',
    model: 'Super Ban',
    img: 'https://cdn.bmwblog.com/wp-content/uploads/2017/06/BMW-M760Li-Frozen-Black-1-830x553.jpg',

    year: '2017',
    new: true,
    numOfImgs: 12,
    location: 'Amman',
    price: 17900,
    premium: true,
    online: true,
  },
];
class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderCatRow({item}) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          this.props.navigation.navigate('CategoryListScreen', {name: name});
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {item.img && (
            <Image
              style={{width: 30, height: 30}}
              resizeMode="contain"
              source={require('../images/bmwLogo.png')}
            />
          )}
          <Text style={{color: '#333', marginLeft: 20, fontSize: 24}}>
            {item.make}
          </Text>
        </View>
        <IconEn
          name={
            I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
          }
          size={30}
          color="#80B7CC"
        />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#f0f0f0'}}>
        <NewHeader navigation={this.props.navigation} back blue make />

        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 15}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 25,
                marginLeft: 20,

                color: '#000',
              }}>
              {this.props.route.params?.Category}
            </Text>

            <IconEn
              name={
                I18nManager.isRTL ? 'chevron-small-left' : 'chevron-small-right'
              }
              size={30}
              color="#000"
            />
          </View>

          <Text
            style={{
              fontSize: 25,
              marginLeft: 20,

              color: '#000',
            }}>
            {this.props.route.params?.Category +
              ' for ' +
              this.props.route.params?.SubCategory}
          </Text>
        </View>

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          style={styles.whiteContainer}
          data={carList}
          renderItem={this.renderCatRow}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  whiteContainer: {
    marginBottom: 10,
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
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
});
export default componentName;
