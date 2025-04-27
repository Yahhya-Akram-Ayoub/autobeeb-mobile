import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const CardLinkPreview = ({url}) => {
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(url);
      const data = await response.json();
      setPreviewData(data);
    };

    fetchData();
  }, [url]);

  return (
    <View style={styles.MainCard}>
      {!!previewData ? (
        <View>
          <Image
            source={
              !!previewData.Image
                ? previewData.Image
                : require('../../images/autobeeb.png')
            }
            style={styles.CardImage}
            resizeMode={'contain'}
          />
          <Text numberOfLines={1} style={styles.Title}>
            {previewData.Title}
          </Text>
          <Text numberOfLines={3} style={styles.Description}>
            {previewData.Description}
          </Text>
        </View>
      ) : (
        <View>
          <Image
            source={require('../../images/autobeeb.png')}
            style={styles.CardImage}
            resizeMode={'contain'}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  CardImage: {
    height: 220,
    width: 250,
    zIndex: 1,
    borderRadius: 10,
    margin: 3,
  },
  MainCard: {
    borderWidth: 1,
    borderColor: '#b9babd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 5,
    width: 300,
  },
  Title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
  },
  Description: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 16,
  },
});

export default CardLinkPreview;
