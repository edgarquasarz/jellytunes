import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Given steps
Given('la biblioteca está cargada', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="library-content"]');
});

Given('hay un dispositivo USB conectado', async function(this: ICustomWorld) {
  // Simular dispositivo conectado o verificar que existe
  const devices = await this.page!.locator('[data-testid="usb-device"]').count();
  expect(devices).toBeGreaterThan(0);
});

Given('el usuario ha seleccionado 5 canciones', async function(this: ICustomWorld) {
  // Seleccionar 5 canciones
  const checkboxes = this.page!.locator('[data-testid="track-checkbox"]');
  for (let i = 0; i < 5; i++) {
    await checkboxes.nth(i).check();
  }
});

Given('la sincronización está en progreso', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="sync-progress"]');
});

Given('el usuario ha seleccionado canciones que exceden el espacio disponible', async function(this: ICustomWorld) {
  // Simular selección de muchas canciones
  const checkboxes = this.page!.locator('[data-testid="track-checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < Math.min(count, 100); i++) {
    await checkboxes.nth(i).check();
  }
});

// When steps
When('un dispositivo USB es conectado', async function(this: ICustomWorld) {
  // Simular evento de conexión USB
  await this.page!.evaluate(() => {
    window.dispatchEvent(new CustomEvent('usb-device-connected'));
  });
});

When('el usuario marca la casilla de la canción {string}', async function(this: ICustomWorld, songName: string) {
  const track = this.page!.locator(`[data-testid="track-item"]:has-text("${songName}")`);
  await track.locator('[data-testid="track-checkbox"]').check();
});

When('el usuario marca la opción de sincronización {string}', async function(this: ICustomWorld, checkboxLabel: string) {
  if (checkboxLabel === 'Seleccionar todo') {
    await this.page!.click('[data-testid="select-all-checkbox"]');
  } else {
    await this.page!.check(`label:has-text("${checkboxLabel}") input[type="checkbox"]`);
  }
});

When('el dispositivo USB es desconectado', async function(this: ICustomWorld) {
  await this.page!.evaluate(() => {
    window.dispatchEvent(new CustomEvent('usb-device-disconnected'));
  });
});

// Then steps
Then('debería detectarse el dispositivo automáticamente', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="usb-device"]', { timeout: 5000 });
});

Then('debería mostrarse el nombre del dispositivo', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="device-name"]')).toBeVisible();
});

Then('debería mostrar el espacio disponible', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="device-free-space"]')).toBeVisible();
});

Then('el botón {string} debería habilitarse', async function(this: ICustomWorld, buttonText: string) {
  const button = this.page!.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeEnabled();
});

Then('el contador de canciones seleccionadas debería mostrar {string}', async function(this: ICustomWorld, count: string) {
  const counter = this.page!.locator('[data-testid="selected-count"]');
  await expect(counter).toHaveText(count);
});

Then('el indicador de espacio requerido debería actualizarse', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="required-space"]')).toBeVisible();
});

Then('todas las canciones del álbum deberían estar marcadas', async function(this: ICustomWorld) {
  const checkboxes = this.page!.locator('[data-testid="track-checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).toBeChecked();
  }
});

Then('el contador debería mostrar el total de canciones del álbum', async function(this: ICustomWorld) {
  const totalTracks = await this.page!.locator('[data-testid="track-item"]').count();
  const counter = this.page!.locator('[data-testid="selected-count"]');
  await expect(counter).toHaveText(String(totalTracks));
});

Then('debería iniciarse el proceso de sincronización', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="sync-progress"]', { timeout: 5000 });
});

Then('debería mostrarse una barra de progreso', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="sync-progress-bar"]')).toBeVisible();
});

Then('la sincronización completa', async function(this: ICustomWorld) {
  // Esperar a que la barra de progreso llegue al 100%
  await this.page!.waitForFunction(() => {
    const progressBar = document.querySelector('[data-testid="sync-progress-bar"]');
    return progressBar && progressBar.getAttribute('aria-valuenow') === '100';
  }, { timeout: 30000 });
});

Then('las canciones deberían estar en el dispositivo USB', async function(this: ICustomWorld) {
  // Verificar que se muestra confirmación
  await expect(this.page!.locator('[data-testid="sync-completed-message"]')).toBeVisible();
});

Then('la sincronización debería detenerse', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="sync-cancelled"]', { timeout: 5000 });
});

Then('los archivos parcialmente copiados deberían eliminarse', async function(this: ICustomWorld) {
  // Verificar estado de limpieza
  await expect(this.page!.locator('[data-testid="cleanup-completed"]')).toBeVisible();
});

Then('la sincronización debería pausarse', async function(this: ICustomWorld) {
  const status = this.page!.locator('[data-testid="sync-status"]');
  await expect(status).toHaveText('Pausada');
});

Then('el botón {string} debería estar disponible', async function(this: ICustomWorld, buttonText: string) {
  const button = this.page!.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
});

Then('debería mostrar cuánto espacio adicional se necesita', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="additional-space-needed"]')).toBeVisible();
});

Then('la sincronización no debería iniciarse', async function(this: ICustomWorld) {
  // Verificar que no aparece la barra de progreso
  const progressBar = this.page!.locator('[data-testid="sync-progress"]');
  await expect(progressBar).not.toBeVisible();
});
