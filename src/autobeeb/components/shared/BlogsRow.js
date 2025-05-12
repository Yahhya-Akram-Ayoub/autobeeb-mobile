import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Color, Constants, Languages} from '../../../common';
import {HorizontalSwiper} from '../../../components';

const {width: screenWidth} = Dimensions.get('screen');

const BlogsRow = ({homePageData}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View />
        <View style={styles.titleWrapper}>
          <Text
            style={styles.title}
            onPress={() => navigation.navigate('BlogsScreen')}>
            {Languages.LatestNews}
          </Text>
          <View style={styles.underline} />
        </View>
        <TouchableOpacity
          style={styles.viewAllWrapper}
          onPress={() => navigation.navigate('BlogsScreen')}>
          <View style={styles.viewAllInner}>
            <Text style={styles.viewAllText}>{Languages.ViewAll}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <HorizontalSwiper
        autoLoop
        intervalValue={4000}
        showButtons
        data={homePageData?.Blog}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.blogItemWrapper}
            onPress={() =>
              navigation.navigate('BlogDetails', {
                Blog: item,
              })
            }>
            <View style={styles.blogCard}>
              <Text numberOfLines={1} style={styles.blogTitle}>
                {item.Name}
              </Text>
              <Image
                source={{
                  uri: `https://autobeeb.com/${item.FullImagePath}_1024x683.jpg`,
                }}
                style={styles.blogImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EBEBEB',
    paddingBottom: 10,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    width: screenWidth,
    paddingVertical: 5,
  },
  titleWrapper: {
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: Constants.MediumFont,
    color: '#000',
    fontFamily: 'Cairo-Bold',
  },
  underline: {
    height: 1,
    width: 70,
    marginBottom: 5,
    backgroundColor: Color.secondary,
    alignSelf: 'center',
  },
  viewAllWrapper: {
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  viewAllInner: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  viewAllText: {
    fontFamily: Constants.fontFamily,
    color: Color.secondary,
    marginBottom: 12,
  },
  blogItemWrapper: {
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blogCard: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#ddd',
    alignSelf: 'center',
    width: screenWidth * 0.95,
    height: (screenWidth * 0.95) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  blogTitle: {
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
    padding: 5,
    width: '100%',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 100,
  },
  blogImage: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
});

export default BlogsRow;
