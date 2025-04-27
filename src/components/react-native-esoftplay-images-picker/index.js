import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  PermissionsAndroid,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import update from 'immutability-helper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Languages} from '../../common';
import FastImage from 'react-native-fast-image';

const {width} = Dimensions.get('window');

export default class ImagesPicker extends React.Component {
  constructor(props) {
    super(props);

    this.rowRenderer = this.rowRenderer.bind(this);
    this.selectImage = this.selectImage.bind(this);
    this.ImageTile = this.ImageTile.bind(this);
    this.state = {
      photos: [],
      selected: {},
      after: null,
      has_next_page: true,
    };
  }

  async componentDidMount() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getPhotos();
      } else {
        alert(Languages.noPermission);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  getPhotos = () => {
    let params = {
      first: 24,
      assetType: 'Photos',

      //  mimeTypes: ["image/jpeg", "image/jpg", "image/png"]
    };
    if (this.state.after) params.after = this.state.after;
    if (!this.state.has_next_page) return;
    CameraRoll.getPhotos(params).then(this.processPhotos);
  };

  processPhotos = r => {
    if (this.state.after === r.page_info.end_cursor) return;
    let uris = r.edges
      .map(i => i.node)
      .map(i => i.image)
      .map(i => ({image: i, selected: false}));
    this.setState({
      photos: [...this.state.photos, ...uris],
      after: r.page_info.end_cursor,
      has_next_page: r.page_info.has_next_page,
    });
  };

  selectImage = index => {
    var photos = this.state.photos;
    var selectedCount = photos.filter(item => item.selected === true).length;
    var isSelect = photos[index].selected;
    var {max} = this.props;
    var isBelowLimit = true;
    if (max) isBelowLimit = selectedCount < max;
    if (isBelowLimit || isSelect) {
      var query = {
        [index]: {
          selected: {
            $set: !isSelect,
          },
        },
      };
      this.setState({photos: update(photos, query)});
    }
  };

  styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      height: 50,
      width: width,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
  });

  clearImages() {
    this.state.photos.map(photo => (photo.selected = false));
    if (
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ) == true
    )
      this.getPhotos();
  }

  ImageTile(props) {
    let {item, index, selectImage} = props;
    var color = this.props.color || 'blue';
    if (!item) return null;
    return (
      <TouchableOpacity
        underlayColor="transparent"
        onPress={() => selectImage(index)}>
        <View style={{width: width / 3, height: width / 3}}>
          <FastImage
            style={{width: width / 3, height: width / 3}}
            source={{
              uri: item.image.uri,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />

          <Ionicons
            name={
              item.selected
                ? 'ios-checkmark-circle'
                : 'ios-radio-button-off-outline'
            }
            style={{
              color: color,
              position: 'absolute',
              bottom: 5,
              right: 5,
              fontSize: 34,
              fontWeight: 'bold',
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  rowRenderer = (index, item) => {
    return (
      <this.ImageTile
        item={item}
        index={index}
        selectImage={this.selectImage}
      />
    );
  };

  render() {
    var {max, show, dismiss, color, images} = this.props;
    var {has_next_page, photos} = this.state;
    color = color ? color : 'blue';
    var selectedPhotos = this.state.photos
      .filter(item => item.selected === true)
      .map(item => item.image);
    var selectedCount = selectedPhotos.length;
    let headerText = selectedCount + Languages.selected;
    if (max && selectedCount === max) headerText = headerText + ' (max)';
    return (
      <Modal
        animationType={'fade'}
        transparent={false}
        onRequestClose={() => dismiss()}
        visible={show}>
        <View style={this.styles.container}>
          <View style={this.styles.header}>
            <TouchableOpacity onPress={() => dismiss()}>
              <Text style={{fontSize: 20, color: color}}>
                {Languages.CANCEL}
              </Text>
            </TouchableOpacity>
            <Text style={{fontSize: 16}}>{headerText}</Text>
            <TouchableOpacity
              hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}
              onPress={() => {
                images(selectedPhotos);
                dismiss();
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 20, color: color}}>
                  {Languages.Done}
                </Text>
                <Ionicons
                  name={'md-checkmark'}
                  size={15}
                  color={color}
                  style={{paddingHorizontal: 5}}
                />
              </View>
            </TouchableOpacity>
          </View>
          {has_next_page && photos.length == 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator color={color} size="large" />
            </View>
          ) : !has_next_page && photos.length == 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text>{Languages.NoImages}</Text>
            </View>
          ) : (
            <FlatList
              extraData={this.state.index}
              data={this.state.photos}
              numColumns={3}
              onEndReached={() => {
                this.getPhotos();
              }}
              renderItem={({item, index}) => {
                return (
                  <this.ImageTile
                    item={item}
                    index={index}
                    selectImage={this.selectImage}
                  />
                );
              }}
            />
          )}
        </View>
      </Modal>
    );
  }
}
