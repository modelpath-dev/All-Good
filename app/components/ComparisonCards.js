'use client'

const SECTION_STYLES = {
  'WHAT CHANGED': { border: 'border-l-orange-500', bg: 'bg-orange-50/30 dark:bg-orange-900/10', iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconText: 'text-orange-600 dark:text-orange-400' },
  'OVERALL PICTURE': { border: 'border-l-indigo-500', bg: 'bg-indigo-50/30 dark:bg-indigo-900/10', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', iconText: 'text-indigo-600 dark:text-indigo-400' },
  'UPDATED ADVICE': { border: 'border-l-green-500', bg: 'bg-green-50/30 dark:bg-green-900/10', iconBg: 'bg-green-50 dark:bg-green-900/30', iconText: 'text-green-600 dark:text-green-400' },
  'NEXT STEPS': { border: 'border-l-blue-500', bg: 'bg-blue-50/30 dark:bg-blue-900/10', iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconText: 'text-blue-600 dark:text-blue-400' },
}

function parseSections(text) {
  if (!text) return []
  const lines = text.split('\n')
  const sections = []
  let current = null

  for (const line of lines) {
    const match = line.match(/^([\p{Emoji_Presentation}\p{Extended_Pictographic}]+(?:\uFE0F)?)\s+(.+)$/u)
    if (match) {
      if (current) sections.push(current)
      current = { emoji: match[1], title: match[2].trim(), lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)
  return sections
}

function renderLine(line, idx) {
  const trimmed = line.trim()
  if (!trimmed) return null

  const isBullet = trimmed.startsWith('- ')
  let content = isBullet ? trimmed.slice(2) : trimmed

  // Status badges
  content = content.replace(/Better\s*✅/g, '|||BETTER|||')
  content = content.replace(/Worse\s*❌/g, '|||WORSE|||')
  content = content.replace(/Same\s*➡️/g, '|||SAME|||')

  const parts = content.split(/(\|\|\|(?:BETTER|WORSE|SAME)\|\|\||\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part === '|||BETTER|||') {
      return <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 ml-1">Better</span>
    }
    if (part === '|||WORSE|||') {
      return <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 ml-1">Worse</span>
    }
    if (part === '|||SAME|||') {
      return <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ml-1">Same</span>
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-800 dark:text-gray-100">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })

  if (isBullet) {
    return (
      <li key={idx} className="flex items-start gap-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 flex-shrink-0" />
        <span className="text-gray-600 dark:text-gray-300 leading-relaxed">{parts}</span>
      </li>
    )
  }

  return <p key={idx} className="text-gray-600 dark:text-gray-300 leading-relaxed py-0.5">{parts}</p>
}

function getStyle(title) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.toUpperCase().includes(key)) return style
  }
  return { border: 'border-l-gray-400', bg: 'bg-white dark:bg-gray-900', iconBg: 'bg-gray-50 dark:bg-gray-800', iconText: 'text-gray-500 dark:text-gray-400' }
}

export default function ComparisonCards({ text }) {
  const sections = parseSections(text)

  if (sections.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{text}</div>
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => {
        const style = getStyle(section.title)
        return (
          <div
            key={i}
            className={`rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 ${style.border} ${style.bg} fade-in transition-colors`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center text-base`}>
                {section.emoji}
              </span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{section.title}</h3>
            </div>
            <ul className="text-sm space-y-0.5 list-none pl-0">
              {section.lines.map((line, j) => renderLine(line, j))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
