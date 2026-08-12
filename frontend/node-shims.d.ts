declare module 'path' {
  const path: {
    dirname(path: string): string
    resolve(...paths: string[]): string
  }

  export default path
}

declare module 'url' {
  export function fileURLToPath(url: string | URL): string
}

interface ImportMeta {
  url: string
}
