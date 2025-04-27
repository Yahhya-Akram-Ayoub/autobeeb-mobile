/*
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
// import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Color} from '../../common';

const {width, height} = Dimensions.get('window');
const playStates = Object.freeze({
  play: 'playing',
  stoped: 'stoped',
  paused: 'paused',
});

const MusicPlayer = ({
  currentMessage,
  placeholder,
  optionTitles,
  onQuickReply,
  onSend,
  user,
  currentUser,
}) => {
  let {_id, audio, createdAt, dateRead} = currentMessage;
  let {avatar} = user;
  let timeout = null;
  const IsFromAnother = !(
    currentUser &&
    currentMessage.user &&
    currentUser.ID === currentMessage.user._id
  );
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playState, setPlayState] = useState(playStates.stoped);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const sound = new Sound(audio, Sound.MAIN_BUNDLE, error => {
      if (error) {
        // console.log('failed to load the sound', error);
        setPlayState(playStates.stoped);
      } else {
        setDuration(sound.getDuration());
        setPlayState(playStates.stoped);
      }
    });

    setDuration(sound.getDuration());
    setSound(sound);

    return () => {
      clearInterval(timeout);
    };
  }, [0]);

  const pause = () => {
    if (!!sound) {
      sound.pause();
    }
    setPlayState(playStates.paused);
  };

  const playSound = () => {
    if (playState === playStates.play) {
      pause();
      clearInterval(timeout);
      return;
    }

    if (!!sound) {
      sound.play(playComplete);
      setPlayState(playStates.play);

      timeout = setInterval(() => {
        if (!!sound) {
          sound.getCurrentTime((seconds, isPlaying) => {
            if (!!isPlaying) setProgress(seconds);
          });
        }
      }, 100);
    }
  };

  const playComplete = success => {
    if (!!sound) {
      if (success) {
        // console.log('successfully finished playing');
      } else {
        // console.log('playback failed due to audio decoding errors');
      }
      clearInterval(timeout);
      setProgress(0);
      setPlayState(playStates.stoped);
      sound.setCurrentTime(0);
    }
  };

  const getAudioTimeString = seconds => {
    const h = parseInt(seconds / (60 * 60));
    const m = parseInt((seconds % (60 * 60)) / 60);
    const s = parseInt(seconds % 60);
    if (s === -1) {
      return '00:00';
    }
    return (
      (h < 1 ? '' : (h < 10 ? '0' + h : h) + ':') +
      (m < 10 ? '0' + m : m) +
      ':' +
      (s < 10 ? '0' + s : s)
    );
  };

  return (
    <View
      style={{
        ...style.container,
        backgroundColor: IsFromAnother ? '#1e3c6299' : '#ffffff00',
      }}>
      <View>
        {/* music control */}
        <View style={style.musicControlsContainer}>
          <Slider
            style={style.progressBar}
            value={progress}
            onValueChange={value => {
              //console.log({ change: value });
            }}
            minimumValue={0}
            maximumValue={duration}
            thumbTintColor={'#fffffa'}
            minimumTrackTintColor={'#fff'}
            maximumTrackTintColor="#fff"
            onSlidingComplete={async value => {
              //console.log({ value })
            }}
          />
          <TouchableOpacity
            style={style.pauseButton}
            onPress={() => playSound()}>
            <Ionicons
              name={
                playState !== playStates.play
                  ? 'ios-play-circle'
                  : 'ios-pause-circle'
              }
              size={30}
              color={'#fff'}
            />
          </TouchableOpacity>
        </View>
        {/* Progress Durations */}
        <View style={style.progressLevelDuraiton}>
          <Text style={style.progressLabelText}>
            {getAudioTimeString(progress)}
          </Text>
          <Text style={style.progressLabelText}>
            {getAudioTimeString(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    height: 60,
    width: width * 0.75,
    borderRadius: 5,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  elevation: {
    elevation: 5,
    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
  },
  progressBar: {
    width: 250,
    height: 20,
    marginTop: 0,
    flexDirection: 'row',
  },
  pauseButton: {
    marginEnd: 15,
    alignSelf: 'center',
  },
  progressLevelDuraiton: {
    width: 220,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
    marginStart: 15,
  },
  progressLabelText: {
    color: '#FFF',
    fontSize: 9,
    marginBottom: 10,
  },
  musicControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default MusicPlayer;
*/