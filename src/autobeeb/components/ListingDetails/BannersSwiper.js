import {useEffect, useRef, useState} from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  I18nManager,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {screenHeight, screenWidth} from '../../constants/Layout';
import {AutobeebModal} from '../../../components';
import HeaderWithShare from './HeaderWithShare';
import {SkeletonLoader} from '../shared/Skeleton';
import {Constants} from '../../../common';
import KS from '../../../services/KSAPI';

const BannersSwiper = ({images, imageBasePath}) => {
  const modalPhotoRef = useRef(null);
  const [imageIndex, setImageIndex] = useState(1);
  const [failOverImages, setFailOverImages] = useState([]);
  const [loader, setLoader] = useState(true);
  const [imagesFullSize, setImagesFullSize] = useState([]);

  const handleScroll = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    let page = 0;

    if (I18nManager.isRTL) {
      page = images?.length - 1 - Math.round(offsetX / screenWidth);
    } else {
      page = Math.round(offsetX / screenWidth);
    }

    setImageIndex(page + 1);
  };

  const openPhoto = index => {
    modalPhotoRef.current?.open?.();
    setLoader(true);

    KS.GetFilesInfoes({
      Paths: images.map(item => `${imageBasePath}${item}.png`),
    })
      .then(res => res.json())
      .then(res => {
        const _res = res.map(x => {
          const scaleFactor = screenWidth / x.width;
          const imageHeight = x.height * scaleFactor;
          return {
            width: screenWidth,
            height: imageHeight > screenHeight ? screenHeight : imageHeight,
            path: x.path,
          };
        });

        setImagesFullSize(_res);
      })
      .finally(() => {
        setLoader(false);
      });
  };

  return (
    <>
      <FlatList
        style={styles.imageList}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imageListContent}
        pagingEnabled
        onScroll={handleScroll}
        initialNumToRender={16}
        data={images}
        renderItem={({item, index}) => {
          const isFailOver = failOverImages?.includes(index);
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => openPhoto(index)}>
              <FastImage
                style={[
                  styles.image,
                  {width: screenWidth * (isFailOver ? 0.7 : 1)},
                ]}
                resizeMode={isFailOver ? 'contain' : 'cover'}
                source={
                  isFailOver
                    ? require('../../../images/placeholder.png') // Replace if needed
                    : {
                        uri: `https://autobeeb.com/${imageBasePath}${item}_1024x853.jpg`,
                      }
                }
                onError={() => {
                  setFailOverImages(prev =>
                    prev?.includes(index) ? prev : [...(prev || []), index],
                  );
                }}
              />
            </TouchableOpacity>
          );
        }}
      />

      {images?.length > 1 && (
        <Text style={styles.imageCounter}>
          {`${images.length - imageIndex + 1}`}{' '}
          <IconFa name={'image'} size={14} color={'#fff'} />
        </Text>
      )}

      <AutobeebModal //the full view
        ref={modalPhotoRef}
        swipeToClose={false}
        fullScreen={true}
        animationDuration={200}
        style={styles.modalBoxWrap}
        useNativeDriver={true}>
        <HeaderWithShare
          name={'name'}
          listingId={11}
          typeId={1}
          backCkick={() => {
            modalPhotoRef.current.close();
          }}
        />
        <FlatList
          horizontal={false}
          showsVerticalScrollIndicator={false}
          data={loader ? [1, 1] : imagesFullSize}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.imageListContent2}
          style={{height: screenHeight, flex: 1}}
          renderItem={({item, index}) =>
            loader ? (
              <SkeletonLoader
                key={`skeleton-${index}`}
                containerStyle={styles.skeletonBox}
                borderRadius={3}
                shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
                animationDuration={1200}
              />
            ) : (
              <RenderPopupImage
                item={item}
                key={index}
                isFailOver={failOverImages?.includes(index)}
                imageBasePath={imageBasePath}
              />
            )
          }
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          getItemLayout={(data, index) => ({
            length: screenHeight,
            offset: screenHeight * index,
            index,
          })}
        />
      </AutobeebModal>
    </>
  );
};

const RenderPopupImage = ({item: {path, width, height}, isFailOver}) => {
  const imageUri = `${Constants.coreApiV1}File/compressed?filePath=${path}`;
  const [loading, setLoading] = useState(true);

  return (
    <View style={[styles.ImageContiner, {height}]}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#888"
          style={{position: 'absolute', zIndex: 1}}
        />
      )}
      <FastImage
        style={{
          width: width,
          height: height,
          alignSelf: 'center',
        }}
        resizeMode={FastImage.resizeMode.contain}
        source={
          isFailOver
            ? require('../../../images/placeholder.png')
            : {
                uri: imageUri,
              }
        }
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageList: {
    height: screenWidth / 1.2,
    width: screenWidth,
  },
  imageListModal: {
    height: screenHeight,
    width: screenWidth,
    gap: 5,
  },
  imageListContent: {
    minWidth: '100%',
  },
  imageListContent2: {
    minWidth: '100%',
    gap: 10,
  },
  image: {
    height: screenWidth / 1.2,
  },
  placeholderImage: {
    height: screenWidth / 1.2,
    width: screenWidth * 0.7,
    alignSelf: 'center',
  },
  imageCounter: {
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    position: 'absolute',
    zIndex: 100,
    bottom: 10,
    left: I18nManager.isRTL ? 10 : undefined,
    right: I18nManager.isRTL ? undefined : 10,
    alignSelf: 'center',
    paddingHorizontal: 5,
    fontSize: 14,
    borderRadius: 4,
  },
  imageSkeleton: {width: screenWidth, height: screenHeight / 2},
  failOverImage: {
    width: screenWidth * 0.7,
    height: screenWidth / 1.2,
  },
  skeletonBox: {
    width: screenWidth,
    height: screenHeight,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  ImageContiner: {
    screenWidth,
    height: screenHeight / 3,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BannersSwiper;
