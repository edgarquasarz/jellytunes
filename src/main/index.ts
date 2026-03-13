import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log'
import usb from 'usb'

// Configure logging
log.transports.file.level = 'info'
log.info('Jellysync starting...')

let mainWindow: BrowserWindow | null = null

// USB detection with real node-usb
interface UsbDeviceInfo {
  deviceAddress: number
  vendorId: number
  productId: number
  productName?: string
  manufacturerName?: string
}

function listUsbDevices(): UsbDeviceInfo[] {
  try {
    const devices = usb.getDeviceList()
    return devices.map(device => ({
      deviceAddress: device.deviceAddress,
      vendorId: device.vendorId,
      productId: device.productId,
      productName: device.productName || undefined,
      manufacturerName: device.manufacturerName || undefined
    }))
  } catch (error) {
    log.error('Error listing USB devices:', error)
    return []
  }
}

// USB event handlers
function setupUsbEvents(): void {
  try {
    usb.on('attach', (device) => {
      log.info('USB device attached:', device.deviceAddress)
      mainWindow?.webContents.send('usb:attach', {
        deviceAddress: device.deviceAddress,
        vendorId: device.vendorId,
        productId: device.productId
      })
    })

    usb.on('detach', (device) => {
      log.info('USB device detached:', device.deviceAddress)
      mainWindow?.webContents.send('usb:detach', {
        deviceAddress: device.deviceAddress,
        vendorId: device.vendorId,
        productId: device.productId
      })
    })
  } catch (error) {
    log.error('Error setting up USB events:', error)
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    log.info('Window ready')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the app
  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (is.dev && rendererUrl) {
    log.info('Loading dev URL:', rendererUrl)
    mainWindow.loadURL(rendererUrl)
  } else {
    const filePath = join(__dirname, '../renderer/index.html')
    log.info('Loading file:', filePath)
    mainWindow.loadFile(filePath)
  }
}

// IPC Handlers
ipcMain.handle('usb:list', async () => {
  try {
    return listUsbDevices()
  } catch (error) {
    log.error('Error in usb:list handler:', error)
    return []
  }
})

ipcMain.handle('app:version', () => app.getVersion())

app.whenReady().then(() => {
  log.info('App ready')

  electronApp.setAppUserModelId('com.jellysync.app')

  // Setup USB event listeners
  setupUsbEvents()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

log.info('Main process initialized')
