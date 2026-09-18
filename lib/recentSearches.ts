import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'qaren.recentSearches';
const MAX = 8;

/**
 * آخر البحثات — محلية بالكامل.
 *
 * ما في endpoint للبحثات السابقة بالباك إند، والتصميم بيعرضها كـ chips.
 * AsyncStorage مناسبة هون: بيانات غير حساسة، وضياعها ما بيكسر إشي.
 * (`expo-secure-store` محجوزة لتوكن Clerk.)
 */
export async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // تخزين معطوب أو JSON مش صالح — نبلّش من الصفر بدل ما نكسر الشاشة
    return [];
  }
}

/** بيرجّع القائمة الجديدة عشان الشاشة تحدّث حالتها بلا قراءة تانية */
export async function pushRecentSearch(term: string): Promise<string[]> {
  const trimmed = term.trim();
  if (!trimmed) return loadRecentSearches();

  const current = await loadRecentSearches();
  // المصطلح المكرر بيطلع لفوق بدل ما ينضاف مرتين
  const next = [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, MAX);

  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // فشل الحفظ ما بيمنع البحث — الجلسة الحالية بتشتغل عادي
  }

  return next;
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ما بيهم
  }
}
