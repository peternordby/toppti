import { splitAnswer } from '../../src/answers.js'

test('splits name and value', () => {
  expect(splitAnswer('India (1,48 mrd.)')).toEqual(['India', '1,48 mrd.'])
})

test('keeps everything before the last bracket as the name', () => {
  expect(splitAnswer('Blinding Lights – The Weeknd (5,63 mrd.)')).toEqual(['Blinding Lights – The Weeknd', '5,63 mrd.'])
  expect(splitAnswer('Norges teknisk-naturvitenskapelige universitet (NTNU)')).toEqual(['Norges teknisk-naturvitenskapelige universitet', 'NTNU'])
})

test('returns no value when there is none', () => {
  expect(splitAnswer('Oppenheimer')).toEqual(['Oppenheimer', null])
  expect(splitAnswer('Grønland (Danmark) og mer')).toEqual(['Grønland (Danmark) og mer', null])
})
