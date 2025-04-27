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
import {LogoSpinner} from '../components';
import {Constants, Languages} from '../common';
import IconEn from 'react-native-vector-icons/Entypo';
import KS from '../services/KSAPI';

class ListingCateogry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Categories: [],
      Loader: true,
    };
  }
  componentDidMount() {
    let typeID = this.props.listingType;
    if (this.props.sectionID) {
      if (this.props.listingType == 32) {
        typeID = this.props.sectionID;
      } else if (this.props.RelatedEntity) {
        typeID = this.props.RelatedEntity;
      } else {
        typeID = this.props.sectionID;
      }
    } else {
      typeID = this.props.listingType;
    }

    KS.TypeCategoriesGet({
      langID: Languages.langID,
      typeID: typeID,
    })
      .then(data => {
        this.setState({
          Categories: data,
        });
      })
      .finally(() => {
        this.setState({Loader: false});
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
                  'https://autobeeb.com/' + item.FullImagePath + '_300x150.png',
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
    if (
      this.state.Loader ||
      (this.props.Categories && this.props.Categories.length < 1)
    ) {
      return <LogoSpinner fullStretch={true} />;
    } else
      return (
        <View style={{}}>
          <FlatList
            extraData={this.state}
            //   numColumns={2}
            data={this.state.Categories}
            keyExtractor={(item, index) => index.toString()}
            //  style={{ flex: 1 }}
            contentContainerStyle={{paddingBottom: 100}}
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

export default ListingCateogry;
