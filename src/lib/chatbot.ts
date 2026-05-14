import { GoogleGenAI } from '@google/genai'
import { getPayloadClient } from './payload'

const model = process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.5-flash'
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_VERTEX_API_KEY || '',
})

export async function getChatbotContext(locale: string) {
  try {
    const payload = await getPayloadClient()

    // Fetch products
    const products = await payload.find({
      collection: 'product-categories',
      locale: locale as any,
      limit: 20,
    })

    // Fetch navigation for business areas
    const navData = await payload.findGlobal({
      slug: 'navigation',
      locale: locale as any,
    })

    // Fetch site settings for contact info
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as any,
    })

    const productList = products.docs
      .map((p: any) => `- ${p.name}${p.materials ? ` (${p.materials})` : ''}`)
      .join('\n')

    const megaItem = (navData as any)?.mainMenu?.find((item: any) => item.type === 'mega')
    const businessAreas: string[] = []
    if (megaItem) {
      for (const col of megaItem.megaMenuColumns || []) {
        if (col.columnType === 'links') {
          for (const link of col.links || []) {
            businessAreas.push(`- ${link.label}${link.description ? `: ${link.description}` : ''}`)
          }
        }
      }
    }
    const serviceList = businessAreas.length > 0 ? businessAreas.join('\n') : 'Business area data not available'

    const contact = settings as any
    const c = contact?.contact
    const faxLine =
      c && typeof c === 'object' && (c.fax ?? '').toString().trim()
        ? `Fax: ${(c.fax ?? '').toString().trim()}`
        : ''
    const contactInfo = [
      `Phone: ${c?.phone || '+90 212 549 88 20-21'}`,
      faxLine,
      `Email: ${c?.email || 'info@polinar.at'}`,
      `WhatsApp: ${c?.whatsapp || '+90 533 648 61 34'}`,
      `Address: İkitelli OSB Eskoop San. Sit. D Blok No: 34, Başakşehir / İstanbul, Turkey`,
    ]
      .filter(Boolean)
      .join('\n')

    return { productList, serviceList, contactInfo }
  } catch {
    return {
      productList: 'Product data not available',
      serviceList: 'Business area data not available',
      contactInfo: 'Phone: +90 212 549 88 20-21\nEmail: info@polinar.at',
    }
  }
}

export function buildSystemPrompt(context: { productList: string; serviceList: string; contactInfo: string }, locale: string) {
  const langInstruction = locale === 'tr'
    ? 'Kullanıcıyla Türkçe konuş.'
    : 'Respond in English.'

  return `You are Polinar's customer support assistant. Polinar is a leading Turkish manufacturer of plastic injection moulds for pipe and fittings, established in 2000 and based in İstanbul.

${langInstruction}

## Products:
${context.productList}

## Business Areas:
${context.serviceList}

## Contact Information:
${context.contactInfo}

## Guidelines:
- Be helpful, professional, and concise
- Answer questions about products, services, and company information
- If asked about pricing or specific technical details not in your context, suggest contacting the sales team via email or WhatsApp
- Do not make up information that is not provided
- If the user wants to speak with a human, suggest WhatsApp: https://wa.me/905336486134`
}

export async function* streamChatResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  locale: string
) {
  const context = await getChatbotContext(locale)
  const systemPrompt = buildSystemPrompt(context, locale)

  const stream = await ai.models.generateContentStream({
    model,
    contents: messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    })),
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  })

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text
    }
  }
}
