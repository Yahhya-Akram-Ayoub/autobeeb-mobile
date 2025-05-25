import {useRef, useState} from 'react';
import {
  Text,
  FlatList,
  TouchableOpacity,
  I18nManager,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import IconFa from 'react-native-vector-icons/FontAwesome';
import {screenWidth} from '../../constants/Layout';
import {AutobeebModal} from '../../../components';
import {AppIcon, Icons} from '../shared/AppIcon';

const BannersSwiper = ({images, imageBasePath}) => {
  const modalPhotoRef = useRef(null);
  const [imageIndex, setImageIndex] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
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
    setSelectedImageIndex(index);
    modalPhotoRef.current?.open?.();
  };

  const closePhoto = () => {
    modalPhotoRef.current?.close?.();
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
                />
              </TouchableOpacity>
            );
          }}
        />
      </AutobeebModal>
    </>
  );
};

const styles = StyleSheet.create({
  imageList: {
    height: screenWidth / 1.2,
    width: screenWidth,
  },
  imageListContent: {
    minWidth: '100%',
    justifyContent: 'center',
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
});

export default BannersSwiper;
