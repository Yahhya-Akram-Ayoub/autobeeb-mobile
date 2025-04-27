/**
 * Created by Kensoftware on 20/12/2016.
 */
import { Dimensions, Platform } from "react-native";
const _height = Dimensions.get("window").height;
const { height } = Dimensions.get("window");
const { heightWindow } = Dimensions.get("window");
import Constants from "./Constants";
import Color from "./Color";

let Styles = {
  width: Dimensions.get("window").width,
  height: Platform.OS !== "ios" ? _height : _height - 20,
  navBarHeight: Platform !== "ios" ? height - heightWindow : 0,
  headerHeight: Platform.OS === "ios" ? 40 : 40,
  thumbnailRatio: 1.2, //Thumbnail ratio, the product display height = width * thumbnail ratio

  app: {
    flexGrow: 1,
    backgroundColor: Color.main
    // paddingTop: Device.ToolbarHeight
  },
  FontSize: {
    tiny: 12,
    small: 14,
    medium: 16,
    big: 18,
    large: 20
  },
  IconSize: {
    TextInput: 25,
    ToolBar: 18,
    Inline: 20
  },
  FontFamily: {}
};

Styles.Common = {
  Column: {},
  ColumnCenter: {
    justifyContent: "center",
    alignItems: "center"
  },
  ColumnCenterTop: {
    alignItems: "center"
  },
  ColumnCenterBottom: {
    justifyContent: "flex-end",
    alignItems: "center"
  },
  ColumnCenterLeft: {
    justifyContent: "center",
    alignItems: "flex-start"
  },
  ColumnCenterRight: {
    justifyContent: "center",
    alignItems: "flex-end"
  },
  Row: {
    flexDirection: "row"
  },
  RowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  RowCenterTop: {
    flexDirection: "row",
    justifyContent: "center"
  },
  RowCenterBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center"
  },
  RowCenterLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  RowCenterRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  RowCenterBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  //More traits

  IconSearchView: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginBottom: 10,
    borderRadius: 50,

    shadowOffset: { width: 0, height: -4 },
    shadowColor: "rgba(0,0,0, .3)",
    elevation: 10,
    shadowOpacity: 0.1,
    zIndex: 9999
  },
  IconSearch: {
    width: 20,
    height: 20,
    margin: 12,
    zIndex: 9999
  },
  logo: {
    maxHeight: 30,
    width: 130,
    resizeMode: "contain",
    marginTop: 4
  },
  toolbar: {
    backgroundColor: Color.navigationBarColor,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 40,
    justifyContent: "flex-start",
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 0
  },

  toolbarAndroid: {
    backgroundColor: Color.navigationBarColor,
    zIndex: 1,
    height: 40,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 0
  },
  headerStyle: {
    color: Color.navigationTitleColor,
    marginLeft: 50,
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
    justifyContent: "center",
    fontFamily: Constants.fontFamily
  },
  toolbarIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",

    marginRight: 12,

    marginLeft: 8,
    opacity: 0.8
  },
  menuRight: {
    width: (30 * Styles.width) / 100,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  menuMid: {
    width: (40 * Styles.width) / 100,
    height: 40,
    alignItems: "center"
  },
  menuLeft: {
    width: (30 * Styles.width) / 100,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  newMenu: {
    backgroundColor: Color.navigationBarColor,

    zIndex: 1,
    height: 80,
    flexDirection: "row",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8"
    // elevation: 1
  },
  newSmallMenu: {
    backgroundColor: Color.navigationBarColor,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "column",
    paddingTop: 0,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1
  },
  newMenuRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    height: 40
  },
  newToolbarIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginRight: 12,
    marginLeft: 8,
    opacity: 0.8,
    tintColor: "#3E82C4"
  },
  newMenuSearch: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 40
  },
  searchInput: {
    height: 40,
    width: (80 * Styles.width) / 100,
    marginLeft: 10,
    marginRight: 10
  }
};

export default Styles;
