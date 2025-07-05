import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import NewHeader from '../containers/NewHeader';
import KS from '../services/KSAPI';
import Languages from '../common/Languages';
import Colors from '../common/Color';
import Constants from '../common/Constants';
import * as Animatable from 'react-native-animatable';
import {useAsyncSetState, useGetState} from '../ultils/use-async-setState';

const BlogsScreen = ({navigation}) => {
  const All = {
    Name: Languages.All,
    ID: 2,
    isAll: true,
  };
  const PageSize = 9;
  const [IsLoading, setIsLoading] = useState(true);
  const [IsFetching, setIsFetching] = useState(false);
  const [Blogs, setBlogs] = useState();
  const [Categories, setCategories] = useState([]);
  const [SelectedMainCateogry, setSelectedMainCateogry] = useState(All);
  const [SubCategories, setSubCategories] = useState([]);
  const [SelectedSubCategory, setSelectedSubCategory] = useState();
  // const [Page, setPage] = useState(1);
  const [IsFooterLoading, setIsFooterLoading] = useState(false);
  const [TotalPages, setTotalPages] = useState(1);
  const [state, setStateAsync] = useAsyncSetState({Page: 1});
  const [SearchText, setSearchText] = useState('');
  const getState = useGetState(state);

  const scrolling = useRef();

  useEffect(() => {
    KS.ArticlesGet({
      langId: Languages.langID,
      categoryid: 2,
      page: getState().Page,
      PageSize,
    }).then(data => {
      if (data?.Success == '1') {
        setBlogs(data.Articles);
        setTotalPages(data.TotalPages);
        setIsLoading(false);
      }
    });

    KS.ArticleCategoriesGet({
      langId: Languages.langID,
      parentID: 2,
    }).then(data => {
      if (data?.Success == '1') {
        setCategories(data.Categories);
      }
    });
  }, []);

  function getArticles(categoryID, onEndReached = false, search = '') {
    if (!onEndReached) {
      setIsLoading(true);
      setBlogs([]);
    }
    KS.ArticlesGet({
      langId: Languages.langID,
      categoryid: categoryID,
      Page: getState().Page,
      sch: search,
      PageSize,
    }).then(data => {
      setIsLoading(false);
      if (data?.Success == '1') {
        if (onEndReached && data.Articles?.length > 0) {
          let tempBlogs = Blogs;
          tempBlogs = [...Blogs]; //, {isBanner: true}];
          // tempBlogs.push({ isBanner: true });
          tempBlogs = tempBlogs.concat(data.Articles);

          setBlogs(tempBlogs);
          setIsFooterLoading(false);
        } else {
          setBlogs(data.Articles);
          setTotalPages(data.TotalPages);
          setIsFooterLoading(false);
        }
      }
    });
  }

  function setMainCategory(category) {
    setSearchText('');
    getArticles(category.ID);
    setSelectedMainCateogry(category);
    setSelectedSubCategory(undefined);
    if (category.isAll) {
      setSubCategories([]);
      return;
    }
    KS.ArticleCategoriesGet({
      langId: Languages.langID,
      parentID: category.ID,
    }).then(data => {
      if (data?.Success == '1') {
        setSubCategories(data.Categories);
        if (Languages.ID == '1')
          setTimeout(() => {
            scrolling.current.scrollToEnd({animated: true});
          }, 150);
      }
    });
  }

  let keyExtractor = React.useCallback((item, index) => index.toString(), []);
  let renderItem = React.useCallback(({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          width: Dimensions.get('screen').width,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          elevation: 1,
        }}
        onPress={() => {
          navigation.navigate('BlogDetails', {
            Blog: item,
          });
        }}>
        <View
          style={{
            overflow: 'hidden',
            borderBottomWidth: 1,
            borderColor: '#eee',
            backgroundColor: '#ddd',
            alignSelf: 'center',
            width: Dimensions.get('screen').width * 0.95,
            height: (Dimensions.get('screen').width * 0.95) / 2,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
          }}>
          <Text
            numberOfLines={1}
            style={{
              position: 'absolute',
              bottom: 0,
              textAlign: 'center',
              padding: 5,
              width: '100%',
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 100,
            }}>
            {item.Name}
          </Text>
          {
            <Image
              source={{
                uri: `https://autobeeb.com/${item.FullImagePath}_1024x683.jpg`,
              }}
              style={{
                alignSelf: 'center',
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
          }
        </View>
      </TouchableOpacity>
    );
  }, []);

  function renderCategories() {
    return (
      <View style={{marginTop: 10, marginLeft: 10}}>
        <FlatList
          style={{
            //  backgroundColor: "red",
            alignSelf: 'flex-start',
            marginBottom: 10,
            //   width: "100%",
          }}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
          data={[All, ...Categories]}
          renderItem={({item, index}) => {
            return (
              <TouchableOpacity
                style={[
                  {
                    backgroundColor: 'white',
                    borderRadius: 5,
                    overflow: 'hidden',
                    paddingHorizontal: 10,
                    elevation: 2,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    marginRight: 5,
                  },
                  SelectedMainCateogry?.ID == item.ID && {
                    backgroundColor: Colors.primary,
                  },
                ]}
                onPress={async () => {
                  if (!IsLoading) {
                    await setStateAsync(s => ({...s, Page: 1}));
                    setMainCategory(item);
                  }
                }}>
                <Text
                  style={[
                    {},
                    SelectedMainCateogry?.ID == item.ID
                      ? {
                          color: '#fff',
                        }
                      : {
                          color: '#000',
                        },
                  ]}>
                  {item.Name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {false && (
          <FlatList //subcategories
            style={{
              //  marginTop: 10,
              alignSelf: 'flex-start',
            }}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            contentContainerStyle={{
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
            showsHorizontalScrollIndicator={false}
            data={SubCategories}
            renderItem={({item, index}) => {
              return (
                <TouchableOpacity
                  onPress={async () => {
                    if (!IsLoading) {
                      await setStateAsync(s => ({...s, Page: 1}));
                      setSelectedSubCategory(item);
                      getArticles(item.ID);
                    }
                  }}>
                  <Animatable.View
                    animation="pulse"
                    style={[
                      {
                        backgroundColor: '#fff',
                        borderRadius: 5,
                        overflow: 'hidden',
                        paddingHorizontal: 10,
                        //  elevation: 2,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: '#ddd',
                        marginRight: 5,
                        marginBottom: 10,
                      },
                      SelectedSubCategory?.ID == item.ID && {
                        backgroundColor: Colors.secondary,
                      },
                    ]}>
                    <Text
                      style={[
                        SelectedSubCategory?.ID == item.ID
                          ? {
                              color: '#fff',
                            }
                          : {
                              color: '#000',
                            },
                      ]}>
                      {item.Name}
                    </Text>
                  </Animatable.View>
                </TouchableOpacity>
              );
            }}
          />
        )}
        <ScrollView
          ref={scrolling}
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{width: '100%'}}>
          {SubCategories.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                if (!IsLoading) {
                  await setStateAsync(s => ({...s, Page: 1}));
                  setSelectedSubCategory(item);
                  getArticles(item.ID);
                }
              }}>
              <Animatable.View
                animation="pulse"
                style={[
                  {
                    backgroundColor: '#fff',
                    borderRadius: 5,
                    overflow: 'hidden',
                    paddingHorizontal: 10,
                    //  elevation: 2,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    marginRight: 5,
                    marginBottom: 10,
                  },
                  SelectedSubCategory?.ID == item.ID && {
                    backgroundColor: Colors.secondary,
                  },
                ]}>
                <Text
                  style={[
                    SelectedSubCategory?.ID == item.ID
                      ? {
                          color: '#fff',
                        }
                      : {
                          color: '#000',
                        },
                  ]}>
                  {item.Name}
                </Text>
              </Animatable.View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <NewHeader
        navigation={navigation}
        back
        CustomSearchComponent
        onChangeText={search => {
          setSearchText(search);
        }}
        searchValue={SearchText}
        placeholder={Languages.SearchByBlogTitle}
        onSubmitEditing={async () => {
          await setStateAsync(s => ({...s, Page: 1}));

          getArticles(SelectedMainCateogry.ID, false, SearchText);
        }}
      />
      {!!Categories?.length && renderCategories()}
      {IsLoading ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={'#F85502'} />
        </View>
      ) : (
        <View style={{}}>
          <FlatList
            style={{}}
            contentContainerStyle={{flexGrow: 1, paddingBottom: 200}}
            data={Blogs}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            // ListHeaderComponent={renderCategories}
            onEndReached={async ({distanceFromEnd}) => {
              // console.log("end" + distanceFromEnd + IsFooterLoading);
              if (IsFooterLoading) return;
              if (Categories?.length > 0 && getState().Page < TotalPages) {
                //console.log(getState().Page);
                setIsFooterLoading(true);
                await setStateAsync(s => ({...s, Page: s.Page + 1}));

                getArticles(
                  SelectedSubCategory
                    ? SelectedSubCategory.ID
                    : SelectedMainCateogry.ID,
                  true,
                  SearchText,
                );
              }
            }}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{textAlign: 'center', fontFamily: 'Cairo-Bold'}}>
                  {Languages.NoOffers}
                </Text>
              </View>
            }
            ListFooterComponent={
              IsFooterLoading && (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    marginBottom: 80,
                  }}>
                  <ActivityIndicator size="large" color={'#F85502'} />
                </View>
              )
            }
          />
        </View>
      )}
    </View>
  );
};

export default BlogsScreen;
