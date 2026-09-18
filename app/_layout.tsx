import '../global.css';

import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import {
  IBMPlexSansArabic_300Light,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Lalezar_400Regular } from '@expo-google-fonts/lalezar';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { env } from '@/lib/env';
import { queryClient, useAppStateFocus } from '@/lib/query/client';
import { enforceRtl } from '@/lib/rtl';

// على مستوى الوحدة عن قصد — لازم تشتغل مرة وحدة قبل أول render
enforceRtl();

// بنمسك شاشة البداية لحد ما تجهز الخطوط، وإلا بتومض النصوص بخط النظام
// (وهو خط لاتيني ما بيعرض العربي متل ما انتصمّم) قبل ما تنبدل
SplashScreen.preventAutoHideAsync().catch(() => {
  // بترمي لو انندهت مرتين — ما بتهم
});

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  // بدون هالحارس بيومض للمستخدم شاشة الدخول لحظة قبل ما Clerk يتعرّف على
  // جلسته المحفوظة بالـ tokenCache
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#F0434A" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  // بيربط AppState بـ focusManager — بدونه refetchOnWindowFocus ما إلها أثر بـ RN
  useAppStateFocus();

  // أسماء المفاتيح هون هي أسماء العائلات يلي بيتسجّلوا بالنظام، ولازم تطابق
  // حرفيًا يلي بـ tailwind.config.js تحت fontFamily
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_300Light,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
    // خط الشعار وحده — `font-logo` بـ tailwind.config.js
    Lalezar_400Regular,
  });

  useEffect(() => {
    // منكمّل حتى لو فشل تحميل الخط — تطبيق بخط النظام أحسن من شاشة بداية عالقة
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ClerkProvider
      publishableKey={env.CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
