import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import ShareLib from 'react-native-share';
import {AutobeebModal} from '../../../components';
import {AppIcon, Icons} from '../shared/AppIcon';
import {Color, Languages} from '../../../common';
import Svg, {Path} from 'react-native-svg';
import {screenHeight, screenWidth} from '../../constants/Layout';

const ListingPopupHandler = ({
  listingId,
  countryId,
  typeId,
  name,
  ownerId,
  isActive,
}) => {
  const user = useSelector(state => state.user.user ?? state.user.tempUser);
  const [firstLoad, setFirstLoad] = useState(0);
  const isSharePopupRef = useRef();
  const warningPopupRef = useRef();

  useEffect(() => {
    if (!listingId) return;
    AsyncStorage.getItem('warningShown', async (error, data) => {
      if (!data && ownerId !== user?.ID) {
        await AsyncStorage.setItem('warningShown', 'true');
        setFirstLoad(2);
        setTimeout(() => {
          warningPopupRef.current?.open();
        }, 500);
      } else if (isActive && ownerId === user?.ID) {
        const _key = 'ItemNeedSharePoup';
        AsyncStorage.getItem(_key, (_error, _item) => {
          if (_item?.includes(`${listingId},`)) {
            AsyncStorage.setItem(_key, _item.replace(`${listingId},`, ''));
            setFirstLoad(1);
            setTimeout(() => {
              isSharePopupRef.current?.open();
            }, 500);
          }
        });
      }
    });
  }, [listingId, user]);

  if (firstLoad === 0) return <></>;

  const getShareMessage = () => {
    const baseUrl =
      Languages.langID === 2
        ? 'https://autobeeb.com/ar/ads'
        : 'https://autobeeb.com/ads';

    const slugifiedName = encodeURIComponent(name.trim().replace(/\s+/g, '-'));

    return `${baseUrl}/${slugifiedName}/${listingId}/${typeId}`;
  };

  const shareOnSocial = async platform => {
    const options = {
      url: `https://cutt.ly/AUTOBEEB${Languages.getLanguage()}`,
      message: `${Languages.CheckOffer}\n${getShareMessage()}`,
    };

    switch (platform) {
      case 'facebook':
        options.social = ShareLib.Social.FACEBOOK;
        break;
      case 'twitter':
        options.social = ShareLib.Social.TWITTER;
        break;
      case 'whatsapp':
        options.social = ShareLib.Social.WHATSAPP;
        break;
      case 'instagram':
        options.social = ShareLib.Social.INSTAGRAM;
        break;
      case 'snapchat':
        options.social = ShareLib.Social.SNAPCHAT;
        break;
      default:
        console.warn('Unsupported platform');
        return;
    }

    try {
      await ShareLib.shareSingle(options);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (firstLoad === 1)
    return (
      <AutobeebModal
        ref={isSharePopupRef}
        backButtonClose
        swipeToClose
        animationDuration={350}
        style={styles.modalWrapper}
        useNativeDriver
        coverScreen>
        <View style={styles.innerModal}>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => isSharePopupRef.current?.close()}>
            <AppIcon
              type={Icons.MaterialCommunityIcons}
              name="close"
              size={25}
              color={Color.primary}
            />
          </TouchableOpacity>

          <Text style={[styles.header, styles.titleStyle]}>
            {countryMessage1.includes(`${countryId}`)
              ? Languages.DidUNeedShareYourOffer
              : Languages.DidUNeedShareYourOffer2}
          </Text>

          {countryMessage1.includes(`${countryId}`) ? (
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.fullPrimaryButton}
                onPress={() => {
                  shareOnSocial('facebook');
                  isSharePopupRef.current?.close();
                }}>
                <Text style={styles.buttonText}>{Languages.Ok}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.iconRow}>
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  shareOnSocial('facebook');
                  isSharePopupRef.current?.close();
                }}>
                <AppIcon
                  type={Icons.Entypo}
                  name="facebook"
                  size={28}
                  color="#3b5998"
                />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  shareOnSocial('twitter');
                  isSharePopupRef.current?.close();
                }}>
                {XIconSVG({size: 24, color: 'black'})}
              </Pressable>
            </View>
          )}
        </View>
      </AutobeebModal>
    );
  if (firstLoad === 2)
    return (
      <AutobeebModal
        ref={warningPopupRef}
        isOpen={firstLoad}
        style={styles.warningModal}
        position="center"
        backButtonClose
        entry="bottom"
        swipeToClose
        backdropPressToClose
        fullScreen={true}
        coverScreen={Platform.OS === 'android'}
        backdropOpacity={0.9}>
        <View style={styles.warningInner}>
          <AppIcon
            type={Icons.Feather}
            name="alert-triangle"
            size={90}
            color="#ffcc00"
          />
          <Text style={styles.warningText}>{Languages.WarningMessage}</Text>
          <TouchableOpacity onPress={() => warningPopupRef.current?.close()}>
            <Text style={styles.okButton}>{Languages.OK}</Text>
          </TouchableOpacity>
        </View>
      </AutobeebModal>
    );
};

export default ListingPopupHandler;

const XIconSVG = ({size, color}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.75 2H21.5L14.25 10.625L22.5 22H15.75L10.75 15.125L4.5 22H1.75L9.5 12.875L2 2H8.75L13.25 8.25L18.75 2ZM17.5 20H19L7.5 4H6L17.5 20Z"
      fill={color}
    />
  </Svg>
);

const countryMessage1 = [
  '897',
  '946',
  '973',
  '979',
  '989',
  '992',
  '1004',
  '1008',
  '1053',
  '1058',
  '1063',
  '1071',
  '1085',
  '1088',
];

const styles = StyleSheet.create({
  modalWrapper: {
    backgroundColor: '#fffff00',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerModal: {
    backgroundColor: '#fff',
    width: '95%',
    paddingTop: 15,
  },
  closeIcon: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginHorizontal: 10,
    position: 'absolute',
    end: 1,
    top: -5,
  },
  header: {
    paddingHorizontal: 10,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleStyle: {
    // Add custom title style here if needed
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  fullPrimaryButton: {
    backgroundColor: Color.primary,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  buttonText: {
    color: '#fff',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 100,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  copyToast: {
    backgroundColor: 'gray',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignItems: 'center',
    marginTop: 10,
  },
  copyText: {
    color: '#fff',
    textAlign: 'center',
  },
  warningModal: {
    minHeight: screenHeight,
    minWidth: screenWidth,
    flex: 1,
    backgroundColor: '#ffffff00',
  },
  warningInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    fontSize: 20,
    color: '#ffcc00',
    textAlign: 'center',
  },
  okButton: {
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 20,
    fontSize: 20,
    color: '#ffffff',
    backgroundColor: Color.secondary,
    textAlign: 'center',
  },
});
