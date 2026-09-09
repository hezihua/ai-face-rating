import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontSize, radius } from '../constants/theme';

interface ScanOverlayProps {
  score: number | null;
  scanning: boolean;
}

export function ScanOverlay({ score, scanning }: ScanOverlayProps) {
  const scanY = useSharedValue(0);

  useEffect(() => {
    scanY.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0, { duration: 1800 })),
      -1,
    );
  }, [scanY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanY.value * 100}%`,
  }));

  const scoreColor =
    score == null
      ? colors.textMuted
      : score >= 8
        ? colors.success
        : score >= 6.5
          ? colors.warning
          : colors.accent;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.faceFrame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        {scanning && <Animated.View style={[styles.scanLine, scanLineStyle]} />}
      </View>

      <Text style={styles.hint}>将面部对准框内，保持正面</Text>

      <View style={styles.scoreBadge}>
        <Text style={styles.scoreLabel}>实时评分</Text>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {score != null ? score.toFixed(1) : '--'}
        </Text>
      </View>
    </View>
  );
}

const FRAME_SIZE = 260;
const CORNER = 28;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.25,
    borderRadius: FRAME_SIZE,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary + '80',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.primaryLight,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: radius.lg,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: radius.lg,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: radius.lg,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: radius.lg,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  hint: {
    marginTop: 20,
    color: colors.text,
    fontSize: fontSize.sm,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scoreBadge: {
    position: 'absolute',
    top: 48,
    right: 24,
    backgroundColor: colors.background + 'CC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
});
