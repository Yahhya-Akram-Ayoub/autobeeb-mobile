//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Moment from 'moment';
import {Color} from '../../common';
import FastImage from 'react-native-fast-image';

// create a component
class Cards extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {item} = this.props;
    //const item = this.props.item;
    //alert(JSON.stringify(item));

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          borderWidth: 5,
          borderBottomWidth: 3,
          borderTopWidth: 3,
          borderColor: '#E9E9EF',
          backgroundColor: '#fff',
          flex: 3,
        }}
        onPress={() => {
          this.props.navigation.navigate('ProductDetailsScreen', {
            product: item.item,
          });
        }}>
        <FastImage
          style={{
            width: Dimensions.get('window').width * 0.35,
            height: Dimensions.get('window').height * 0.2,
            //   position: "relative",
            flex: 1,
          }}
          resizeMode={FastImage.resizeMode.cover}
          source={
            item.item.ThumbURL
              ? {
                  uri:
                    'https://www.autobeeb.com/' +
                    item.item.FullImagePath +
                    '_400x400.jpg',
                }
              : require('../../images/placeholder.png')
          }
        />

        <View
          style={{
            paddingHorizontal: 20,
            minHeight: Dimensions.get('window').height * 0.2,
            width: Dimensions.get('window').width * 0.65,
          }}>
          <Text
            style={{
              textAlign: 'left',
              fontFamily: 'Cairo-Regular',
              fontSize: 15,
              padding: 10,
            }}>
            {item.item.Name}
          </Text>
          {!!item.item.Price && (
            <Text
              style={{
                textAlign: 'left',
                fontFamily: 'Cairo-Bold',
                color: Color.primary,
                fontSize: 16,
              }}>
              {item.item.Price + ' ' + item.item.FormatedCur}
            </Text>
          )}
          <View style={{width: null, height: 1, backgroundColor: 'gray'}} />

          <Text style={{textAlign: 'left', fontSize: 12, paddingVertical: 10}}>
            {Moment(item.item.StartDate).format('YYYY-MM-DD')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default Cards;
