var fs = require("fs");
var minify = require('html-minifier').minify;
var path = require("path")

var autoprefixer = require('cssnano')
var postcss = require('postcss')

var UglifyJS = require("uglify-js");

var find = require('find');

var async = require("async");

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
//minifyHTML("src/index.html");

// Minify files in paralell by running their respective functions async 
async.parallel([
    minifyFiles(/\.html$/, minifyHTML),
    minifyFiles(/\.css$/, minifyCSS),
    minifyFiles(/\.js/, minifyJS)
]).catch((err) => { if (err.message !== "expected a function") console.error(err) });


// Wrapper function that finds files and creates an async queue to pass them onto minification functions
async function minifyFiles(filter, minificationFunction) {
    find.file(filter, './src', (files) => {

        try {
            var queue = async.queue(minificationFunction, files.length);
        } catch (e) {
            if (e instanceof RangeError) console.error("ERROR!: Unable to find any files of file type: " + filter);
            return;
        }
       

        // add files to the queue (batch-wise)
        queue.push(files, function (err) {
            if (err) throw err;
        });
    }).error((err) => { if (err) throw err; });
}

async function minifyHTML(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, "utf8", function (err, data) {
        if (err) throw err;
        var htmlResult = minify(data, HTML_minifyOptions);

        fs.writeFile("dist/index.html", htmlResult, "utf8", (err) => {
            if (err) throw err;
            console.log("minifyHTML:\tOutput minified HTML " + outputPath);
        });
    });
}

async function minifyCSS(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, (err, css) => {
        if (err) throw err;

        postcss([autoprefixer])
            .process(css, { from: src, to: outputPath })
            .then(result => {
                fs.writeFile(outputPath, result.css, (err) => { if (err) throw err; })
                if (result.map) {
                    fs.writeFile(outputPath, result.map, (err) => { if (err) throw err; })
                }
                console.log("minifyCSS:\tOutput minified CSS " + outputPath);
            });
    });
}

async function minifyJS(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, "utf8", (err, js) => {
        if (err) throw err;
        console.log("minifyJS:\tOutput minified JS " + outputPath);
        fs.writeFile(outputPath, UglifyJS.minify(js, UglifyOptions).code, (err) => { if (err) throw err; })
    });
}