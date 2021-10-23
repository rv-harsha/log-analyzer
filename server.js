const express = require("express");
const webpack = require("webpack");

var cors = require("cors"),
  bodyParser = require("body-parser"),
  helmet = require("helmet"),
  path = require("path"),
  formidableMiddleware = require("express-formidable"),
  request = require("request"),
  fs = require("fs");

const app = express();
/*const config = require("./webpack.dev.js");
const compiler = webpack(config); */
app.use(express.static(__dirname + "/dist"));
app.use(helmet());
app.use(cors());
const events = [
  {
    event: "file",
    action: function(req, res, next, name, file) {
      const formData = {
        files: fs.createReadStream(file.path)
      };
      request.post(
        {
          url: "http://127.0.0.1:5000/LogAnalyzer/file/upload",
          formData: formData
        },
        function optionalCallback(err, httpResponse, body) {
          if (err) {
            return console.error("upload failed:", err);
          } else {
            res.setHeader("Content-Type", "application/json");
            return res.status(200).json(body);
          }
        }
      );
    }
  },
  {
    event: "field",
    action: function(req, res, next, name, value) {}
  }
];

app.use(
  formidableMiddleware(
    {
      encoding: "utf-8",
      uploadDir: path.join(__dirname, "/uploaded-files"),
      multiples: true,
      keepExtensions: true
    },
    events
  )
);

/*app.use(function(req, res, next) {
  var form = new formidable.IncomingForm({
    encoding: "utf-8",
    uploadDir: path.join(__dirname, "/UploadedFiles"),
    multiples: true,
    keepExtensions: true
  });
  form.once("error", console.log);
  form.parse(req, function(err, fields, files) {
    Object.assign(req, { fields, files });
    next();
  });
});*/

app.post("/upload", (req, res) => {
  console.log("FIELDS -->" + JSON.stringify(req.fields)); // contains non-file fields
  console.log("FILES" + JSON.stringify(req.files)); // contains files
  //console.log("Upload successful!  Server responded with:", body);
  //res.sendStatus(200);
});

app.use(require("./routes"));

app.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "dist/index.html"), function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});
// Tell express to use the webpack-dev-middleware and use the webpack.dev.js
// configuration file as a base.
/*app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));*/

// Serve the files on port 3000.
app.listen(3050, function() {
  console.log("Example app listening on port 3000!\n");
});
