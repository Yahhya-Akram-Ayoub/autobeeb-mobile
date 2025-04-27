import React, {Component} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
} from 'react-native';

import {Color, ExtractScreenObjFromUrl} from '../common';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modalbox';
import KS from '../services/KSAPI';
class ImagePopUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  open() {
    this.refs?.ImagePopUp.open();
  }
  close() {
    this.refs?.ImagePopUp.close();
  }
  componentDidMount() {
    if (!!this.props.Banner?.ID) {
      KS.BannerViewed(this.props.Banner?.ID);
    }
  }

  render() {
    return (
      <Modal
        ref="ImagePopUp"
        isOpen={this.props.isOpen}
        //  isOpen={true}
        //    onLayout={e => this.props.onLayout(e)}

        style={[
          styles.modelModal,
          this.state.isLoading && {backgroundColor: 'transparent'},
        ]}
        position="center"
        onOpened={() => {
          if (this.props.onOpened) {
            this.props.onOpened();
          }
        }}
        onClosed={() => {
          if (this.props.onClosed) {
            this.props.onClosed();
          }
        }}
        backButtonClose
        entry="bottom"
        swipeToClose={true}
        backdropPressToClose
        coverScreen={Platform.OS == 'android'}
        backdropOpacity={0.7}>
        <TouchableOpacity
          style={styles.modelContainer}
          disabled={!this.props.Banner?.Link || this.props.Banner?.Link == ''}
          onPress={async () => {
            if (!!this.props.Banner?.Link) {
              this.close();
              let url = this.props.Banner.Link;
              if (!url) return;

              KS.BannerClick({
                bannerID: this.props.Banner.ID,
              });
              
              const {screen, params} = await ExtractScreenObjFromUrl(url);
              if (!!screen) {
                this.props.navigation.navigate(screen, !!params && params);
              } else {
                Linking.openURL(url);
              }
            }
          }}>
          {!this.state.isLoading && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                zIndex: 10,
                right: 10,
                padding: 10,
                //  backgroundColor: "rgba(0,0,0,0.4)",
              }}
              onPress={() => {
                this.close();
              }}>
              <View
                style={{
                  backgroundColor: Color.primary,
                  borderWidth: 1,
                  borderColor: Color.primary,
                  borderRadius: 50,
                  elevation: 1,
                  padding: 5,
                }}>
                <IconMC name="close" size={30} color={'#fff'} />
              </View>
            </TouchableOpacity>
          )}

          <Image
            style={{
              width: Dimensions.get('screen').width * 0.85,
              height: (Dimensions.get('screen').width * 0.85) / 0.6,
            }}
            onError={() => {
              this.refs.ImagePopUp?.close();
            }}
            onLoad={() => {
              this.setState({isLoading: false});
            }}
            resizeMode="contain"
            source={{
              uri: `https://autobeeb.com/${this.props.Banner?.FullImagePath}_635x811.jpg`,
            }}
          />
        </TouchableOpacity>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  bottomBox: {
    flexDirection: 'row',
    borderRightColor: '#fff',
    borderRightWidth: 1,
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontStyle: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,
  },
  blackHeader: {color: '#000', fontSize: 18, marginBottom: 5},
  boxContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderTopWidth: 1,
    //   padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    flex: 1,
    marginVertical: 10,
    borderRightColor: 'gray',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHalf: {
    //  flex: 1
    width: Dimensions.get('screen').width / 2,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    color: Color.secondary,
  },
  sectionValue: {
    fontSize: 18,
    color: '#000',
  },
  featuresRow: {
    borderTopWidth: 1,
    paddingVertical: 15,
    borderTopColor: '#eee',
    flexDirection: 'row',
  },

  featuresHalf: {
    flexDirection: 'row',
    flex: 1,
  },
  featuresText: {
    fontSize: 18,
    color: '#000',
  },
  modelModal: {
    // backgroundColor: "red",
    zIndex: 5000,
    flex: 1,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    // alignItems: "center",
    justifyContent: 'center',
  },
  modelContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width * 0.85,
    height: (Dimensions.get('screen').width * 0.85) / 0.6,
    marginBottom: Platform.select({ios: 100, android: 0}),
    // backgroundColor: "#eee",
    borderRadius: 10,
    overflow: 'hidden',
    padding: 0,
  },
});

export default ImagePopUp;
