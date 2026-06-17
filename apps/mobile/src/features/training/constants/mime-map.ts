import type { Ionicons } from '@expo/vector-icons';

type MimeIconMap = Record<string, keyof typeof Ionicons.glyphMap>;

export const mimeTypeToIcon: MimeIconMap = {
  'video/mp4': 'videocam-outline',
  'image/png': 'image-outline',
  'image/jpeg': 'image-outline',
  'application/pdf': 'document-outline',
};

export const getMimeIcon = (mimeType: string): keyof typeof Ionicons.glyphMap =>
  mimeTypeToIcon[mimeType] ?? 'document-outline';
