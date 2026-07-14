const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const { s3, bucketName } = require('../config/aws');

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const folderMap = {
  avatar: 'users',
  donorImage: 'donors',
  donorPhoto: 'donors',
  requestImage: 'requests',
  requestAttachment: 'requests',
  report: 'reports'
};

const getFolderName = (req, file) => {
  if (folderMap[file.fieldname]) {
    return folderMap[file.fieldname];
  }

  const path = `${req.baseUrl || ''}${req.path || ''}`.toLowerCase();
  if (path.includes('/donor')) return 'donors';
  if (path.includes('/request')) return 'requests';
  if (path.includes('/report')) return 'reports';
  if (path.includes('/user') || file.fieldname === 'avatar') return 'users';

  return 'uploads';
};

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder = getFolderName(req, file);
      const extension = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
      }[file.mimetype];

      cb(null, `${folder}/${uuidv4()}.${extension}`);
    }
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload };