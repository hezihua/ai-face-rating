import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DimensionBar } from '../src/components/DimensionBar';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ScoreRing } from '../src/components/ScoreRing';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';
import { getModelName } from '../src/services/faceRating';
import { FaceRatingResult } from '../src/types/rating';

function getScoreLabel(score: number): string {
  if (score >= 9) return '惊艳';
  if (score >= 8) return '出众';
  if (score >= 7) return '优秀';
  if (score >= 6) return '良好';
  return '不错';
}

export default function ResultScreen() {
  const router = useRouter();
  const { imageUri, result: resultJson } = useLocalSearchParams<{
    imageUri: string;
    result: string;
  }>();

  const result: FaceRatingResult = JSON.parse(resultJson);

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/capture');
  };

  const handleHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>评分结果</Text>
        {result.mode === 'ai' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🤖 {getModelName()} AI 分析</Text>
          </View>
        )}

        <View style={styles.heroSection}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.avatar} contentFit="cover" />
          )}
          <ScoreRing score={result.overallScore} />
          <Text style={styles.scoreLabel}>{getScoreLabel(result.overallScore)}</Text>
          <Text style={styles.summary}>{result.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>维度分析</Text>
          {result.dimensions.map((dim, i) => (
            <DimensionBar
              key={dim.name}
              label={dim.label}
              score={dim.score}
              description={dim.description}
              index={i}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>提升建议</Text>
          {result.suggestions.map((suggestion, i) => (
            <View key={i} style={styles.suggestionItem}>
              <Text style={styles.suggestionNumber}>{i + 1}</Text>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="再评一次" onPress={handleRetry} />
          <PrimaryButton title="返回首页" variant="outline" onPress={handleHome} />
        </View>

        <Text style={styles.disclaimer}>
          评分结果仅供娱乐参考，不代表任何客观美学标准
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: colors.primary + '30',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  badgeText: {
    color: colors.primaryLight,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.accent,
    marginTop: spacing.sm,
  },
  summary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  suggestionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary + '40',
    color: colors.primaryLight,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  suggestionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disclaimer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
