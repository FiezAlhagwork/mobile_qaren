import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { clerkErrorMessage } from "@/lib/clerkError";

export default function SignUpScreen() {
  // واجهة الإشارات تبع @clerk/expo 4.x — `signUp.password()` بتعمل المحاولة
  // وبتحط كلمة السر بنداء واحد، والنداءات بترجّع `{ error }` بدل ما ترمي
  const { signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!signUp || busy) return;

    setError(null);
    setBusy(true);
    try {
      const created = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      if (created.error) {
        setError(clerkErrorMessage(created.error));
        return;
      }

      const sent = await signUp.verifications.sendEmailCode();
      if (sent.error) {
        setError(clerkErrorMessage(sent.error));
        return;
      }

      // محاولة التسجيل محفوظة بعميل Clerk نفسه، فشاشة التحقق بتكمّلها
      // بدون ما نمرّر إشي بالمسار
      router.push("/verify");
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = email.trim().length > 0 && password.length >= 8;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-[30px] pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <Logo className="mb-4" />

          <Text className="mb-2 font-bold text-[25px] leading-[36px] text-tx text-right">
            أنشئ حسابك
          </Text>
          <Text className="mb-7 font-sans text-[13.5px] leading-[24px] text-muted text-right">
            حساب واحد يكفي لمتابعة أسعار كل أجهزتك ومراقبتها يوميًا.
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
            autoComplete="new-password"
            textContentType="newPassword"
            ltr
            error={
              password.length > 0 && password.length < 8
                ? "لازم 8 محارف على الأقل."
                : null
            }
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
            label="تابع"
            onPress={onSubmit}
            loading={busy}
            disabled={!canSubmit || !signUp}
          />

          <View className="mt-7 flex-row items-center justify-center gap-1.5">
            <Text className="font-sans text-[12.5px] text-muted">
              عندك حساب؟
            </Text>
            <Link
              href="/sign-in"
              className="font-semibold text-[12.5px] text-brand"
            >
              سجّل دخولك
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
