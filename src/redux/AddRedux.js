import KS from '../services/KSAPI';
import Constants from '../common/Constants';
import {Languages} from '../common';
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
            console.log({responseJson});
            dispatch({
              type: 'ADD_OFFER_SUCCESS',
              payload: {response: responseJson},
            });

            KS.FeaturesGet({
              langid: Languages.langID,
              selltype: responseJson.SellType,
              typeID: responseJson.Section || responseJson.TypeId,
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
              .finally(() => {
                if (images && images.length > 0) {
                  images.forEach(async (image, index) => {
                    if (image.uri) {
                      fetch(
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
                            base64: image?.data,
                            filename: image?.uri
                              .split('/')
                              [image.uri.split('/').length - 1].split('.')[0],
                            fileextension: image.uri
                              .split('/')
                              [image.uri.split('/').length - 1].split('.')[1],
                          }),
                        },
                      )
                        .then(res => res.json())
                        .then(data => {
                          setTimeout(() => {
                            console.log({data});
                          }, 1000);
                        })
                        .catch(err => console.log('error img ', err));
                    }
                  });
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
