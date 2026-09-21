import { useSignIn } from '@clerk/expo';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { clerkErrorMessage } from '@/lib/clerkError';

export default function SignInScreen() {
  // @clerk/expo 4.x بيستخدم واجهة الإشارات: الـ hook بيرجّع مورد `signIn`
  // (ممكن يكون null قبل ما يجهز العميل)، والنداءات بترجّع `{ error }` بدل
  // ما ترمي، والجلسة بتنفعّل بـ `finalize()` مش `setActive()`
  const { signIn } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!signIn || busy) return;

    setError(null);
    setBusy(true);
    try {
      const attempt = await signIn.password({
        identifier: email.trim(),
        password,
      });

      if (attempt.error) {
        setError(clerkErrorMessage(attempt.error));
        return;
      }

      if (signIn.status !== 'complete') {
        setError('حسابك بدو خطوة تحقق إضافية مش مدعومة حاليًا.');
        return;
      }

      // ما في router.replace هون عن قصد: الحارس بـ app/_layout.tsx بيراقب
      // isSignedIn وبيبدّل مجموعة المسارات لحالو أول ما تنفعّل الجلسة
      const finalized = await signIn.finalize();
      if (finalized.error) setError(clerkErrorMessage(finalized.error));
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar barStyle="dark-content"/>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-[30px] pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <Logo className="mb-4" />

          <Text className="mb-2 font-bold text-[25px] leading-[36px] text-tx text-right">
            أهلاً فيك مرة تانية
          </Text>
          <Text className="mb-7 font-sans text-[13.5px] leading-[24px] text-muted text-right">
            سجّل دخولك لتتابع أسعار أجهزتك وقائمة المراقبة.
          </Text>

        
          <Input
            label="البريد الإلكتروني"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            ltr
            className="mb-[18px]"
          />

          <Input
            label="كلمة السر"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            ltr
            className="mb-6"
          />

          {error ? (
            <View className="mb-4 rounded-field border border-brand/30 bg-tint px-4 py-3">
              <Text className="font-medium text-[12.5px] leading-[21px] text-brand">
                {error}
              </Text>
            </View>
          ) : null}

          <Button
            label="تسجيل الدخول"
            onPress={onSubmit}
            loading={busy}
            disabled={!canSubmit || !signIn}
          />

          <View className="mt-7 flex-row items-center justify-center gap-1.5">
            <Text className="font-sans text-[12.5px] text-muted">ما عندك حساب؟</Text>
            <Link href="/sign-up" className="font-semibold text-[12.5px] text-brand">
              أنشئ حساب
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
