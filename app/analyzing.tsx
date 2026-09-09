import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingDots } from '../src/components/LoadingDots';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';
import { rateFace } from '../src/services/faceRating';

const STEPS = [
  '正在检测人脸...',
  '分析面部对称性...',
  '评估五官比例...',
  '生成综合评分...',
];

export default function AnalyzingScreen() {
  const router = useRouter();
  const { imageUri, base64 } = useLocalSearchParams<{
    imageUri: string;
    base64: string;
  }>();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function analyze() {
      try {
        const result = await rateFace({
          imageUri,
          base64: base64 || undefined,
        });

        if (cancelled) return;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        router.replace({
          pathname: '/result',
          params: {
            imageUri,
            result: JSON.stringify(result),
          },
        });
      } catch (error) {
        if (cancelled) return;
        Alert.alert(
          '分析失败',
          error instanceof Error ? error.message : '请重试',
          [{ text: '返回', onPress: () => router.back() }],
        );
      }
    }

    analyze();
    return () => {
      cancelled = true;
    };
  }, [imageUri, base64, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {imageUri && (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
            <View style={styles.scanOverlay}>
              <View style={styles.scanLine} />
            </View>
          </View>
        )}

        <Text style={styles.title}>AI 分析中</Text>
        <Text style={styles.step}>{STEPS[stepIndex]}</Text>
        <LoadingDots />

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((stepIndex + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  imageWrapper: {
    width: 200,
    height: 260,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    width: '80%',
    height: 2,
    backgroundColor: colors.primaryLight,
    opacity: 0.8,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  step: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginTop: spacing.xxl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
