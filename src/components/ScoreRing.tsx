import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontSize } from '../constants/theme';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 180 }: ScoreRingProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 10, { duration: 1200 });
  }, [score, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${progress.value * 100}%`,
  }));

  const scoreColor =
    score >= 8 ? colors.success : score >= 6.5 ? colors.warning : colors.accent;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={styles.ringInner}>
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: scoreColor + '30' },
              fillStyle,
            ]}
          />
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={[styles.score, { color: scoreColor }]}>{score.toFixed(1)}</Text>
        <Text style={styles.unit}>/ 10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 6,
    borderColor: colors.surfaceLight,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ringInner: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 9999,
  },
  fill: {
    width: '100%',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    fontSize: fontSize.hero,
    fontWeight: '800',
  },
  unit: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -4,
  },
});
