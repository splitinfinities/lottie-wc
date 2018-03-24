exports.config = {
  namespace: 'lottie',
  outputTargets:[{type: 'dist'}, {type: 'www', serviceWorker: false}]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
