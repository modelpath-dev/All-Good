import { storeReport } from '@/lib/db'
import { extractTextFromImage } from '@/lib/openai'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')

    if (!file || !userId) {
      return Response.json({ error: 'File and userId are required' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = file.name
    const mimeType = file.type

    let reportText = ''

    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      reportText = pdfData.text
    } else if (mimeType.startsWith('image/')) {
      const base64 = buffer.toString('base64')
      reportText = await extractTextFromImage(base64, mimeType)
    } else {
      reportText = buffer.toString('utf-8')
    }

    const report = await storeReport({
      userId: parseInt(userId),
      fileName,
      reportText
    })

    return Response.json({ report })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
