import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';
import { getModelName, getRatingMode } from '../src/services/faceRating';

export default function HomeScreen() {
  const router = useRouter();
  const mode = getRatingMode();
  const modelName = getModelName();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.primary + '40', colors.accent + '20', 'transparent']}
          style={styles.glow}
        />
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>AI 颜值评分</Text>
        <Text style={styles.subtitle}>
          上传或拍摄正面人脸照片{'\n'}AI 将从多个维度为你分析面容
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '📹', text: '实时扫描 + 动态分数更新' },
          { icon: '📸', text: '拍照或从相册选择' },
          { icon: '🧠', text: mode === 'ai' ? `${modelName} AI 分析` : '本地智能评分引擎' },
          { icon: '📊', text: '五维评分 + 个性化建议' },
        ].map((item) => (
          <View key={item.text} style={styles.featureItem}>
            <Text style={styles.featureIcon}>{item.icon}</Text>
            <Text style={styles.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="📹  实时扫描评分"
          onPress={() => router.push('/live-scan')}
        />
        <PrimaryButton
          title="📷  拍照 / 相册评分"
          variant="secondary"
          onPress={() => router.push('/capture')}
        />
        <Text style={styles.disclaimer}>
          评分仅供娱乐参考，请理性看待结果
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: radius.full,
    top: '20%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  actions: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  disclaimer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});
