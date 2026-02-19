import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../theme/colors';

interface PlayerControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: string;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  shuffle,
  repeat,
  onPlay,
  onPause,
  onNext,
  onShuffle,
  onRepeat,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity onPress={onShuffle}>
          <Icon
            name="shuffle"
            size={24}
            color={shuffle ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={styles.playButton}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={36}
            color={colors.background}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext}>
          <Icon name="play-skip-forward" size={28} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onRepeat}>
          <Icon
            name="repeat"
            size={24}
            color={repeat !== 'off' ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerControls;