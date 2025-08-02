import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Color, Constants, Languages} from '../../../common';
import SpecialSVG from './SpecialSVG';
import {useDispatch, useSelector} from 'react-redux';
import {OTPModal, AutobeebModal} from '../../../components';
import {useEffect, useState, useRef} from 'react';
import KS from '../../../services/KSAPI';
import {toast} from '../../../Omni';
import {actions} from '../../../redux/UserRedux';
import {SkeletonLoader} from '../shared/Skeleton';
import {AppIcon, Icons} from '../shared/AppIcon';
import {useNavigation} from '@react-navigation/native';
import {screenHeight, screenWidth} from '../../constants/Layout';

const ListingTitle = ({
  loading,
  countryName,
  name,
  cityName,
  isSpecial,
  sellType,
  formatedPrice,
  paymentMethod,
  ownerId,
  listingId,
  openOTPModal,
  isPendingDelete,
  isNewUser,
  email,
  phone,
  isOpenSpecialPlans = true,
  isNeedRefresh,
  openFeatureModal,
}) => {
  const user = useSelector(x => x.user.user ?? x.user.tempUser);
  const [openModal, setOpenModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [oTP, setOTP] = useState(null);
  const featureModalRef = useRef();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {
    EmailRegister,
    OTPConfirmed,
    EmailConfirmed,
    EmailApproved,
    ID,
    Email,
    Phone,
  } = user ?? {};
  const _isOpenSpecialPlans =
    isOpenSpecialPlans && (!EmailRegister || (EmailRegister && EmailApproved));
  const renderPaymentMethod = method => {
    switch (`${method}`) {
      case '2':
        return ' / ' + Languages.Installments + ' ';
      default:
        return '';
    }
  };
  const onVerifyPress = () => {
    setOpenModal(true);
  };

  useEffect(() => {
    if (openFeatureModal) featureModalRef.current?.open();
    if (openOTPModal) setOpenModal(true);
  }, [openOTPModal, openFeatureModal]);

  const notOtpConfirmed =
    OTPConfirmed === false && !EmailRegister && (ownerId === ID || isNewUser);
  const notEmailConfirmed =
    EmailConfirmed === false && EmailRegister && (ownerId === ID || isNewUser);

  const checkOTP = () => {
    let username = '';
    if (EmailRegister) username = email ? email : Email;
    else username = phone ? phone : Phone;
    setOtpLoading(true);

    KS.UserVerifyOTP({
      otpcode: oTP,
      userid: ID,
      username: username,
    })
      .then(data => {
        if (data.OTPVerified === true || data.EmailConfirmed === true) {
          if (isPendingDelete)
            KS.TransferListing({
              userid: ID,
              listingID: listingId,
            });

          if (
            (data.User.EmailApproved !== false &&
              data.EmailConfirmed === true &&
              data.EmailRegister === true) ||
            !data.EmailRegister
          )
            toast(Languages.PublishSuccess, 3500);

          if (data.User) {
            actions.storeUserData(dispatch, data.User);
            setOpenModal(false);
            if (_isOpenSpecialPlans) {
              setTimeout(() => {
                featureModalRef.current?.open();
              }, 1000);
            }
          }
        } else {
          toast(Languages.WrongOTP);
          setTimeout(() => {
            setOTP('');
          }, 1000);
        }
      })
      .finally(() => {
        setOtpLoading(false);
      });
  };

  const resendCode = () => {
    let username = '';
    if (EmailRegister) username = email ? email : Email;
    else username = phone ? phone : Phone;
    setOtpLoading(true);
    setOTP('');

    KS.ResendOTP({
      userID: ID,
      otpType: EmailRegister ? 2 : 1,
      username: username,
    })
      .then(data => {
        if (data.Success === 1) {
          toast(Languages.WeSendUOTP);
        } else toast(Languages.SomethingWentWrong);
      })
      .finally(() => {
        setOtpLoading(false);
      });
  };

  if (loading)
    return (
      <View style={[styles.container, {paddingVertical: 6}]}>
        <SkeletonLoader
          containerStyle={[styles.skeletonText]}
          borderRadius={3}
          shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
          animationDuration={1200}
        />
        <SkeletonLoader
          containerStyle={[styles.skeletonText, {width: '100%'}]}
          borderRadius={3}
          shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
          animationDuration={1200}
        />
      </View>
    );

  return (
    <View style={styles.container}>
      {(notOtpConfirmed || notEmailConfirmed) && (
        <TouchableOpacity onPress={onVerifyPress}>
          <Text style={styles.unverifiedText}>
            {Languages.UnpublishedOffer}
            <Text style={styles.verifyNowText}>{Languages.VerifyNow}</Text>
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerRow}>
        {!!name && (
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{name.replace(/\n/g, ' ')}</Text>
            {isSpecial && (
              <View style={styles.specialSVG}>
                <SpecialSVG />
              </View>
            )}
          </View>
        )}
      </View>

      <View
        style={[
          styles.infoRow,
          {
            flexDirection:
              `${cityName}`.length >= 10 ||
              (!formatedPrice && paymentMethod === 2)
                ? 'column'
                : 'row',
          },
        ]}>
        <View style={styles.priceRow}>
          {sellType !== 4 && (
            <Text style={styles.priceText}>
              {formatedPrice || Languages.CallForPrice}
            </Text>
          )}
          {!!paymentMethod && (
            <Text style={styles.paymentText}>
              {renderPaymentMethod(paymentMethod)}
            </Text>
          )}
        </View>

        <View style={styles.locationRow}>
          <AppIcon
            type={Icons.FontAwesome}
            name="map-marker"
            size={16}
            color="gray"
          />
          <Text style={styles.locationText}>
            {`${countryName} / ${cityName || ''}`}
          </Text>
        </View>
      </View>

      {openModal && (
        <OTPModal
          isOpen={openModal}
          externalLoading={otpLoading}
          onClosed={() => {
            setOpenModal(false);
          }}
          OTPMessage={Languages.WeHaveSentTheOTP}
          EnterMessage={Languages.EnterItNow}
          pendingDelete={isPendingDelete}
          Username={
            EmailRegister || (EmailRegister && EmailConfirmed === false)
              ? email
                ? email
                : Email
              : phone
              ? phone
              : Phone
          }
          otp={oTP}
          onChange={otp => {
            setOTP(otp);
          }}
          checkOTP={checkOTP}
          resendCode={resendCode}
          toast={msg => {
            toast(msg);
          }}
        />
      )}

      <AutobeebModal
        ref={featureModalRef}
        style={[styles.modelModal]}
        onClosed={() => {}}
        backButtonClose
        animationDuration={300}
        exitDuration={200}
        position="center"
        entry="bottom"
        moveType="slide"
        swipeToClose={true}
        backdropPressToClose
        backdropOpacity={0.7}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              hitSlop={{top: 25, bottom: 25, left: 25, right: 25}}
              style={styles.cancelButton}
              onPress={() => featureModalRef.current?.close()}>
              <AppIcon
                type={Icons.Ionicons}
                name="close"
                size={22}
                color={'#fff'}
              />
            </TouchableOpacity>
            <View style={styles.iconWrapper}>
              <View style={styles.iconWrapper2}>
                <SpecialSVG color="#e5e82c" width={25} height={26} />
              </View>
              <Text style={styles.titleText}>
                {Languages.SpecialYourOfferTitle}
              </Text>
            </View>
            <View style={styles.sellFastBox}>
              <Text style={styles.sellFastTitle}>
                {Languages.SpecialYourOfferAction}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                featureModalRef.current?.close();
                navigation.navigate('SpecialPlans', {listingId, isNeedRefresh});
              }}>
              <View style={styles.sellFastButton}>
                <AppIcon
                  type={Icons.Entypo}
                  name="rocket"
                  size={20}
                  color={Color.primary}
                />
                <Text style={styles.sellFastButtonText}>
                  {Languages.SpecialYourOfferTitle}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </AutobeebModal>
    </View>
  );
};

export default ListingTitle;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    minHeight: 75,
    justifyContent: 'space-between',
  },
  skeletonText: {
    height: 25,
    width: '70%',
    borderRadius: 0,
  },
  unverifiedText: {
    color: '#000',
    textAlign: 'left',
  },
  verifyNowText: {
    color: Color.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    // color: Color.secondary,
    // fontSize: 20,
    color: '#000',
    fontSize: 19,
    fontFamily: Constants.fontFamilyBold,
  },
  specialSVG: {
    marginLeft: 5,
  },
  infoRow: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: Color.error,
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
  },
  paymentText: {
    color: 'green',
    fontFamily: 'Cairo-Bold',
    fontSize: 16,
  },
  locationRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'gray',
    marginHorizontal: 10,
    fontSize: 16,
  },
  modelModal: {
    zIndex: 550,
    flex: 1,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: screenHeight,
  },
  modalContainer: {
    height: '50%',
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Color.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 30,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper2: {
    marginTop: -10,
  },
  titleText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Constants.fontFamilyBold,
  },
  descriptionText: {
    fontSize: 16,
    color: Color.primary,
    textAlign: 'center',
    fontFamily: Constants.fontFamilySemiBold,
    marginRight: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  okButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: Color.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  okText: {
    color: '#fff',
    fontFamily: Constants.fontFamilySemiBold,
    fontSize: 16,
  },
  cancelButton: {
    position: 'absolute',
    top: 15,
    start: 20,
  },
  cancelText: {
    color: Color.primary,
    fontFamily: Constants.fontFamilySemiBold,
    fontSize: 16,
  },
  //new for special listing button
  sellFastTitle: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Constants.fontFamilyBold,
  },
  sellFastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    textAlign: 'center',
    textAlignVertical: 'center',
    justifyContent: 'center',
    height: 40,
    marginTop: 20,
    minWidth: '100%',
    alignSelf: 'center',
  },
  sellFastButtonText: {
    color: Color.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    fontFamily: Constants.fontFamilyBold,
    marginHorizontal: 2,
  },

  sellFastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
