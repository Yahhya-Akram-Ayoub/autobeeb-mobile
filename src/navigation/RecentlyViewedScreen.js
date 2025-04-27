import React, {Component} from 'react';
import {Text, View, FlatList} from 'react-native';
import {Languages} from '../common';
import {connect} from 'react-redux';
import {NewHeader} from '../containers';
import {BannerListingsComponent} from '../components';
import AddButton from '../components/AddAdvButton';

export class RecentlyViewedScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //   isLoading: true,
      //   Favorites: [],
    };
  }

  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  render() {
    // if (this.state.isLoading) {
    //   return (
    //     <View style={{ flex: 1 }}>
    //       <NewHeader navigation={this.props.navigation} back />
    //       <LogoSpinner fullStretch />
    //     </View>
    //   );
    // }
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <NewHeader back navigation={this.props.navigation} />
        <AddButton navigation={this.props.navigation} />
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            alignItems: 'center',
            paddingVertical: 10,
            //   flex: 1,
            //  paddingVertical: 20
          }}
          data={this.props.recentSeenListings}
          renderItem={({item, index}) => {
            return (
              <BannerListingsComponent
                key={item.ID}
                user={this.props.user}
                item={item}
                navigation={this.props.navigation}
                AppCountryCode={this.props.ViewingCountry?.cca2}
              />
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  flex: 1,

                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Cairo-Bold',
                    fontSize: 21,
                    textAlign: 'center',
                    color: 'black',
                  }}>
                  {Languages.NoOffers}
                </Text>
              </View>
            );
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = ({user, menu, recentListings}) => ({
  user: user.user,
  ViewingCountry: menu.ViewingCountry,
  recentSeenListings: recentListings.recentSeenListings,
});

export default connect(mapStateToProps)(RecentlyViewedScreen);
