import { NextRequest, NextResponse } from 'next/server';
import * as line from '@line/bot-sdk';

// LINE Bot設定
const lineConfig = {
  channelAccessToken: 'sCf/zZSQdEioCsdBjdj3sNg0BvrWiqw3zruTcwFNTdtlDw02x45w/QEg8vbWEs9EazSiS1UziVKoz6p75foPbnaiNFxgCBUerBr1s+969C6IVrvVEaDt0FPYFWNEH6Qtczqf3E495P0QmkV0altlEQdB04t89/1O/w1cDnyilFU=',
  channelSecret: '88779957b5120a3d043e922e1626652a',
};

const client = new line.Client(lineConfig);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // 署名検証
    if (!line.validateSignature(body, lineConfig.channelSecret, signature)) {
      console.error("Signature validation failed");
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Webhookイベントを処理
    const webhookData = JSON.parse(body);
    const events: line.WebhookEvent[] = webhookData.events;

    // LINEからの検証リクエストには中身がないので、ここで成功を返す
    if (events.length === 0) {
      return NextResponse.json({ message: 'OK' });
    }
    
    const results = await Promise.all(
      events.map(async (event) => {
        try {
          if (event.type === 'follow') {
            return handleFollow(event);
          }
          if (event.type === 'message') {
            if (event.message.type === 'text') {
              return handleTextMessage(event as line.MessageEvent & { message: line.TextMessage });
            }
            if (event.message.type === 'image') {
              return handleImageMessage(event as line.MessageEvent & { message: line.ImageMessage });
            }
          }
        } catch (err) {
          console.error(err);
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 友だち追加イベントを処理する関数
const handleFollow = (event: line.FollowEvent) => {
  const richMessage: line.FlexMessage = {
    type: 'flex',
    altText: '初回カウンセリングのご案内です。',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://storage.googleapis.com/proud-ground-244503.appspot.com/counseling_header.jpeg',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'ようこそ！', weight: 'bold', size: 'xl' },
          { type: 'text', text: '最高のスタートを切るために、まずはあなたのことを教えてください。', margin: 'md', wrap: true },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '初回カウンセリングを開始',
              uri: 'https://liff.line.me/2007945061-DEEaglg8'
            },
            color: '#00b900'
          },
        ],
        flex: 0,
      },
    },
  };
  return client.replyMessage(event.replyToken, richMessage);
};

// テキストメッセージを処理する関数
const handleTextMessage = async (event: line.MessageEvent & { message: line.TextMessage }) => {
  const text = event.message.text;
  const userId = event.source.userId!;
  
  // カウンセリング開始のトリガー
  if (text === 'カウンセリング開始') {
    const welcomeMessage = {
      type: 'text' as const,
      text: 'ありがとうございます！\n\nまずは年齢を教えてください。'
    };
    return client.replyMessage(event.replyToken, [welcomeMessage]);
  }
  
  // その他のテキストメッセージには簡単な返答
  const replyMessage = {
    type: 'text' as const,
    text: '「カウンセリング開始」と送信してください。'
  };
  return client.replyMessage(event.replyToken, [replyMessage]);
};

// 画像メッセージを処理する関数
const handleImageMessage = async (event: line.MessageEvent & { message: line.ImageMessage }) => {
  const userId = event.source.userId!;
  
  // 画像分析の結果を返す（簡易版）
  const analysisMessage = {
    type: 'text' as const,
    text: '画像を確認しました！\n\nこの画像から食事の内容を分析して、カロリーとPFC（タンパク質・脂質・炭水化物）の情報をお伝えします。\n\n詳細な分析結果はマイページで確認できます。'
  };
  return client.replyMessage(event.replyToken, [analysisMessage]);
};