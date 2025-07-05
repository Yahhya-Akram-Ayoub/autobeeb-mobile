import React, {useState, useEffect} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Color, Languages} from '../../common';
import KS from '../../services/KSAPI';

const SwearModal = ({
  Open,
  Lang,
  Curr,
  Country,
  IsSwear,
  IsCommission,
  ApproveFunc,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    if (!Open) {
      return;
    }
    setModalVisible(Open);

    if (!plan) {
      KS.GetSwearPlan({
        CountryIdOrPrefix: Country.toLowerCase(),
        LangPrefix: Lang,
        Cur: Curr,
      })
        .then(res => {
          console.log({GetSwearPlan: res});
          if (res.Success) {
            setPlan(res.Plan);
            setCurrency(res.Currency);
          } else {
            setTimeout(() => {
              ApproveFunc();
            }, 1000);
          }

          setLoading(false);
        })
        .catch(err => {
          console.log({my: err});
          setLoading(false);
          setTimeout(() => {
            ApproveFunc();
          }, 1000);
        });
    }
  }, [Open]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View
          style={[
            styles.modalView,
            !!plan && IsSwear
              ? {minHeight: SecreenHeight / 3 + 50}
              : {minHeight: SecreenHeight / 5 + 50},
          ]}>
          {loading ? (
            <ActivityIndicator size={60} color={Color.primary} />
          ) : !plan && !IsSwear ? (
            <Text style={styles.modalText}>Error!</Text>
          ) : (
            <>
              <Text style={styles.modalTitle}>{Languages.OathTitle}</Text>
              {IsSwear && (
                <Text style={styles.bodyText}>- {Languages.OathBody}</Text>
              )}
              {!!plan && IsCommission && (
                <Text style={styles.bodyText}>
                  -{' '}
                  {Languages.OathBody2.replaceAll(
                    '{0}',
                    `${global.ViewingCurrency.Format}`.replaceAll(
                      '{0}',
                      Math.ceil(plan.Price * global.ViewingCurrency.Ratio),
                    ),
                  )}
                </Text>
              )}
              <View style={styles.buttons}>
                <Pressable
                  style={[styles.button, styles.buttonOpen]}
                  onPress={() => {
                    ApproveFunc();
                    setModalVisible(!modalVisible);
                  }}>
                  <Text style={styles.textStyle}>{Languages.OathAction}</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.textStyle}>{Languages.Cancel}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const SecreenWidth = Dimensions.get('screen').width;
const SecreenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    minWidth: SecreenWidth - 20,
    margin: 20,
    marginTop: 150,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewPlan: {
    minHeight: SecreenHeight / 5,
  },
  button: {
    borderRadius: 3,
    padding: 10,
  },
  buttonOpen: {
    backgroundColor: '#00b300',
  },
  buttonClose: {
    backgroundColor: '#ff0000',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    minWidth: SecreenWidth - 50,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
  },
  bodyText: {
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 15,
    textAlign: 'auto',
  },
});

export default SwearModal;
