import * as ImagePicker from 'expo-image-picker';

export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function requestMediaPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function pickImageFromGallery(): Promise<ImagePicker.ImagePickerResult> {
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
    base64: true,
  });
}

export async function takePhoto(): Promise<ImagePicker.ImagePickerResult> {
  return ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
    base64: true,
  });
}

/** 从 base64 或 URI 生成稳定的伪随机种子，用于本地评分的一致性 */
export function hashImageData(data: string): number {
  let hash = 0;
  const sample = data.slice(0, 2000);
  for (let i = 0; i < sample.length; i++) {
    hash = (hash << 5) - hash + sample.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9999) * 10000;
  return x - Math.floor(x);
}
