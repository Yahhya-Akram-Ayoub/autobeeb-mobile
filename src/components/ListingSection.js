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
import {Color, Constants, Languages} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';
import LogoSpinner from './LogoSpinner';

class ListingSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Sections: this.props.Sections,
    };
  }
  componentDidMount() {
    this.props.FindStep();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.Sections != this.state.Sections) {
      this.setState({Sections: nextProps.Sections});
    }
  }

  renderItem({item, index}) {
    return (
      <TouchableOpacity
        key={index}
        style={styles.row}
        onPress={() => {
          this.props.onClick(item);
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
                width: 60,
                height: 60,
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
              marginLeft: 20,
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
    let tempSections = [];

    if (!this.state.Sections) {
      return <LogoSpinner fullStretch={true} />;
    } else
      return (
        <View style={{}}>
          {false && (
            <TextInput
              style={{
                height: 60,
                borderColor: Color.secondary,
                borderBottomWidth: 1,
                paddingHorizontal: 15,
                fontSize: Constants.mediumFont,
                fontFamily: 'Cairo-Regular',
              }}
              placeholder={Languages.Search}
              onChangeText={text => {
                tempSections = this.props.Sections.filter(item => {
                  return item.Name.toUpperCase().includes(text.toUpperCase());
                });
                this.setState({Sections: tempSections, text});
              }}
              value={this.state.text}
            />
          )}

          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={this.state.Sections || []}
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

export default ListingSection;
