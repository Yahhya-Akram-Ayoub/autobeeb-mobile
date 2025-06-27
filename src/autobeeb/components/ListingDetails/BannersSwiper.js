import {useEffect, useRef, useState} from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  I18nManager,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {screenHeight, screenWidth} from '../../constants/Layout';
import {AutobeebModal} from '../../../components';
import HeaderWithShare from './HeaderWithShare';
import {SkeletonLoader} from '../shared/Skeleton';
import {Constants} from '../../../common';

const BannersSwiper = ({images, imageBasePath}) => {
  const modalPhotoRef = useRef(null);
  const [imageIndex, setImageIndex] = useState(1);
  const [failOverImages, setFailOverImages] = useState([]);

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
            setImageIndex(1);
          }}
        />
        <FlatList
          horizontal
          pagingEnabled
          showsVerticalScrollIndicator={false}
          data={images}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.imageListContent}
          renderItem={({item, index}) => (
            <RenderPopupImage
              item={item}
              key={index}
              isFailOver={failOverImages?.includes(index)}
              imageBasePath={imageBasePath}
            />
          )}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={4}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onScroll={handleScroll}
        />
      </AutobeebModal>
    </>
  );
};

const RenderPopupImage = ({item, isFailOver, imageBasePath}) => {
  const imageUri = `${Constants.coreApiV1}File/compressed?filePath=${imageBasePath}${item}.png`;
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!isFailOver) {
      Image.getSize(
        imageUri,
        (width, height) => {
          const scaleFactor = screenWidth / width;
          const imageHeight = height * scaleFactor;
          setImageSize({width: screenWidth, height: imageHeight});
        },
        error => {
          console.log('Error getting image size:', error);
        },
      );
    }
  }, [imageUri, isFailOver]);

  return (
    <View
      style={{
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FastImage
        style={{
          width: imageSize.width,
          height: imageSize.height,
          alignSelf: 'center',
        }}
        resizeMode={FastImage.resizeMode.contain}
        source={
          isFailOver
            ? require('../../../images/placeholder.png')
            : {
                uri: imageUri,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }
        }
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
    height: screenHeight,
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
});

export default BannersSwiper;
