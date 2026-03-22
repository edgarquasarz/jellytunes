import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import type { ICustomWorld } from '../support/world'

// All Given steps shared with authentication are in common.steps.ts

// ── When ─────────────────────────────────────────────────────────────────────

When('I re-enter credentials', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'http://localhost:19999')
  await this.page!.fill('[data-testid="api-key-input"]', 'new-key')
})

// ── Then ─────────────────────────────────────────────────────────────────────

Then('I can re-enter credentials and try again', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'http://localhost:19999')
  await expect(this.page!.locator('[data-testid="connect-button"]')).toBeEnabled()
})
