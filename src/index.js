const http = require("http");
const fs = require("fs");
const path = require("path");

////
const base = __dirname;
///

//create a server object:
http
  .createServer(async function(req, res) {
    await logic(req, res);
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080

/**
 *
 */
async function logic(req, res) {
  try {
    const result = await getFilesByRegex(new RegExp(`.txt`), {
      directory: path.join(base, "files/sub"),
      includeData: true
    });
    res.write(JSON.stringify(result, null, 1));
  } catch (err) {
    // res.status(500);
    console.error(err);
    res.write("error");
  }
}

/**
 *
 */
async function getFilesByRegex(
  regex,
  { directory = path.join(base, "files"), includeData = true }
) {
  if (regex instanceof RegExp === false) {
    throw new Error("First argumest should be a regex");
  }

  // loop through the stream & stop when totalFieldCount is 0.
  return new Promise((resolve, reject) => {
    fs.readdir(directory, async (err, files) => {
      if (err) {
        return reject(err);
      }
      console.log({ files });
      // remove none files from list
      const filteredFiles = files
        .filter(filename => {
          const file_location = path.join(directory, filename);
          const isAFile = fs.lstatSync(file_location).isFile();
          // if not a file
          if (!isAFile) {
            return false;
          }

          // check regex
          return regex.test(filename);
        })
        .map(async filename => {
          // get actual file
          const file_location = path.join(directory, filename);
          let data = null;
          if (includeData) {
            data = await getFilesAsync(file_location);
          }
          return {
            filename: filename,
            file_location: file_location,
            include_data: includeData,
            data
          };
        });

      const filesWithData = await Promise.all(filteredFiles);
      return resolve(filesWithData);
    });
  });
}

/**
 *
 */
async function getFilesAsync(file_location) {
  return new Promise((resolve, reject) => {
    fs.readFile(file_location, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}
