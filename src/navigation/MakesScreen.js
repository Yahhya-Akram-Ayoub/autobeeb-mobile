import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  StatusBar,
  I18nManager,
} from 'react-native';
import {NewHeader} from '../containers';
import {LogoSpinner} from '../components';
import AddButton from '../components/AddAdvButton';
import IconEn from 'react-native-vector-icons/Entypo';

import {Languages, Constants, Color} from '../common';

import KS from '../services/KSAPI';

class MakesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }
  componentDidMount() {
    KS.MakesGet({
      langID: Languages.langID,
      listingType:
        this.props.route.params?.ListingType?.ID === 4
          ? 8192
          : this.props.route.params?.ListingType?.ID === 32
          ? 1
          : this.props.route.params?.ListingType?.ID,
    }).then(data => {
      let AllMakes = {
        //  FullImagePath: "yaz",
        ID: '',
        All: true,
        Image: require('../images/SellTypes/BlueAll.png'),
        AllMake: true,
        Name: Languages.AllMakes,
      };
      data.unshift(AllMakes);
      this.setState({
        Makes: data,
        FullMakes: data,
        isLoading: false,
      });
    });
  }

  renderCatRow({item, index}) {
    return (
      <TouchableOpacity
        key={index}
        style={styles.row}
        onPress={() => {
          if (!!this.props.route.params?.navigationOption) {
            this.props.navigation.navigate('ListingsScreen', {
              ListingType: (this.props.route.params?.navigationOption ?? 0)
                .ListingType,
              SellType: (this.props.route.params?.navigationOption ?? 0)
                .SellType,
              SectionID: (this.props.route.params?.navigationOption ?? 0)
                .SectionID,
              selectedSection:
                this.props.route.params?.navigationOption?.selectedSection,
              selectedMake: item,
              Makes: this.state.FullMakes,
            });
          } else {
            this.props.navigation.navigate('ListingsScreen', {
              ListingType: this.props.route.params?.ListingType,
              SellType: this.props.route.params?.SellType ?? 0,
              selectedMake: item,
              Makes: this.state.FullMakes,
            });
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
              style={{width: 40, height: 40}}
              resizeMode="contain"
              source={{
                uri:
                  'https://autobeeb.com/' + item.FullImagePath + '_240x180.png',
              }}
            />
          )}
          {item.Image && (
            <Image
              style={{width: 30, height: 20}}
              resizeMode="contain"
              source={item.Image}
            />
          )}
          <Text
            style={{
              color: '#333',
              marginLeft: 15,
              fontSize: Constants.mediumFont,
            }}>
            {item.Name}
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
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1}}>
          <NewHeader navigation={this.props.navigation} back blue make />

          <LogoSpinner fullStretch={true} />
        </View>
      );
    }
    return (
      <View style={{flex: 1, backgroundColor: '#f0f0f0'}}>
        <NewHeader navigation={this.props.navigation} back blue make />
        <AddButton navigation={this.props.navigation} />
        <TextInput
          style={[
            styles.whiteContainer,
            {
              height: 40,
              elevation: 1,
              //        borderColor: Color.secondary,
              textAlign: I18nManager.isRTL ? 'right' : 'left',

              borderBottomWidth: 1,
              paddingHorizontal: 15,
              marginBottom: 0,
              fontFamily: 'Cairo-Regular',

              fontSize: Constants.mediumFont,
            },
          ]}
          placeholder={Languages.Search}
          onChangeText={text => {
            let tempMakes = this.state.FullMakes.filter(item => {
              return item.Name.toUpperCase().includes(text.toUpperCase());
            });
            this.setState({Makes: tempMakes, text});
          }}
          value={this.state.text}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          style={styles.whiteContainer}
          data={this.state.Makes}
          renderItem={this.renderCatRow.bind(this)}
        />
      </View>
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
    paddingVertical: 8,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
});
export default MakesScreen;
