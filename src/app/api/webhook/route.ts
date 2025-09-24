import { NextRequest, NextResponse } from 'next/server';

// LINE Bot の型定義
interface WebhookEvent {
  type: string;
  replyToken?: string;
  message?: {
    type: string;
    text?: string;
  };
  source?: {
    userId: string;
    type: string;
  };
  postback?: {
    data: string;
  };
}

interface WebhookRequestBody {
  events: WebhookEvent[];
}

// LINE Bot SDKの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // 署名検証（簡易版）
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha256', config.channelSecret)
      .update(body)
      .digest('base64');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const webhookData: WebhookRequestBody = JSON.parse(body);
    
    // イベントを処理
    for (const event of webhookData.events) {
      await handleEvent(event);
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleEvent(event: WebhookEvent) {
  console.log('Received event:', event);

  switch (event.type) {
    case 'message':
      if (event.message && event.message.type === 'text') {
        await handleTextMessage(event);
      }
      break;
    
    case 'follow':
      await handleFollowEvent(event);
      break;
    
    case 'postback':
      await handlePostbackEvent(event);
      break;
    
    default:
      console.log('Unhandled event type:', event.type);
  }
}

async function handleTextMessage(event: WebhookEvent) {
  const { replyToken } = event;
  
  if (!replyToken) {
    console.error('No reply token');
    return;
  }
  
  // LIFFアプリのURLを送信
  const liffUrl = process.env.NEXT_PUBLIC_LIFF_URL || 'https://your-app.vercel.app';
  
  const response = {
    type: 'flex',
    altText: 'LIFFアプリを開く',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Kota-kun LIFF App',
            weight: 'bold',
            size: 'xl',
            color: '#1DB446'
          },
          {
            type: 'text',
            text: '健康管理アプリを開いてみましょう！',
            wrap: true,
            margin: 'md'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#1DB446',
            action: {
              type: 'uri',
              label: 'アプリを開く',
              uri: liffUrl
            }
          }
        ]
      }
    }
  };

  await sendReplyMessage(replyToken, response);
}

async function handleFollowEvent(event: WebhookEvent) {
  const { replyToken } = event;
  
  if (!replyToken) {
    console.error('No reply token');
    return;
  }
  
  const welcomeMessage = {
    type: 'text',
    text: 'フォローありがとうございます！\n「アプリ」と送信するとLIFFアプリを開けます。'
  };

  await sendReplyMessage(replyToken, welcomeMessage);
}

async function handlePostbackEvent(event: WebhookEvent) {
  const { replyToken, postback } = event;
  
  if (!replyToken || !postback) {
    console.error('No reply token or postback data');
    return;
  }
  
  console.log('Postback data:', postback.data);
  
  // ポストバックデータに応じた処理
  const response = {
    type: 'text',
    text: `ポストバックを受信しました: ${postback.data}`
  };

  await sendReplyMessage(replyToken, response);
}

async function sendReplyMessage(replyToken: string, message: Record<string, unknown>) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [message],
      }),
    });

    if (!response.ok) {
      console.error('Failed to send reply:', await response.text());
    }
  } catch (error) {
    console.error('Error sending reply:', error);
  }
}
