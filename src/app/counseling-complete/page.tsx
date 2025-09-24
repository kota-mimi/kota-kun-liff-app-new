"use client";

import { useEffect, useState } from 'react';
import liff from '@line/liff';

export default function CounselingCompletePage() {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // LIFFの初期化
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID || '2007945061-DEEaglg8' })
      .then(() => {
        if (liff.isLoggedIn()) {
          liff.getProfile().then(profile => {
            setUserId(profile.userId);
          });
        }
      })
      .catch((err) => {
        console.error('LIFF Init Error:', err);
      });
  }, []);

  const handleGetAIAdvice = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // LINE BotにAIアドバイスを送信
        await fetch('/api/send-ai-advice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            aiAdvice: result.aiAdvice,
            nutritionData: result.nutritionData
          }),
        });

        // マイページにリダイレクト
        window.location.href = '/?mode=mypage';
      } else {
        console.error('Failed to get AI advice');
      }
    } catch (error) {
      console.error('Error getting AI advice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryCounseling = () => {
    window.location.href = '/counseling';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            カウンセリング完了！
          </h1>
          <p className="text-gray-600 mb-8">
            お疲れ様でした！<br />
            あなたに最適な健康プランを作成する準備ができました。
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGetAIAdvice}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                AIアドバイスを生成中...
              </div>
            ) : (
              <>
                <div className="text-xl mb-2">🤖</div>
                <div className="font-bold">AIアドバイスをもらう</div>
                <div className="text-sm opacity-90">個別の健康プランを生成</div>
              </>
            )}
          </button>

          <button
            onClick={handleRetryCounseling}
            className="w-full bg-gray-500 text-white py-4 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <div className="text-xl mb-2">🔄</div>
            <div className="font-bold">もう一度やり直す</div>
            <div className="text-sm opacity-90">カウンセリングを再実行</div>
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">次のステップ</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• AIがあなたのデータを分析</li>
            <li>• 個別の健康プランを生成</li>
            <li>• LINEで詳細なアドバイスを受信</li>
            <li>• マイページで継続管理</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
