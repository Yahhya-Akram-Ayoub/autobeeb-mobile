import {Platform} from 'react-native';
import Languages from './Languages';
import {isIphoneX} from 'react-native-iphone-x-helper';

const urls = __DEV__
  ? !__DEV__
    ? {
        Url: 'http://localhost:44300/v2/',
        HubUrl: 'http://localhost:44300',
        coreApiV1: 'http://localhost:5051/api/v1/',
      }
    : {
        Url: 'https://api.autobeeb.com/v2/',
        HubUrl: 'https://api.autobeeb.com',
        coreApiV1: 'http://coreapi.autobeeb.com/api/v1/',
      }
  : {
      Url: 'https://api.autobeeb.com/v2/',
      HubUrl: 'https://api.autobeeb.com',
      coreApiV1: 'http://coreapi.autobeeb.com/api/v1/',
    };

const Constants = {
  ...urls,
  android_app_ads_id: 'ca-app-pub-2004329455313921/8851160063',
  ios_app_ads_id: 'ca-app-pub-2004329455313921/8383878907',
  RTL: false,
  bigFont: 22,
  mediumFont: 18,
  smallFont: 14,
  Language: 'en', // Arabic
  fontFamily: 'Cairo-Regular',
  currency: 1,
  fontFamilyBold: 'Cairo-Bold',
  fontFamilySemiBold: 'Cairo-SemiBold',
  fontHeader: 'Cairo-Regular',
  fontHeaderAndroid: 'Cairo-Regular',
  listingsHeaderHiegth:
    Platform.OS === 'ios'
      ? isIphoneX()
        ? 90
        : Platform.select({ios: 80, android: 60})
      : 60,
  EmitCode: {
    SideMenuOpen: 'emit.side.open',
    SideMenuClose: 'emit.side.close',
    Toast: 'toast',
    MenuReload: 'menu.reload',
  },
  sellTypes: [
    {
      ID: 1,
      get Name() {
        return Languages.ForSale;
      },
      img: require('../images/SellTypes/WhiteSale.png'),
      backgroundColor: '#0F93DD',
    },
    {
      ID: 2,
      get Name() {
        return Languages.ForRent;
      },
      img: require('../images/SellTypes/WhiteRent.png'),

      backgroundColor: '#F68D00',
    },
    {
      ID: 4,
      get Name() {
        return Languages.Wanted;
      },
      img: require('../images/SellTypes/WhiteWanted.png'),
      backgroundColor: '#D31018',
    },
  ],

  sellTypesFilter: [
    {
      ID: 1,
      Name: Languages.ForSale,
      img: require('../images/SellTypes/BlueSale.png'),
      backgroundColor: '#0F93DD',
    },
    {
      ID: 2,
      Name: Languages.ForRent,
      img: require('../images/SellTypes/BlueRent.png'),
      backgroundColor: '#F68D00',
    },
    {
      ID: 4,
      Name: Languages.Wanted,
      img: require('../images/SellTypes/BlueWanted.png'),
      backgroundColor: '#D31018',
    },
  ],
  offerCondition: [
    {
      ID: 1,
      Name: Languages.New,
    },
    {
      ID: 2,
      Name: Languages.Used,
    },
  ],
  listingStatus: [
    {
      ID: 1,
      Name: Languages.Rejected,
    },
    {
      ID: 2,
      Name: Languages.Expired,
    },
    {
      ID: 4,
      Name: Languages.New,
    },
    {
      ID: 8,
      Name: Languages.Approved,
    },
    {
      ID: 16,
      Name: Languages.Featured,
    },
  ],
  gearBox: [
    {
      ID: 1,
      Name: Languages.Automatic,
    },
    {
      ID: 2,
      Name: Languages.Manual,
    },
  ],
  filterGearBox: [
    {
      //  FullImagePath: "yaz",
      ID: -1,
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      Name: Languages.All,
    },
    {
      ID: 1,
      Name: Languages.Automatic,
    },
    {
      ID: 2,
      Name: Languages.Manual,
    },
  ],
  gearBoxTrucks: [
    {
      ID: 1,
      get Name() {
        return Languages.Automatic;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Manual;
      },
    },
    {
      ID: 4,
      get Name() {
        return Languages.SemiAutomatic;
      },
    },
  ],
  fuelTypes: [
    {
      ID: 1,
      get Name() {
        return Languages.Benzin;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Diesel;
      },
    },
    {
      ID: 4,
      get Name() {
        return Languages.Electric;
      },
    },
    {
      ID: 8,
      get Name() {
        return Languages.Hybrid;
      },
    },
    {
      ID: 16,
      get Name() {
        return Languages.Other;
      },
    },
  ],
  FilterFuelTypes: [
    {
      ID: -1,
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      get Name() {
        return Languages.All;
      },
    },
    {
      ID: 1,
      get Name() {
        return Languages.Benzin;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Diesel;
      },
    },
    {
      ID: 4,
      get Name() {
        return Languages.Electric;
      },
    },
    {
      ID: 8,
      get Name() {
        return Languages.Hybrid;
      },
    },
    {
      ID: 16,
      get Name() {
        return Languages.Other;
      },
    },
    {
      ID: 32,
      get Name() {
        return Languages.PlugInHybrid;
      },
    },
  ],
  paymentMethods: [
    {
      ID: 1,
      get Name() {
        return Languages.Cash;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Installments;
      },
    },
  ],
  FilterPaymentMethods: [
    {
      //  FullImagePath: "yaz",
      ID: -1,
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      get Name() {
        return Languages.All;
      },
    },
    {
      ID: 1,
      get Name() {
        return Languages.Cash;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Installments;
      },
    },
  ],
  FilterPriceSuggestions: [
    '5000',
    '10000',
    '15000',
    '20000',
    '30000',
    '40000',
    '50000',
    '75000',
    '100000',
    '125000',
    '150000',
    '175000',
    '200000',
  ],
  FilterMileageSuggestions: [
    '10000',

    '30000',

    '50000',
    '70000',
    '90000',
    '110000',
    '130000',
    '150000',
  ],
  rentPeriod: [
    {
      ID: 1,
      Name: Languages.Daily,
    },
    {
      ID: 2,
      Name: Languages.Weekly,
    },
    {
      ID: 4,
      Name: Languages.Monthly,
    },
    {
      ID: 8,
      Name: Languages.Yearly,
    },
    {
      ID: 15,
      Name: Languages.AnyPeriod,
    },
  ],
  FilterRentPeriod: [
    {
      ID: -1,
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      get Name() {
        return Languages.All;
      },
    },
    {
      ID: 1,
      get Name() {
        return Languages.Daily;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Weekly;
      },
    },
    {
      ID: 4,
      get Name() {
        return Languages.Monthly;
      },
    },
    {
      ID: 8,
      get Name() {
        return Languages.Yearly;
      },
    },
  ],
  FilterOfferCondition: [
    {
      ID: -1,
      Image: require('../images/SellTypes/BlueAll.png'),
      All: true,
      get Name() {
        return Languages.All;
      },
    },
    {
      ID: 1,
      get Name() {
        return Languages.New;
      },
    },
    {
      ID: 2,
      get Name() {
        return Languages.Used;
      },
    },
  ],
  addingSteps: [
    {
      //Cars
      ID: 1,
      //Cars For Sell
      UserSell: [2, 5, 6, 7, 4, 10, 11, 9, 14, 12, 8, 15, 18],
      GuestSell: [2, 5, 6, 7, 4, 10, 11, 9, 14, 12, 16, 20, 17, 8, 15, 18],
      //Cars For Rent
      UserRent: [2, 5, 6, 7, 4, 13, 8, 18],
      GuestRent: [2, 5, 6, 7, 4, 13, 16, 20, 17, 8, 18],
      //Cars Wanted
      UserWanted: [2, 5, 6, 7, 4, 10, 14, 12, 8, 18],
      GuestWanted: [2, 5, 6, 7, 4, 10, 14, 12, 16, 20, 17, 8, 18],
    },
    {
      //Trucks
      ID: 2,
      //Trucks For Sell
      UserSell: [2, 4, 5, 6, 7, 10, 11, 14, 12, 8, 15, 18],
      GuestSell: [2, 4, 5, 6, 7, 10, 11, 14, 12, 16, 20, 17, 8, 15, 18],
      //Trucks For Rent
      UserRent: [2, 4, 5, 6, 7, 13, 8, 18],
      GuestRent: [2, 4, 5, 6, 7, 13, 16, 20, 17, 8, 18],
      //Trucks Wanted
      UserWanted: [2, 4, 5, 6, 7, 10, 14, 12, 8, 18],
      GuestWanted: [2, 4, 5, 6, 7, 10, 14, 12, 16, 20, 17, 8, 18],
    },
    {
      //Equipments
      ID: 4,
      //Equipments For Sell
      UserSell: [2, 3, 4, 5, 6, 7, 10, 11, 12, 8, 15, 18],
      GuestSell: [2, 3, 4, 5, 6, 7, 10, 11, 12, 16, 20, 17, 8, 15, 18],
      //Equipments For Rent
      UserRent: [2, 3, 4, 5, 6, 7, 13, 8, 18],
      GuestRent: [2, 3, 4, 5, 6, 7, 13, 16, 20, 17, 8, 18],
      //Equipments Wanted
      UserWanted: [2, 3, 4, 5, 6, 7, 10, 12, 8, 18],
      GuestWanted: [2, 3, 4, 5, 6, 7, 10, 12, 16, 20, 17, 8, 18],
    },
    {
      //Buses & Van
      ID: 8,
      //Buses & Van For Sell
      UserSell: [2, 4, 5, 6, 7, 10, 11, 9, 14, 12, 8, 15, 18],
      GuestSell: [2, 4, 5, 6, 7, 10, 11, 9, 14, 12, 16, 20, 17, 8, 15, 18],
      //Buses & Van For Rent
      UserRent: [2, 4, 5, 6, 7, 13, 8, 18],
      GuestRent: [2, 4, 5, 6, 7, 13, 16, 20, 17, 8, 18],
      //Buses & Van Wanted
      UserWanted: [2, 4, 5, 6, 7, 10, 14, 12, 8, 18],
      GuestWanted: [2, 4, 5, 6, 7, 10, 14, 12, 16, 20, 17, 8, 18],
    },
    {
      //Trailer
      ID: 16,
      //Trailer For Sell
      UserSell: [2, 4, 5, 6, 10, 7, 12, 8, 18],
      GuestSell: [2, 4, 5, 6, 10, 7, 12, 16, 20, 17, 8, 18],
      //Trailer For Rent
      UserRent: [2, 4, 7, 13, 8, 18],
      GuestRent: [2, 4, 7, 13, 16, 20, 17, 8, 18],
      //Trailer Wanted
      UserWanted: [2, 4, 7, 10, 12, 8, 18],
      GuestWanted: [2, 4, 7, 10, 12, 16, 20, 17, 8, 18],
    },
    {
      //Spare Parts missing title page after 8
      ID: 32,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 5, 6, 10, 8, 18],
      GuestSell: [2, 3, 4, 5, 6, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 5, 6, 7, 10, 8, 18],
      GuestWanted: [2, 3, 4, 5, 6, 7, 10, 16, 20, 17, 8, 18],
    },
    {
      //Cars Spare Parts
      ID: 64,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
    },
    {
      //Trucks Spare Parts
      ID: 128,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
    },
    {
      //Trailer Spare Parts
      ID: 256,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
    },
    {
      //Buses & Van Spare Parts
      ID: 512,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
    },
    {
      //Equipment Spare Parts
      ID: 1024,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 16, 20, 17, 8, 18],
    },
    {
      //Accessories Spare Parts
      ID: 2048,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 10, 8, 18],
      GuestSell: [2, 3, 4, 10, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 10, 8, 18],
      GuestWanted: [2, 3, 4, 10, 16, 20, 17, 8, 18],
    },
    {
      //Regulation Spare Parts
      ID: 4096,
      //Spare Parts For Sell
      UserSell: [2, 3, 4, 8, 18],
      GuestSell: [2, 3, 4, 16, 20, 17, 8, 18],
      //Spare Parts For Wanted
      UserWanted: [2, 3, 4, 8, 18],
      GuestWanted: [2, 3, 4, 16, 20, 17, 8, 18],
    },
    {
      //Equipments Sections 1
      ID: 8192,
      //Equipments For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 11, 12, 8, 15, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 11, 12, 16, 20, 17, 8, 15, 18],
      //Equipments For Rent
      UserRent: [2, 3, 4, 19, 5, 6, 7, 13, 8, 18],
      GuestRent: [2, 3, 4, 19, 5, 6, 7, 13, 16, 20, 17, 8, 18],
      //Equipments Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 12, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 12, 16, 20, 17, 8, 18],
    },
    {
      //Equipments Sections 2
      ID: 16384,
      //Equipments For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 11, 12, 8, 15, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 11, 12, 16, 20, 17, 8, 15, 18],
      //Equipments For Rent
      UserRent: [2, 3, 4, 19, 5, 6, 7, 13, 8, 18],
      GuestRent: [2, 3, 4, 19, 5, 6, 7, 13, 16, 20, 17, 8, 18],
      //Equipments Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 12, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 12, 16, 20, 17, 8, 18],
    },
    {
      //Equipments Sections 3
      ID: 32768,
      //Equipments For Sell
      UserSell: [2, 3, 4, 19, 5, 6, 7, 10, 11, 12, 8, 15, 18],
      GuestSell: [2, 3, 4, 19, 5, 6, 7, 10, 11, 12, 16, 20, 17, 8, 15, 18],
      //Equipments For Rent
      UserRent: [2, 3, 4, 19, 5, 6, 7, 13, 8, 18],
      GuestRent: [2, 3, 4, 19, 5, 6, 7, 13, 16, 20, 17, 8, 18],
      //Equipments Wanted
      UserWanted: [2, 3, 4, 19, 5, 6, 7, 10, 12, 8, 18],
      GuestWanted: [2, 3, 4, 19, 5, 6, 7, 10, 12, 16, 20, 17, 8, 18],
    },
  ],
};

export default Constants;
