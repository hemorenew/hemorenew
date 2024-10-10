module.exports = {
  rules: {
    'type-enum': [
      2,
      'always',
      ['FEATURE', 'FIX', 'BUG', 'STYLE', 'REFACTOR', 'TEST'],
    ],
    'scope-case': [0],
    'type-case': [0],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'never', []],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w+)\] (.*)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
};
