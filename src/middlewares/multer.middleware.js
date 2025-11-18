// // -> read multer documentation on github 
// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "./public/temp")
//     },

//     filename: function(req, file, cb){
//         cb(null, file.originalname)
//     }
// })

// export const upload = multer({
//     storage,
// })

import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve the absolute path for public/temp
const tempPath = path.resolve("public/temp");

// Ensure folder exists (important for Render)
if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempPath); // use absolute path
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname); // save with original filename
  },
});

export const upload = multer({ storage });
