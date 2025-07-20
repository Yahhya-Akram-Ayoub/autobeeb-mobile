import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {HeaderBackButton} from '@react-navigation/stack';
import {isIphoneX} from 'react-native-iphone-x-helper';
import IconEV from 'react-native-vector-icons/EvilIcons';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import Color from '../common/Color';
import {I18nManager} from 'react-native';
import KS from '../services/KSAPI';
import {Languages, Constants} from '../common';
import AutoHeightWebView from 'react-native-autoheight-webview';
import {AppHeader, AppIcon, Icons} from '../autobeeb/components';
import {NewHeader} from '../containers';
import {useNavigation} from '@react-navigation/native';
import {screenWidth} from '../autobeeb/constants/Layout';
import {SkeletonLoader} from '../autobeeb/components/shared/Skeleton';
let htmlStyle =
  `<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Cairo">
  <style>
  *{direction:` +
  (Languages.langID == '2' ? 'rtl' : 'ltr') +
  `; font-family:'cairo'; font-size:18px; text-align: justify;}
</style>`;
const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight); 
  }, 500);
  true; // note: this is required, or you'll sometimes get silent failures
`;

const Header = props => {
  // return <NewHeader navigation={props.navigation} back />;

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)']}
      style={{
        position: 'absolute',

        top: 0,
        zIndex: 200,
        //   elevation:10,
        minHeight: 50,
        paddingTop: isIphoneX() ? 15 : 5,
        width: Dimensions.get('screen').width,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 20,
          justifyContent: 'space-between',
        }}>
        <HeaderBackButton
          labelVisible={false}
          tintColor="#fff"
          style={{}}
          onPress={() => {
            props.navigation.goBack();
          }}
        />
        {false && (
          <TouchableOpacity
            style={{marginRight: 15}}
            onPress={() => {
              this.onShare();
            }}>
            <IconEV name="share-google" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const Images = ({Blog, updateImageIndex, ImageIndex}) => {
  function handleScroll(event) {
    const page =
      event.nativeEvent.contentOffset.x / Dimensions.get('screen').width;
    updateImageIndex(Math.round(page) + 1);
  }
  if (Blog?.ThumbURL || Blog?.ImageList?.length > 0) {
    return (
      <FlatList
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        inverted={I18nManager.isRTL}
        style={{
          width: Dimensions.get('screen').width,
        }}
        onScroll={handleScroll}
        data={
          Blog?.ImageList?.length > 0
            ? Blog.ImageList.map(
                image =>
                  `https://autobeeb.com/${Blog.FullImagePath}${image}_1024x683.jpg`,
              )
            : [`https://autobeeb.com/${Blog.FullImagePath}_1024x683.jpg`]
        }
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={{}}
              disabled
              onPress={() => {
                //        this.openPhoto(index);
              }}>
              <FastImage
                style={{
                  height: Dimensions.get('screen').width / 2,
                  width: Dimensions.get('screen').width,
                }}
                resizeMode="cover"
                source={{
                  uri: item,
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    );
  } else {
    return (
      <Image
        style={{
          height: Dimensions.get('screen').width / 1.5,
          width: Dimensions.get('screen').width * 0.7,
          alignSelf: 'center',
        }}
        resizeMode="contain"
        source={require('../images/placeholder.png')}
      />
    );
  }
};

const BlogDetails = props => {
  const [Blog, setBlog] = useState(props.route.params?.Blog || {});
  const [ImageIndex, setImageIndex] = useState(0);
  const [webheight, setwebHeight] = useState(200);
  const navigation = useNavigation();

  useEffect(() => {
    KS.ArticleGet({
      langid: Languages.langID,
      articleID: Blog.ID,
    }).then(data => {
      if (data?.Article) {
        setBlog(data.Article);
      }
    });
  }, []);

  return (
    <View style={{flex: 1}}>
      <View style={styles.wrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.row}>
            <View />
            <TouchableOpacity
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
              style={styles.closeButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <AppIcon
                type={Icons.Ionicons}
                name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
                size={20}
                color={'white'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {Blog && Blog.Name ? (
        <ScrollView style={{backgroundColor: '#fff', flex: 1}}>
          <View
            style={{width: '100%', height: Dimensions.get('screen').width / 2}}>
            <Images
              Blog={Blog}
              updateImageIndex={val => {
                setImageIndex(val);
              }}
              ImageIndex={ImageIndex}
            />
            {Blog?.ImageList?.length > 1 && (
              <Text
                style={[
                  {
                    position: 'absolute',
                    bottom: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    fontSize: 14,
                    color: '#fff',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    zIndex: 10,
                    alignSelf: 'center',
                  },
                  I18nManager.isRTL ? {left: 10} : {right: 10},
                ]}>
                {`${ImageIndex} / ${Blog?.ImageList?.length}`}
              </Text>
            )}
          </View>
          <View
            style={{
              padding: Dimensions.get('screen').width * 0.04,
              alignItems: 'center',
              borderTopWidth: 1,
              borderColor: '#ddd',
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Cairo-Bold',
                fontSize: 19,
                lineHeight: 26,
                color: Color.secondary,
              }}>
              {Blog.Name}
            </Text>
            <Text style={{textAlign: 'center', fontSize: 15, color: '#ACAEAD'}}>
              {moment(Blog.Date).format('YYYY-MM-DD')}
            </Text>
            <View
              style={{
                height: 1,
                width: '100%',
                backgroundColor: 'black',
                marginVertical: 5,
              }}></View>
            <AutoHeightWebView
              allowsInlineMediaPlayback={true}
              style={{
                width:
                  Dimensions.get('window').width -
                  Dimensions.get('screen').width * 0.06,
              }}
              showsVerticalScrollIndicator={false}
              viewportContent={'width=device-width, user-scalable=no'}
              originWhitelist={['*']}
              source={{
                html: htmlStyle + Blog.Description,
              }}
              automaticallyAdjustContentInsets={false}
              scrollEnabled={false}
              javaScriptEnabled={true}
              injectedJavaScript={webViewScript}
              domStorageEnabled={true}
            />
          </View>
        </ScrollView>
      ) : (
        <>
          <SkeletonLoader
            containerStyle={styles.skeletonBox}
            borderRadius={3}
            shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
            animationDuration={1200}
          />
          <SkeletonLoader
            containerStyle={styles.skeletonBox2}
            borderRadius={3}
            shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
            animationDuration={1200}
          />
        </>
      )}
    </View>
  );
};

export default BlogDetails;
const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 200,
    minHeight: 70,
    paddingTop: 15,
    width: screenWidth,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 100,
    padding: 7,
  },
  shareButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  skeletonBox: {
    height: 150,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  skeletonBox2: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
});
