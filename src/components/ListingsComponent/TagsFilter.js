import {useCallback, useMemo, useState} from 'react';
import {Text} from 'react-native';
import {FlatList, Pressable} from 'react-native';
import {Dimensions, Modal, StyleSheet, View} from 'react-native';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import {Color, Constants, Languages} from '../../common';

const {width} = Dimensions.get('screen');
const TagsFilter = ({Tags, OnCelarFilter, OnDeleteFilter}) => {
  const CelarFilter = useMemo(
    () => (
      <View style={styles.DeleteContainer}>
        <Pressable style={styles.DeleteBtn} onPress={OnCelarFilter}>
          <Text style={styles.DeleteText} numberOfLines={1}>
            {Languages.Delete}
          </Text>
        </Pressable>
      </View>
    ),
    [OnCelarFilter],
  );
  const handleDeleteFilter = useCallback(
    (Id, Type) => {
      OnDeleteFilter({Id, Type});
    },
    [OnDeleteFilter],
  );

  if (!Tags || !Tags.filter(x => !!x.Id).length)
    return <View style={{height: 10}} />;

  return (
    <View style={styles.HeaderRow}>
      {CelarFilter}

      <FlatList
        data={Tags.filter(x => !!x.Id)}
        horizontal
        contentContainerStyle={{minWidth: width - 62}}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={true}
        renderItem={({item, index}) => {
          return (
            <View style={styles.TagButton}>
              <Text style={styles.TagButtonText}>{item.Name}</Text>

              <Pressable
                style={{paddingHorizontal: 4}}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                onPress={() => handleDeleteFilter(item.Id, item.Type)}>
                <IconMa name={'close'} size={17} color={Color.secondary} />
              </Pressable>
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ModalView: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '90%',
  },
  ModalDataView: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    justifyContent: 'center',
    height: '50%',
    width: '100%',
  },
  HeaderRow: {
    width: width - 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    overflow: 'scroll',
    gap: 5,
  },
  TagButton: {
    borderColor: '#1C7DA27f',
    backgroundColor: '#1C7DA20f',
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'space-around',
    flexDirection: 'row',
    height: 34,
    alignItems: 'center',
    paddingHorizontal: 6,
    marginEnd: 5,
    minWidth: 75,
  },
  TagButtonText: {
    color: Color.secondary,
    textAlign: 'center',
    verticalAlign: 'middle',
    paddingEnd: 3,
    marginBottom: 3,
    fontSize: 13,
    fontFamily: Constants.fontFamilyBold,
  },
  DeleteContainer: {
    maxWidth: 60,
  },
  DeleteText: {
    color: Color.secondary,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: Constants.fontFamilyBold,
  },
  DeleteBtn: {
    paddingHorizontal: 4,
  },
});

export default TagsFilter;
