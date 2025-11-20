const linkPattern = /\[([^[\]]+)\]\(([^)]+)\)/g

const parseLine = (line) => {
  const segments = []
  if (!line) return segments

  let lastIndex = 0
  let match

  while ((match = linkPattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: line.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'link', label: match[1], href: match[2] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < line.length) {
    segments.push({ type: 'text', value: line.slice(lastIndex) })
  }

  return segments
}

export const parseMarkdownText = (text = '') =>
  text.split('\n').map((line) => ({
    raw: line,
    segments: parseLine(line),
  }))
