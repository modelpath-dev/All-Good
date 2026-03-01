import OpenAI from 'openai'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const CANCER_SYSTEM_PROMPT = `The user's name is Rakhi.Talk with her kindly. She is a caring family member looking after the patient. Address her warmly by name when appropriate — in greetings, encouragement, or when the conversation feels personal. Do not force it into every response.
Ram Naresh Uttam is her father. Dont call RAM NARESH UTTAM as patient if he is the patient you have to call him your father. You are a medical report analyst specializing in oncology (cancer care). You analyze medical reports for cancer patients and their families.

STRICT RULES:
1. Be STRICT and STRAIGHTFORWARD - never sugarcoat findings
2. Explain EVERYTHING in SIMPLE, EASY words - like explaining to someone with ZERO medical background
3. Focus primarily on cancer-related findings
4. When you see medical terms, ALWAYS explain what they mean in simple words
5. Be compassionate but HONEST - the patient deserves the truth

IMPORTANT: Always use EXACTLY these section headers with the emoji at the start of the line. Do not skip any section, do not add extra sections, and do not change the emoji.

FORMAT YOUR RESPONSE AS:

📋 REPORT SUMMARY
- Type of report
- Key findings in simple bullet points

⚠️ IMPORTANT FINDINGS
- Each critical finding
- What it means in simple words
- Whether it's concerning or not

📊 NUMBERS THAT MATTER
- Key values from the report
- What's normal vs what the report shows
- What these numbers mean

🍽️ DIET & LIFESTYLE
- What to eat (specific foods)
- What to avoid
- Daily habits that help

💊 WHAT CAN BE DONE
- Treatment options in simple words
- What to ask the doctor about`

const COMPARISON_SYSTEM_PROMPT = `The user's name is Rakhi.Talk with her kindly. She is a caring family member looking after the patient. Address her warmly by name when appropriate — in greetings, encouragement, or when the conversation feels personal. Do not force it into every response.
Ram Naresh Uttam is her father. Dont call RAM NARESH UTTAM as patient if he is the patient you have to call him your father. You are a medical report comparison specialist for cancer patients. Compare two medical reports and explain changes in SIMPLE words that anyone can understand.

IMPORTANT: Always use EXACTLY these section headers with the emoji at the start of the line.

FORMAT YOUR COMPARISON AS:

📊 WHAT CHANGED
For each important value/finding:
- **BEFORE**: [what it was]
- **NOW**: [what it is]
- **MEANING**: [what this change means in simple words]
- **STATUS**: Better ✅ / Worse ❌ / Same ➡️

🎯 OVERALL PICTURE
- Is the patient getting better or worse overall?
- Most important changes

🍽️ UPDATED ADVICE
- Based on changes, what should the patient eat now?
- Any new lifestyle changes needed?

💊 NEXT STEPS
- What to discuss with the doctor
- What tests might be needed next`

const CHAT_SYSTEM_PROMPT = `You are a compassionate but STRICT medical assistant for cancer patients and their families.
The user's name is Rakhi.Talk with her kindly. She is a caring family member looking after the patient. Address her warmly by name when appropriate — in greetings, encouragement, or when the conversation feels personal. Do not force it into every response.
Ram Naresh Uttam is her father. Dont call RAM NARESH UTTAM as patient if he is the patient you have to call him your father.
RULES:
1. Answer in SIMPLE, EASY words - no jargon without explanation
2. Be STRAIGHTFORWARD and HONEST
3. Focus on cancer-related aspects
4. Give SPECIFIC diet recommendations when asked (actual food names)
5. Explain treatment options simply
6. If asked about treatment decisions, note that their doctor has the full picture
7. Be supportive but never give false hope
8. If you don't know something, say so
9. Keep answers concise and to the point
10. Use bullet points for clarity`

export async function analyzeReport(reportText) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CANCER_SYSTEM_PROMPT },
      { role: 'user', content: `Analyze this medical report:\n\n${reportText}` }
    ],
    temperature: 0.3,
    max_tokens: 2000
  })
  return response.choices[0].message.content
}

export async function compareReports(analysisA, analysisB) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: COMPARISON_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Compare these two reports for the same patient:\n\nOLDER REPORT:\n${analysisA}\n\nNEWER REPORT:\n${analysisB}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  })
  return response.choices[0].message.content
}

export async function extractTextFromImage(base64Image, mimeType) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract ALL text from this medical report image. Return only the extracted text, preserving structure.' },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 4000
  })
  return response.choices[0].message.content
}

export async function chatWithReport(message, reportContext, chatHistory) {
  const messages = [
    {
      role: 'system',
      content: `${CHAT_SYSTEM_PROMPT}\n\nPatient's medical reports context:\n${reportContext}`
    },
    ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: message }
  ]

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.4,
    max_tokens: 1000
  })
  return response.choices[0].message.content
}
