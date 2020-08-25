module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-console": "off", // process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": "off", // process.env.NODE_ENV === "production" ? "error" : "off",
    "print-width": 200
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
