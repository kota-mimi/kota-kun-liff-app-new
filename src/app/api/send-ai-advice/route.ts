import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, aiAdvice, nutritionData } = await request.json();

    if (!userId || !aiAdvice || !nutritionData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // AIアドバイスをFlexメッセージで送信
    const flexMessage = {
      type: 'flex',
      altText: 'AIアドバイス',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🤖 AI健康アドバイス',
              weight: 'bold',
              size: 'lg',
              color: '#1DB446'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'あなたに最適な健康プランが完成しました！',
              wrap: true,
              margin: 'md',
              color: '#666666'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'text',
              text: '【栄養目標】',
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'sm',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: 'カロリー',
                      size: 'sm',
                      color: '#666666',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: `${nutritionData.dailyCalories}kcal`,
                      size: 'sm',
                      color: '#1DB446',
                      weight: 'bold',
                      align: 'end'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: 'タンパク質',
                      size: 'sm',
                      color: '#666666',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: `${nutritionData.protein}g`,
                      size: 'sm',
                      color: '#1DB446',
                      weight: 'bold',
                      align: 'end'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '脂質',
                      size: 'sm',
                      color: '#666666',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: `${nutritionData.fat}g`,
                      size: 'sm',
                      color: '#1DB446',
                      weight: 'bold',
                      align: 'end'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '炭水化物',
                      size: 'sm',
                      color: '#666666',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: `${nutritionData.carbs}g`,
                      size: 'sm',
                      color: '#1DB446',
                      weight: 'bold',
                      align: 'end'
                    }
                  ]
                }
              ]
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'text',
              text: '【AIアドバイス】',
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'text',
              text: aiAdvice,
              wrap: true,
              margin: 'sm',
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
                type: 'uri',
                label: 'マイページを開く',
                uri: `${process.env.NEXT_PUBLIC_LIFF_URL}?mode=mypage`
              }
            }
          ]
        }
      }
    };

    // LINE Bot APIを使用してメッセージを送信
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [flexMessage],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send AI advice:', errorText);
      return NextResponse.json({ error: 'Failed to send AI advice' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending AI advice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
