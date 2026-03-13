import { Before, After, Status, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { ICustomWorld } from './world';

// Configuración de timeouts
const ELECTRON_TIMEOUT = 60000; // 60 segundos
const STEP_TIMEOUT = 30000; // 30 segundos por step

// Variable para controlar si usamos mock o Electron real
const USE_MOCK = process.env.BDD_MOCK === 'true';

// Importar funciones de Electron solo si no usamos mock
let launchApp: any;
let closeApp: any;
let getMainWindow: any;

if (!USE_MOCK) {
  const electronModule = require('./app-launcher');
  launchApp = electronModule.launchApp;
  closeApp = electronModule.closeApp;
  getMainWindow = electronModule.getMainWindow;
}

// Hook Before - iniciar app
Before({ timeout: ELECTRON_TIMEOUT }, async function(this: ICustomWorld) {
  try {
    if (USE_MOCK) {
      // Usar mock - no hacer nada
      this.page = undefined;
      this.app = undefined;
      this.testData = {};
    } else {
      this.app = await launchApp();
      this.page = await getMainWindow(this.app);
      this.testData = {};
    }
  } catch (error) {
    console.error('Failed to launch app:', error);
    // No lanzar error si es un timeout, permitir que el test continúe como skipped
    if (error instanceof Error && error.message.includes('timeout')) {
      this.page = undefined;
      this.app = undefined;
    } else {
      throw error;
    }
  }
});

// Hook After - cerrar app y tomar screenshot
After(async function(this: ICustomWorld, scenario) {
  // Tomar screenshot si el test falló y tenemos page
  if (scenario.result?.status === Status.FAILED && this.page) {
    try {
      const screenshot = await this.page.screenshot({
        path: `./tests/bdd/screenshots/${scenario.pickle.name.replace(/\s+/g, '_')}.png`,
        fullPage: true,
      });
      this.attach(screenshot, 'image/png');
    } catch (e) {
      console.error('Failed to take screenshot:', e);
    }
  }
  
  // Cerrar la aplicación si existe
  if (this.app && !USE_MOCK) {
    try {
      await closeApp(this.app);
    } catch (e) {
      console.error('Failed to close app:', e);
    }
  }
  
  this.app = undefined;
  this.page = undefined;
});
