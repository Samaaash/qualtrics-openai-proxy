export async function GET() {
  return Response.json({ ok: true, message: "chat route works" });
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
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: "OpenAI request failed", details: data },
        { status: response.status }
      );
    }

    const text =
      data.choices?.[0]?.message?.content || "(no response)";

    return Response.json({ text });

  } catch (error) {
    return Response.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
