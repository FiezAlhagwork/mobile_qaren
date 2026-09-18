/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  // 🔴 مقصودة. بـ React Native `fontWeight` ما بيبدّل الخط المخصّص — كل وزن
  // لازم يكون عائلة مستقلة باسمها (خصوصًا على أندرويد جوا Expo Go). ولو تركنا
  // هالإضافة شغّالة، `font-bold` بتتولّد من إضافتين — fontFamily وfontWeight —
  // وإضافة الوزن بتغلب، فبيرجع fontWeight:700 على خط ما إلو وزن سميك، يعني
  // ولا فرق بصري. بتعطيلها، `font-bold` بتعني «عائلة Bold» وهو المطلوب فعليًا.
  corePlugins: { fontWeight: false },

  theme: {
    extend: {
      fontFamily: {
        light: ["IBMPlexSansArabic_300Light"],
        sans: ["IBMPlexSansArabic_400Regular"],
        medium: ["IBMPlexSansArabic_500Medium"],
        semibold: ["IBMPlexSansArabic_600SemiBold"],
        bold: ["IBMPlexSansArabic_700Bold"],

        // للشعار وحده. خط عرضي ما إلو إلا وزن واحد، وما بينستعمل بأي نص تاني
        logo: ["Lalezar_400Regular"],
      },

   
      
      colors: {
        brand: {
          DEFAULT: "#F0434A",
          dark: "#DC343B", // حالة الضغط
          link: "#C9333A",
        },
        ok: { DEFAULT: "#1BA672", bg: "#E7F7F0" }, // نزول السعر وتحقق الهدف
        warn: "#F5A623", // توصية «استنّى» والتقييم
        ink: "#1D2027", // البطاقة الداكنة والتوست

        bg: "#F6F6F8",
        card: "#FFFFFF",
        tx: "#14151A",
        muted: "#7C808C",
        faint: "#9A9DA8", // نص ثانوي أفتح من muted
        line: "#EDEDF2",
        chip: "#F2F2F6",
        tint: "#FDECEC", // خلفية حمرا خفيفة
        ph: "#ECECF1", // مربّعات الصور المخطّطة
      },

      borderRadius: {
        field: "14px",
        input: "15px",
        btn: "17px",
        card: "18px",
        panel: "20px",
        pill: "20px",
        hero: "22px",
      },
    },
  },
  plugins: [],
};
