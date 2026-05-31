import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { toast } from 'sonner-native';

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const downloadFile = async (url: string, title: string) => {
  const ext = url.split('.').pop()?.split('?')[0] || 'file';
  const localUri = `${cacheDirectory}${title}.${ext}`;
  const { uri } = await downloadAsync(url, localUri);
  return uri;
};

export const handleFileDownload = async (url: string, title: string) => {
  try {
    toast.loading('Downloading...');
    await downloadFile(url, title);
    toast.dismiss();
    toast.success('Download complete');
  } catch {
    toast.dismiss();
    toast.error('Failed to download file');
  }
};

export const handleFileShare = async (url: string, title: string) => {
  try {
    toast.loading('Preparing...');
    const uri = await downloadFile(url, title);
    toast.dismiss();

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      toast.error('Sharing is not available on this device');
    }
  } catch {
    toast.dismiss();
    toast.error('Failed to share file');
  }
};
