// Split "Navn (verdi)" into name and value so the value can be styled separately.
export const splitAnswer = (text) => {
  const match = text.match(/^(.*) \(([^()]*)\)$/)
  return match ? [match[1], match[2]] : [text, null]
}
