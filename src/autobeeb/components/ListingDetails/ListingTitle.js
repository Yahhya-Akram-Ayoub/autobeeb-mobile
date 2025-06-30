import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Color, Languages} from '../../../common';
import SpecialSVG from './SpecialSVG';
import {useDispatch, useSelector} from 'react-redux';
import {OTPModal} from '../../../components';
import {useEffect, useState} from 'react';
import KS from '../../../services/KSAPI';
import {toast} from '../../../Omni';
import {actions} from '../../../redux/UserRedux';
import {SkeletonLoader} from '../shared/Skeleton';
import {AppIcon, Icons} from '../shared/AppIcon';
import {useNavigation} from '@react-navigation/native';

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
}) => {
  const user = useSelector(x => x.user.user ?? x.user.tempUser);
  const [openModal, setOpenModal] = useState(false);
  const [oTP, setOTP] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {EmailRegister, OTPConfirmed, EmailConfirmed, ID, Email, Phone} =
    user ?? {};
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
    if (openOTPModal) setOpenModal(true);
  }, [openOTPModal]);

  const notOtpConfirmed =
    OTPConfirmed === false && !EmailRegister && (ownerId === ID || isNewUser);
  const notEmailConfirmed =
    EmailConfirmed === false && EmailRegister && (ownerId === ID || isNewUser);

  const checkOTP = () => {
    let username = '';
    if (EmailRegister) username = email ? email : Email;
    else username = phone ? phone : Phone;
    console.log({
      otpcode: oTP,
      userid: ID,
      username: username,
    });

    KS.UserVerifyOTP({
      otpcode: oTP,
      userid: ID,
      username: username,
    }).then(data => {
      if (data.OTPVerified === true || data.EmailConfirmed === true) {
        if (isPendingDelete)
          KS.TransferListing({
            userid: ID,
            listingID: listingId,
          });

        toast(Languages.PublishSuccess, 3500);

        if (data.User) {
          actions.storeUserData(dispatch, data.User);
          setOpenModal(false);
          setTimeout(() => {
            navigation.navigate('SpecialPlans', {listingId});
          }, 1000);
        }
      } else {
        toast(Languages.WrongOTP);
        setTimeout(() => {
          setOTP('');
        }, 1000);
      }
    });
  };

  const resendCode = () => {
    let username = '';
    if (EmailRegister) username = email ? email : Email;
    else username = phone ? phone : Phone;

    setOTP('');
    KS.ResendOTP({
      userID: ID,
      otpType: EmailRegister ? 2 : 1,
      username: username,
    }).then(data => {
      if (data.Success === 1) {
        toast(Languages.WeSendUOTP);
      } else toast(Languages.SomethingWentWrong);
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
    color: Color.secondary,
    fontSize: 20,
    textAlign: 'left',
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
});
