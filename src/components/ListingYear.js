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
  Platform,
} from 'react-native';
import {Color, Images, Styles, Constants, Languages, Icons} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';
import {SearchableFlatList} from 'react-native-searchable-list';
import {LogoSpinner} from '../components';

class ListingYear extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Years: this.props.Years,
      loader: true,
    };
  }
  componentDidMount() {
    this.props.FindStep();
    setTimeout(() => { // to fix skip year issue
      this.setState({loader: false});
    }, 300);
  }

  renderItem({item, index}) {
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
          <Text
            style={{
              color: '#333',
              marginLeft: 20,
              fontSize: Constants.mediumFont,
            }}>
            {item}
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
    let tempYears = [];

    if (this.state.loader) return <LogoSpinner fullStretch={true} />;
    if (this.props.Years && this.props.Years.length < 1) {
      return <View style={{}} />;
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
          }}
          placeholder={Languages.Search}
          onChangeText={text => {
            tempYears = this.props.Years.filter(item => {
              return item.toUpperCase().includes(text.toUpperCase());
            });
            this.setState({Years: tempYears, text});
          }}
          value={this.state.text}
        />

        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.Years || []}
          //  style={{ flex: 1 }}
          extraData={this.state}
          contentContainerStyle={{paddingBottom: 120}}
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

export default ListingYear;
