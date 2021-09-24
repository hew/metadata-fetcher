module.exports = {
  react: {
    strictMode: true
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        $$: 'eres',
      })
    )
    return config
  },
}
