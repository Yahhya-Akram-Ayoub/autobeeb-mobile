import {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Color, Constants, Languages} from '../../../common';
import KS from '../../../services/KSAPI';
import {AutobeebModal} from '../../../components';
import {screenHeight, screenWidth} from '../../constants/Layout';
import FastImage from 'react-native-fast-image';
import {arrayOfNull} from '../shared/StaticData';
import {SkeletonLoader} from '../shared/Skeleton';

const FeaturesModal = ({
  listingId,
  typeId,
  sellType,
  section,
  isPendingDelete,
  isNewUser,
  isSpecial,
  openOTPModale,
  reloadFeatures,
}) => {
  const navigation = useNavigation();
  const {AllowFeature, Features} = useSelector(state => state.menu);
  const [featuresSwitch, setFeaturesSwitch] = useState([]);
  const [featuresDropDown, setFeaturesDropDown] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedDropdownFeatures, setSelectedDropdownFeatures] = useState([]);
  const [formattedDropdownFeatures, setFormattedDropdownFeatures] = useState(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFeaturesLoading, setFeaturesIsLoading] = useState(true);
  const modalRef = useRef();

  const onClosed = () => {
    if (isNewUser || isPendingDelete) {
      openOTPModale();
    } else if (
      !isSpecial &&
      typeId !== '32' &&
      `${sellType}` !== '4' &&
      AllowFeature
    ) {
      navigation.navigate('SpecialPlans', {listingId});
    }
  };

  useEffect(() => {
    if (listingId) {
      if (
        Features &&
        (Features?.FeaturesSwitch?.length ||
          Features?.FeaturesDropDown?.length) &&
        typeId &&
        `${typeId}` !== '32' &&
        modalRef.current &&
        !modalRef.current?.isOpen()
      ) {
        modalRef.current?.open();
        setFeaturesSwitch(Features.FeaturesSwitch || []);
        setFeaturesDropDown(Features.FeaturesDropDown || []);
      } else {
        setFeaturesIsLoading(true);
        KS.FeaturesGet({
          langid: Languages.langID,
          selltype: sellType,
          typeID: section || typeId,
        })
          .then(data => {
            if (data?.Success === 1) {
              if (data.Features?.length > 0) {
                setFeaturesSwitch(data.FeaturesSwitch || []);
                setFeaturesDropDown(data.FeaturesDropDown || []);

                if (modalRef.current && !modalRef.current?.isOpen()) {
                  modalRef.current?.open();
                }
              } else {
                modalRef.current?.close();
                onClosed();
              }
            }
          })
          .finally(() => {
            setFeaturesIsLoading(false);
          });
      }
    }
  }, [listingId]);

  const toggleFeature = feature => {
    const exists = selectedFeatures.find(f => f.ID === feature.ID);
    if (exists) {
      setSelectedFeatures(prev => prev.filter(f => f.ID !== feature.ID));
    } else {
      setSelectedFeatures(prev => [...prev, feature]);
    }
  };

  const handleDropdownSelect = item => {
    const feature = featuresDropDown.find(x => x.ID === item.FeatureID);
    feature.Value = item.ID;
    let updated = selectedDropdownFeatures.filter(x => x.ID !== item.FeatureID);
    updated.push(feature);

    const mapped = updated.map(item => ({[item.ID]: item.Value}));
    setSelectedDropdownFeatures(updated);
    setFormattedDropdownFeatures(Object.assign({}, ...mapped));
  };

  const handleConfirm = () => {
    setIsLoading(true);
    modalRef.current?.close();

    KS.FeatureSetAdd({
      listingID: listingId,
      featureSet: {
        FeaturesOn: selectedFeatures.map(f => f.ID),
        FeaturesDropdown: formattedDropdownFeatures,
      },
    })
      .then(res => {
        if (res?.Success === 1) {
          reloadFeatures();
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <AutobeebModal
      ref={modalRef}
      onClosed={onClosed}
      position="center"
      swipeToClose={false}
      coverScreen
      fullScreen={true}
      backdropOpacity={0.5}
      style={styles.modal}>
      <View style={styles.container}>
        <Text style={styles.title}>{Languages.SelectFeatureSet}</Text>
        <ScrollView nestedScrollEnabled>
          {!isFeaturesLoading ? (
            <View>
              <FlatList
                data={featuresSwitch}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => {
                  const selected = selectedFeatures.find(f => f.ID === item.ID);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.featureItem,
                        {
                          backgroundColor: selected ? Color.primary : '#fff',
                        },
                      ]}
                      onPress={() => toggleFeature(item)}>
                      <FastImage
                        source={{
                          uri: `https://autobeeb.com/${item.FullImagePath}_300x150.png`,
                        }}
                        style={styles.featureImage}
                        resizeMode={FastImage.resizeMode.contain}
                        tintColor={selected ? '#FFF' : Color.secondary}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          {
                            color: selected ? '#FFF' : Color.secondary,
                          },
                        ]}>
                        {item.Name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <SectionList
                sections={featuresDropDown.map(f => ({
                  title: f.Name,
                  data: f.Options,
                }))}
                keyExtractor={(item, index) => item + index}
                renderItem={({item}) => {
                  let selected = selectedDropdownFeatures.find(
                    x => x.Value === item.ID,
                  );

                  return (
                    <TouchableOpacity
                      onPress={() => handleDropdownSelect(item)}
                      style={[
                        styles.featureItem,
                        {
                          height: 40,
                          backgroundColor: selected ? Color.primary : '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.featureText,
                          {
                            paddingHorizontal: 6,
                            color: selected ? '#FFF' : Color.secondary,
                          },
                        ]}>
                        {item.Name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                renderSectionHeader={({section: {title}}) => (
                  <Text style={styles.sectionHeader}>{title}</Text>
                )}
              />
            </View>
          ) : (
            <FlatList
              data={arrayOfNull(10)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => {
                return (
                  <SkeletonLoader
                    key={`skeleton-${index}`}
                    containerStyle={styles.LoadingSkeleton}
                    borderRadius={3}
                    shimmerColors={['#E0E0E0', '#F8F8F8', '#E0E0E0']}
                    animationDuration={1200}
                  />
                );
              }}
            />
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              modalRef.current?.close();
            }}>
            <Text style={styles.cancelText}>{Languages.CANCEL}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loader}
              />
            ) : (
              <Text style={styles.confirmText}>{Languages.OK}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AutobeebModal>
  );
};

export default FeaturesModal;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxHeight: screenHeight * 0.85,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  LoadingSkeleton: {
    height: 60,
    width: '100%',
    marginBottom: 10,
  },
  modal: {
    backgroundColor: '#fffff00',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    padding: 5,
    textAlign: 'center',
    color: Color.secondary,
    fontSize: 18,
    fontFamily: Constants.fontFamilyBold,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'flex-start',
    gap: 8,
  },
  featureImage: {
    width: 60,
    height: 60,
  },
  featureText: {
    fontSize: 16,
    fontFamily: Constants.fontFamilySemiBold,
  },
  dropdownItem: {
    marginBottom: 3,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: Constants.fontFamilySemiBold,
  },
  sectionHeader: {
    color: Color.secondary,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 18,
    marginTop: 15,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    marginTop: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    height: 50,
  },
  cancelButton: {
    backgroundColor: '#fff',
    flex: 1,
    height: '100%',
    borderBottomEndRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: Color.secondary,
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: Constants.fontFamilyBold,
  },
  confirmButton: {
    flex: 1,
    height: '100%',
    backgroundColor: Color.secondary,
    borderBottomStartRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: Constants.fontFamilyBold,
  },
  loader: {
    paddingVertical: 12,
  },
});
