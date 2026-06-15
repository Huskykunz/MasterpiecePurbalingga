import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";

interface CustomerProfile {
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  engineCC?: string;
  usage?: string;
  soundPreference?: string;
  budget?: string;
  customRequest?: boolean;
  material?: string;
  performanceGoal?: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Halo! Selamat datang di Masterpiece Purbalingga Exhaust Shop. Ada yang bisa saya bantu?", isBot: true },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"id" | "en">("id");
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({});
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [lastResponseType, setLastResponseType] = useState<string>("");

  const detectLanguage = (text: string): "id" | "en" => {
    // Common Indonesian words and particles
    const indonesianIndicators = [
      "yang", "untuk", "saya", "apa", "ini", "itu", "dengan", "dari", "ke", "di",
      "ada", "tidak", "atau", "dan", "bisa", "mau", "harga", "knalpot", "motor",
      "berapa", "dimana", "bagaimana", "kenapa", "kapan", "siapa", "sudah", "akan",
      "sedang", "telah", "adalah", "juga", "kalau", "tapi", "namun", "jadi", "makanya"
    ];

    // Common English words
    const englishIndicators = [
      "the", "is", "are", "was", "were", "have", "has", "had", "do", "does",
      "did", "will", "would", "could", "should", "can", "may", "might", "must",
      "what", "where", "when", "why", "how", "who", "which", "this", "that",
      "these", "those", "for", "with", "from", "about", "price", "exhaust"
    ];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let indonesianScore = 0;
    let englishScore = 0;

    words.forEach((word) => {
      if (indonesianIndicators.includes(word)) indonesianScore++;
      if (englishIndicators.includes(word)) englishScore++;
    });

    // If mixed or unclear, maintain current language preference
    if (indonesianScore === englishScore) {
      return preferredLanguage;
    }

    return indonesianScore > englishScore ? "id" : "en";
  };

  const extractCustomerInfo = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const newProfile = { ...customerProfile };

    // Extract vehicle brand
    const brands = ["yamaha", "honda", "kawasaki", "suzuki", "ducati", "ktm", "bmw", "harley"];
    brands.forEach((brand) => {
      if (lowerMessage.includes(brand)) {
        newProfile.vehicleBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    });

    // Extract vehicle model
    const models = ["nmax", "pcx", "vario", "beat", "scoopy", "r15", "cbr", "ninja", "gsx", "vixion"];
    models.forEach((model) => {
      if (lowerMessage.includes(model)) {
        newProfile.vehicleModel = model.toUpperCase();
      }
    });

    // Extract year
    const yearMatch = message.match(/20\d{2}/);
    if (yearMatch) {
      newProfile.vehicleYear = yearMatch[0];
    }

    // Extract CC
    const ccMatch = message.match(/(\d+)\s*cc/i);
    if (ccMatch) {
      newProfile.engineCC = ccMatch[1] + "cc";
    }

    // Extract usage
    if (lowerMessage.includes("harian") || lowerMessage.includes("daily") || lowerMessage.includes("commute")) {
      newProfile.usage = preferredLanguage === "id" ? "Harian" : "Daily commute";
    } else if (lowerMessage.includes("racing") || lowerMessage.includes("balap")) {
      newProfile.usage = preferredLanguage === "id" ? "Racing" : "Racing";
    } else if (lowerMessage.includes("touring")) {
      newProfile.usage = "Touring";
    }

    // Extract sound preference
    if (lowerMessage.includes("loud") || lowerMessage.includes("keras") || lowerMessage.includes("ngebass")) {
      newProfile.soundPreference = preferredLanguage === "id" ? "Loud/Ngebass" : "Loud";
    } else if (lowerMessage.includes("quiet") || lowerMessage.includes("halus") || lowerMessage.includes("pelan")) {
      newProfile.soundPreference = preferredLanguage === "id" ? "Halus" : "Quiet";
    } else if (lowerMessage.includes("sporty") || lowerMessage.includes("sedang")) {
      newProfile.soundPreference = preferredLanguage === "id" ? "Sporty" : "Sporty";
    }

    // Detect custom request
    if (lowerMessage.includes("custom") || lowerMessage.includes("bikin") || lowerMessage.includes("pesan")) {
      newProfile.customRequest = true;
    }

    setCustomerProfile(newProfile);
    return newProfile;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Detect language from user message
    const detectedLang = detectLanguage(inputMessage);
    setPreferredLanguage(detectedLang);

    // Extract customer information
    const updatedProfile = extractCustomerInfo(inputMessage);

    // Add to conversation context
    setConversationContext([...conversationContext, inputMessage.toLowerCase()]);

    const userMessage = { text: inputMessage, isBot: false };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage, detectedLang, updatedProfile);
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    }, 800);

    setInputMessage("");
  };

  const getVariedOpening = (language: "id" | "en", type: string): string => {
    const openings = {
      general: {
        id: ["Baik, saya mengerti.", "Terima kasih atas informasinya.", "Oke, mari saya bantu.", "Sip, saya paham."],
        en: ["I understand.", "Got it, thanks.", "Alright, let me help.", "Okay, I see."],
      },
      recommendation: {
        id: ["Berdasarkan kebutuhan Anda,", "Untuk kasus Anda,", "Saya punya beberapa saran,", "Mari saya rekomendasikan,"],
        en: ["Based on your needs,", "For your case,", "I have some suggestions,", "Let me recommend,"],
      },
      question: {
        id: ["Boleh saya tahu,", "Untuk memberikan saran terbaik,", "Supaya lebih tepat,", "Saya perlu tahu,"],
        en: ["May I know,", "To give the best advice,", "For better accuracy,", "I need to know,"],
      },
    };

    const pool = openings[type as keyof typeof openings]?.[language] || openings.general[language];
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  const generateBotResponse = (message: string, language: "id" | "en", profile: CustomerProfile): string => {
    const lowerMessage = message.toLowerCase();
    const opening = getVariedOpening(language, "general");

    // CUSTOM EXHAUST REQUEST HANDLING
    if (profile.customRequest || lowerMessage.includes("custom") || lowerMessage.includes("bikin") || lowerMessage.includes("pesan khusus")) {
      setLastResponseType("custom");

      const missingInfo = [];
      if (!profile.vehicleBrand) missingInfo.push(language === "id" ? "merek motor" : "vehicle brand");
      if (!profile.vehicleModel) missingInfo.push(language === "id" ? "model motor" : "vehicle model");
      if (!profile.soundPreference) missingInfo.push(language === "id" ? "preferensi suara" : "sound preference");
      if (!profile.material) missingInfo.push(language === "id" ? "material" : "material");

      if (missingInfo.length > 0) {
        if (language === "id") {
          return `${opening} Saya siap membantu Anda membuat knalpot custom!\n\n` +
            `Saya sudah mencatat:\n` +
            `${profile.vehicleBrand ? `✓ Motor: ${profile.vehicleBrand} ${profile.vehicleModel || ""}` : ""}\n` +
            `${profile.soundPreference ? `✓ Suara: ${profile.soundPreference}` : ""}\n\n` +
            `Untuk melanjutkan, saya perlu informasi:\n` +
            `${missingInfo.map((info) => `• ${info}`).join("\n")}\n\n` +
            `Bisa tolong sebutkan ${missingInfo[0]}nya?`;
        } else {
          return `${opening} I'm ready to help you create a custom exhaust!\n\n` +
            `I've noted:\n` +
            `${profile.vehicleBrand ? `✓ Vehicle: ${profile.vehicleBrand} ${profile.vehicleModel || ""}` : ""}\n` +
            `${profile.soundPreference ? `✓ Sound: ${profile.soundPreference}` : ""}\n\n` +
            `To proceed, I need:\n` +
            `${missingInfo.map((info) => `• ${info}`).join("\n")}\n\n` +
            `Could you tell me the ${missingInfo[0]}?`;
        }
      } else {
        if (language === "id") {
          return `Sempurna! Berdasarkan informasi Anda:\n\n` +
            `📋 Ringkasan Kebutuhan Custom:\n` +
            `• Kendaraan: ${profile.vehicleBrand} ${profile.vehicleModel}\n` +
            `• Suara: ${profile.soundPreference}\n` +
            `• Material: ${profile.material || "Stainless Steel (recommended)"}\n` +
            `• Penggunaan: ${profile.usage || "Daily use"}\n\n` +
            `💡 Rekomendasi Saya:\n` +
            `Untuk motor Anda, saya sarankan sistem knalpot dengan:\n` +
            `- Material stainless steel 304 (tahan karat, awet)\n` +
            `- Diameter pipa disesuaikan dengan CC motor\n` +
            `- Sound chamber custom untuk karakter suara yang Anda inginkan\n\n` +
            `📞 Langkah selanjutnya:\n` +
            `Tim kami akan menghubungi Anda untuk konsultasi detail dan penawaran harga. Apakah ada detail spesifik lain yang ingin Anda tambahkan?`;
        } else {
          return `Perfect! Based on your information:\n\n` +
            `📋 Custom Requirements Summary:\n` +
            `• Vehicle: ${profile.vehicleBrand} ${profile.vehicleModel}\n` +
            `• Sound: ${profile.soundPreference}\n` +
            `• Material: ${profile.material || "Stainless Steel (recommended)"}\n` +
            `• Usage: ${profile.usage || "Daily use"}\n\n` +
            `💡 My Recommendation:\n` +
            `For your motorcycle, I suggest an exhaust system with:\n` +
            `- 304 stainless steel material (rust-proof, durable)\n` +
            `- Pipe diameter matched to engine CC\n` +
            `- Custom sound chamber for your desired sound character\n\n` +
            `📞 Next Steps:\n` +
            `Our team will contact you for detailed consultation and pricing. Any other specific details you'd like to add?`;
        }
      }
    }

    // RECOMMENDATION REQUEST
    if (
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("rekomendasi") ||
      lowerMessage.includes("cocok") ||
      lowerMessage.includes("bagus") ||
      lowerMessage.includes("suggest") ||
      lowerMessage.includes("saran")
    ) {
      setLastResponseType("recommendation");

      // Check if we have enough info
      if (!profile.vehicleBrand && !profile.vehicleModel) {
        if (language === "id") {
          return `${getVariedOpening(language, "question")} motor apa yang Anda pakai?\n\n` +
            `Contoh: "Yamaha NMAX 2023" atau "Honda CBR150R"\n\n` +
            `Informasi ini penting karena setiap motor punya karakteristik mesin berbeda yang mempengaruhi pemilihan knalpot.`;
        } else {
          return `${getVariedOpening(language, "question")} which motorcycle do you ride?\n\n` +
            `Example: "Yamaha NMAX 2023" or "Honda CBR150R"\n\n` +
            `This info is important as each bike has different engine characteristics affecting exhaust selection.`;
        }
      }

      if (!profile.soundPreference && !profile.usage) {
        if (language === "id") {
          return `${opening} Untuk motor ${profile.vehicleBrand} ${profile.vehicleModel}, saya punya beberapa opsi bagus.\n\n` +
            `Tapi pertama, tolong pilih:\n\n` +
            `🔊 Preferensi Suara:\n` +
            `1. Halus/Quiet - Suara dalam, tidak terlalu loud\n` +
            `2. Sporty - Suara sedang, karakter racing\n` +
            `3. Loud - Suara keras, ngebass maksimal\n\n` +
            `Dan penggunaan utama:\n` +
            `• Harian (city riding)\n` +
            `• Touring (jarak jauh)\n` +
            `• Racing/Track day\n\n` +
            `Anda prefer yang mana?`;
        } else {
          return `${opening} For your ${profile.vehicleBrand} ${profile.vehicleModel}, I have some great options.\n\n` +
            `But first, please choose:\n\n` +
            `🔊 Sound Preference:\n` +
            `1. Quiet - Deep sound, not too loud\n` +
            `2. Sporty - Moderate sound, racing character\n` +
            `3. Loud - Loud sound, maximum bass\n\n` +
            `And primary use:\n` +
            `• Daily (city riding)\n` +
            `• Touring (long distance)\n` +
            `• Racing/Track day\n\n` +
            `Which do you prefer?`;
        }
      }

      // We have enough info, provide recommendation
      if (language === "id") {
        return `${getVariedOpening(language, "recommendation")} berdasarkan profil motor Anda:\n\n` +
          `🏍️ ${profile.vehicleBrand} ${profile.vehicleModel}\n` +
          `📊 Penggunaan: ${profile.usage || "Harian"}\n` +
          `🔊 Suara: ${profile.soundPreference || "Sporty"}\n\n` +
          `✅ Rekomendasi Utama:\n\n` +
          `1️⃣ Racing Exhaust Pro - Rp 450.000\n` +
          `   • Dual tip stainless steel\n` +
          `   • Suara sporty deep\n` +
          `   • Cocok untuk ${profile.usage || "harian & touring"}\n` +
          `   • Material tahan karat, lifetime warranty\n\n` +
          `2️⃣ Carbon Fiber Sport - Rp 380.000\n` +
          `   • Ultra ringan, carbon fiber body\n` +
          `   • Suara racing khas\n` +
          `   • Performa handling lebih responsif\n` +
          `   • Aesthetic premium\n\n` +
          `💡 Kenapa cocok untuk motor Anda?\n` +
          `Motor ${profile.vehicleBrand} ${profile.vehicleModel} punya karakteristik mesin yang responsif. Kedua knalpot ini dirancang untuk:\n` +
          `- Meningkatkan exhaust flow tanpa mengorbankan torsi\n` +
          `- Memberikan sound character yang Anda cari\n` +
          `- Material tahan lama untuk penggunaan ${profile.usage || "harian"}\n\n` +
          `Mana yang lebih menarik untuk Anda?`;
      } else {
        return `${getVariedOpening(language, "recommendation")} based on your motorcycle profile:\n\n` +
          `🏍️ ${profile.vehicleBrand} ${profile.vehicleModel}\n` +
          `📊 Usage: ${profile.usage || "Daily"}\n` +
          `🔊 Sound: ${profile.soundPreference || "Sporty"}\n\n` +
          `✅ Primary Recommendations:\n\n` +
          `1️⃣ Racing Exhaust Pro - Rp 450,000\n` +
          `   • Dual tip stainless steel\n` +
          `   • Deep sporty sound\n` +
          `   • Perfect for ${profile.usage || "daily & touring"}\n` +
          `   • Rust-proof material, lifetime warranty\n\n` +
          `2️⃣ Carbon Fiber Sport - Rp 380,000\n` +
          `   • Ultra lightweight, carbon fiber body\n` +
          `   • Distinctive racing sound\n` +
          `   • More responsive handling performance\n` +
          `   • Premium aesthetics\n\n` +
          `💡 Why perfect for your bike?\n` +
          `The ${profile.vehicleBrand} ${profile.vehicleModel} has responsive engine characteristics. Both exhausts are designed to:\n` +
          `- Improve exhaust flow without sacrificing torque\n` +
          `- Deliver the sound character you seek\n` +
          `- Durable materials for ${profile.usage || "daily"} use\n\n` +
          `Which one interests you more?`;
      }
    }

    // PRICE INQUIRY
    if (lowerMessage.includes("price") || lowerMessage.includes("harga") || lowerMessage.includes("berapa")) {
      setLastResponseType("price");
      const variations = language === "id"
        ? [
            `Harga knalpot kami mulai dari Rp 200.000 hingga Rp 500.000, tergantung material dan tipe.\n\n` +
            `💰 Range Harga:\n` +
            `• Entry Level: Rp 200.000 - Rp 300.000\n` +
            `• Mid Range: Rp 300.000 - Rp 400.000\n` +
            `• Premium: Rp 400.000 - Rp 500.000\n\n` +
            `Kalau saya tahu motor Anda, saya bisa kasih rekomendasi yang lebih spesifik. Motor apa yang Anda pakai?`,

            `Kami punya berbagai pilihan harga sesuai budget Anda:\n\n` +
            `Budget-friendly (Rp 200k - 300k): Stainless steel standard, suara bagus, tahan lama\n` +
            `Mid-range (Rp 300k - 400k): Material upgrade, dual tip, sound tuning\n` +
            `Premium (Rp 400k+): Carbon fiber, titanium coating, racing grade\n\n` +
            `Berapa budget Anda? Atau mau saya rekomendasikan berdasarkan motor Anda?`,
          ]
        : [
            `Our exhaust prices range from Rp 200,000 to Rp 500,000, depending on material and type.\n\n` +
            `💰 Price Range:\n` +
            `• Entry Level: Rp 200,000 - Rp 300,000\n` +
            `• Mid Range: Rp 300,000 - Rp 400,000\n` +
            `• Premium: Rp 400,000 - Rp 500,000\n\n` +
            `If I know your bike, I can give more specific recommendations. Which motorcycle do you ride?`,

            `We have various price options to fit your budget:\n\n` +
            `Budget-friendly (Rp 200k - 300k): Standard stainless steel, good sound, durable\n` +
            `Mid-range (Rp 300k - 400k): Upgraded materials, dual tip, sound tuning\n` +
            `Premium (Rp 400k+): Carbon fiber, titanium coating, racing grade\n\n` +
            `What's your budget? Or shall I recommend based on your motorcycle?`,
          ];

      return variations[Math.floor(Math.random() * variations.length)];
    }

    // SHIPPING/DELIVERY
    if (lowerMessage.includes("shipping") || lowerMessage.includes("pengiriman") || lowerMessage.includes("ongkir") || lowerMessage.includes("kirim")) {
      setLastResponseType("shipping");
      if (language === "id") {
        return `${opening} Untuk pengiriman:\n\n` +
          `✅ GRATIS ONGKIR untuk pembelian di atas Rp 100.000\n` +
          `📦 Estimasi pengiriman: 3-5 hari kerja\n` +
          `🚚 Menggunakan JNE, J&T, atau SiCepat\n` +
          `📍 Pengiriman ke seluruh Indonesia\n\n` +
          `Produk dikemas dengan bubble wrap + kardus tebal untuk memastikan sampai dengan aman.\n\n` +
          `Sudah ada produk yang Anda minati?`;
      } else {
        return `${opening} For shipping:\n\n` +
          `✅ FREE SHIPPING for purchases above Rp 100,000\n` +
          `📦 Estimated delivery: 3-5 business days\n` +
          `🚚 Using JNE, J&T, or SiCepat\n` +
          `📍 Delivery across Indonesia\n\n` +
          `Products are packed with bubble wrap + thick cardboard to ensure safe arrival.\n\n` +
          `Have you found a product you're interested in?`;
      }
    }

    // INSTALLATION
    if (lowerMessage.includes("install") || lowerMessage.includes("pasang") || lowerMessage.includes("instalasi")) {
      setLastResponseType("installation");
      if (language === "id") {
        return `${opening} Untuk instalasi knalpot:\n\n` +
          `🔧 DIY (Pasang Sendiri):\n` +
          `Kami sertakan panduan instalasi lengkap dengan video tutorial. Rata-rata bisa selesai dalam 30-45 menit dengan tools standard.\n\n` +
          `👨‍🔧 Instalasi Profesional:\n` +
          `Kami bisa rekomendasikan bengkel mitra di kota Anda yang sudah berpengalaman. Biaya instalasi biasanya Rp 50.000 - Rp 100.000.\n\n` +
          `💡 Tips: Instalasi knalpot aftermarket relatif mudah. Yang penting pastikan gasket dan baut terpasang dengan benar untuk menghindari kebocoran.\n\n` +
          `Anda di kota mana? Saya bisa carikan bengkel rekanan terdekat.`;
      } else {
        return `${opening} For exhaust installation:\n\n` +
          `🔧 DIY (Self-Install):\n` +
          `We include complete installation guide with video tutorial. Average completion time is 30-45 minutes with standard tools.\n\n` +
          `👨‍🔧 Professional Installation:\n` +
          `We can recommend partner workshops in your city with experience. Installation cost usually Rp 50,000 - Rp 100,000.\n\n` +
          `💡 Tip: Aftermarket exhaust installation is relatively easy. Just ensure gasket and bolts are properly installed to avoid leaks.\n\n` +
          `Which city are you in? I can find the nearest partner workshop.`;
      }
    }

    // WARRANTY
    if (lowerMessage.includes("warranty") || lowerMessage.includes("garansi")) {
      setLastResponseType("warranty");
      if (language === "id") {
        return `${opening} Semua produk knalpot kami dilengkapi:\n\n` +
          `✅ Garansi 1 Tahun untuk cacat produksi\n` +
          `✅ Garansi material (anti karat untuk stainless steel)\n` +
          `✅ Free konsultasi seumur hidup\n\n` +
          `Garansi mencakup:\n` +
          `• Kebocoran dari sambungan pabrik\n` +
          `• Karat pada material stainless/titanium\n` +
          `• Kerusakan coating/finishing\n\n` +
          `Tidak mencakup:\n` +
          `• Kerusakan akibat kecelakaan\n` +
          `• Modifikasi oleh pihak ketiga\n` +
          `• Keausan normal akibat pemakaian\n\n` +
          `Klaim garansi sangat mudah, cukup hubungi kami dengan foto + bukti pembelian. Ada pertanyaan lain?`;
      } else {
        return `${opening} All our exhaust products come with:\n\n` +
          `✅ 1-Year warranty for manufacturing defects\n` +
          `✅ Material warranty (rust-proof for stainless steel)\n` +
          `✅ Lifetime free consultation\n\n` +
          `Warranty covers:\n` +
          `• Leaks from factory joints\n` +
          `• Rust on stainless/titanium material\n` +
          `• Coating/finishing damage\n\n` +
          `Does not cover:\n` +
          `• Damage from accidents\n` +
          `• Third-party modifications\n` +
          `• Normal wear from use\n\n` +
          `Warranty claims are easy, just contact us with photo + proof of purchase. Any other questions?`;
      }
    }

    // CONTACT
    if (lowerMessage.includes("contact") || lowerMessage.includes("hubungi") || lowerMessage.includes("telepon")) {
      setLastResponseType("contact");
      if (language === "id") {
        return `${opening} Anda bisa hubungi kami melalui:\n\n` +
          `📞 Telepon/WhatsApp: +62 812-3456-7890\n` +
          `📧 Email: info@masterpiecepbg.com\n` +
          `🕒 Jam Operasional: Senin-Sabtu, 09.00-18.00 WIB\n\n` +
          `Atau gunakan fitur chat ini untuk konsultasi langsung dengan saya. Saya siap membantu kapan saja!\n\n` +
          `Ada yang bisa saya bantu sekarang?`;
      } else {
        return `${opening} You can reach us through:\n\n` +
          `📞 Phone/WhatsApp: +62 812-3456-7890\n` +
          `📧 Email: info@masterpiecepbg.com\n` +
          `🕒 Operating Hours: Monday-Saturday, 9 AM - 6 PM WIB\n\n` +
          `Or use this chat feature for direct consultation with me. I'm ready to help anytime!\n\n` +
          `How can I assist you now?`;
      }
    }

    // BEST SELLERS
    if (lowerMessage.includes("terlaris") || lowerMessage.includes("populer") || lowerMessage.includes("best") || lowerMessage.includes("favorit")) {
      setLastResponseType("bestseller");
      if (language === "id") {
        return `Produk favorit pelanggan kami bulan ini:\n\n` +
          `🥇 Racing Exhaust Pro - Rp 450.000\n` +
          `   ⭐ 4.9/5.0 (127 reviews)\n` +
          `   Dual tip stainless, suara deep sporty, best seller untuk Yamaha NMAX & Honda PCX\n\n` +
          `🥈 Carbon Fiber Sport - Rp 380.000\n` +
          `   ⭐ 4.8/5.0 (98 reviews)\n` +
          `   Ultra ringan, cocok untuk motor sport 150-250cc, aesthetic racing\n\n` +
          `🥉 Titanium Blue Exhaust - Rp 420.000\n` +
          `   ⭐ 4.7/5.0 (85 reviews)\n` +
          `   Titanium coating, tahan panas, suara khas racing, tampilan elegan\n\n` +
          `Kenapa produk ini laris?\n` +
          `✓ Kualitas material premium\n` +
          `✓ Sound tuning sesuai karakter motor Indonesia\n` +
          `✓ Harga kompetitif\n` +
          `✓ After-sales support excellent\n\n` +
          `Motor Anda apa? Saya bisa kasih saran mana yang paling cocok.`;
      } else {
        return `Our customers' favorite products this month:\n\n` +
          `🥇 Racing Exhaust Pro - Rp 450,000\n` +
          `   ⭐ 4.9/5.0 (127 reviews)\n` +
          `   Dual tip stainless, deep sporty sound, best seller for Yamaha NMAX & Honda PCX\n\n` +
          `🥈 Carbon Fiber Sport - Rp 380,000\n` +
          `   ⭐ 4.8/5.0 (98 reviews)\n` +
          `   Ultra lightweight, perfect for 150-250cc sport bikes, racing aesthetics\n\n` +
          `🥉 Titanium Blue Exhaust - Rp 420,000\n` +
          `   ⭐ 4.7/5.0 (85 reviews)\n` +
          `   Titanium coating, heat resistant, distinctive racing sound, elegant look\n\n` +
          `Why are these popular?\n` +
          `✓ Premium material quality\n` +
          `✓ Sound tuning matched to Indonesian bikes\n` +
          `✓ Competitive pricing\n` +
          `✓ Excellent after-sales support\n\n` +
          `What's your bike? I can suggest which one fits best.`;
      }
    }

    // DEFAULT - CONVERSATIONAL
    if (language === "id") {
      const defaultResponses = [
        `Saya di sini sebagai ahli knalpot untuk membantu Anda memilih produk yang tepat.\n\n` +
        `Saya bisa bantu dengan:\n` +
        `🔍 Rekomendasi knalpot sesuai motor & kebutuhan Anda\n` +
        `🎨 Konsultasi pembuatan knalpot custom\n` +
        `💰 Info harga & promo\n` +
        `📦 Pengiriman & instalasi\n` +
        `⚙️ Spesifikasi teknis & performa\n\n` +
        `Motor apa yang Anda pakai? Atau mau langsung lihat produk terlaris kami?`,

        `Terima kasih sudah menghubungi kami!\n\n` +
        `Saya bisa membantu Anda menemukan knalpot yang sempurna untuk motor Anda. ` +
        `Setiap motor punya karakteristik unik, jadi penting untuk pilih knalpot yang pas.\n\n` +
        `Ceritakan sedikit tentang motor dan kebutuhan Anda, saya akan berikan rekomendasi terbaik!`,

        `Halo! Senang bisa bantu Anda hari ini.\n\n` +
        `Di Masterpiece Purbalingga, kami spesialis knalpot berkualitas untuk berbagai jenis motor. ` +
        `Dari knalpot harian yang halus, sampai racing yang ngebass - semua ada!\n\n` +
        `Apa yang Anda cari hari ini?`,
      ];
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    } else {
      const defaultResponses = [
        `I'm here as an exhaust expert to help you choose the right product.\n\n` +
        `I can help with:\n` +
        `🔍 Exhaust recommendations for your bike & needs\n` +
        `🎨 Custom exhaust consultation\n` +
        `💰 Pricing & promotions info\n` +
        `📦 Shipping & installation\n` +
        `⚙️ Technical specs & performance\n\n` +
        `Which bike do you ride? Or want to see our best sellers?`,

        `Thanks for reaching out!\n\n` +
        `I can help you find the perfect exhaust for your motorcycle. ` +
        `Every bike has unique characteristics, so it's important to choose the right exhaust.\n\n` +
        `Tell me a bit about your bike and needs, I'll give you the best recommendations!`,

        `Hello! Happy to assist you today.\n\n` +
        `At Masterpiece Purbalingga, we specialize in quality exhausts for all types of motorcycles. ` +
        `From quiet daily exhausts to loud racing ones - we have it all!\n\n` +
        `What are you looking for today?`,
      ];
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          size="lg"
          className="fixed bottom-6 left-6 z-50 rounded-full h-16 w-16 shadow-2xl bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 z-50 w-96 h-[500px] shadow-2xl flex flex-col">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">{preferredLanguage === "id" ? "Asisten AI" : "AI Assistant"}</h3>
                <p className="text-xs text-blue-100">
                  {preferredLanguage === "id" ? "Online - Siap membantu" : "Online - Here to help"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700 h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Customer Profile Indicator */}
            {(customerProfile.vehicleBrand || customerProfile.soundPreference || customerProfile.usage) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  {preferredLanguage === "id" ? "📋 Info yang sudah saya catat:" : "📋 Information collected:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {customerProfile.vehicleBrand && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {customerProfile.vehicleBrand} {customerProfile.vehicleModel}
                    </span>
                  )}
                  {customerProfile.soundPreference && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                      🔊 {customerProfile.soundPreference}
                    </span>
                  )}
                  {customerProfile.usage && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                      📊 {customerProfile.usage}
                    </span>
                  )}
                  {customerProfile.customRequest && (
                    <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded">
                      ⭐ Custom Request
                    </span>
                  )}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.isBot
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="p-4 border-t">
            {/* Quick Action Buttons - Only show at start */}
            {messages.length <= 2 && (
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setInputMessage(preferredLanguage === "id" ? "Rekomendasi knalpot untuk motor saya" : "Recommend exhaust for my bike")}
                >
                  {preferredLanguage === "id" ? "🔍 Cari Rekomendasi" : "🔍 Get Recommendations"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setInputMessage(preferredLanguage === "id" ? "Produk terlaris" : "Best sellers")}
                >
                  {preferredLanguage === "id" ? "⭐ Terlaris" : "⭐ Best Sellers"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setInputMessage(preferredLanguage === "id" ? "Bikin knalpot custom" : "Custom exhaust")}
                >
                  {preferredLanguage === "id" ? "🎨 Custom" : "🎨 Custom"}
                </Button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder={preferredLanguage === "id" ? "Ketik pesan Anda..." : "Type your message..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
