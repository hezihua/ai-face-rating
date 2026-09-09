import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ScanOverlay } from '../src/components/ScanOverlay';
import { colors, fontSize, spacing } from '../src/constants/theme';
import { rateFacePreview } from '../src/services/faceRating';

const SCAN_INTERVAL_MS = 2000;

export default function LiveScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [scanning, setScanning] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const scanningRef = useRef(true);
  const analyzingRef = useRef(false);

  const captureFrame = useCallback(async (quality: number) => {
    if (!cameraRef.current || analyzingRef.current) return null;
    return cameraRef.current.takePictureAsync({
      quality,
      base64: true,
      skipProcessing: true,
    });
  }, []);

  useEffect(() => {
    if (!permission?.granted) return;

    const tick = async () => {
      if (!scanningRef.current || analyzingRef.current) return;
      try {
        const photo = await captureFrame(0.2);
        if (!photo?.base64) return;
        const result = rateFacePreview(photo.base64);
        setLiveScore(result.overallScore);
      } catch {
        // 预览帧失败时静默跳过
      }
    };

    tick();
    const id = setInterval(tick, SCAN_INTERVAL_MS);
    return () => clearInterval(id);
  }, [permission?.granted, captureFrame]);

  const handleFinalAnalyze = async () => {
    if (capturing) return;
    setCapturing(true);
    analyzingRef.current = true;
    setScanning(false);
    scanningRef.current = false;

    try {
      const photo = await captureFrame(0.8);
      if (!photo?.uri) {
        throw new Error('拍摄失败，请重试');
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: '/analyzing',
        params: { imageUri: photo.uri, base64: photo.base64 ?? '' },
      });
    } catch (error) {
      analyzingRef.current = false;
      setScanning(true);
      scanningRef.current = true;
      Alert.alert('拍摄失败', error instanceof Error ? error.message : '请重试');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionBox}>
        <Text style={styles.permissionTitle}>需要相机权限</Text>
        <Text style={styles.permissionText}>实时扫描需要使用前置摄像头</Text>
        <PrimaryButton title="授权相机" onPress={requestPermission} />
        <PrimaryButton title="返回" variant="outline" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" mirror>
        <ScanOverlay score={liveScore} scanning={scanning} />
      </CameraView>

      <SafeAreaView style={styles.controls} edges={['top', 'bottom']}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </Pressable>

        <View style={styles.bottom}>
          <Text style={styles.modeHint}>实时预览分 · 定格后 AI 深度分析</Text>
          <PrimaryButton
            title={capturing ? '拍摄中...' : '🎯  定格 · AI 深度分析'}
            onPress={handleFinalAnalyze}
            loading={capturing}
            disabled={liveScore == null}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  permissionBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  controls: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    backgroundColor: colors.background + '99',
    borderRadius: 8,
  },
  backText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  bottom: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  modeHint: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
