export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      message: "chat route works"
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      prompt,
      system,
      history = [],
      model = "gpt-4o-mini",
      temperature = 0.7,
      max_tokens = 300
    } = body;

    const messages = [];

    if (system) {
      messages.push({
        role: "system",
        content: system
      });
    }

    history.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    messages.push({
      role: "user",
      content: prompt
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "OpenAI request failed",
          details: data
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const text =
      data?.choices?.[0]?.message?.content || "(no response)";

    return new Response(
      JSON.stringify({ text }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
