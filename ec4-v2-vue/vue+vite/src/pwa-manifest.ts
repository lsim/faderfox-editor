export default {
  name: 'Faderfox EC4 Editor',
  short_name: 'FFox EC4',
  description: 'A midi-enabled web-based editor for the Faderfox EC4 midi controller.',
  theme_color: '#c2c457',
  background_color: '#5160b0',
  scope: '/faderfox-editor/',
  icons: [
    {
      src: '/faderfox-editor/web-app-manifest-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/faderfox-editor/web-app-manifest-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
  ],
};

// export interface VitePWAOptions {
//   mode?: 'development' | 'production'
//   srcDir?: string
//   outDir?: string
//   filename?: string
//   manifestFilename?: string
//   strategies?: 'generateSW' | 'injectManifest'
//   scope?: string
//   injectRegister: 'inline' | 'script' | 'script-defer' | 'auto' | false | null
//   registerType?: 'prompt' | 'autoUpdate'
//   minify: boolean
//   manifest: Partial<ManifestOptions> | false
//   useCredentials?: boolean
//   workbox: Partial<GenerateSWOptions>
//   injectManifest: Partial<CustomInjectManifestOptions>
//   base?: string
//   includeAssets: string | string[] | undefined
//   includeManifestIcons: boolean
//   disable: boolean
//   integration?: PWAIntegration
//   devOptions?: DevOptions
//   selfDestroying?: boolean
//   buildBase?: string
//   pwaAssets?: PWAAssetsOptions
//   showMaximumFileSizeToCacheInBytesWarning?: boolean
// }
