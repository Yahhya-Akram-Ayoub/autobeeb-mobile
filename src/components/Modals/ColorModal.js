import {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Languages} from '../../common';
import GeneralFilterModal from './GenralFilterModal';

const ColorModal = ({DataList, SelectedOptions, OnSelect, OnClose, IsOpen}) => {
  return (
    <GeneralFilterModal
      DataList={DataList.map(i => {
        return {...i, Name: i.Label ?? i.Name, Color: i.Value};
      })}
      SelectedOptions={SelectedOptions}
      OnSelect={OnSelect}
      OnClose={OnClose}
      IsOpen={IsOpen}
    />
  );
};

const styles = StyleSheet.create({});

const All = {
  ID: '',
  All: true,
  Name: Languages.All,
};

export default ColorModal;
