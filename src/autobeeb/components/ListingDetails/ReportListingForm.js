import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  I18nManager,
  Alert,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AppIcon, Icons} from '../shared/AppIcon';
import {Color, Constants, Languages} from '../../../common';
import KS from '../../../services/KSAPI';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {toast} from '../../../Omni';
import {screenHeight, screenWidth} from '../../constants/Layout';

const reportOptions = [
  {
    title: 'MisleadingAd',
    type: 1,
    icon: (color = '#555') => (
      <AppIcon
        type={Icons.MaterialIcons}
        name="bug-report"
        color={color}
        size={30}
      />
    ),
  },
  {
    title: 'DuplicatedAd',
    type: 2,
    icon: (color = '#555') => (
      <AppIcon
        type={Icons.MaterialCommunityIcons}
        name="repeat"
        color={color}
        size={30}
      />
    ),
  },
  {
    title: 'FraudulentAd',
    type: 3,
    icon: (color = '#555') => (
      <AppIcon
        type={Icons.MaterialIcons}
        name="report"
        color={color}
        size={30}
      />
    ),
  },
  {
    title: 'SoldAd',
    type: 4,
    icon: (color = '#555') => (
      <AppIcon
        type={Icons.MaterialIcons}
        name="money-off"
        color={color}
        size={30}
      />
    ),
  },
  {
    title: 'WrongSectionAd',
    type: 5,
    icon: (color = '#555') => (
      <AppIcon
        type={Icons.MaterialIcons}
        name="sim-card-alert"
        color={color}
        size={30}
      />
    ),
  },
  {
    title: 'Other',
    type: 6,
    icon: (color = '#555') => (
      <AppIcon
        type={Icons.Entypo}
        name="dots-three-horizontal"
        color={color}
        size={30}
      />
    ),
  },
];

const ReportListingForm = ({listingId}) => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const [typeId, setTypeId] = useState(3);
  const [message, setMessage] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportDetailError, setReportDetailError] = useState(false);

  const handleSubmit = () => {
    let finalEmail = user.Email;
    if (
      finalEmail?.trim().length < 6 ||
      !finalEmail?.includes('.') ||
      !finalEmail?.includes('@')
    ) {
      finalEmail = 'unknowemail@us.com';
    }

    if (!typeId) {
      toast('', Languages.selectType);
      return;
    }

    if (typeId === 6 && message.trim().length < 3) {
      setReportDetailError(true);
      return;
    }

    setLoadingReport(true);
    setReportDetailError(false);

    const finalReport = {
      userId: user.ID,
      listingId: listingId,
      typeId,
      message,
      email: finalEmail,
      listingname: '',
    };

    KS.ReportListing(finalReport)
      .then(data => {
        if (data?.Success === 1) {
          toast(Languages.ReportedSuccessfully, 3000);
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }
        setLoadingReport(false);
      })
      .catch(err => {
        setLoadingReport(false);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardShouldPersistTaps="handled"
      style={styles.container}>
      <View style={styles.optionWrapper}>
        <Text style={styles.title}>{Languages.WhyReportThisListing}</Text>
        <View style={styles.optionContainer}>
          {reportOptions.map((d, i) => {
            const isSelected = typeId === d.type;
            const color = isSelected ? Color.primary : '#555';
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.5}
                style={[styles.optionBox, {borderColor: color}]}
                onPress={() => setTypeId(d.type)}>
                {d.icon(color)}
                <Text style={[styles.optionText, {color}]}>
                  {Languages[d.title]}{' '}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={{flex: 1}} />
      <View style={[styles.optionWrapper, {marginBottom: 40}]}>
        <Text style={styles.commentLabel}>{Languages.Comment} : </Text>

        <TextInput
          placeholder={Languages.WhatToReportThisAd}
          multiline
          textAlignVertical="top"
          value={message}
          onChangeText={txt => setMessage(txt)}
          style={[
            styles.textInput,
            reportDetailError && {borderColor: '#e22e22', borderWidth: 2},
          ]}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loadingReport}>
          {loadingReport ? (
            <ActivityIndicator size={25} color={'#fff'} />
          ) : (
            <Text style={styles.submitText}>{Languages.Send}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: '100%',
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 25,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  closeIcon: {
    padding: 7,
    marginHorizontal: 10,
    alignSelf: I18nManager.isRTL ? 'flex-start' : 'flex-end',
  },
  title: {
    alignSelf: 'center',
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Constants.fontFamilyBold,
  },
  optionWrapper: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  optionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  optionBox: {
    alignItems: 'center',
    marginVertical: 10,
    width: screenWidth / 3.8,
    height: screenWidth / 3.8,
    borderWidth: 2,
    borderRadius: 5,
    padding: 5,
    justifyContent: 'space-evenly',
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: Constants.fontFamilySemiBold,
  },
  commentLabel: {
    color: '#000',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
    fontFamily: Constants.fontFamilySemiBold,
  },
  textInput: {
    minWidth: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    height: 100,
    paddingVertical: 0,
    paddingHorizontal: 7,
    color: '#000',
    fontFamily: Constants.fontFamily,
  },
  submitButton: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 3,
    minWidth: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ffffff00',
    backgroundColor: Color.primary,
  },
  submitText: {
    color: '#fff',
    fontFamily: Constants.fontFamilyBold,
    fontSize: 15,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default ReportListingForm;
