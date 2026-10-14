const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * jsPDF (ekspor Laporan) memuat modul ini lewat import() hanya untuk fitur HTML/SVG yang tidak
 * dipakai aplikasi. Dijadikan modul kosong supaya tidak ikut ter-bundle.
 */
const EMPTY_MODULES = new Set(['html2canvas', 'dompurify', 'canvg']);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) =>
      EMPTY_MODULES.has(moduleName)
        ? { type: 'empty' }
        : context.resolveRequest(context, moduleName, platform),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
