const fs = require("fs");
const titleize = require("titleize");

module.exports = {
eleventyComputed: {
    themes: () => {
        const ids = Array.from(fs.readdirSync("node_modules/highlightjs/styles")
            .filter(path => path.endsWith('.css'))
            .map(path => path.substring(0, path.length - 4))
            .filter(id => id !== 'default'));
        ids.sort();
        return [...ids.map(id => ({id, name: titleize(id.replace(/[-_.]/g, ' '))}))]
    }
}
};
