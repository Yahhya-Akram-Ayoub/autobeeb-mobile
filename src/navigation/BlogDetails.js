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
                  `https://autobeeb.com/${Blog.FullImagePath}${image}_1024x683.jpg`
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
      <StatusBar
        backgroundColor={'#111'}
        barStyle={'light-content'}></StatusBar>
      {/* <Header {...props} /> */}
      {Blog && Blog.Name && (
        <ScrollView
          style={{backgroundColor: '#fff', flex: 1}}
          //  contentContainerStyle={{ flexGrow: 1 }}
        >
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
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    color: 'black',
                    position: 'absolute',
                    zIndex: 100,
                    //  top: 25,
                    //    right: 0,
                    alignSelf: 'center',
                    paddingHorizontal: 5,
                    fontSize: 19,
                    bottom: 0,
                    borderTopLeftRadius: 50,
                    paddingLeft: 20,
                  },
                  I18nManager.isRTL
                    ? {
                        left: 0,
                      }
                    : {
                        right: 0,
                      },
                ]}>{`${ImageIndex} / ${Blog?.ImageList?.length}`}</Text>
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
              /* onMessage={(event) => {
                setwebHeight(parseInt(event.nativeEvent.data));
              }}*/
              javaScriptEnabled={true}
              injectedJavaScript={webViewScript}
              domStorageEnabled={true}></AutoHeightWebView>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default BlogDetails;
