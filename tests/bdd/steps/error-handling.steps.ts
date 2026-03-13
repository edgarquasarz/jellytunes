import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Given steps
Given('el usuario ha configurado un servidor válido', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
  await this.page!.fill('[data-testid="api-key-input"]', 'valid-key');
});

Given('el servidor Jellyfin está caído', async function(this: ICustomWorld) {
  // Simular servidor caído - el test de conexión fallará
  this.testData!.serverDown = true;
});

Given('el usuario está intentando conectar', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
  await this.page!.fill('[data-testid="api-key-input"]', 'valid-key');
  await this.page!.click('[data-testid="connect-button"]');
});

Given('el usuario ingresa credenciales', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
  await this.page!.fill('[data-testid="api-key-input"]', 'expired-key');
});

Given('el usuario está navegando la biblioteca', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="library-screen"]');
});

Given('el usuario está conectado', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="library-screen"]');
});

// Eliminada duplicación: la sincronización está en progreso está en synchronization.steps.ts

// Eliminada duplicación: hay un dispositivo USB conectado está en synchronization.steps.ts

Given('el dispositivo está protegido contra escritura', async function(this: ICustomWorld) {
  this.testData!.writeProtected = true;
});

// When steps
// Eliminada duplicación: el servidor Jellyfin está caído como When

When('el usuario intenta conectar', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="connect-button"]');
});

When('el servidor tarda más de 30 segundos en responder', async function(this: ICustomWorld) {
  // Simular timeout - esperar >30 segundos
  await this.page!.waitForTimeout(35000);
});

When('la API key ha expirado', async function(this: ICustomWorld) {
  // Simular API key expirada
  this.testData!.expiredApiKey = true;
});

When('se pierde la conexión a internet', async function(this: ICustomWorld) {
  await this.page!.evaluate(() => {
    window.dispatchEvent(new CustomEvent('network-offline'));
  });
});

When('ocurre un error al cargar la biblioteca', async function(this: ICustomWorld) {
  this.testData!.libraryLoadError = true;
});

When('se encuentra un archivo corrupto', async function(this: ICustomWorld) {
  // Simular archivo corrupto durante sync
  this.testData!.corruptFile = true;
});

When('el usuario intenta sincronizar', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="sync-button"]');
});

// Then steps
Then('debería mostrarse un mensaje de error amigable', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
});

// Eliminada duplicación: el mensaje debería decir {string} está en authentication.steps.ts

Then('debería mostrar {string}', async function(this: ICustomWorld, suggestion: string) {
  const suggestionElement = this.page!.locator(`text=${suggestion}`);
  await expect(suggestionElement).toBeVisible();
});

Then('debería ofrecer la opción {string}', async function(this: ICustomWorld, option: string) {
  const button = this.page!.locator(`button:has-text("${option}")`);
  await expect(button).toBeVisible();
});

// Eliminada duplicación: el botón {string} debería estar disponible está en synchronization.steps.ts

Then('debería indicar {string}', async function(this: ICustomWorld, message: string) {
  const messageElement = this.page!.locator(`text=${message}`);
  await expect(messageElement).toBeVisible();
});

Then('debería redirigir a la pantalla de login', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="auth-screen"]');
});

Then('debería mostrarse el contenido en caché si está disponible', async function(this: ICustomWorld) {
  const cachedContent = this.page!.locator('[data-testid="cached-content"]');
  await expect(cachedContent).toBeVisible();
});

Then('debería mostrar el estado {string}', async function(this: ICustomWorld, status: string) {
  const statusElement = this.page!.locator(`[data-testid="connection-status"]:has-text("${status}")`);
  await expect(statusElement).toBeVisible();
});

Then('debería mostrar el detalle del error', async function(this: ICustomWorld) {
  const errorDetail = this.page!.locator('[data-testid="error-detail"]');
  await expect(errorDetail).toBeVisible();
});

Then('debería ofrecer {string} o {string}', async function(this: ICustomWorld, option1: string, option2: string) {
  const button1 = this.page!.locator(`button:has-text("${option1}")`);
  const button2 = this.page!.locator(`button:has-text("${option2}")`);
  const visible = await button1.isVisible().catch(() => false) || await button2.isVisible().catch(() => false);
  expect(visible).toBe(true);
});

Then('debería registrar el error en logs', async function(this: ICustomWorld) {
  // Verificar que hay indicadores de error en la UI
  await expect(this.page!.locator('[data-testid="error-logged-indicator"]')).toBeVisible();
});

Then('debería continuar con la siguiente canción', async function(this: ICustomWorld) {
  const progressBar = this.page!.locator('[data-testid="sync-progress-bar"]');
  await expect(progressBar).toBeVisible();
});

Then('al finalizar debería mostrarse {string}', async function(this: ICustomWorld, message: string) {
  await this.page!.waitForSelector(`text=${message}`, { timeout: 30000 });
});

Then('debería ofrecer ver el reporte de errores', async function(this: ICustomWorld) {
  const viewReportButton = this.page!.locator('button:has-text("Ver reporte")');
  await expect(viewReportButton).toBeVisible();
});

// Eliminada duplicación: debería sugerir {string} está en filters-search.steps.ts

Then('debería mostrarse un mensaje genérico amigable', async function(this: ICustomWorld) {
  const friendlyError = this.page!.locator('[data-testid="friendly-error"]');
  await expect(friendlyError).toBeVisible();
});

Then('no debería mostrarse código de error técnico al usuario', async function(this: ICustomWorld) {
  const technicalError = this.page!.locator('[data-testid="technical-error-code"]');
  const isVisible = await technicalError.isVisible().catch(() => false);
  expect(isVisible).toBe(false);
});

Then('los detalles técnicos deberían estar disponibles para soporte', async function(this: ICustomWorld) {
  const technicalDetails = this.page!.locator('[data-testid="technical-details"]');
  await expect(technicalDetails).toBeVisible();
});
