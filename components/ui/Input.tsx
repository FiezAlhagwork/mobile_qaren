import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /**
   * رسالة خطأ للحقل. بتوصل جاهزة من `ApiError.fieldErrors` — `errors.ts`
   * أصلاً بيفكّ أخطاء zod (يلي بتوصل كنص JSON جوا `message`) لخريطة حقول.
   */
  error?: string | null;
  /** إيميل، كلمة سر، أو رقم — محتوى لاتيني لازم يضل LTR جوا واجهة RTL */
  ltr?: boolean;
  className?: string;
}

export function Input({
  label,
  error,
  ltr = false,
  className = '',
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  // الخطأ بيغلب التركيز: المستخدم لازم يشوف إنه الحقل غلط حتى وهو فيه
  const borderClass = error
    ? 'border-brand'
    : focused
      ? 'border-brand'
      : 'border-line';

  return (
    <View className={className}>
      {label ? (
        <Text className="mb-2 font-semibold text-[12.5px] text-tx">{label}</Text>
      ) : null}

      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor="#9A9DA8"
        style={ltr ? { writingDirection: 'ltr', textAlign: 'left' } : undefined}
        className={`rounded-input border bg-card px-4 py-[15px] font-sans text-[14px] text-tx ${borderClass}`}
      />

      {error ? (
        <Text className="mt-1.5 font-sans text-[11.5px] text-brand">{error}</Text>
      ) : null}
    </View>
  );
}
