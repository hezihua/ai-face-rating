import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontSize, radius, spacing } from '../constants/theme';

interface DimensionBarProps {
  label: string;
  score: number;
  description: string;
  index?: number;
}

export function DimensionBar({
  label,
  score,
  description,
  index = 0,
}: DimensionBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(index * 100, withTiming(score / 10, { duration: 800 }));
  }, [score, index, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const barColor =
    score >= 8 ? colors.success : score >= 6.5 ? colors.warning : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.score, { color: barColor }]}>{score.toFixed(1)}</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: barColor }, barStyle]} />
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  score: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
