import antfu from '@antfu/eslint-config';

export default antfu({
  formatters: true,
  react: true,
  stylistic: {
    semi: true,
  },
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
    'react/no-array-index-key': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
});
