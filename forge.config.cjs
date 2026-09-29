const { MakerSquirrel } = require('@electron-forge/maker-squirrel');
const { MakerZIP } = require('@electron-forge/maker-zip');
const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'Tamify',
    productName: 'Tamify',
    executableName: 'Tamify',
    appBundleId: 'com.tamify.desktop',
    appCategoryType: 'public.app-category.utilities',
    icon: path.resolve(__dirname, 'assets/icon'),
    asar: true,
    extraResource: [
      path.resolve(__dirname, 'assets')
    ],
    ignore: [
      /^\/\.git/,
      /^\/\.github/,
      /^\/python_offline_suite\/(?!dist)/,
      /^\/tools/
    ]
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'Tamify',
      setupExe: 'Tamify-Setup.exe',
      setupIcon: path.resolve(__dirname, 'assets/icon.ico'),
      iconUrl: 'https://raw.githubusercontent.com/hadexcode-collab/Tamify/main/assets/icon.ico',
      description: 'Tamify • Tamil Legacy Document OCR, PDF to Excel & Unicode DOCX Studio',
      authors: 'Tamify',
      exe: 'Tamify.exe',
      noMsi: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true
    }),
    new MakerZIP({}, ['win32', 'darwin'])
  ]
};
