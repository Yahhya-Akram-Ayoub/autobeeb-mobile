import React, {useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  I18nManager,
  Platform,
  StyleSheet,
  Alert,
  Image,
  NativeModules,
  ScrollView,
} from 'react-native';
import {Color, Constants, Languages} from '../common';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {requestCameraPermission} from '../ultils/Permission';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import KS from '../services/KSAPI';
import {useRoute} from '@react-navigation/native';
import DialogBox from 'react-native-dialogbox';
import {screenHeight, screenWidth} from '../autobeeb/constants/Layout';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

var ImagePicker = NativeModules.ImageCropPicker;
const ListingAddImages = ({onClick, listingType}) => {
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [imagesEdit, setImagesEdit] = useState([]);
  const [imagePendingDelete, setImagePendingDelete] = useState(false);
  const [isMaxImagesUploaded, setIsMaxImagesUploaded] = useState(false);
  const [index, setIndex] = useState(0);
  const imagesListRef = useRef(null);
  const route = useRoute();
  const isEditMode = route?.params?.EditOffer;
  const dialogRef = useRef(null);
  const maxImages = listingType !== 32 ? 15 : 1;

  const pickMultiple = () => {
    const maxAllowed = maxImages - (imagesEdit?.length ?? 0);
    const selectionLimit = maxAllowed > 0 ? maxAllowed : 0;

    const options = {
      mediaType: 'photo',
      selectionLimit,
      maxFiles: selectionLimit,
      includeBase64: true,
      compressImageQuality: 0.7,
    };

    launchImageLibrary(options, res => {
      if (!res || res.didCancel || !res.assets) return;

      setMainImage(null);
      let newImages = [...images];

      res.assets.forEach(image => {
        if (newImages.length < selectionLimit) {
          newImages.push({
            uri: image.uri,
            width: image.width,
            height: image.height,
            mime: image.type,
            data: image.base64,
          });
        }
      });

      setImages(newImages);
      setIndex(prev => prev + 1);
      setIsMaxImagesUploaded(newImages.length === selectionLimit);
    });
  };

  const pickSingleWithCamera = async () => {
    try {
      const isPermissionGranted = await requestCameraPermission();
      if (!isPermissionGranted) return;

      const options = {
        mediaType: 'photo',
        cropping: false,
        width: 500,
        height: 500,
        includeExif: true,
        includeBase64: true,
        compressImageQuality: 0.7,
      };

      launchCamera(options, res => {
        if (!res || res.didCancel || !res.assets?.[0]) return;

        const image = res.assets[0];
        setMainImage(null);

        let newImages = [...images];

        const canAddImage = isEditMode
          ? newImages.length <= 14 - imagesEdit.length
          : newImages.length <= 14;

        if (canAddImage) {
          newImages.push({
            uri: image.uri,
            width: image.width,
            height: image.height,
            mime: image.type,
            data: image.base64,
          });
        }

        setImages(newImages);
      });
    } catch (error) {
      console.log('Camera Error:', error);
    }
  };
  const cleanupImage = image => {
    if (!image) return;

    setImages(prev => prev.filter(x => x !== image));

    try {
      ImagePicker.cleanSingle(image.uri);
    } catch (error) {
      console.warn('Failed to clean image:', error);
    }
  };

  const showImageOptions = () => {
    dialogRef.current?.pop({
      title: Languages.ImageSource,
      btns: [
        {
          text: Languages.camera,
          callback: () => {
            dialogRef.current?.close();
            setTimeout(() => {
              pickSingleWithCamera();
            }, 500);
          },
        },
        {
          text: Languages.Gallery,
          callback: () => {
            dialogRef.current?.close();
            setTimeout(() => {
              pickMultiple();
            }, 500);
          },
        },
      ],
    });
  };

  const renderItem = useCallback(
    ({item, index}) => {
      if (!item)
        return (
          <TouchableOpacity onPress={showImageOptions} style={styles.addBox}>
            {!index && (
              <IconFa
                name="file-image-o"
                size={40}
                color={Color.primary}
                style={{marginVertical: 5}}
              />
            )}
            <IconFa
              name="plus"
              size={index === 0 ? 20 : 20}
              color={Color.primary}
              style={index === 0 ? styles.AbsulatePlus : styles.PlusIcon}
            />

            <Text style={styles.addPhotoText}>{Languages.addPhotos}</Text>
          </TouchableOpacity>
        );

      return (
        <View
          key={index} // style={styles.imageWrapper}
          style={styles.addBox}>
          <TouchableOpacity
            onPress={() => {
              if (imagesListRef.current) {
                imagesListRef.current.scrollToOffset({
                  animated: true,
                  offset: 0,
                });
              }

              const newImages = [...images];
              const [selected] = newImages.splice(index, 1);
              setMainImage(null);
              setImages([selected, ...newImages]);
            }}>
            <Image
              style={[
                {
                  maxWidth: '100%',
                  maxHeight: '100%',
                  resizeMode: 'contains',
                },
                mainImage === index && {
                  borderWidth: 3,
                  borderColor: Color.primary,
                },
              ]}
              source={item}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => cleanupImage(item)}>
            <IconMC name="close" size={20} color={'#fff'} />
          </TouchableOpacity>
        </View>
      );
    },
    [cleanupImage],
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.limitText}>
          {isMaxImagesUploaded
            ? Languages.limitHighlightedImage.replace('15', maxImages)
            : images.length > 0 && !mainImage
            ? Languages.highlightedImage
            : ''}
        </Text>
        {maxImages === 1 && !images.length ? (
          <TouchableOpacity
            onPress={showImageOptions}
            style={styles.addBoxOnImage}>
            <IconFa
              name="file-image-o"
              size={40}
              color={Color.primary}
              style={{marginVertical: 5}}
            />
            <IconFa
              name="plus"
              size={20}
              color={Color.primary}
              style={styles.AbsulatePlus}
            />
            <Text style={styles.addPhotoText}>{Languages.addPhotos}</Text>
          </TouchableOpacity>
        ) : maxImages === 1 && images.length ? (
          <View
            key={index} // style={styles.imageWrapper}
            style={styles.addBoxOnImage}>
            <TouchableOpacity>
              <Image
                style={[
                  {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    resizeMode: 'contains',
                  },
                  mainImage === index && {
                    borderWidth: 3,
                    borderColor: Color.primary,
                  },
                ]}
                source={images[0]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => cleanupImage(images[0])}>
              <IconMC name="close" size={20} color={'#fff'} />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={imagesListRef}
            data={[
              ...images,
              ...Array.apply(null, {length: maxImages - images.length}),
            ]}
            keyExtractor={(item, index) => index.toString()}
            extraData={images}
            numColumns={3}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={styles.flatListContent}
            columnWrapperStyle={{
              gap: 3,
            }}
          />
        )}
      </ScrollView>
      <DialogBox ref={dialogRef} />
      <TouchableOpacity
        onPress={() => {
          onClick({images, mainImage});
        }}
        style={{
          backgroundColor: Color.primary,
          width: '100%',
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 3,
          position: 'absolute',
          bottom: 65,
        }}
        disabled={!images.length}>
        <Text
          style={{
            color: '#fff',
            fontFamily: Constants.fontFamilySemiBold,
            fontSize: 18,
          }}>
          {Languages.Continue}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListingAddImages;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingBottom: 125,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '89%',
  },
  addBoxOnImage: {
    width: screenWidth / 1.3,
    height: screenWidth / 1.3,
    marginTop: screenHeight / 10,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Color.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  addBox: {
    width: screenWidth / 3 - 5,
    height: screenWidth / 3 - 5,
    borderWidth: 1,
    borderColor: Color.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  AbsulatePlus: {
    position: 'absolute',
    top: 12,
    right: 5,
  },
  PlusIcon: {},
  iconMain: {
    marginVertical: 5,
  },
  iconPlus: {
    position: 'absolute',
    top: 12,
    right: 5,
  },
  addPhotoText: {
    fontSize: 12,
    color: Color.primary,
  },
  flatListContent: {
    gap: 6,
  },
  imageWrapper: {
    marginHorizontal: 3,
    overflow: 'visible',
    paddingVertical: 18,
    paddingHorizontal: 5,
  },
  removeButton: {
    position: 'absolute',
    end: 1,
    top: 1,
    backgroundColor: '#000',
    zIndex: 500,
    elevation: 1,
    width: 25,
    height: 25,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  limitText: {
    color: Color.primary,
    fontSize: 12,
    fontFamily: Constants.fontFamilySemiBold,
    paddingVertical: 6,
  },
});
