import React, {Component} from 'react';
import {Text, View, FlatList} from 'react-native';
import {Languages} from '../common';
import {connect} from 'react-redux';
import {NewHeader} from '../containers';
import KS from '../services/KSAPI';
import {LogoSpinner, BannerListingsComponent} from '../components';
import AddButton from '../components/AddAdvButton';

export class FavoriteScreen extends Component {
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: true,
  });

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      Favorites: [],
    };
  }

  componentDidMount() {
    KS.WatchlistGet({
      langid: Languages.langID,
      userid: this.props.user.ID,
      pagesize: 1000,
      page: 1,
      type: 1,
    }).then(data => {
      if (data && data.Success) {
        this.setState({Favorites: data.Listings, isLoading: false});
      }
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1}}>
          <NewHeader navigation={this.props.navigation} back />
          <LogoSpinner fullStretch />
        </View>
      );
    }
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
          refreshing={this.state.refreshing}
          data={this.state.Favorites}
          renderItem={({item, index}) => {
            return (
              <BannerListingsComponent
                key={item.ID}
                user={this.props.user}
                isFavorites
                item={item}
                navigation={this.props.navigation}
                removeFavorite={ID => {
                  this.setState({
                    Favorites: this.state.Favorites.filter(
                      item => item.ID != ID,
                    ),
                  });
                }}
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
                  {Languages.NoFavourites}
                </Text>
              </View>
            );
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = ({user, menu}) => ({
  user: user.user,
  ViewingCountry: menu.ViewingCountry,
});

export default connect(mapStateToProps)(FavoriteScreen);
