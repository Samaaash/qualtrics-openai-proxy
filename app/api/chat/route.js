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

    const input = [];

    if (system) {
      input.push({
        role: "system",
        content: [{ type: "input_text", text: system }]
      });
    }

    for (const msg of history) {
      input.push({
        role: msg.role,
        content: [{ type: "input_text", text: msg.content }]
      });
    }

    // Add the current user message if it is not already the last item in history
    if (!history.length || history[history.length - 1].content !== prompt) {
      input.push({
        role: "user",
        content: [{ type: "input_text", text: prompt }]
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        input,
        temperature,
        max_output_tokens: max_tokens
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json(
        { error: "OpenAI request failed", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();

    const text =
      data.output_text ||
      "";

    return Response.json({ text });
  } catch (error) {
    return Response.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}