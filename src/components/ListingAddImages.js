import React, {useRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import {Color, Constants, Languages} from '../common';
import IconFa from 'react-native-vector-icons/FontAwesome';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import DialogBox from 'react-native-dialogbox';
import {screenHeight, screenWidth} from '../autobeeb/constants/Layout';
import {requestCameraPermission} from '../ultils/Permission';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import KS from '../services/KSAPI';
import {toast} from '../Omni';

const ListingAddImages = ({
  onClick,
  listingType,
  pImages,
  imageBasePath,
  listingId,
  sellType,
}) => {
  const [images, setImages] = useState(pImages ?? []);
  const [mainImage, setMainImage] = useState(0);
  const [fetchLoader, setFetchLoader] = useState(false);
  const dialogRef = useRef(null);
  const isNeededListing = sellType === 4;
  const maxImages = listingType !== 32 && !isNeededListing ? 15 : 1;

  const updateImages = newImages => {
    setImages(newImages.slice(0, maxImages));
    if (newImages.length === 0) {
      setMainImage(null);
    } else if (mainImage === null || mainImage >= newImages.length) {
      setMainImage(0);
    }
    setFetchLoader(false);
  };

  const pickMultiple = () => {
    dialogRef.current?.close();
    const maxAllowed = maxImages - images.length;
    setFetchLoader(true);

    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: maxAllowed,
        includeBase64: true,
        compressImageQuality: 0.7,
      },
      res => {
        if (!res || res.didCancel || !res.assets) {
          setFetchLoader(false);
          return;
        }

        try {
          const newImages = images
            ? [
                ...images,
                ...res.assets.map(image => ({
                  uri: image.uri,
                  width: image.width,
                  height: image.height,
                  mime: image.type,
                  data: image.base64,
                })),
              ]
            : res.assets.map(image => ({
                uri: image.uri,
                width: image.width,
                height: image.height,
                mime: image.type,
                data: image.base64,
              }));

          updateImages(newImages);
        } catch (err) {
          setFetchLoader(false);
        }
      },
    );
  };

  const pickSingleWithCamera = async () => {
    dialogRef.current?.close();
    const isGranted = await requestCameraPermission();
    if (!isGranted) return;

    launchCamera(
      {
        mediaType: 'photo',
        cropping: false,
        width: 500,
        height: 500,
        includeBase64: true,
        compressImageQuality: 0.7,
      },
      res => {
        if (!res || res.didCancel) return;

        setFetchLoader(true);

        try {
          const image = res.assets[0];
          const _image = {
            uri: image.uri,
            width: image.width,
            height: image.height,
            mime: image.type,
            data: image.base64,
          };
          const newImages = images ? [...images, _image] : [_image];
          updateImages(newImages);
        } catch (err) {
          setFetchLoader(false);
        }
      },
    );
  };

  const cleanupImage = (image, index) => {
    if (listingId && images.length === 1) {
      toast('You can not delete all photos');
      return;
    }

    const filtered = images.filter((img, i) => i !== index);
    updateImages(filtered);
  };

  const showImageOptions = () => {
    dialogRef.current?.pop({
      title: Languages.ImageSource,
      btns: [
        {
          text: Languages.camera,
          callback: () => setTimeout(pickSingleWithCamera, 500),
        },
        {
          text: Languages.Gallery,
          callback: () => setTimeout(pickMultiple, 500),
        },
      ],
    });
  };

  const moveIndexToStart = index => {
    setTimeout(() => {
      setFetchLoader(false);
    }, 100);

    if (index < 0 || index >= images.length) return;
    const item = images[index];
    const newArr = images.slice(0, index).concat(images.slice(index + 1));
    updateImages([item, ...newArr]);
    setMainImage(0);
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
              size={20}
              color={Color.primary}
              style={index === 0 ? styles.AbsulatePlus : styles.PlusIcon}
            />
            <Text style={styles.addPhotoText}>{Languages.addPhotos}</Text>
          </TouchableOpacity>
        );

      return (
        <View key={index} style={styles.addBox}>
          <TouchableOpacity
            onPress={() => {
              setFetchLoader(true);
              setTimeout(() => {
                moveIndexToStart(index);
              }, 10);
            }}>
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={styles.imageBoxSquer}
                source={
                  typeof item === 'string'
                    ? {
                        uri: `https://autobeeb.com/${imageBasePath}${item}_400x400.jpg`,
                      }
                    : item
                }
              />
            </View>
            {mainImage === index && (
              <IconFa
                name="home"
                size={20}
                color={Color.primary}
                style={styles.mainImageIcon}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => cleanupImage(item, index)}>
            <IconMC name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    },
    [images, mainImage],
  );

  const paddedImages = [...images];
  while (paddedImages.length < maxImages) paddedImages.push(null);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
        ) : maxImages === 1 && images.length === 1 ? (
          <View key={0} style={styles.addBoxOnImage}>
            <TouchableOpacity onPress={() => setMainImage(0)}>
              <View
                style={{
                  width: screenWidth / 1.3,
                  height: screenWidth / 1.3,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    resizeMode: 'contain',
                    width: screenWidth / 1.3,
                    height: screenWidth / 1.3,
                  }}
                  source={
                    typeof images[0] === 'string'
                      ? {
                          uri: `https://autobeeb.com/${imageBasePath}${images[0]}.png`,
                        }
                      : images[0]
                  }
                />
              </View>
              <IconFa
                name="home"
                size={20}
                color={Color.primary}
                style={styles.mainImageIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => cleanupImage(images[0], 0)}>
              <IconMC name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={paddedImages}
            keyExtractor={(_, index) => index.toString()}
            extraData={[mainImage]}
            numColumns={3}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={styles.flatListContent}
            columnWrapperStyle={{gap: 3}}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => onClick({images, mainImage: images[0]})}
        style={{
          backgroundColor:
            (!isNeededListing &&
              (!images.length || images.length > maxImages)) ||
            fetchLoader
              ? 'gray'
              : Color.primary,
          width: '97%',
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 3,
          marginVertical: 6,
        }}
        disabled={
          !isNeededListing && (!images.length || images.length > maxImages)
        }>
        {fetchLoader ? (
          <ActivityIndicator size={'small'} color={'#fff'} />
        ) : (
          <Text
            style={{
              color: '#fff',
              fontFamily: Constants.fontFamilySemiBold,
              fontSize: 18,
            }}>
            {Languages.Continue}
          </Text>
        )}
      </TouchableOpacity>

      <DialogBox ref={dialogRef} />
    </View>
  );
};

export default ListingAddImages;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '89%',
    height: screenHeight - 140,
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
  imageBoxSquer: {
    maxWidth: '100%',
    maxHeight: '100%',
    resizeMode: 'contain',
    minWidth: 130,
    height: '100%',
  },
  addPhotoText: {
    fontSize: 12,
    color: Color.primary,
  },
  flatListContent: {
    gap: 6,
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
  mainImageIcon: {position: 'absolute', top: 3, start: 15},
});
