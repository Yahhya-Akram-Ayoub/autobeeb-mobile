//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
//import ActionButton from "react-native-action-button";
import {connect} from 'react-redux';

import {Languages} from '../common';

import {ListingsComponent, LogoSpinner} from '../components';
import NewHeader from '../containers/NewHeader';
import AddButton from '../components/AddAdvButton';
import {isIphoneX} from 'react-native-iphone-x-helper';

// create a component
class ListingsScreen extends Component {
  constructor(props) {
    super(props);
    this.pageNumber = 1;
    this.renderItem = this.renderItem.bind(this);
    this.onEndReached = this.onEndReached.bind(this);

    this.state = {
      selectedCategory: undefined,
    };
  }

  static navigationOptions = ({navigation}) => ({
    header: <NewHeader navigation={navigation} back />,
  });
  renderItem(item) {
    //alert(JSON.stringify(item));
    return <ListingsComponent item={item} navigation={this.props.navigation} />;
  }

  onEndReached() {
    const {fetchRecentListings, isFetching} = this.props;

    if (!isFetching && ++this.pageNumber <= this.props.RecentData.Pages)
      fetchRecentListings(this.pageNumber, Languages.langID);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return (nextState.selectedCategory != this.state.selectedCategory)
  // }
  render() {
    if (this.props.isFetching) {
      return <LogoSpinner fullStretch />;
    }
    return (
      <View
        style={[
          {flex: 1, paddingTop: 40, backgroundColor: '#fff'},
          isIphoneX() && {paddingTop: 70},
        ]}>
        <AddButton navigation={this.props.navigation} />

        {!this.props.isFetching &&
        this.props.RecentProducts &&
        this.props.RecentProducts.length == 0 ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.text}>{Languages.NoItems}</Text>
          </View>
        ) : (
          !this.props.isFetching && (
            <View style={{flex: 1}}>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={this.props.RecentProducts}
                renderItem={this.renderItem}
                onEndReached={() => this.onEndReached()}
              />
            </View>
          )
        )}
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  text: {
    fontFamily: 'Cairo-Bold',
    fontSize: 20,
    color: '#D24B92',
  },
});

const mapStateToProps = ({listings}) => {
  return {
    isFetching: listings.isFetching,
    RecentData: listings.RecentData,
    RecentProducts: listings.RecentProducts,
  };
};

const mapDispatchToProps = dispatch => {
  const {actions} = require('../redux/ListingsRedux');
  return {
    fetchRecentListings: (page, langID, callback) =>
      actions.fetchRecentListings(dispatch, page, langID, callback),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListingsScreen);
