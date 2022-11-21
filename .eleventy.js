const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');

module.exports = function (config) {
  config.setUseGitIgnore(false);

  config.addPassthroughCopy({'source/images/*': '/images'});

  if (process.env.NODE_ENV !== 'dev') {
    config.addPlugin(
      cacheBuster({
        createResourceHash: () => Date.now(),
      })
    );
  }

  return {
    templateFormats: ['md', 'html', 'js', 'js.map', 'css'],
    dir: {
      input: 'source',
    },
    pathPrefix: process.env.HIGHLIGHT_URL_PREFIX,
  };
};
