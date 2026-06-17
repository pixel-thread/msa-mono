import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabBarIconProps {
  name: IconName;
  color: string;
}

export const TabBarIcon = ({ name, color }: TabBarIconProps) => (
  <Ionicons name={name} size={28} color={color} />
);
