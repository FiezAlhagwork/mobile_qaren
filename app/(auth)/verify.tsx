import { useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { clerkErrorMessage } from '@/lib/clerkError';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // البريد يلي انبعتلو الكود — جاي من محاولة التسجيل المحفوظة بعميل Clerk
  const address = signUp?.emailAddress ?? null;

  const onVerify = async () => {
    if (!signUp || busy) return;

    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const attempt = await signUp.verifications.verifyEmailCode({ code });
      if (attempt.error) {
        setError(clerkErrorMessage(attempt.error));
        return;
      }

      if (signUp.status !== 'complete') {
        setError('ما اكتمل التحقق. جرّب كود جديد.');
        return;
      }

      // بمجرد تفعيل الجلسة، حارس app/_layout.tsx بينقل المستخدم لمجموعة (app)
      const finalized = await signUp.finalize();
      if (finalized.error) setError(clerkErrorMessage(finalized.error));
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    if (!signUp || busy) return;

    setError(null);
    try {
      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) {
        setError(clerkErrorMessage(sent.error));
        return;
      }
      setNotice('بعتنالك كود جديد.');
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-[30px] pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <Logo className="mb-9" />

          <Text className="mb-2 font-bold text-[25px] leading-[36px] text-tx">
            أكّد بريدك
          </Text>
          <Text className="mb-7 font-sans text-[13.5px] leading-[24px] text-muted">
            بعتنا كود من {CODE_LENGTH} أرقام
            {address ? ` على ${address}` : ''}. اكتبو هون لتفعيل حسابك.
          </Text>

          <Input
            label="كود التحقق"
            value={code}
            onChangeText={(next) => setCode(next.replace(/[^\d]/g, ''))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
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

          {notice ? (
            <View className="mb-4 rounded-field bg-ok-bg px-4 py-3">
              <Text className="font-medium text-[12.5px] text-ok">{notice}</Text>
            </View>
          ) : null}

          <Button
            label="فعّل حسابي"
            onPress={onVerify}
            loading={busy}
            disabled={code.length !== CODE_LENGTH || !signUp}
          />

          <View className="mt-6 flex-row items-center justify-center gap-4">
            <Pressable onPress={onResend} hitSlop={8}>
              <Text className="font-semibold text-[12.5px] text-brand">
                ابعت الكود مرة تانية
              </Text>
            </Pressable>
            <View className="h-3 w-px bg-line" />
            <Pressable onPress={() => router.replace('/sign-up')} hitSlop={8}>
              <Text className="font-semibold text-[12.5px] text-muted">
                غيّر البريد
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
