var fs = require("fs");
var minify = require('html-minifier').minify;

fs.readFile("src/index.html", "utf8", function(err, data) {
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

        console.log("outputted html");
    });

});