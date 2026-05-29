export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse the request body
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "กรุณาระบุ Prompt ในการวิเคราะห์" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json; charset=utf-8" 
        }
      });
    }

    // Retrieve API Key from Cloudflare Environment Variables (Secret)
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ไม่พบการกำหนดค่า GEMINI_API_KEY บนเซิร์ฟเวอร์ Cloudflare" }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json; charset=utf-8" 
        }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      return new Response(JSON.stringify({ error: errData.error?.message || `Gemini API error (Status ${response.status})` }), {
        status: response.status,
        headers: { 
          "Content-Type": "application/json; charset=utf-8" 
        }
      });
    }

    const resData = await response.json();
    const textResult = resData.candidates[0].content.parts[0].text;

    // Return the response text directly (which contains the JSON string)
    return new Response(textResult, {
      headers: { 
        "Content-Type": "application/json; charset=utf-8" 
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json; charset=utf-8" 
      }
    });
  }
}
