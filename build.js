const fs = require("fs");
const minify = require('html-minifier').minify;
const path = require("path")

const autoprefixer = require('cssnano')
const postcss = require('postcss')

const UglifyJS = require("uglify-js");

const find = require('find');

// Turn off variable name mangling, the default of true messes up some of the js libraries.
const UglifyOptions = {
    mangle: {
        properties: false,
    }
};

// Enable HTML minification options.
const HTML_minifyOptions = {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeTagWhitespace: true,
    useShortDoctype: true
}

// Minify index.html
minifyHTML("src/index.html");

// Find and minify all CSS files
find.eachfile(/\.css$/, './src', minifyCSS);

// Find and minify all JS files.
find.eachfile(/\.js$/, './src', minifyJS);

function minifyHTML(src) {
    fs.readFile(src, "utf8", function (err, data) {
        if (err) throw err;

        var htmlResult = minify(data, HTML_minifyOptions);

        fs.writeFile("dist/index.html", htmlResult, "utf8", (err) => {
            if (err) throw err;
            console.log("index.html has been minified.\n");
        });
    });
}

function minifyCSS(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, (err, css) => {
        if (err) throw err;

        postcss([autoprefixer])
            .process(css, { from: src, to: outputPath })
            .then(result => {
                console.log("\t\tWriting minified CSS " + outputPath);
                fs.writeFile(outputPath, result.css, (err) => { if (err) throw err; })
                if (result.map) {
                    fs.writeFile(outputPath, result.map, (err) => { if (err) throw err; })
                }
            });
    });
}

function minifyJS(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, "utf8", (err, js) => {
        if (err) throw err;
        console.log("\t\tWriting minified JS " + outputPath);
        fs.writeFile(outputPath, UglifyJS.minify(js, UglifyOptions).code, (err) => { if (err) throw err; })
    })
}