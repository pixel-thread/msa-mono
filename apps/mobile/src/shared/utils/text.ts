/**
 * Text manipulation utilities.
 */

type TruncateOptionsT = {
  position?: 'end' | 'middle' | 'start';
  ellipsis?: string;
};

type TruncateProps = {
  text: string;
  maxLength?: number;
  options?: TruncateOptionsT;
};

/**
 * Truncates text based on length and position.
 */
export const truncateText = ({ text, maxLength = 20, options }: TruncateProps): string => {
  const { position = 'end', ellipsis = '...' } = { ...options };

  const ellipsisLength = ellipsis.length;
  const displayLength = maxLength - ellipsisLength;

  if (text.length <= maxLength) return text;
  if (displayLength <= 0) return ellipsis;

  const half = Math.floor(displayLength / 2);

  switch (position) {
    case 'start':
      return ellipsis + text.slice(-displayLength);
    case 'middle':
      return text.slice(0, half) + ellipsis + text.slice(-half);
    case 'end':
    default:
      return text.slice(0, displayLength) + ellipsis;
  }
};
