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
import HorizontalSwiper from './HorizontalSwiper';
import Layout from '../../constants/Layout';
import {useSelector} from 'react-redux';
import BlogsRowSkeleton from './BlogsRowSkeleton';

const BlogsRow = () => {
  const navigation = useNavigation();
  const {homePageData, isFetching} = useSelector(state => state.home);
  const Blog = homePageData?.Blog ?? [];

  if (isFetching) return <BlogsRowSkeleton />;
  if (!isFetching && (!Blog || !Blog?.length)) return <></>;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{width: '32%'}} />
        <View style={styles.titleWrapper}>
          <Text
            style={styles.title}
            onPressIn={() => navigation.navigate('BlogsScreen')}>
            {Languages.LatestNews}
          </Text>
          <View style={styles.underline} />
        </View>
        <TouchableOpacity
          style={styles.viewAllWrapper}
          onPressIn={() => navigation.navigate('BlogsScreen')}>
          <View style={styles.viewAllInner}>
            <Text style={styles.viewAllText}>{Languages.ViewAll}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <HorizontalSwiper
        autoLoop
        intervalValue={4000}
        showButtons
        data={Blog}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.blogItemWrapper}
            onPress={() =>
              navigation.navigate('BlogDetails', {
                Blog: {ID: item.Id},
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
    paddingVertical: 5,
    width: Layout.screenWidth,
  },
  titleWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '32%',
  },
  title: {
    textAlign: 'center',
    fontSize: Constants.mediumFont,
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
    width: '32%',
    alignItems: 'center',
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
    width: Layout.screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blogCard: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#ddd',
    alignSelf: 'center',
    width: Layout.screenWidth * 0.95,
    height: (Layout.screenWidth * 0.95) / 2,
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
