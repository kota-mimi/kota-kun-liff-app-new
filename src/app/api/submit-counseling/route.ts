import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface CounselingData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  targetWeight: string;
  targetDate: string;
  sleepHours: string;
  activityLevel: string;
  hasExerciseHabit: string;
  exerciseFrequency: string;
  mealCount: string;
  snackFrequency: string;
  drinkFrequency: string;
  concernedAreas: string;
  goalType: string;
  otherConcernedAreas: string;
  otherGoalType: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, counselingData } = await request.json();

    if (!userId || !counselingData) {
      return NextResponse.json({ error: 'Missing userId or counselingData' }, { status: 400 });
    }

    // カウンセリングデータをFirestoreに保存
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      userId,
      counselingData,
      isRegistered: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    // カロリーとPFC計算
    const nutritionData = calculateNutrition(counselingData);

    // 栄養データも保存
    await setDoc(userRef, {
      nutritionData,
      updatedAt: new Date()
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Counseling data saved successfully',
      nutritionData 
    });

  } catch (error) {
    console.error('Error saving counseling data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // ユーザーデータを取得
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return NextResponse.json({
        isRegistered: userData.isRegistered || false,
        counselingData: userData.counselingData || null,
        nutritionData: userData.nutritionData || null
      });
    } else {
      return NextResponse.json({
        isRegistered: false,
        counselingData: null,
        nutritionData: null
      });
    }

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateNutrition(counselingData: CounselingData) {
  const age = parseInt(counselingData.age) || 25;
  const gender = counselingData.gender || '男性';
  const height = parseInt(counselingData.height) || 170;
  const weight = parseFloat(counselingData.weight) || 65;
  const activityLevel = counselingData.activityLevel || '中程度の活動';

  // BMR計算（Harris-Benedict式）
  let bmr;
  if (gender === '男性') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // 活動レベル係数を決定
  let activityFactor;
  switch (activityLevel) {
    case '座りがち':
      activityFactor = 1.2;
      break;
    case '軽い活動':
      activityFactor = 1.375;
      break;
    case '中程度の活動':
      activityFactor = 1.55;
      break;
    case '活発':
      activityFactor = 1.725;
      break;
    case '非常に活発':
      activityFactor = 1.9;
      break;
    default:
      activityFactor = 1.55;
  }

  // 活動レベルを考慮した1日カロリー
  const dailyCalories = Math.round(bmr * activityFactor);

  // PFC計算
  const protein = Math.round((dailyCalories * 0.20) / 4);
  const fat = Math.round((dailyCalories * 0.25) / 9);
  const carbs = Math.round((dailyCalories * 0.55) / 4);

  // BMI計算
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

  return {
    dailyCalories,
    protein,
    fat,
    carbs,
    bmi: parseFloat(bmi),
    bmr: Math.round(bmr)
  };
}
