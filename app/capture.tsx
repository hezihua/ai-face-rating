import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import {
  pickImageFromGallery,
  requestCameraPermission,
  requestMediaPermission,
  takePhoto,
} from '../src/utils/imageUtils';

export default function CaptureScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setBase64(asset.base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTakePhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert('权限不足', '请在系统设置中允许访问相机');
      return;
    }
    setLoading(true);
    try {
      const result = await takePhoto();
      handleResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handlePickGallery = async () => {
    const granted = await requestMediaPermission();
    if (!granted) {
      Alert.alert('权限不足', '请在系统设置中允许访问相册');
      return;
    }
    setLoading(true);
    try {
      const result = await pickImageFromGallery();
      handleResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!imageUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/analyzing',
      params: { imageUri, base64: base64 ?? '' },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>
        <Text style={styles.title}>选择照片</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.previewArea}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderIcon}>👤</Text>
            <Text style={styles.placeholderText}>请拍摄或选择一张{'\n'}清晰的正面人脸照片</Text>
          </View>
        )}
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipTitle}>拍摄建议</Text>
        {['正面面对镜头，光线均匀', '避免遮挡面部（口罩、墨镜）', '背景简洁，面部居中'].map(
          (tip) => (
            <Text key={tip} style={styles.tipItem}>
              · {tip}
            </Text>
          ),
        )}
      </View>

      <View style={styles.actions}>
        {imageUri ? (
          <>
            <PrimaryButton title="开始 AI 分析" onPress={handleAnalyze} />
            <PrimaryButton
              title="重新选择"
              variant="outline"
              onPress={() => {
                setImageUri(null);
                setBase64(null);
              }}
            />
          </>
        ) : (
          <>
            <PrimaryButton
              title="📹  实时扫描模式"
              onPress={() => router.push('/live-scan')}
            />
            <PrimaryButton
              title="📷  拍照"
              onPress={handleTakePhoto}
              loading={loading}
            />
            <PrimaryButton
              title="🖼  从相册选择"
              variant="secondary"
              onPress={handlePickGallery}
              loading={loading}
            />
          </>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backText: {
    color: colors.primaryLight,
    fontSize: fontSize.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  previewArea: {
    flex: 1,
    marginVertical: spacing.md,
  },
  preview: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primary + '60',
  },
  placeholderBox: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  tips: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipItem: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  actions: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
