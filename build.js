var fse = require('fs-extra');
var minify = require("html-minifier").minify;
var autoprefixer = require("cssnano")
var postcss = require("postcss")
var UglifyJS = require("uglify-js");
var find = require("find");
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

// Remove any old files from /dist before minification to ensure that only necessary files are deployed.
fse.emptyDirSync("./dist");
console.log("Emptied /dist");


// Minify and copy files in parallel by running their respective functions async
async.parallel([
    copyStaticFiles(),
    minifyFiles(/\.html$/, minifyHTML),
    minifyFiles(/\.css$/, minifyCSS),
    minifyFiles(/\.js$/, minifyJS)
]).catch((err) => { if (err.message !== "expected a function") console.error(err) });


async function copyStaticFiles() {
    try {
        await fse.copy('./src', './dist', {
            // Returns true for all files that do not end in .js, .css or .html
            filter: (src, dest) => { return !(/\.css$/.test(src) || /\.js$/.test(src) || /\.html$/.test(src)); }
        });
        console.log('Finished copying static files.');
    } catch (err) {
        console.error("Error at copyStaticFiles():\n" + err);
    }
}

// Wrapper function that finds files and creates an async queue to pass them onto minification functions
async function minifyFiles(filter, minificationFunction) {
    find.file(filter, "./src", (files) => {
        try {
            var queue = async.queue(minificationFunction, files.length);
        } catch (err) {
            if (err instanceof RangeError) {
                console.error("WARNING!: Unable to find any files of file type: " + filter);
            } else {
                console.error("Error at creating queue in minifyFiles():\n" + err);
            }
            return;
        }

        // add files to the queue (batch-wise)
        queue.push(files, function (err) {
            if (err) console.error("Error at pushing queue in minifyFiles():\n" + err);
        });
    }).error((err) => { console.error("Error at minifyFiles():\n" + err) });
}

async function minifyHTML(src) {
    const outputPath = "dist" + src.substring(3);

    try {
        const data = await fse.readFile(src, "utf8");
        const htmlResult = minify(data, HTML_minifyOptions);
        await fse.outputFile(outputPath, htmlResult, "utf8");
        console.log("Output minified HTML:\t" + outputPath);
    } catch (err) {
        console.error("Error at minifyHTML():\n" + err);
    }
}

async function minifyCSS(src) {
    const outputPath = "dist" + src.substring(3);

    fse.readFile(src, (err, css) => {
        if (err) console.error("Error at minifyCSS():\n" + err);

        postcss([autoprefixer])
            .process(css, { from: src, to: outputPath })
            .then(result => {
                fse.outputFile(outputPath, result.css, (err) => { if (err) console.error("Error at minifyCSS():\n" + err); })
                if (result.map) {
                    fse.outputFile(outputPath, result.map, (err) => { if (err) console.error("Error at minifyCSS():\n" + err); })
                }
                console.log("Output minified CSS:\t" + outputPath);
            });
    });
}

async function minifyJS(src) {
    const outputPath = "dist" + src.substring(3);

    try {
        const data = await fse.readFile(src, "utf8");
        const jsResult = UglifyJS.minify(data, UglifyOptions).code;
        await fse.outputFile(outputPath, jsResult, "utf8");
        console.log("Output minified JS:\t" + outputPath);
    } catch (err) {
        console.error("Error at minifyJS():\n" + err);
    }
}