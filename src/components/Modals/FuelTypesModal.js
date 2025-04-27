import {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Languages} from '../../common';
import GeneralFilterModal from './GenralFilterModal';

const FuelTypesModal = ({
  FuelTypesList,
  SelectedFuelTypes,
  OnSelect,
  OnClose,
  IsOpen,
}) => {
  return (
    <GeneralFilterModal
      DataList={FuelTypesList}
      SelectedOptions={SelectedFuelTypes}
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

export default FuelTypesModal;
