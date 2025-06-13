/**
 * init class API
 * @param opt
 * @returns {KensoftApi}
 * @constructor
 */
function KensoftApi(opt) {
  if (!(this instanceof KensoftApi)) {
    return new KensoftApi(opt);
  }
  opt = opt || {};
  this.classVersion = '1.0.0';
  this._setDefaultsOptions(opt);
}

KensoftApi.prototype._request = function (url, callback, signal = null) {
  const options = signal ? {signal} : {};

  //var self = this;
  return fetch(url, options)
    .then(response => response.text()) // Convert to text instead of res.json()
    .then(response => JSON.parse(response))
    .then(responseData => {
      if (typeof callback == 'function') {
        callback(responseData);
      }
      // console.log("request result from " + url, responseData);
      return responseData;
    })
    .catch(error => {
      // ////console.log('2=error network -- ', error.message);
    });
};

KensoftApi.prototype._requestPost = function (url, data, callback) {
  var params = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(data),
  };
  return fetch(url, params)
    .then(response => response.json())
    .then(responseData => {
      if (typeof callback == 'function') {
        callback(responseData);
      }
      return responseData;
    })
    .catch(error => {
      console.log({error, url});
    });
};

KensoftApi.prototype.join = function (obj, separator, ignoreCur = false) {
  var arr = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(key + '=' + obj[key]);
    }
  }
  if (global.ViewingCurrency && global.ViewingCurrency.ID && !ignoreCur) {
    arr.push('cur=' + global.ViewingCurrency.ID);
  }

  return arr.join(separator);
};
KensoftApi.prototype.makeMessageReade = function (data, callback) {
  var requestUrl = this.url + 'Services/MakeMessagesRead';

  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
  });
};

KensoftApi.prototype.GetUnreadMessagesCount = function (data, callback) {
  var requestUrl = this.url + 'Services/UnreadMessagesCount?userID=' + data;
  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
};

KensoftApi.prototype.GetChatSession = function (data, callback) {
  var requestUrl =
    this.url +
    'Services/GetChatSession?SessionId=' +
    data.SessionId +
    '&LangId=' +
    data.LangId;
  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
};

/**
 * Default option
 * @param opt
 * @private
 */
KensoftApi.prototype._setDefaultsOptions = async function (opt) {
  this.url = opt.url;
  this.coreApiV1 = opt.coreApiV1;
};

// ConvertURL = (data) => {
//   var newURL = "";
//   Object.keys(data).map((item, index) => {
//     newURL += item + ":" + data[item];
//   });
//   newURL += "KhaledYazeedMohammad";

//   return md5(newURL);
// };
KensoftApi.prototype.HomeScreenGet = function (data) {
  var requestUrl = '';

  if (data) {
    requestUrl = this.join(data, '&');
  } else {
    requestUrl = 'parent=0';
  }

  var requestUrl = this.url + '/services/HomeScreenGetV2?';
  requestUrl += this.join(data, '&', true);
  // requestUrl += "&kensoftware=" + ConvertURL(data);
  requestUrl = requestUrl.replace('&userID=null', '');
  console.log('requestUrl home ', requestUrl);
  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.UpdateUser = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }

  var requestUrl = this.url + '/services/UpdateUser?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this.request(requestUrl, callback);
};

// KensoftApi.prototype.SendMessage = function (data, callback) {
//   var requestUrl = this.url + "/services/MessagingSend?";
//   requestUrl += this.join(data, "&");
//   // requestUrl += "&kensoftware=" + ConvertURL(data);

//   return this._request(requestUrl).then(function (data) {
//     return data;
//   });
// };

KensoftApi.prototype.getMessageSessions = function (data, callback) {
  var requestUrl = this.url + '/services/GetMessageSessions?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};
KensoftApi.prototype.getIfTargetBlockUser = function (data, callback) {
  var requestUrl = this.url + '/services/GetIfTargetBlockUser?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.SetUserToken = function (data, callback) {
  var requestUrl = this.url + '/services/SetUserToken?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};
KensoftApi.prototype.getFacebookUser = function (data, callback) {
  var requestUrl = this.url + '/services/getFacebookUser?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl)

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.facebookLogin = function (data, callback) {
  var requestUrl = this.url + '/services/facebookLogin?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // ////console.log(requestUrl)

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.GoogleSignin = function (data, callback) {
  var requestUrl = this.url + '/services/emaillogin?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // ////console.log(requestUrl)

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.GoogleRegister = function (data, callback) {
  var requestUrl = this.url + '/services/emailregister?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.MakesGet = function (data, callback) {
  var requestUrl = this.url + '/services/MakesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.ModelsGet = function (data, callback) {
  var requestUrl = this.url + '/services/ModelsGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.TypeCategoriesGet = function (data, callback) {
  var requestUrl = this.url + '/services/TypeCategoriesGet?';
  requestUrl += this.join(data, '&');

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.ColorsGet = function (data, callback) {
  var requestUrl = this.url + '/services/ColorsGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.CitiesGet = function (data, callback) {
  var requestUrl = this.url + '/services/CitiesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.DoAddListing = function (data, callback) {
  var requestUrl = this.url + '/services/DoAddListing?';
  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.AddPendingTransaction = function (data, callback) {
  var requestUrl = this.url + '/services/AddPendingTransaction?';
  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.CompleteTransaction = function (data, callback) {
  //console.log(data);
  var requestUrl = this.url + '/services/CompleteTransaction?';

  //////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ListingTypesGet = function (data, callback) {
  var requestUrl = this.url + '/services/ListingTypesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.CountriesGet = function (data, callback) {
  var requestUrl = this.url + '/services/CountriesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  //////console.log(requestUrl);

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.ListingsGet = function (data, callback, signal = null) {
  var requestUrl = this.url + '/services/ListingsGet?';
  requestUrl += this.join(data, '&', true);

  return this._request(requestUrl, callback, signal).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.AuthStart = function (data, callback) {
  var requestUrl = this.url + '/services/AuthStart?';

  //////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.LoginUser = function (data, callback) {
  var requestUrl = this.url + '/services/LoginUser?';
  //requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.UserVerifyOTP = function (data, callback) {
  var requestUrl = this.url + '/services/UserVerifyOTP?';
  requestUrl += this.join(data, '&');

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ResendOTP = function (data, callback) {
  var requestUrl = this.url + '/services/ResendOTP?';
  // requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.QuickSearch = function (data, callback) {
  var requestUrl = this.url + '/Services/QuickSearch?';
  //  requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ForgotPasswordInit = function (data, callback) {
  var requestUrl = this.url + '/Services/ForgotPasswordInit?';
  //  requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ConfirmResetCode = function (data, callback) {
  var requestUrl = this.url + '/Services/ConfirmResetCode?';
  // requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ChangePassword = function (data, callback) {
  var requestUrl = this.url + '/Services/ChangePassword?';
  //requestUrl += this.join(data, "&");

  ////console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.UploadImage = function (data, callback) {
  var requestUrl = this.url + '/Services/UploadImage?';
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.UpdateInfo = function (data, callback) {
  var requestUrl = this.url + '/Services/UpdateInfo?';
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ConfirmOTPAndUpdate = function (data, callback) {
  var requestUrl = this.url + '/Services/ConfirmOTPAndUpdate?';
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ClassificationsGet = function (data, callback) {
  var requestUrl = this.url + '/Services/ClassificationsGet?';
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.MakesMulitpleTypesGet = function (data, callback) {
  var requestUrl = this.url + '/Services/MakesMulitpleTypesGet?';
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.CompetencesGet = function (data, callback) {
  var requestUrl = this.url + '/Services/CompetencesGet?';
  requestUrl += this.join(data, '&');

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};
KensoftApi.prototype.BecomeADealer = function (data, callback) {
  var requestUrl = this.url + '/Services/BecomeADealer?';
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.CountryGet = function (data, callback) {
  var requestUrl = this.url + '/Services/CountryGet?';
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.DealerGet = function (data, callback) {
  var requestUrl = this.url + '/Services/DealerGet?';
  //requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.UserGet = function (data, callback) {
  var requestUrl = this.url + '/Services/UserGet?';
  requestUrl += this.join(data, '&');

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.GetPlusSubscription = function (data, callback) {
  var requestUrl = this.url + '/Services/GetPlusSubscription?';
  requestUrl += this.join(data, '&');

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.DealersGet = function (data, callback) {
  var requestUrl = this.url + '/Services/DealersGet?';
  requestUrl += this.join(data, '&');
  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.UserListings = function (data, callback) {
  if (global.ViewingCurrency && global.ViewingCurrency.ID) {
    var requestUrl = `${this.url}/Services/UserListings?cur=${global.ViewingCurrency.ID}`;
    data.cur = global.ViewingCurrency.ID;
  } else {
    var requestUrl = this.url + '/Services/UserListings?';
  }

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.Core_UserListings = function (data, callback) {
  if (!data.UserId) return {};
  let requestUrl = `${this.coreApiV1}User/ListingsAsync?`;

  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  requestUrl +=
    this.join(data, '&') + `&CurrencyId=${global.ViewingCurrency.ID}`;

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.GetListingsCore = function (data, callback) {
  let requestUrl = `${this.coreApiV1}Listings/List/ListingsAsync?`;

  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  requestUrl +=
    this.join(data, '&') + `&CurrencyId=${global.ViewingCurrency.ID}`;

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.GetFeaturedListings = function (data, callback) {
  let _requestUrl = `${this.url}/Services/FeaturedListings?`;

  if (global.ViewingCurrency && global.ViewingCurrency.ID) {
    data = {...data, currencyId: global.ViewingCurrency.ID};
  }
  _requestUrl += this.join(data, '&');
  return this._requestPost(_requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.DeleteOffer = function (data, callback) {
  var requestUrl = this.url + '/Services/DeleteOffer?';
  requestUrl += this.join(data, '&');

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};
KensoftApi.prototype.OfferUpdateStatus = function (data, callback) {
  var requestUrl = this.url + '/Services/OfferUpdateStatus?';
  requestUrl += this.join(data, '&');

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.RenewOffer = function (data, callback) {
  var requestUrl = this.url + '/Services/RenewOffer?';
  requestUrl += this.join(data, '&'); // when i comment this the Post request stops working, ill check back with mohammed

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.TransferListing = function (data, callback) {
  var requestUrl = this.url + '/Services/TransferListing?';
  requestUrl += this.join(data, '&');

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.FeaturesGet = function (data, callback) {
  var requestUrl = this.url + '/Services/FeaturesGet?';
  // requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.FeatureSetAdd = function (data, callback) {
  var requestUrl = this.url + '/Services/FeatureSetAdd?';
  // requestUrl += this.join(data, "&");

  // console.log(requestUrl, ' ', JSON.stringify(data));

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ListingEditGet = function (data, callback) {
  var requestUrl = this.url + '/Services/ListingEditGet?';
  requestUrl += this.join(data, '&');

  // console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ListingImageDelete = function (data, callback) {
  var requestUrl = this.url + '/Services/ListingImageDelete?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.EmailRegister = function (data, callback) {
  var requestUrl = this.url + '/Services/EmailRegister?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.EmailLogin = function (data, callback) {
  var requestUrl = this.url + '/Services/EmailLogin?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};
KensoftApi.prototype.AppleLogin = function (data) {
  var requestUrl = '';
  if (data) {
    requestUrl = this.join(data, '&');
  } else {
    requestUrl = 'parent=0';
  }
  var requestUrl = this.url + '/services/AppleLogin?' + requestUrl;

  return this._request(requestUrl).then(function (data) {
    return data;
  });
};

KensoftApi.prototype.CheckFacebookUser = function (data, callback) {
  var requestUrl = this.url + '/Services/CheckFacebookUser?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.FacebookLogin = function (data, callback) {
  var requestUrl = this.url + '/Services/FacebookLogin?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.SocialMediaImage = function (data, callback) {
  var requestUrl = this.url + '/Services/SocialMediaImage?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};
KensoftApi.prototype.EmailLogin = function (data, callback) {
  var requestUrl = this.url + '/Services/EmailLogin?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.EmailRegister = function (data, callback) {
  var requestUrl = this.url + '/Services/EmailRegister?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.QuickSearch = function (data, callback) {
  var requestUrl = this.url + '/Services/QuickSearch?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.FreeSearch = function (data, callback) {
  if (global.ViewingCurrency && global.ViewingCurrency.ID) {
    var requestUrl = `${this.url}/Services/FreeSearch?cur=${global.ViewingCurrency.ID}`;
  } else {
    var requestUrl = this.url + '/Services/FreeSearch?';
  }

  //  requestUrl += this.join(data, "&");

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.SendMessage = function (data, callback) {
  var requestUrl = this.url + '/Services/SendMessage?';

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.getMessageSessions = function (data, callback) {
  var requestUrl = this.url + '/Services/getMessageSessions?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.getCommunication = function (data, callback) {
  var requestUrl = this.url + '/Services/getCommunication';
  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.hideCommunication = function (data, callback) {
  var requestUrl = this.url + '/Services/hideCommunication?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.WatchlistAdd = function (data, callback) {
  var requestUrl = this.url + '/Services/WatchlistAdd?';
  //  requestUrl += this.join(data, "&");

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};
KensoftApi.prototype.WatchlistGet = function (data, callback) {
  var requestUrl = this.url + '/Services/WatchlistGet?';
  requestUrl += this.join(data, '&');

  //console.log(requestUrl);

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.AddEntitySession = function (data, callback) {
  var requestUrl = this.url + '/Services/AddEntitySession?';

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.ListingInitInfo = function (data, callback) {
  var requestUrl = `${this.url}Services/ListingInitInfo?`;
  //  requestUrl += this.join(data, "&");

  // console.log(requestUrl, ' ', JSON.stringify(data));

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.BannerClick = function (data, callback) {
  var requestUrl = this.url + 'Services/BannerClick?';
  requestUrl += this.join(data, '&');

  return this._requestPost(requestUrl, data, response => {
    return response;
  });
};

KensoftApi.prototype.CurrenciesGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }

  var requestUrl = this.url + '/services/CurrenciesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ListingGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }

  var requestUrl = this.url + '/services/ListingGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);
  // console.log({requestUrl});

  return this._request(requestUrl, callback);
};

// KensoftApi.prototype.ListingGet = function (data, callback) {
//   var requestUrl = this.url + "/services/ListingGet?";
//   requestUrl += this.join(data, "&");

//   //console.log(requestUrl);

//   return this._requestPost(requestUrl, data, (response) => {
//     return response;
//   });
// };

KensoftApi.prototype.CurrencyGetByISOCode = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }

  var requestUrl = this.url + '/services/CurrencyGetByISOCode?';
  requestUrl += this.join(data, '&');
  // console.log('====================================');
  // console.log(requestUrl);
  // console.log('====================================');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.PrimaryCurrenciesGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }

  var requestUrl = this.url + '/services/PrimaryCurrenciesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  return this._request(requestUrl, callback);
};

KensoftApi.prototype.BannersGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }

  var requestUrl = this.url + '/services/BannersGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // setTimeout(() => {
  //   console.log(requestUrl);
  // }, 2000);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ArticlesGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }
  var requestUrl = this.url + '/services/ArticlesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ArticleGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }
  var requestUrl = this.url + '/services/ArticleGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ArticleCategoriesGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }
  var requestUrl = this.url + '/services/ArticleCategoriesGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.PlansGet = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }
  var requestUrl = this.url + '/services/PlansGet?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.GenerateClientToken = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }
  var requestUrl = this.url + '/services/GenerateClientToken?';
  requestUrl += this.join(data, '&');
  // requestUrl += "&kensoftware=" + ConvertURL(data);

  // console.log(requestUrl);
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.ReportListing = function (data, callback, noEmbed) {
  var embedText = '_embed';
  if (typeof noEmbed !== 'undefined') {
    embedText = '';
  }
  var requestUrl = this.url + '/services/AddReport?';
  requestUrl += this.join(data, '&');
  // console.log({requestUrl});
  return this._request(requestUrl, callback);
};

KensoftApi.prototype.BannerViewed = function (data, callback) {
  var requestUrl = this.url + 'Services/BannerViewed?bannerID=' + data;

  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
};

KensoftApi.prototype.GetSwearPlan = function (data, callback) {
  var requestUrl = `${this.url}services/get-swear-paln?`;
  requestUrl += this.join(data, '&');

  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

KensoftApi.prototype.GetSpecialPlans = function (data, callback) {
  var requestUrl = `${this.url}services/get-special-palns?`;
  requestUrl += this.join(data, '&');
  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

KensoftApi.prototype.GetCommissionPlan = function (data, callback) {
  var requestUrl = `${this.url}services/get-commission-paln?`;
  requestUrl += this.join(data, '&');

  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

KensoftApi.prototype.GetCountry = function (data, callback) {
  var requestUrl = `${this.url}services/get-country?Id=${data.Id}`;

  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

KensoftApi.prototype.BlockChatUser = function (data, callback) {
  var requestUrl =
    this.url +
    `services/block-chat-user?UserId=${data.UserId}&Blocked=${data.BlockedId}&IsBlocked=${data.IsBlocked}`;

  return new Promise((resolve, reject) => {
    fetch(requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
};

KensoftApi.prototype.UpdateLastLogin = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}User/UpdateLogin`;
  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(data => {
        resolve(data);
      })
      .catch(UpdateLogin_err => {
        console.log({UpdateLogin_err});
      });
  });
};

KensoftApi.prototype.IncreaseScViews = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}Listings/IncreaseScViewsAsync`;

  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({Ids: data}),
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      });
  });
};

KensoftApi.prototype.GetCountryCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}Country/Get?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.FreeSearchCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}Listings/List/FreeSearchAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.GetUserCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}User/GetAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.GetMakesCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}lookups/List/MakesAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.GetSectionsCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}lookups/List/SectionsAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.GetCategoriesCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}lookups/List/CategoriesAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.GetListingCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}Listings/Get/ListingAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null && v !== undefined),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.GetFeaturesCore = function (data, callback) {
  let _requestUrl = `${this.coreApiV1}Listings/List/FeaturesAsync?`;
  data = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null && v !== undefined),
  );
  _requestUrl += this.join(data, '&');
  return this._request(_requestUrl, callback);
};

KensoftApi.prototype.UpdateMobileClick = function (data, callback) {
  let _requestUrl = `${this.url}/Services/UpdateMobileClick?`;
  _requestUrl += this.join(data, '&');

  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
};

KensoftApi.prototype.ExtractMobileFilter = function (data, callback) {
  var requestUrl = `${this.coreApiV1}Utilities/ExtractFilterObject?`;
  requestUrl += this.join(data, '&');
  return this._request(requestUrl, callback);
};

export default KensoftApi;
