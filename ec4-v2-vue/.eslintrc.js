module.exports = {
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended", "prettier"],
  rules: {
    // override/add rules settings here, such as:
    // single quote should be preferred
    quotes: ["warn", "single", { avoidEscape: true }],
    // 'vue/no-unused-vars': 'error'
  },
};
