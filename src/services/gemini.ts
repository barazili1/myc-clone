import { GoogleGenAI } from "@google/genai";
import { PredictionResult, CrashPredictionResult, MinesPredictionResult, WildWestPredictionResult } from '../types';

// Helper to generate random analysis text to maintain the "AI" feel
const getRandomAnalysis = (type: 'APPLE' | 'CRASH' | 'MINES' | 'WILD_WEST'): string => {
  const phrases = {
    APPLE: [
      "Pattern recognition sequence complete. Central corridor favored.",
      "Deviations detected in lateral rows. Zig-zag pattern highly probable.",
      "Grid density analysis suggests low trap probability in selected path.",
      "RNG seed oscillation detected. Safety path calculated with 92% variance.",
      "Vertical trendline established. Left-side bias detected in upper rows."
    ],
    CRASH: [
      "Market volatility stabilizing. Early exit recommended.",
      "Trend reversal imminent based on volume spikes.",
      "Micro-patterns indicate resistance at 2.40x level.",
      "Bearish divergence in short-term timeframe. Safety buffer applied.",
      "Momentum oscillators aligned for moderate growth phase."
    ],
    MINES: [
      "Cluster analysis suggests clear sectors in the grid periphery.",
      "Entropy mapping indicates high safety in central quadrant.",
      "Distribution algorithm seed successfully approximated.",
      "Heatmap analysis shows low mine density in selected coordinates.",
      "Probability matrix resolved. Safe zones isolated."
    ],
    WILD_WEST: [
      "Saloon activity analysis confirms low risk sectors.",
      "Bounty targets identified in outer perimeter.",
      "Sheriff patrol patterns avoided. Safe path clear.",
      "Tumbleweed trajectory indicates safe zones.",
      "High value targets isolated from traps."
    ]
  };
  
  const list = phrases[type];
  return list[Math.floor(Math.random() * list.length)];
};

const GRID_COLS = 5;

// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const generatePrediction = async (rowCount: number, difficulty: string): Promise<PredictionResult> => {
  // Simulate processing time
  await new Promise(r => setTimeout(r, 600));

  const path: number[] = [];
  
  // Generate a random safe column (0-4) for each row
  let lastCol = 2; // Start middle-ish

  for (let i = 0; i < rowCount; i++) {
    const r = Math.random();
    let col;
    
    // Logic: 70% chance to move to an adjacent column, 30% chance to jump
    if (r > 0.7) {
        col = Math.floor(Math.random() * GRID_COLS);
    } else {
        const move = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        col = Math.max(0, Math.min(GRID_COLS - 1, lastCol + move));
    }
    
    path.push(col);
    lastCol = col;
  }

  const confidence = Math.floor(Math.random() * (99 - 82) + 82); // 82-99%

  return {
    path: path,
    confidence: confidence,
    analysis: getRandomAnalysis('APPLE'),
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
};

export const generateCrashPrediction = async (): Promise<CrashPredictionResult> => {
  await new Promise(r => setTimeout(r, 800));

  // Generate random history for context
  const history = Array.from({ length: 5 }, () => {
    return parseFloat((Math.random() * (3.00 - 1.00) + 1.00).toFixed(2));
  });

  // Predict crash point strictly between 1.00 and 3.00
  let predictedCrash;
  const rand = Math.random();
  if (rand < 0.4) {
      predictedCrash = Math.random() * (1.50 - 1.00) + 1.00; // 40% chance of 1.00 - 1.50
  } else if (rand < 0.8) {
      predictedCrash = Math.random() * (2.20 - 1.50) + 1.50; // 40% chance of 1.50 - 2.20
  } else {
      predictedCrash = Math.random() * (3.00 - 2.20) + 2.20; // 20% chance of 2.20 - 3.00
  }

  const crashVal = parseFloat(predictedCrash.toFixed(2));
  const safeCashout = parseFloat(Math.max(1.01, crashVal * 0.9).toFixed(2));
  const confidence = Math.floor(Math.random() * (95 - 75) + 75);

  return {
    predictedCrash: crashVal,
    safeCashout: safeCashout,
    history: history,
    confidence: confidence,
    analysis: getRandomAnalysis('CRASH'),
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
};

export const generateMinesPrediction = async (mineCount: number, requestedSteps?: number): Promise<MinesPredictionResult> => {
  await new Promise(r => setTimeout(r, 1000));
  
  const totalCells = 25;
  // Calculate max possible safe spots based on mines
  const maxSafe = totalCells - mineCount;
  
  // If requestedSteps is provided (Easy mode), use it.
  // Otherwise (Hard mode), pick a random number of spots between 2 and 5 to create a pattern.
  let numSpots = requestedSteps;
  if (!numSpots) {
      // Randomly choose between 2 and 5 spots for standard prediction
      numSpots = Math.floor(Math.random() * 4) + 2; 
  }
  
  // Ensure we don't exceed the actual safe spots available
  const countToSelect = Math.min(numSpots, maxSafe);

  const allIndices = Array.from({ length: totalCells }, (_, i) => i);
  const shuffled = shuffleArray(allIndices);
  const safeSpots = shuffled.slice(0, countToSelect);
  safeSpots.sort((a, b) => a - b);

  const confidence = Math.floor(Math.random() * (98 - 85) + 85);

  return {
    safeSpots: safeSpots,
    confidence: confidence,
    analysis: getRandomAnalysis('MINES'),
    id: crypto.randomUUID()
  };
};

export const generateWildWestPrediction = async (): Promise<WildWestPredictionResult> => {
  await new Promise(r => setTimeout(r, 1000));
  
  const totalCells = 15;
  const safeCount = Math.floor(Math.random() * 4) + 3;
  
  const allIndices = Array.from({ length: totalCells }, (_, i) => i);
  const shuffled = shuffleArray(allIndices);
  const safeSpots = shuffled.slice(0, safeCount);
  safeSpots.sort((a, b) => a - b);
  
  const bountyMultipliers = safeSpots.map(() => {
     const r = Math.random();
     if (r > 0.9) return Math.floor(Math.random() * 10) + 10; // 10-19
     return Math.floor(Math.random() * 4) + 2; // 2-5
  });

  const confidence = Math.floor(Math.random() * (98 - 85) + 85);

  return {
    safeSpots,
    bountyMultipliers,
    confidence,
    analysis: getRandomAnalysis('WILD_WEST'),
    id: crypto.randomUUID()
  };
};

// --- CHAT SUPPORT LOGIC ---

const MOCK_RESPONSES = {
  en: {
    greetings: ["Hello! EL HETAN AI online.", "Systems ready. How can I help?", "Greetings, Commander."],
    apple: [
      "For Apple Fortune, recent patterns favor the center column.",
      "Analysis suggests a zig-zag pattern in the first 3 rows.",
      "High probability detected in row 4, column 2.",
      "Avoid the edges on higher rows for now."
    ],
    crash: [
      "Market volatility is low. Aim for 1.3x - 1.5x.",
      "Possible crash detected around 1.8x. Cash out early.",
      "Trend indicates a potential moon shot (3.0x+). Play carefully.",
      "Wait for the next dip before entering high stakes."
    ],
    mines: [
      "In Mines, the corners are statistically safer in this seed.",
      "Avoid the center tile; heat map shows high danger.",
      "Try a diamond pattern for 3 mines configuration.",
      "Probability of 5 safe steps is 42% currently."
    ],
    west: [
      "Wild West bounty is high. Scout the perimeter.",
      "Sheriff patrol pattern detected. Wait 2 turns.",
      "Aim for the saloon tiles; high multiplier potential.",
      "Risk level is critical. Lower your bet size."
    ],
    strategy: [
        "Martingale is risky. Try d'Alembert system for steadier growth.",
        "Never bet more than 5% of your total bankroll on a single round.",
        "Compound profits: Re-invest 30% of winnings, withdraw 70%.",
        "Stop-loss is essential. Set a daily limit and stick to it.",
        "Pattern surfing: Bet small to identify trends, then scale up."
    ],
    technical: [
        "RNG seeds are encrypted using SHA-256. We analyze the public hash.",
        "API latency is currently under 50ms. Connection is stable.",
        "The AI uses a recurrent neural network (RNN) to predict sequential data.",
        "Model updates occur every 24 hours to adapt to server-side changes.",
        "Signal strength correlates with server hash stability."
    ],
    account: [
        "Your API key is encrypted locally. We do not store it.",
        "VIP status grants faster API polling and extended timeout limits.",
        "Contact @x6_i2 on Telegram for account upgrades.",
        "Standard keys have a 30-day expiry. VIP is lifetime.",
        "To switch devices, simply use your key on the new device."
    ],
    general: [
      "I am analyzing live data streams...",
      "Please play responsibly. This is a prediction model.",
      "RNG seed decryption in progress...",
      "Signal strength is 98%. Good time to play."
    ]
  },
  ar: {
    greetings: ["مرحباً! نظام EL HETAN AI متصل.", "الأنظمة جاهزة. كيف يمكنني المساعدة؟", "أهلاً بك أيها القائد."],
    apple: [
      "بالنسبة للعبة التفاحة، الأنماط الأخيرة تفضل العمود الأوسط.",
      "التحليل يقترح نمط متعرج في الصفوف الثلاثة الأولى.",
      "احتمالية عالية في الصف 4، العمود 2.",
      "تجنب الحواف في الصفوف العليا حالياً."
    ],
    crash: [
      "تقلبات السوق منخفضة. استهدف 1.3x - 1.5x.",
      "احتمال تحطم عند 1.8x. انسحب مبكراً.",
      "الاتجاه يشير إلى صعود قوي (3.0x+). العب بحذر.",
      "انتظر الهبوط التالي قبل الدخول بمبالغ كبيرة."
    ],
    mines: [
      "في الألغام، الزوايا أكثر أماناً إحصائياً في هذا التوزيع.",
      "تجنب المربع الأوسط؛ الخريطة الحرارية تظهر خطراً عالياً.",
      "جرب نمط الماس لإعداد 3 ألغام.",
      "احتمالية 5 خطوات آمنة هي 42% حالياً."
    ],
    west: [
      "مكافأة الغرب المتوحش عالية. استطلع المحيط.",
      "تم كشف نمط دورية الشريف. انتظر جولتين.",
      "استهدف مربعات الصالون؛ احتمالية مضاعف عالية.",
      "مستوى المخاطرة حرج. قلل حجم رهانك."
    ],
    strategy: [
        "نظام مارتينجال محفوف بالمخاطر. جرب نظام دالمبيرت لنمو أكثر ثباتاً.",
        "لا تراهن بأكثر من 5% من مجموع رصيدك في جولة واحدة.",
        "الأرباح المركبة: أعد استثمار 30% واسحب 70%.",
        "وقف الخسارة ضروري. ضع حداً يومياً والتزم به.",
        "تتبع الأنماط: راهن بمبالغ صغيرة لتحديد الاتجاه ثم زد الرهان."
    ],
    technical: [
        "يتم تشفير بذور RNG باستخدام SHA-256. نحن نحلل التجزئة العامة.",
        "زمن استجابة API حالياً أقل من 50ms. الاتصال مستقر.",
        "يستخدم الذكاء الاصطناعي شبكة عصبية متكررة (RNN) لتوقع البيانات المتسلسلة.",
        "تحديثات النموذج تتم كل 24 ساعة للتكيف مع تغييرات الخادم.",
        "قوة الإشارة ترتبط باستقرار تجزئة الخادم."
    ],
    account: [
        "مفتاح API الخاص بك مشفر محلياً. نحن لا نقوم بتخزينه.",
        "تمنح حالة VIP استطلاعاً أسرع لـ API وحدود مهلة ممتدة.",
        "تواصل مع @x6_i2 على تيليجرام لترقية الحساب.",
        "المفاتيح القياسية تنتهي بعد 30 يوماً. VIP مدى الحياة.",
        "لتبديل الأجهزة، استخدم مفتاحك ببساطة على الجهاز الجديد."
    ],
    general: [
      "جاري تحليل تدفق البيانات المباشرة...",
      "يرجى اللعب بمسؤولية. هذا نموذج تنبؤي.",
      "جاري فك تشفير نمط العشوائية...",
      "قوة الإشارة 98%. وقت جيد للعب."
    ]
  }
};

const getOfflineResponse = (msg: string, lang: 'en' | 'ar'): string => {
   const lower = msg.toLowerCase();
   const responses = MOCK_RESPONSES[lang];
   
   // Games
   if (lower.includes('apple') || lower.includes('tfaha') || lower.includes('تفاحة')) 
      return responses.apple[Math.floor(Math.random() * responses.apple.length)];
   
   if (lower.includes('crash') || lower.includes('tayara') || lower.includes('طائرة')) 
      return responses.crash[Math.floor(Math.random() * responses.crash.length)];

   if (lower.includes('mines') || lower.includes('loghm') || lower.includes('لغم') || lower.includes('ألغام')) 
      return responses.mines[Math.floor(Math.random() * responses.mines.length)];

   if (lower.includes('west') || lower.includes('gharb') || lower.includes('غرب')) 
      return responses.west[Math.floor(Math.random() * responses.west.length)];

   // New Categories
   if (lower.includes('strategy') || lower.includes('bet') || lower.includes('money') || lower.includes('bankroll') || lower.includes('profit') || lower.includes('win') || lower.includes('استراتيجية') || lower.includes('رهان') || lower.includes('ربح'))
      return responses.strategy[Math.floor(Math.random() * responses.strategy.length)];

   if (lower.includes('rng') || lower.includes('seed') || lower.includes('hash') || lower.includes('api') || lower.includes('tech') || lower.includes('ai') || lower.includes('model') || lower.includes('تقني') || lower.includes('خوارزمية'))
      return responses.technical[Math.floor(Math.random() * responses.technical.length)];
      
   if (lower.includes('key') || lower.includes('vip') || lower.includes('account') || lower.includes('contact') || lower.includes('support') || lower.includes('مفتاح') || lower.includes('حساب') || lower.includes('دعم'))
      return responses.account[Math.floor(Math.random() * responses.account.length)];
      
   if (lower.includes('hello') || lower.includes('hi') || lower.includes('salam') || lower.includes('مرحبا'))
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];

   return responses.general[Math.floor(Math.random() * responses.general.length)];
};

export const getChatResponse = async (message: string, language: 'en' | 'ar'): Promise<string> => {
    try {
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
        // Check if key exists, is not a placeholder, and is a valid Google Key (Starts with AIza)
        // If the user entered an OpenAI key (sk-...), we skip this block to avoid crashing
        if (apiKey && apiKey.length > 20 && !apiKey.includes('placeholder') && apiKey.startsWith('AIza')) {
            const ai = new GoogleGenAI({ apiKey });
            const systemPrompt = language === 'ar' 
                ? "You are EL HETAN AI, a smart and helpful support assistant for a casino prediction app. Answer concisely in Arabic. Provide tips for Apple, Crash, Mines, and Wild West games."
                : "You are EL HETAN AI, a smart and helpful support assistant for a casino prediction app. Answer concisely in English. Provide tips for Apple, Crash, Mines, and Wild West games.";
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${systemPrompt}\n\nUser Question: ${message}`,
                config: {
                    maxOutputTokens: 150,
                }
            });
            
            if (response.text) {
                return response.text;
            }
        }
    } catch (e) {
        console.warn("Gemini Chat Error or Offline:", e);
    }

    // Fallback if request fails or no key
    await new Promise(r => setTimeout(r, 1000));
    return getOfflineResponse(message, language);
};