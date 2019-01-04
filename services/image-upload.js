const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const config = require("../config");

aws.config.update({
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  region: "us-east-2"
});

const s3 = new aws.S3();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg"
};

const fileFilter = (req, file, cb) => {
  const isValid = MIME_TYPE_MAP[file.mimetype];
  if (isValid) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type, only JPEG, PNG and JPG is allowed!"),
      false
    );
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: "bwd-ng-react",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});

module.exports = upload;
