import KS from '../services/KSAPI';
import Constants from '../common/Constants';
import {Languages} from '../common';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';

var md5 = require('md5');

const types = {
  ADD_OFFER_PENDING: 'ADD_OFFER_PENDING',
  ADD_OFFER_SUCCESS: 'ADD_OFFER_SUCCESS',
  ADD_PHOTOS_PENDING: 'ADD_PHOTOS_PENDING',
  ADD_PHOTOS_SUCCESS: 'ADD_PHOTOS_SUCCESS',
};

function ConvertURL2(data) {
  var newURL = '';
  Object.keys(data).map((item, index) => {
    newURL += item + ':' + data[item];
  });
  newURL += 'KhaledYazeedMohammad';

  return md5(newURL);
}

const initialState = {
  isAdding: false,
  response: null,
  images: [],
  isUploading: false,
  uploadingResponse: '',
  isFetching: false,
};
export const actions = {
  DoAddListing(dispatch, data, images, callback) {
    dispatch({type: types.ADD_OFFER_PENDING});

    KS.DoAddListing(data)
      .then(responseJson => {
        if (callback) callback(responseJson);
        if (responseJson.Success) {
          if (!responseJson.IsUserActive) {
            return;
          } else {
            dispatch({
              type: 'ADD_OFFER_SUCCESS',
              payload: {response: responseJson},
            });

            KS.FeaturesGet({
              langid: Languages.langID,
              selltype: responseJson.SellType,
              typeID: responseJson.SectionID || responseJson.TypeID,
            })
              .then(data => {
                dispatch({
                  type: 'LAST_OFFER_FEATURES',
                  payload: {
                    FeaturesSwitch: data?.FeaturesSwitch || [],
                    FeaturesDropDown: data?.FeaturesDropDown || [],
                  },
                });
              })
              .finally(async () => {
                if (images && images.length > 0) {
                  for (let index = 0; index < images.length; index++) {
                    const image = images[index];

                    if (image.uri) {
                      const resizedBase64 = await resizeImage(image?.data);

                      await fetch(
                        'https://api.autobeeb.com/v2/Services/ListingImageUploadV2', // https://apiv2.autobeeb.com
                        {
                          method: 'POST',
                          headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            pid: responseJson?.ID,
                            isPrimary: index == 0 ? true : false,
                            listingType: data?.TypeID ?? '1',
                            base64: resizedBase64,
                            filename: image?.uri
                              .split('/')
                              [image.uri.split('/').length - 1].split('.')[0],
                            fileextension: image.uri
                              .split('/')
                              [image.uri.split('/').length - 1].split('.')[1],
                          }),
                        },
                      );
                    }
                  }
                }
              });
          }
        }
      })
      .catch(error => {
        setTimeout(() => {
          console.error('Error in DoAddListing:', error);
        }, 1000);
      });
  },
};

const resizeImage = async (base64Str, maxSize = 1920) => {
  try {
    const cleanedBase64 = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const tempFilePath = `${RNFS.CachesDirectoryPath}/temp_image.jpg`;

    await RNFS.writeFile(tempFilePath, cleanedBase64, 'base64');

    const resizedImage = await ImageResizer.createResizedImage(
      tempFilePath,
      maxSize,
      maxSize,
      'JPEG',
      70,
      0,
    );

    const resizedBase64 = await RNFS.readFile(resizedImage.uri, 'base64');
    return `data:image/jpeg;base64,${resizedBase64}`;
  } catch (error) {
    console.error('resizeImage error', error);
    throw error;
  }
};

export const reducer = (state = initialState, action) => {
  const {type} = action;

  switch (type) {
    case types.ADD_OFFER_PENDING: {
      return {
        ...state,
        isAdding: true,
      };
    }

    case types.ADD_OFFER_SUCCESS: {
      return {
        ...state,
        response: action.payload,
        isAdding: false,
      };
    }

    case types.ADD_PHOTOS_PENDING:
      return {
        ...state,
        isUploading: true,
      };
    case types.ADD_PHOTOS_SUCCESS:
      return {
        ...state,
        isUploading: false,
        uploadingResponse: action.payload,
        images: [],
      };

    default: {
      return state;
    }
  }
};
