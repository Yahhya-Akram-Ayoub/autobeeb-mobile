/**
 * Created by Kensoftware on 17/02/2017.
 */

import {Constants} from './common';

import _Icon from 'react-native-vector-icons/MaterialCommunityIcons';
export const Icon = _Icon;

import _IconIO from 'react-native-vector-icons/Ionicons';
export const IconIO = _IconIO;

import {EventEmitter} from 'events';
//require("events").EventEmitter.defaultMaxListeners = 10;

export const _EventEmitter = new EventEmitter();

import _Timer from 'react-timer-mixin';
export const Timer = _Timer;

// import _Validate from "./ultils/Validate";
// export const Validate = _Validate;

// import _BlockTimer from "./ultils/BlockTimer";
// export const BlockTimer = _BlockTimer;

//TODO: replace those function after app go live

/**
 * An async fetch with error catch
 * @param url
 * @param data
 * @returns {Promise.<*>}
 */
export const request = async (url, data = {}) => {
  try {
    const response = await fetch(url, data);
    return await response.json();
  } catch (err) {
    error(err);
    return {error: err};
  }
};

//Drawer
export const openDrawer = () =>
  _EventEmitter.emit(Constants.EmitCode.SideMenuOpen);
export const closeDrawer = () =>
  _EventEmitter.emit(Constants.EmitCode.SideMenuClose);

/**
 * Display the message toast-like (work both with Android and iOS)
 * @param msg Message to display
 * @param duration Display duration
 */
export const toast = (msg, duration = 2500) =>
  _EventEmitter.emit(Constants.EmitCode.Toast, msg, duration);
