import KS from '../services/KSAPI';
import Constants from './Constants';

const ExtractScreenObjFromUrl = async url => {
  if (!url) return {screen: 'App'};
  let ID = url.split('/').at(-2);
  let TypeID = url.split('/').at(-1);
  let IDarray = url.match(
    /([a-z0-9A-Z]{8}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{4}-[a-z0-9A-Z]{12})/g,
  );
  let userID = IDarray && IDarray.length > 0 ? IDarray[0] : undefined;

  if (ID && TypeID && url.includes('ads')) {
    return {screen: 'CarDetails', params: {id: ID}};
  } else if (url.includes('dealer') && userID) {
    return {screen: 'DealerProfileScreen', params: {userid: userID}};
  } else if (url.includes('user') && userID) {
    return {screen: 'UserProfileScreen', params: {userid: userID}};
  } else if (url.includes('/sl/')) {
    const params = url.split('/');
    let LinkValues = params.at(-1);
    if (LinkValues.includes('?')) LinkValues = LinkValues.split('?')[0];
    const Prefix = params[3] == 'sl' ? 'en' : params[3];
    const res = await KS.ExtractMobileFilter({LinkValues, Prefix});
    let filter = res.filter;
    let _params = {
      ListingType: {ID: filter.typeID.id, Name: filter.typeID.name},
      SellType: Constants.sellTypes.filter(x => x.ID == filter.sellType)[0],
      selectedMake: filter.makeID,
      selectedModel: filter.modelID,
      selectedPaymentMethod: !filter.paymentMethod
        ? null
        : Constants.FilterPaymentMethods.filter(
            x => filter.paymentMethod == x.ID,
          )[0],
      selectedCategory: filter.categoryID,
      selectedFuelType: !filter.fuelType
        ? null
        : Constants.fuelTypes.filter(x => filter.fuelType.includes(x.ID))[0],
      selectedSection: !!filter.section ? filter.section[0] : null,
      partNumber: filter.partNumber,
    };

    return {screen: 'ListingsScreen', params: {..._params}};
  } else if (url.includes('/blog/')) {
    return {screen: 'BlogDetails', params: {Blog: {ID: url.split('/').at(-2)}}};
  } else if (url.includes('/freesearch')) {
    return {
      screen: 'SearchResult',
      params: {query: getQueryParam(url, 'searchFor')},
    };
  } else if (url.includes('/post')) {
    return {screen: 'PostOfferScreen'};
  } else if (url.includes('/dealers')) {
    return {screen: 'DealersScreen'};
  }

  return {screen: null};
};

const getQueryParam = (url, param) => {
  const queryString = url.split('?')[1];
  if (!queryString) return null;

  const params = queryString.split('&').reduce((acc, pair) => {
    const [key, value] = pair.split('=');
    acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
    return acc;
  }, {});

  return params[param] || null;
};

export default ExtractScreenObjFromUrl;
