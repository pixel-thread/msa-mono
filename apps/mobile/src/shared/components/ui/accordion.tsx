import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@lib/cn';

const AccordionContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

export const Accordion = ({
  children,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) => {
  const [internalValue, setInternalValue] = React.useState('');

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const onValueChange =
    controlledOnValueChange !== undefined ? controlledOnValueChange : setInternalValue;

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <View className={cn('w-full', className)}>{children}</View>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({
  children,
  value: itemValue,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) => {
  const { value: activeValue } = React.useContext(AccordionContext);
  const isOpen = activeValue === itemValue;

  return (
    <View className={cn('border-b border-border', className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { isOpen, value: itemValue })
          : child
      )}
    </View>
  );
};

export const AccordionTrigger = ({
  children,
  isOpen,
  value: itemValue,
  className,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  value?: string;
  className?: string;
}) => {
  const { onValueChange, value: activeValue } = React.useContext(AccordionContext);

  const rotation = useDerivedValue(() => {
    return withTiming(isOpen ? 180 : 0, { duration: 300 });
  });

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (onValueChange && itemValue) {
          onValueChange(activeValue === itemValue ? '' : itemValue);
        }
      }}
      className={cn('flex-row items-center justify-between py-4', className)}>
      <View className="flex-1">{children}</View>
      <Animated.View style={arrowStyle}>
        <Ionicons name="chevron-down" size={18} color="#7c828a" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const AccordionContent = ({
  children,
  isOpen,
  className,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}) => {
  const heightValue = useSharedValue(0);
  const measuredHeight = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: withTiming(isOpen ? 1 : 0, { duration: 200 }),
    overflow: 'hidden',
  }));

  React.useEffect(() => {
    if (isOpen) {
      heightValue.value = withTiming(measuredHeight.value, { duration: 300 });
    } else {
      heightValue.value = withTiming(0, { duration: 250 });
    }
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <Animated.View style={animatedStyle}>
      <View
        onLayout={(e) => {
          measuredHeight.value = e.nativeEvent.layout.height;
          if (isOpen) {
            heightValue.value = withTiming(e.nativeEvent.layout.height, { duration: 300 });
          }
        }}
        className={cn('pb-4 pt-0', className)}
        style={{ position: 'absolute', width: '100%' }}>
        {children}
      </View>
    </Animated.View>
  );
};
