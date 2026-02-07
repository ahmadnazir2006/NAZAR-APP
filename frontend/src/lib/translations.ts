export type Language = "en" | "ur" | "hi" | "ar"

export const translations: Record<
  Language,
  {
    tapToSee: string
    exitConfirm: string
    exit: string
    close: string
    settings: string
    holdToSee: string
    releaseToHide: string
    cameraError: string
    allowCamera: string
    language: string
    navMode: string
    readMode: string
    moneyMode: string
    hazardMode: string
    sceneMode: string
  }
> = {
  en: {
    tapToSee: "Tap to see",
    exitConfirm: "Are you sure you want to exit?",
    exit: "Exit",
    close: "Close",
    settings: "Settings",
    holdToSee: "Hold to see",
    releaseToHide: "Release to hide",
    cameraError: "Camera access denied",
    allowCamera: "Please allow camera access",
    language: "Language",
    navMode: "Navigation Mode",
    readMode: "Reading Mode",
    moneyMode: "Currency Mode",
    hazardMode: "Safety Mode",
    sceneMode: "Scene Mode",
  },
  ur: {
    tapToSee: "دیکھنے کے لیے ٹیپ کریں",
    exitConfirm: "کیا آپ واقعی باہر نکلنا چاہتے ہیں؟",
    exit: "باہر نکلیں",
    close: "بند کریں",
    settings: "ترتیبات",
    holdToSee: "دیکھنے کے لیے پکڑیں",
    releaseToHide: "چھپانے کے لیے چھوڑیں",
    cameraError: "کیمرہ دستیاب نہیں ہے",
    allowCamera: "کیمرہ کی اجازت دیں",
    language: "زبان",
    navMode: "راستہ بتانے والا موڈ",
    readMode: "پڑھنے والا موڈ",
    moneyMode: "پیسے پہچاننے والا موڈ",
    hazardMode: "خطرہ بتانے والا موڈ",
    sceneMode: "منظر بتانے والا موڈ",
  },
  hi: {
    tapToSee: "देखने के लिए टैप करें",
    exitConfirm: "क्या आप बाहर निकलना चाहते हैं?",
    exit: "बाहर निकलें",
    close: "बंद करें",
    settings: "सेटिंग्स",
    holdToSee: "देखने के लिए दबाकर रखें",
    releaseToHide: "छिपने के लिए छोड़ें",
    cameraError: "कैमरा उपलब्ध नहीं है",
    allowCamera: "कैमरा एक्सेस की अनुमति दें",
    language: "भाषा",
    navMode: "नेविगेशन मोड",
    readMode: "रीडिंग मोड",
    moneyMode: "मुद्रा मोड",
    hazardMode: "सुरक्षा मोड",
    sceneMode: "दृश्य मोड",
  },
  ar: {
    tapToSee: "انقر للرؤية",
    exitConfirm: "هل أنت متأكد من الخروج؟",
    exit: "خروج",
    close: "إغلاق",
    settings: "الإعدادات",
    holdToSee: "استمر بالضغط للرؤية",
    releaseToHide: "اترك للإخفاء",
    cameraError: "الكاميرا غير متوفرة",
    allowCamera: "يرجى السماح بالوصول للكاميرا",
    language: "اللغة",
    navMode: "وضع التنقل",
    readMode: "وضع القراءة",
    moneyMode: "وضع العملة",
    hazardMode: "وضع السلامة",
    sceneMode: "وضع المشهد",
  },
}