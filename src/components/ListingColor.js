import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  I18nManager,
} from 'react-native';
import {Color, Constants, Languages} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';
import LogoSpinner from './LogoSpinner';

class ListingColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Colors: this.props.Colors,
    };
  }
  componentDidMount() {
    this.props.FindStep();
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
          {item.Value && (
            <View
              style={{
                height: 25,
                width: 25,
                elevation: 2,
                borderRadius: 15,
                backgroundColor: item.Value,
              }}
            />
          )}
          <Text
            style={{
              color: '#333',
              marginLeft: 20,
              fontSize: Constants.mediumFont,
            }}>
            {item.Label}
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
    let tempColors = [];

    if (this.props.Colors && this.props.Colors.length < 1) {
      return <LogoSpinner fullStretch={true} />;
    } else
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
              tempColors = this.props.Colors.filter(item => {
                return item.Label.toUpperCase().includes(text.toUpperCase());
              });
              this.setState({Colors: tempColors, text});
            }}
            value={this.state.text}
          />

          <FlatList
            data={this.state.Colors || []}
            keyExtractor={(item, index) => index.toString()}
            //  style={{ flex: 1 }}
            extraData={this.state}
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

export default ListingColor;
