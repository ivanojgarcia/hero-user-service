
export const ES_BUILD = {
  esbuild: {
    bundle: true,
    minify: false,
    sourcemap: true,
    exclude: ['aws-sdk'],
    target: 'node16',
    define: { 'require.resolve': undefined },
    platform: 'node',
    concurrency: 10,
  }
}

export const SLS_OFFLINE = {
  "serverless-offline": {
    httpPort: 3000,
    babelOptions: {
      presets: ["env"],
    },
  },
}

