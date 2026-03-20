module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 200], // Allow commit headers up to 200 chars
    "body-max-line-length": [0, "always"], // No max line length restriction for body
    "footer-max-line-length": [0, "always"], // No max line length restriction for footer
  },
};
