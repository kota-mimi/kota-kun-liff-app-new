"use client";

import { useEffect, useState } from 'react';
import liff from '@line/liff';

interface UserData {
  name: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  goal: string;
}

export default function Home() {
  const [message, setMessage] = useState('LIFFの初期化中...');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<{displayName: string; userId: string; pictureUrl?: string} | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'meals' | 'exercise' | 'weight'>('home');

  useEffect(() => {
    // LIFFの初期化
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || 'YOUR_LIFF_ID' })
      .then(() => {
        setMessage('LIFFの初期化が完了しました');
        
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          setMessage('ログイン済みです');
          
          // プロフィール情報を取得
          liff.getProfile().then(profile => {
            setProfile(profile);
            setUserId(profile.userId);
            setMessage(`ようこそ、${profile.displayName}さん！`);
            
            // ローカルストレージからユーザーデータを読み込み
            loadUserData(profile.userId);
          });
        } else {
          setMessage('ログインが必要です');
          if (liff.isInClient()) {
            liff.login();
          }
        }
      })
      .catch((err) => {
        console.error('LIFF Init Error:', err);
        setMessage('LIFFの初期化に失敗しました');
      });
  }, []);

  const loadUserData = (userId: string) => {
    const savedData = localStorage.getItem(`userData_${userId}`);
    if (savedData) {
      setUserData(JSON.parse(savedData));
    }
  };

  const saveUserData = (data: UserData) => {
    if (userId) {
      localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
      setUserData(data);
    }
  };

  const handleLogout = () => {
    liff.logout();
    window.location.reload();
  };

  const calculateBMI = () => {
    if (!userData) return 0;
    const heightInMeters = userData.height / 100;
    return (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateTargetCalories = () => {
    if (!userData) return 0;
    // 簡易的な計算（男性の場合）
    const bmr = 88.362 + (13.397 * userData.weight) + (4.799 * userData.height) - (5.677 * userData.age);
    return Math.round(bmr * 1.55); // 中程度の活動レベル
  };

  const renderHomePage = () => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">ステータス:</p>
        <p className="font-medium">{message}</p>
      </div>

      {userData ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">今日の目標</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">BMI</p>
                <p className="font-bold text-lg">{calculateBMI()}</p>
              </div>
              <div>
                <p className="text-gray-600">目標カロリー</p>
                <p className="font-bold text-lg">{calculateTargetCalories()}kcal</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentPage('meals')}
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-medium">食事記録</div>
            </button>
            <button
              onClick={() => setCurrentPage('exercise')}
              className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
            >
              <div className="text-2xl mb-2">💪</div>
              <div className="font-medium">運動記録</div>
            </button>
            <button
              onClick={() => setCurrentPage('weight')}
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-medium">体重記録</div>
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">プロフィール</div>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <p className="text-yellow-800 mb-4">プロフィールを設定してください</p>
          <button
            onClick={() => setCurrentPage('profile')}
            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            プロフィール設定
          </button>
        </div>
      )}

      {isLoggedIn && (
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
        >
          ログアウト
        </button>
      )}
    </div>
  );

  const renderProfilePage = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">プロフィール設定</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
          <input
            type="text"
            value={userData?.name || ''}
            onChange={(e) => setUserData(prev => prev ? {...prev, name: e.target.value} : null)}
            className="w-full p-2 border rounded-lg"
            placeholder="お名前を入力"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
            <input
              type="number"
              value={userData?.age || ''}
              onChange={(e) => setUserData(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
              className="w-full p-2 border rounded-lg"
              placeholder="25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身長(cm)</label>
            <input
              type="number"
              value={userData?.height || ''}
              onChange={(e) => setUserData(prev => prev ? {...prev, height: parseInt(e.target.value)} : null)}
              className="w-full p-2 border rounded-lg"
              placeholder="170"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在の体重(kg)</label>
            <input
              type="number"
              value={userData?.weight || ''}
              onChange={(e) => setUserData(prev => prev ? {...prev, weight: parseFloat(e.target.value)} : null)}
              className="w-full p-2 border rounded-lg"
              placeholder="65.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標体重(kg)</label>
            <input
              type="number"
              value={userData?.targetWeight || ''}
              onChange={(e) => setUserData(prev => prev ? {...prev, targetWeight: parseFloat(e.target.value)} : null)}
              className="w-full p-2 border rounded-lg"
              placeholder="60.0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
          <select
            value={userData?.goal || ''}
            onChange={(e) => setUserData(prev => prev ? {...prev, goal: e.target.value} : null)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">選択してください</option>
            <option value="weight_loss">体重減少</option>
            <option value="weight_gain">体重増加</option>
            <option value="muscle_gain">筋肉増量</option>
            <option value="maintenance">現状維持</option>
          </select>
        </div>
        
        <button
          onClick={() => {
            if (userData) {
              saveUserData(userData);
              setCurrentPage('home');
            }
          }}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
        
        <button
          onClick={() => setCurrentPage('home')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );

  const renderMealsPage = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">食事記録</h2>
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">食事記録機能は準備中です</p>
      </div>
      <button
        onClick={() => setCurrentPage('home')}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
      >
        ホームに戻る
      </button>
    </div>
  );

  const renderExercisePage = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">運動記録</h2>
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">運動記録機能は準備中です</p>
      </div>
      <button
        onClick={() => setCurrentPage('home')}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
      >
        ホームに戻る
      </button>
    </div>
  );

  const renderWeightPage = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">体重記録</h2>
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">体重記録機能は準備中です</p>
      </div>
      <button
        onClick={() => setCurrentPage('home')}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
      >
        ホームに戻る
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Kota-kun Health App
        </h1>
        
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'profile' && renderProfilePage()}
        {currentPage === 'meals' && renderMealsPage()}
        {currentPage === 'exercise' && renderExercisePage()}
        {currentPage === 'weight' && renderWeightPage()}

        {/* デバッグ情報 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">デバッグ情報:</p>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>LIFF ID: {process.env.NEXT_PUBLIC_LIFF_ID || '設定されていません'}</p>
              <p>ログイン状態: {isLoggedIn ? 'ログイン済み' : '未ログイン'}</p>
              <p>LINEクライアント内: {liff.isInClient() ? 'はい' : 'いいえ'}</p>
              <p>現在のページ: {currentPage}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}