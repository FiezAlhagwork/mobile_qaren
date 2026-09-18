import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

/** السطح الأساسي بالتصميم: أبيض، حد بلون `line`، نصف قطر 18–20 */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      className={`rounded-panel border border-line bg-card ${className}`}
    >
      {children}
    </View>
  );
}
