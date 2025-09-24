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
  const liffUrl = process.env.NEXT_PUBLIC_LIFF_URL || 'https://kota-kun-liff-app.vercel.app';
  
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
    type: 'flex',
    altText: 'カウンセリングを開始しましょう！',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'こんにちは！',
            weight: 'bold',
            size: 'xl',
            color: '#1DB446'
          },
          {
            type: 'text',
            text: 'Kota-kun健康管理アプリへようこそ！',
            wrap: true,
            margin: 'md'
          },
          {
            type: 'text',
            text: 'まずは簡単なカウンセリングを行って、あなたに最適な健康プランを作成しましょう。',
            wrap: true,
            margin: 'md',
            size: 'sm',
            color: '#666666'
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
              type: 'postback',
              label: 'カウンセリングを開始',
              data: 'action=start_counseling'
            }
          }
        ]
      }
    }
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
  if (postback.data === 'action=start_counseling') {
    const liffUrl = process.env.NEXT_PUBLIC_LIFF_URL || 'https://kota-kun-liff-app.vercel.app';
    
    const response = {
      type: 'flex',
      altText: 'カウンセリングページを開く',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'カウンセリングを開始します',
              weight: 'bold',
              size: 'xl',
              color: '#1DB446'
            },
            {
              type: 'text',
              text: '以下のボタンを押してカウンセリングページを開いてください。',
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
                label: 'カウンセリングページを開く',
                uri: `${liffUrl}/counseling`
              }
            }
          ]
        }
      }
    };
    
    await sendReplyMessage(replyToken, response);
  } else {
    const response = {
      type: 'text',
      text: `ポストバックを受信しました: ${postback.data}`
    };
    await sendReplyMessage(replyToken, response);
  }
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