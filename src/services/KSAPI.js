import KensoftApi from './KensoftApi';
import Constants from '../common/Constants';

var KS = new KensoftApi({
  url: Constants.Url,
  coreApiV1: Constants.coreApiV1,
});

export default KS;
