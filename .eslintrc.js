module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/self-closing-comp': 'off',
    'eol-last': 'off',
    'handle-callback-err': 'off',
    curly: 'off',
  },
  parser: '@babel/eslint-parser',
};
