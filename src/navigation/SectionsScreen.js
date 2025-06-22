import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  StatusBar,
  I18nManager,
} from 'react-native';
import {NewHeader} from '../containers';
import {LogoSpinner} from '../components';
import AddButton from '../components/AddAdvButton';
import IconEn from 'react-native-vector-icons/Entypo';
import {Languages, Constants, Color} from '../common';

import KS from '../services/KSAPI';

class SectionsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSectionsLoading: true,
      isMakesLoading: false,
    };
  }
  componentDidMount() {
    KS.ListingTypesGet({
      langID: Languages.langID,
    }).then(data => {
      this.setState({CarListingType: data.find(x => x.ID == 1)});
    });
    KS.ListingTypesGet({
      langID: Languages.langID,
      parentID: this.props.route.params?.ListingType?.ID,
    }).then(data => {
      // alert(JSON.stringify(data));
      let All = {
        //  FullImagePath: "yaz",
        //   ID: 57344,
        ID: '',
        Image: require('../images/SellTypes/BlueAll.png'),
        AllMake: true,
        All: true,
        Name: Languages.All,
      };
      data.unshift(All);
      this.setState({
        Sections:
          data?.filter(x => !['4096', '2048'].includes(`${x.ID}`)) ?? [],
        isSectionsLoading: false,
        FullSections: data,
      });
    });
  }

  renderCatRow({item}) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          if (item.ParentID == 32 && item.ID == 64) {
            this.props.navigation.navigate('MakesScreen', {
              ListingType: this.state.CarListingType,
              navigationOption: {
                ListingType: this.props.route.params?.ListingType,
                SellType: this.props.route.params?.SellType ?? 0,

                SectionID: item.ID,
                selectedSection: item,
              },
              SellType: this.props.route.params?.SellType ?? 0,
            });
          } else {
            KS.MakesGet({
              langID: Languages.langID,
              listingType: item.RelatedEntity,
            }).then(data => {
              let AllMakes = {
                //  FullImagePath: "yaz",
                Image: require('../images/SellTypes/BlueAll.png'),
                AllMake: true,
                ID: '',
                All: true,
                Name: Languages.All,
              };
              data.unshift(AllMakes);

              this.props.navigation.navigate('ListingsScreen', {
                ListingType: this.props.route.params?.ListingType,
                SellType: this.props.route.params?.SellType ?? 0,
                selectedMake: data[0],
                SectionID: item.ID,
                selectedSection: item,
                Makes: data,
              });

              this.setState({
                isMakesLoading: false,
              });
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
              style={{width: 50, height: 50}}
              resizeMode="contain"
              source={{
                uri:
                  'https://autobeeb.com/' + item.FullImagePath + '_240x180.png',
              }}
            />
          )}
          {item.Image && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 50,
              }}>
              <Image
                style={{width: 25, height: 20, tintColor: Color.primary}}
                tintColor={Color.primary}
                resizeMode="contain"
                source={item.Image}
              />
            </View>
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
    if (this.state.isMakesLoading || this.state.isSectionsLoading) {
      return (
        <View style={{flex: 1}}>
          <NewHeader navigation={this.props.navigation} back blue make />

          <LogoSpinner fullStretch={true} />
        </View>
      );
    }
    return (
      <View style={{flex: 1, backgroundColor: '#f0f0f0'}}>
        {false && (
          <StatusBar
            backgroundColor={Color.secondary}
            barStyle="light-content"
          />
        )}

        <NewHeader navigation={this.props.navigation} back blue make />
        <AddButton navigation={this.props.navigation} />

        {false && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 20,
                  marginLeft: 20,

                  color: '#000',
                }}>
                {this.props.route.params?.ListingType?.Name}
              </Text>

              <IconEn
                name={
                  I18nManager.isRTL
                    ? 'chevron-small-left'
                    : 'chevron-small-right'
                }
                size={25}
                color="#000"
                style={{marginTop: 3}}
              />
            </View>

            <Text
              style={{
                fontSize: 20,
                marginLeft: 10,

                color: '#000',
              }}>
              {this.props.route.params?.ListingType?.Name +
                ' ' +
                this.props.route.params?.SellType?.Name}
            </Text>
          </View>
        )}
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
              fontFamily: 'Cairo-Regular',

              marginBottom: 0,
              fontSize: Constants.mediumFont,
            },
          ]}
          placeholder={Languages.Search}
          onChangeText={text => {
            tempSections = this.state.FullSections.filter(item => {
              return item.Name.toUpperCase().includes(text.toUpperCase());
            });
            this.setState({Sections: tempSections, text});
          }}
          value={this.state.text}
        />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          style={styles.whiteContainer}
          data={this.state.Sections}
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
export default SectionsScreen;
