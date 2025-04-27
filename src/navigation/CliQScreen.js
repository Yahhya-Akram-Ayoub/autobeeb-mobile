import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  BackHandler,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Color from '../common/Color';
import Languages from '../common/Languages';
import IconEn from 'react-native-vector-icons/Feather';
import IconFa from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

const CliQScreen = ({route}) => {
  const [displyNotify, setDisplyNotify] = useState(false);
  const {PlanName, Price} = route.params; // Accessing route parameters
  const navigation = useNavigation();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
    });
  }, []);

  const CopyText = text => {
    Clipboard.setString(text);
    setDisplyNotify(true);
    setTimeout(() => {
      setDisplyNotify(false);
    }, 700);
  };

  return (
    <View style={styles.MainScreen}>
      <FastImage
        style={styles.ImageCliQ}
        source={{
          uri: __DEV__
            ? 'https://i.ibb.co/rFK4zyb/final-cliq-logo-02-1-0-Copy-1.png'
            : 'https://autobeeb.com/wsImages/bank-transfer.png',
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
      <Text style={styles.Title}> {PlanName}</Text>
      <Text style={styles.Price}>
        {`${Languages.Price} : ${`${global.ViewingCurrency.Format}`.replaceAll(
          '{0}',
          Math.ceil(Price * global.ViewingCurrency.Ratio),
        )}`}
      </Text>
      <View style={styles.TextBox}>
        <Text style={styles.Text}>
          {
            'لتفعيل الخدمة ادفع المبلغ المطلوب عن طريق كليك من تطبيق البنك أو المحفظة الخاص بك على التفاصيل التاليه :'
          }
        </Text>
        <Pressable style={styles.CopyBtn} onPress={() => CopyText('AutoBeeb')}>
          <Text style={styles.Text}>{'- الاسم المستعار : AutoBeeb'}</Text>
          <IconEn name={'copy'} size={20} color={Color.secondary} />
        </Pressable>
        <Pressable
          style={styles.CopyBtn}
          onPress={() =>
            CopyText(`${Math.ceil(Price * global.ViewingCurrency.Ratio)}`)
          }>
          <Text style={styles.Text}>{`- القيمة المطلوبة : ${`${
            Languages.Price
          } : ${`${global.ViewingCurrency.Format}`.replaceAll(
            '{0}',
            Math.ceil(Price * global.ViewingCurrency.Ratio),
          )}`}`}</Text>
          <IconEn name={'copy'} size={20} color={Color.secondary} />
        </Pressable>
        <Text style={styles.Text}>{' علماً بأن :'}</Text>
        <Text style={styles.Text}>{'- اسم البنك : بنك القاهرة عمان'}</Text>
        <Text style={styles.Text}>
          {'- اسم المستفيد : DEVELOPMENT FOR MARKETING AND'}
        </Text>
        <Text style={styles.Text}>
          {
            'ارسل لنا صورة من الحوالة وصورة لقطة شاشة لاعلانك عبر الواتس أب على الرقم التالي : '
          }
        </Text>
        <Pressable
          style={styles.WhatsappBtn}
          onPress={() => {
            Linking.openURL(`whatsapp://send?phone=+962780003003`);
          }}>
          <Text style={styles.Text}>{'+962780003003'}</Text>
          <IconFa name={'whatsapp'} size={28} color={'#25d366'} />
        </Pressable>
      </View>

      <View style={styles.Line} />
      <Text style={styles.NoteText}>
        {'* سيتم تفعيل الخدمة خلال 12 ساعه كحد أقصى'}
      </Text>
      {displyNotify && <Text style={styles.NotefyCopy}>{'تم نسخ النص'}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  MainScreen: {
    backgroundColor: '#fff',
    minHeight: '100%',
    minWidth: '100%',
  },
  ImageCliQ: {
    width: '100%',
    height: 100,
    borderColor: '#fff',
  },
  Title: {
    textAlign: 'center',
    fontSize: 24,
    color: Color.primary,
  },
  Price: {
    textAlign: 'center',
    fontSize: 16,
    color: Color.primary,
  },
  Text: {
    color: '#000',
    fontSize: 14,
  },
  TextBox: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  CopyBtn: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  WhatsappBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  Line: {
    color: 'gray',
    width: '90%',
    borderWidth: 0.2,
    alignSelf: 'center',
  },
  NoteText: {
    color: Color.primary,
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 2,
  },
  NotefyCopy: {
    backgroundColor: 'gray',
    width: '30%',
    textAlign: 'center',
    color: 'white',
    fontSize: 12,
    paddingVertical: 6,
    position: 'absolute',
    alignSelf: 'center',
    top: '80%',
  },
});

export default CliQScreen;
