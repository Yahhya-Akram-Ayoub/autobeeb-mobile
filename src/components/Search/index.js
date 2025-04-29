import React, {Component} from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  Keyboard,
  StyleSheet,
  ScrollView,
  I18nManager,
} from 'react-native';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {Color, Constants, Languages} from '../../common';
import BlockTimer from '../../ultils/BlockTimer';
import {isIphoneX} from 'react-native-iphone-x-helper';

class Search extends Component {
  constructor(props) {
    super(props);
    this.page = 1;
    this.langid = 1;
    this.state = {
      text: '',
      LoadingBuffer: true,
      isSubmit: false,
      loading: false,
      focus: false,

      selectedCity: '',
      selectedCategory: '',
      ScientificNamesState: [],
      searchFetching: false,
      query: '',
      selectedItems: [],
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderSearchBar = this.renderSearchBar.bind(this);
  }

  componentDidMount() {
    // setTimeout(() => {
    //   alert(JSON.stringify(this.props.searchResult))
    // }, 5000);

    this.setState({LoadingBuffer: false});

    //  this.setState({ focus: true, searchType: "commercial" });
    // setTimeout(() => {
    //   this.setState({ ScientificNamesState: this.props.ScientificList });
    // }, 5000);
    // this.props.fetchCities().then(data => {
    //   this.setState({ ScientificNamesState: data });
    // });
  }

  componentWillUnmount() {
    this.props.clearSearch();
  }

  renderSearchBar() {
    const closeButton = () => {
      return (
        <TouchableOpacity
          onPress={this.onBack.bind(this)}
          style={{width: 50, justifyContent: 'center', alignItems: 'center'}}>
          <Icon name={'close'} size={30} />
        </TouchableOpacity>
      );
    };

    const searchButton = () => {
      return (
        <TouchableOpacity
          onPress={this.startNewSearch.bind(this)}
          style={{width: 50, justifyContent: 'center', alignItems: 'center'}}>
          <Icon name={'search'} size={24} />
        </TouchableOpacity>
      );
    };

    const styleTextInput = {
      flex: 1,
      fontSize: 15,
      justifyContent: 'center',
      //   paddingLeft: 10,
      textAlign: I18nManager.isRTL ? 'right' : 'left',
      fontFamily: Constants.fontFamily,
    };
    const searchInput = (
      <TextInput
        placeholder={Languages.SearchPlaceHolder}
        style={[styleTextInput]}
        value={this.state.text}
        onChangeText={text => {
          this.setState({text}, () => {
            if (text.length >= 3)
              this.props.QuickSearch(this.state.text, Languages.langID);
          });
        }}
        underlineColorAndroid="transparent"
        onSubmitEditing={this.startNewSearch.bind(this)}
      />
    );

    return (
      <View>
        <View
          style={[
            {
              height: 50,
              flexDirection: Constants.RTL ? 'row-reverse' : 'row',
              marginBottom: 10,
              borderBottomWidth: 1,
              borderColor: Color.DirtyBackground,
            },
            isIphoneX() ? {marginTop: 30} : {},
          ]}>
          {closeButton()}
          {searchButton()}

          {searchInput}
        </View>

        <TouchableOpacity
          onPress={() => {
            this.startNewSearch();
          }}
          style={{
            backgroundColor: Color.primary,
            borderRadius: 20,
            alignSelf: 'center',
            paddingVertical: 5,
            paddingHorizontal: 20,
            marginVertical: 10,
          }}>
          <Text
            style={{fontFamily: 'Cairo-Regular', color: '#fff', fontSize: 17}}>
            {Languages.search}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  onBack = () => {
    this.setState({text: ''});
    Keyboard.dismiss();
    this.props.onBack();
  };

  async startNewSearch() {
    var self = this;
    const searchResult = this.props.searchResult;
    this.setState({loading: true, isSubmit: true, searchFetching: true});
    this.props.QuickSearch(this.state.text, Languages.langID, data => {
      this.setState({searchFetching: false});
    });
    if (typeof searchResult != 'undefined') {
      self.setState({loading: false});
    }

    Keyboard.dismiss();
  }

  onRowClickHandle(product) {
    BlockTimer.execute(() => {
      this.props.onViewProductScreen({product});
    }, 500);
  }

  renderItem(item) {
    return <Text style={{}}>{yazeed}</Text>;
  }

  nextPosts() {
    this.page += 1;
    this.props.fetchProductsByName(this.state.text, this.langid, this.page);
  }
  onEndReached() {
    const {searchTotalPages, isListingsFetching} = this.props;

    //   alert(isListingsFetching);

    if (!isListingsFetching && ++this.page <= searchTotalPages) {
      this.props.QuickSearch(this.state.text, this.langid, data => {
        this.setState({searchFetching: false});
      });
    }
  }

  renderResultList() {
    const {searchResult, isListingsFetching} = this.props;
    const {isSubmit} = this.state;
    // setTimeout(() => {
    //   alert(JSON.stringify(searchResult));
    // }, 1500);

    return searchResult && searchResult.length > 0 ? (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{flex: 1, backgroundColor: '#fff', padding: 5}}
        data={this.props.searchResult}
        renderItem={({item}) => (
          <TouchableOpacity
            style={{
              flexDirection: 'row',

              //      elevation: 2,
              borderBottomWidth: 1,
              borderBottomColor: '#E9E9EF',
              backgroundColor: '#f8f8f8',
              //   flex: 3
            }}
            onPress={() =>
              this.props.navigation.navigate('ProductDetailsScreen', {
                product: item,
              })
            }>
            <View
              style={{
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  textAlign: 'left',
                  fontFamily: 'Cairo-Regular',
                  fontSize: 15,
                  padding: 10,
                }}>
                {item.MakeName}
              </Text>
              {item.ModelName && <Text style={{}}>{' ' + item.ModelName}</Text>}
            </View>
          </TouchableOpacity>
        )}
        onEndReached={() => this.onEndReached()}
      />
    ) : (
      isSubmit && !isListingsFetching && (
        <Text
          style={{
            textAlign: 'center',
            fontSize: 15,
            padding: 5,
            fontFamily: 'Cairo-Regular',
          }}>
          {Languages.NoResultError}
        </Text>
      )
    );
  }
  onSelectedItemsChange = selectedItems => {
    // alert(selectedItems);
    this.props.onScientificView(selectedItems);
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        {this.renderSearchBar()}

        {
          <ScrollView style={{flex: 1}}>
            {/* Spinkit */}
            {this.state.searchFetching ? <></> : this.renderResultList()}
          </ScrollView>
        }
      </View>
    );
  }
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 15,
    textAlign: 'left',
    fontFamily: Constants.fontFamily,
    padding: 10,
    marginHorizontal: 20,
  },
  inputAndroid: {},
  underline: {},
  placeholderColor: {},
  viewContainer: {
    //  backgroundColor: "#f2f2f2",
    alignContent: 'center',
  },
});

const mapStateToProps = ({home}) => ({
  cities: home.cities,
  categories: home.categories,
  searchTotalPages: home.searchTotalPages,
  homePageData: home.homePageData,
  searchResult: home.listingsSearch,
  isListingsFetching: home.isListingsFetching,
  isFetching: home.isCitiesFetching || home.isCategoriesFetching,
});
const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {dispatch} = dispatchProps;
  const {actions} = require('../../redux/HomeRedux');
  return {
    ...ownProps,
    ...stateProps,
    fetchCities: () => {
      actions.fetchCities(dispatch, Languages.langID);
    },
    fetchCategories: () => {
      actions.fetchCategories(dispatch, Languages.langID);
    },
    clearSearch: () => {
      actions.clearSearch(dispatch);
    },
    QuickSearch: (text, langid, callback) => {
      actions.QuickSearch(dispatch, text, langid, callback);
    },
  };
};
module.exports = connect(mapStateToProps, null, mergeProps)(Search);
