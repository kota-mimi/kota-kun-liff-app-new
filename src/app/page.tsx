export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Kota-kun LIFF App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          アプリが正常に動作しています！
        </p>
        <div className="space-y-4">
          <a 
            href="/counseling" 
            className="block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            カウンセリングページへ
          </a>
          <a 
            href="/api/webhook" 
            className="block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Webhook API
          </a>
        </div>
      </div>
    </div>
  );
}