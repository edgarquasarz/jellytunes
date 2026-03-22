import { Before, After, Status } from '@cucumber/cucumber'
import * as fs from 'fs'
import * as path from 'path'
import type { ICustomWorld } from './world'

const { launchApp, closeApp, getMainWindow } = require('./app-launcher')

const ELECTRON_TIMEOUT = 60000
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots')

Before({ timeout: ELECTRON_TIMEOUT }, async function(this: ICustomWorld) {
  this.app = await launchApp()
  this.page = await getMainWindow(this.app)
  this.testData = {}
})

After(async function(this: ICustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    try {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
      const safeName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${safeName}.png`)
      const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true })
      this.attach(screenshot, 'image/png')
    } catch (e) {
      console.error('Failed to take screenshot:', e)
    }
  }

  if (this.app) {
    try {
      await closeApp(this.app)
    } catch (e) {
      console.error('Failed to close app:', e)
    }
  }

  this.app = undefined
  this.page = undefined
})
