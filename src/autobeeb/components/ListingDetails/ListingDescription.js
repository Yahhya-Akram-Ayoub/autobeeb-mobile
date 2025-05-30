import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Color, Constants, Languages} from '../../../common';
import {useState} from 'react';
import {screenWidth} from '../../constants/Layout';
import {AppIcon, Icons} from '../shared/AppIcon';

const ListingDescription = ({loading, description}) => {
  const [isShowMore, setIsShowMore] = useState(false);

  if (loading || !description) return <View />;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.blackHeader}>{Languages.Description}</Text>

      <Text style={styles.description} numberOfLines={isShowMore ? 100 : 3}>
        {description.length > 100 && !isShowMore
          ? `${description.trim().substring(0, 100)}...`
          : description.trim()}
      </Text>

      {description.length > 100 && (
        <TouchableOpacity
          style={styles.showMoreBtn}
          onPress={() => {
            setIsShowMore(prev => !prev);
          }}>
          <Text style={styles.showMoreText}>
            {isShowMore ? Languages.ShowLess : Languages.ShowMore}
          </Text>
          <AppIcon
            type={Icons.Entypo}
            name={isShowMore ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Color.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ListingDescription;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: Color.secondary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 8,
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
    width: screenWidth - 14,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-around',
  },
  blackHeader: {
    paddingHorizontal: 10,
    width: '100%',
    paddingTop: 4,
    paddingBottom: 3,
    color: '#000',
    fontSize: 18,
    marginBottom: 5,
    fontFamily: Constants.fontFamilyBold,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  description: {
    color: Color.blackTextSecondary,
    fontFamily: Constants.fontFamilyBold,
    fontSize: 14,
  },
  showMoreText: {
    color: Color.primary,
    fontFamily: Constants.fontFamilyBold,
    fontSize: 14,
  },
});
