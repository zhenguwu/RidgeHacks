const fs = require("fs");
const minify = require('html-minifier').minify;
const path = require("path")

const autoprefixer = require('cssnano')
const postcss = require('postcss')

// Minify index.html
minifyHTML("src/index.html");

// Find all CSS files
fromDir('./src', /\.css$/, minifyCSS);

function minifyCSS(src) {
    const output = "dist" + src.substring(3);

    fs.readFile(src, (err, css) => {
        postcss([autoprefixer])
            .process(css, { from: src, to: output })
            .then(result => {
                fs.writeFile(output, result.css, () => true)
                console.log("\t\tWriting " + output);
                if (result.map) {
                    fs.writeFile(output, result.map, () => true)
                }
            })
    })
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