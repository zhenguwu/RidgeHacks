const fs = require("fs");
const minify = require('html-minifier').minify;
const path = require("path")

const autoprefixer = require('cssnano')
const postcss = require('postcss')

const UglifyJS = require("uglify-js");

// Turn off variable name mangling, the default of true messes up some of the js libraries.
const UglifyOptions = {
    mangle: {
        properties: false,
    }
};

// Minify index.html
minifyHTML("src/index.html");

// Find and minify all CSS files
fromDir('./src', /\.css$/, minifyCSS);

// Find and minify all JS files.
fromDir('./src', /\.js$/, minifyJS);

function minifyJS(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, "utf8", (err, js) => {
        if (err) throw err;
        console.log("\t\tWriting " + outputPath);
        fs.writeFile(outputPath, UglifyJS.minify(js, UglifyOptions).code, (err) => { if (err) throw err; })
    })
}

function minifyCSS(src) {
    const outputPath = "dist" + src.substring(3);

    fs.readFile(src, (err, css) => {
        if (err) throw err;

        postcss([autoprefixer])
            .process(css, { from: src, to: outputPath })
            .then(result => {
                console.log("\t\tWriting " + outputPath);
                fs.writeFile(outputPath, result.css, (err) => { if (err) throw err; })
                if (result.map) {
                    fs.writeFile(outputPath, result.map, (err) => { if (err) throw err; })
                }
            });
    });
}

function minifyHTML(src) {
    fs.readFile(src, "utf8", function (err, data) {
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
            console.log("index.html has been minified.\n");
        });
    });
}

function fromDir(startPath, filter, callback) {
    console.log('\nStarting from dir ' + startPath + '/');

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            fromDir(filename, filter, callback); //recurse
        }
        else if (filter.test(filename)) {
            console.log("\tFound: " + filename);
            callback(filename);
        }
    };
};