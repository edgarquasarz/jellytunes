const config = {
  default: {
    format: ['progress', 'html:./tests/bdd/reports/cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    paths: ['tests/bdd/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['tests/bdd/steps/**/*.ts', 'tests/bdd/support/**/*.ts'],
    publishQuiet: true,
    worldParameters: {
      headless: true,
    },
  },

  // Development profile (visible UI)
  dev: {
    worldParameters: {
      headless: false,
      slowMo: 100,
    },
  },

  // CI profile (headless, JSON report)
  ci: {
    paths: ['tests/bdd/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['tests/bdd/steps/**/*.ts', 'tests/bdd/support/**/*.ts'],
    format: ['json:./tests/bdd/reports/cucumber-report.json'],
    worldParameters: {
      headless: true,
    },
  },
}

module.exports = config
