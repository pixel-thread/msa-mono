import React, { createContext, useContext, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@lib/cn';

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

const SkeletonContext = createContext<{ isLoading: boolean }>({ isLoading: false });

/**
 * Provider to manage the loading state for a branch of the UI tree.
 */
export const SkeletonProvider = ({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) => <SkeletonContext.Provider value={{ isLoading }}>{children}</SkeletonContext.Provider>;

export const useSkeleton = () => useContext(SkeletonContext);

/* -------------------------------------------------------------------------- */
/*                               Base Component                               */
/* -------------------------------------------------------------------------- */

interface SkeletonProps {
  /**
   * Tailwind class for dimensions and border radius.
   * Example: 'h-10 w-full '
   */
  className?: string;
  /**
   * Whether the pulse animation is active. Defaults to true.
   */
  animate?: boolean;
}

/**
 * A reusable Skeleton component for premium loading states.
 * Powered by React Native Reanimated for 60fps pulsing.
 */
export function Skeleton({ className, animate = true }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animate) {
      opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1, // Infinite loop
        true // Reverse each loop
      );
    } else {
      opacity.value = 1;
    }
  }, [animate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={cn('bg-muted', className)}
      style={animatedStyle}
      accessibilityLabel="Loading..."
      accessible={false}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                               Wrapper Item                                 */
/* -------------------------------------------------------------------------- */

interface SkeletonItemProps {
  children: React.ReactNode;
  /** Tailwind class for the skeleton shape (e.g., '') */
  className?: string;
  /** Optional container styles */
  containerClassName?: string;
}

/**
 * A wrapper that renders a Skeleton pulse over its children when the
 * SkeletonProvider is in the 'isLoading' state.
 */
export const SkeletonItem = ({ children, className, containerClassName }: SkeletonItemProps) => {
  const { isLoading } = useSkeleton();

  if (!isLoading) return <>{children}</>;

  return (
    <View className={cn('relative overflow-hidden ', containerClassName)}>
      {/* Visual content hidden to preserve exact layout dimensions */}
      <View className="opacity-0">{children}</View>
      <Skeleton className={cn('absolute inset-0', className)} />
    </View>
  );
};
