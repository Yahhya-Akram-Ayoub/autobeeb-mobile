import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  I18nManager,
} from 'react-native';

import {LogoSpinner} from '../components';
import {Color, Constants, Languages} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';
import KS from '../services/KSAPI';

class ListingMake extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      Makes: [],
      FullMakes: [],
    };
  }
  componentDidMount() {
    this.setState({isLoading: true});
    // alert(this.props.RelatedEntity);
    KS.MakesGet({
      langID: Languages.langID,
      listingtype: this.props.sectionID
        ? this.props.RelatedEntity
          ? this.props.RelatedEntity
          : this.props.sectionID
        : this.props.listingType,
    }).then(data => {
      data.push({ID: '', Name: Languages.Other});
      this.setState({Makes: data, FullMakes: data, isLoading: false});
    });
  }

  renderItem({item, index}) {
    return (
      <TouchableOpacity
        key={index}
        style={styles.row}
        onPress={() => {
          if (!this.props.isEditing) {
            this.props.FindStep(item);
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
                  'https://autobeeb.com/' + item.FullImagePath + '_240x180.png',
              }}
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
    let tempMakes = [];

    if (this.state.isLoading) {
      return <LogoSpinner fullStretch={true} />;
    }
    return (
      <View style={{}}>
        <TextInput
          style={{
            height: 60,
            borderColor: Color.secondary,
            borderBottomWidth: 1,
            paddingHorizontal: 15,
            fontSize: Constants.mediumFont,
            fontFamily: 'Cairo-Regular',
            textAlign: I18nManager.isRTL ? 'right' : 'left',
            color: '#383737',
          }}
          placeholderTextColor={'#38373770'}
          placeholder={Languages.Search}
          onChangeText={text => {
            tempMakes = this.state.FullMakes.filter(item => {
              return item.Name.toUpperCase().includes(text.toUpperCase());
            });
            this.setState({Makes: tempMakes, text});
          }}
          value={this.state.text}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.Makes}
          //  style={{ flex: 1 }}
          extraData={this.state.Makes}
          contentContainerStyle={{paddingBottom: 150}}
          renderItem={this.renderItem.bind(this)}
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
    paddingVertical: 10,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    justifyContent: 'space-between',
  },
});

export default ListingMake;
