import pdfParse from "pdf-parse";

const DEFAULT_MAX_TEXT_CHARS = 12000;
const DEFAULT_MAX_TOKENS = 300;
const DEFAULT_TIMEOUT_MS = 20000;

const normalizeText = (text) => text.replace(/\s+/g, " ").trim();

const extractPdfText = async (pdfFile) => {
  if (!pdfFile?.buffer) return "";

  const parsed = await pdfParse(pdfFile.buffer);
  return normalizeText(parsed?.text || "");
};

const buildPrompt = (text) =>
  "Summarize the following workshop document for students. " +
  "Return 2-4 concise sentences in plain text.\n\n" +
  `Document:\n${text}`;

const requestAiSummary = async (text) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return {
      summary: "",
      status: "failed",
      error: "AI_API_KEY is missing",
    };
  }

  const model = process.env.AI_MODEL || "llama-3.1-8b-instant";
  const maxTokens = Number.parseInt(
    process.env.AI_SUMMARY_MAX_TOKENS || DEFAULT_MAX_TOKENS,
    10,
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes workshop materials.",
          },
          {
            role: "user",
            content: buildPrompt(text),
          },
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        summary: "",
        status: "failed",
        error: `AI request failed: ${response.status} ${errorText}`,
      };
    }

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content?.trim() || "";

    return {
      summary: normalizeText(summary),
      status: summary ? "generated" : "failed",
    };
  } catch (error) {
    return {
      summary: "",
      status: "failed",
      error: error?.message || "AI request failed",
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const summarizeWorkshopPdf = async (pdfFile) => {
  if (!pdfFile) {
    return {
      summary: "",
      status: "none",
    };
  }
  try {
    const text = await extractPdfText(pdfFile);
    if (!text) {
      return {
        summary: "",
        status: "failed",
      };
    }

    const maxChars = Number.parseInt(
      process.env.AI_SUMMARY_MAX_CHARS || DEFAULT_MAX_TEXT_CHARS,
      10,
    );
    const trimmedText = text.slice(0, maxChars);

    return requestAiSummary(trimmedText);
  } catch (error) {
    return {
      summary: "",
      status: "failed",
      error: error?.message || "PDF extraction failed",
    };
  }
};
