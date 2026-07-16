import "dotenv/config";

const key = process.env.GEMINI_API_KEY!;

async function test(model: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Say only OK",
              },
            ],
          },
        ],
      }),
    }
  );

  console.log("Status:", res.status);
  console.log("Model:", model);

  const text = await res.text();
  console.log(text);
}

async function main() {
  await test("models/gemini-flash-latest");
}

main().catch(console.error);