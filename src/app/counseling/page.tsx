"use client";

import { useEffect, useState } from 'react';
import liff from '@line/liff';

interface CounselingData {
  // Step 1: 基本情報
  name: string;
  age: string;
  gender: string;
  
  // Step 2: 身体情報
  height: string;
  weight: string;
  targetWeight: string;
  targetDate: string;
  
  // Step 3: 生活習慣
  sleepHours: string;
  activityLevel: string;
  
  // Step 4: 運動習慣
  hasExerciseHabit: string;
  exerciseFrequency: string;
  
  // Step 5: 食生活
  mealCount: string;
  snackFrequency: string;
  drinkFrequency: string;
  
  // Step 6: 目標・悩み
  concernedAreas: string;
  goalType: string;
  otherConcernedAreas: string;
  otherGoalType: string;
}

export default function CounselingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState<CounselingData>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    targetDate: '',
    sleepHours: '',
    activityLevel: '',
    hasExerciseHabit: '',
    exerciseFrequency: '',
    mealCount: '',
    snackFrequency: '',
    drinkFrequency: '',
    concernedAreas: '',
    goalType: '',
    otherConcernedAreas: '',
    otherGoalType: ''
  });

  useEffect(() => {
    // LIFFの初期化
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2007945061-DEEaglg8' })
      .then(() => {
        if (liff.isLoggedIn()) {
          liff.getProfile().then(profile => {
            setUserId(profile.userId);
            setFormData(prev => ({ ...prev, name: profile.displayName }));
          });
        }
      })
      .catch((err) => {
        console.error('LIFF Init Error:', err);
      });
  }, []);

  const handleInputChange = (field: keyof CounselingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitCounseling = async () => {
    try {
      const response = await fetch('/api/submit-counseling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          counselingData: formData
        }),
      });

      if (response.ok) {
        // カウンセリング完了後の処理
        const result = await response.json();
        console.log('Counseling submitted:', result);
        
        // カウンセリング完了ページにリダイレクト
        window.location.href = '/counseling-complete';
      } else {
        console.error('Failed to submit counseling');
      }
    } catch (error) {
      console.error('Error submitting counseling:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">基本情報</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="お名前を入力"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">選択してください</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">身体情報</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">身長(cm)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="170"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">現在の体重(kg)</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="65.0"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目標体重(kg)</label>
          <input
            type="number"
            value={formData.targetWeight}
            onChange={(e) => handleInputChange('targetWeight', e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="60.0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目標達成日</label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleInputChange('targetDate', e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">生活習慣</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">睡眠時間</label>
        <select
          value={formData.sleepHours}
          onChange={(e) => handleInputChange('sleepHours', e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="4時間未満">4時間未満</option>
          <option value="4-5時間">4-5時間</option>
          <option value="5-6時間">5-6時間</option>
          <option value="6-7時間">6-7時間</option>
          <option value="7-8時間">7-8時間</option>
          <option value="8時間以上">8時間以上</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">活動レベル</label>
        <select
          value={formData.activityLevel}
          onChange={(e) => handleInputChange('activityLevel', e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="座りがち">座りがち（デスクワーク中心）</option>
          <option value="軽い活動">軽い活動（週1-3回の軽い運動）</option>
          <option value="中程度の活動">中程度の活動（週3-5回の中程度の運動）</option>
          <option value="活発">活発（週6-7回の激しい運動）</option>
          <option value="非常に活発">非常に活発（1日2回以上の激しい運動）</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">運動習慣</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">現在運動をしていますか？</label>
        <div className="space-y-2">
          {['はい', 'いいえ'].map((option) => (
            <button
              key={option}
              onClick={() => handleInputChange('hasExerciseHabit', option)}
              className={`w-full p-3 border rounded-lg text-left ${
                formData.hasExerciseHabit === option ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {formData.hasExerciseHabit === 'はい' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">運動頻度</label>
          <select
            value={formData.exerciseFrequency}
            onChange={(e) => handleInputChange('exerciseFrequency', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">選択してください</option>
            <option value="週1回">週1回</option>
            <option value="週2-3回">週2-3回</option>
            <option value="週4-5回">週4-5回</option>
            <option value="週6-7回">週6-7回</option>
            <option value="毎日">毎日</option>
          </select>
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">食生活</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">1日の食事回数</label>
        <select
          value={formData.mealCount}
          onChange={(e) => handleInputChange('mealCount', e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="1回">1回</option>
          <option value="2回">2回</option>
          <option value="3回">3回</option>
          <option value="4回以上">4回以上</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">間食の頻度</label>
        <select
          value={formData.snackFrequency}
          onChange={(e) => handleInputChange('snackFrequency', e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="しない">しない</option>
          <option value="週1-2回">週1-2回</option>
          <option value="週3-4回">週3-4回</option>
          <option value="毎日">毎日</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">飲み物の頻度</label>
        <select
          value={formData.drinkFrequency}
          onChange={(e) => handleInputChange('drinkFrequency', e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="水・お茶のみ">水・お茶のみ</option>
          <option value="週1-2回">週1-2回</option>
          <option value="週3-4回">週3-4回</option>
          <option value="毎日">毎日</option>
        </select>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">目標・悩み</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">気になる部位</label>
        <div className="grid grid-cols-2 gap-2">
          {['お腹', '太もも', '二の腕', '背中', '顔', 'その他'].map((area) => (
            <button
              key={area}
              onClick={() => handleInputChange('concernedAreas', area)}
              className={`p-2 border rounded-lg text-sm ${
                formData.concernedAreas === area ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
        <div className="space-y-2">
          {['体重減少', '体重増加', '筋肉増量', '現状維持', 'その他'].map((goal) => (
            <button
              key={goal}
              onClick={() => handleInputChange('goalType', goal)}
              className={`w-full p-3 border rounded-lg text-left ${
                formData.goalType === goal ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          カウンセリング
        </h1>
        
        {/* 進捗バー */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} / 6</span>
            <span>{Math.round((currentStep / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* ステップ内容 */}
        {renderCurrentStep()}
        
        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              戻る
            </button>
          )}
          
          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-auto"
            >
              次へ
            </button>
          ) : (
            <button
              onClick={submitCounseling}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ml-auto"
            >
              完了
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
