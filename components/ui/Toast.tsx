import { Ionicons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Text, View } from 'react-native';

/** نفس المدة يلي بالنموذج التفاعلي تبع التصميم */
const VISIBLE_MS = 2600;

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * التوست لازم يعيش **فوق** الشاشات مش جواتها: التصميم بيعرضه بعد تأكيد
 * المراقبة، وبنفس اللحظة بينتقل المستخدم من `watch-add` لـ `watchlist`.
 * لو كان جوا الشاشة، بيروح معها.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
  }, []);

  useEffect(() => {
    if (!message) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    timer.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setMessage(null));
    }, VISIBLE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [message, opacity]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {message ? (
        <Animated.View
          pointerEvents="none"
          style={{
            opacity,
            transform: [
              { translateY: opacity.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
            ],
          }}
          className="absolute bottom-24 left-5 right-5 z-50 flex-row items-center gap-3 rounded-card bg-ink px-4 py-3.5"
        >
          <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-ok">
            <Ionicons name="checkmark" size={13} color="#FFFFFF" />
          </View>
          <Text className="flex-1 font-medium text-[12.5px] text-white">{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast لازم تكون جوا ToastProvider');
  return ctx;
}
