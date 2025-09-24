import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // ユーザーのカウンセリングデータを取得
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const counselingData = userData.counselingData;
    const nutritionData = userData.nutritionData;

    if (!counselingData || !nutritionData) {
      return NextResponse.json({ error: 'Counseling data not found' }, { status: 404 });
    }

    // AIアドバイスを生成
    const aiAdvice = await generateAIAdvice(counselingData, nutritionData);

    return NextResponse.json({ 
      success: true, 
      aiAdvice,
      nutritionData 
    });

  } catch (error) {
    console.error('Error generating AI advice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAIAdvice(counselingData: Record<string, unknown>, nutritionData: Record<string, unknown>) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
あなたは健康管理の専門家です。以下のユーザー情報に基づいて、個別のアドバイスを提供してください。

【ユーザー情報】
- 名前: ${counselingData.name}
- 年齢: ${counselingData.age}歳
- 性別: ${counselingData.gender}
- 身長: ${counselingData.height}cm
- 現在の体重: ${counselingData.weight}kg
- 目標体重: ${counselingData.targetWeight}kg
- BMI: ${nutritionData.bmi}
- 目標: ${counselingData.goalType}
- 気になる部位: ${counselingData.concernedAreas}
- 活動レベル: ${counselingData.activityLevel}
- 運動習慣: ${counselingData.hasExerciseHabit}
- 睡眠時間: ${counselingData.sleepHours}
- 食事回数: ${counselingData.mealCount}
- 間食頻度: ${counselingData.snackFrequency}

【計算された栄養目標】
- 1日カロリー: ${nutritionData.dailyCalories}kcal
- タンパク質: ${nutritionData.protein}g
- 脂質: ${nutritionData.fat}g
- 炭水化物: ${nutritionData.carbs}g

以下の形式でアドバイスを提供してください：

1. 【総合評価】BMIと目標に対する現在の状況
2. 【食事アドバイス】具体的な食事の取り方
3. 【運動アドバイス】効果的な運動方法
4. 【生活習慣アドバイス】睡眠や生活リズムの改善点
5. 【目標達成のコツ】モチベーション維持の方法

各項目は3-4行程度で、実践的で具体的なアドバイスを提供してください。
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    return '申し訳ございません。AIアドバイスの生成中にエラーが発生しました。';
  }
}
