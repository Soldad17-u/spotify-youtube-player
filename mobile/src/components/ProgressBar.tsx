import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@react-native-community/slider';
import { colors, spacing } from '../theme/colors';
import { formatTime } from '../utils/format';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (position: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ position, duration, onSeek }) => {
  const [dragging, setDragging] = useState(false);
  const [tempPosition, setTempPosition] = useState(position);

  useEffect(() => {
    if (!dragging) {
      setTempPosition(position);
    }
  }, [position, dragging]);

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={tempPosition}
        onValueChange={setTempPosition}
        onSlidingStart={() => setDragging(true)}
        onSlidingComplete={(value) => {
          setDragging(false);
          onSeek(value);
        }}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.card}
        thumbTintColor={colors.text}
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(tempPosition)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default ProgressBar;