var fs = require("fs");
var minify = require('html-minifier').minify;

// Minify index.html
minifyHTML("src/index.html");





function minifyHTML(src) {
    fs.readFile(src, "utf8", function(err, data) {
        if (err) throw err;

        var htmlResult = minify(data, {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            removeComments: true,
            removeOptionalTags: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeTagWhitespace: true,
            useShortDoctype: true
        });

        fs.writeFile("dist/index.html", htmlResult, "utf8", (err) => {
            if (err) throw err;
            console.log("index.html has been minified.");
        });
    });
}