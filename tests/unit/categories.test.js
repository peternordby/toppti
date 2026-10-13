import categories from '../../src/categories.js'

const KNOWN_KEYS = ['id', 'navn', 'fasit', 'kilde', 'år']

describe.each(Object.entries(categories))('%s', (edition, questions) => {
  test('has questions with unique ids', () => {
    expect(questions.length).toBeGreaterThan(0)
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test.each(questions.map((q) => [q.id, q]))('question %s is well-formed', (_, q) => {
    // Catches typos like `kilder`, which silently break the source link.
    expect(Object.keys(q).filter((key) => !KNOWN_KEYS.includes(key))).toEqual([])
    expect(q.navn).toEqual(expect.any(String))
    expect(q.fasit).toHaveLength(10)
    q.fasit.forEach((answer) => expect(answer.trim()).not.toBe(''))
    expect(new Set(q.fasit).size).toBe(10)
    if (q.kilde !== undefined) expect(() => new URL(q.kilde)).not.toThrow()
    if (q.år !== undefined) expect(q.år).toMatch(/^\d{4}$/)
  })
})

test('every Normal question has a source and year', () => {
  categories.default.forEach((q) => {
    expect(q.kilde).toBeDefined()
    expect(q.år).toBeDefined()
  })
})
