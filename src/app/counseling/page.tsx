"use client";

import { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function CounselingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    goal: ''
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitCounseling = () => {
    // ダミーの完了処理
    alert('カウンセリングが完了しました！\n（これはダミーです）');
    window.location.href = '/';
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
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">目標設定</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
        <select
          value={formData.goal}
          onChange={(e) => handleInputChange('goal', e.target.value)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="">選択してください</option>
          <option value="weight_loss">体重減少</option>
          <option value="weight_gain">体重増加</option>
          <option value="muscle_gain">筋肉増量</option>
          <option value="maintenance">現状維持</option>
        </select>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">入力内容確認</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>名前: {formData.name}</p>
          <p>年齢: {formData.age}歳</p>
          <p>性別: {formData.gender}</p>
          <p>身長: {formData.height}cm</p>
          <p>現在の体重: {formData.weight}kg</p>
          <p>目標体重: {formData.targetWeight}kg</p>
          <p>目標: {formData.goal}</p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
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
            <span>Step {currentStep} / 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
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
          
          {currentStep < 3 ? (
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