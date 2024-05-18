const multer = require('multer');

const storage = directorio => multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `public/uploads/${directorio}`)
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
});

const uploadHab = multer({storage: storage('habitaciones')});
const uploadInc = multer({storage: storage('incidencias')});

module.exports = {
    uploadHab: uploadHab,
    uploadInc: uploadInc
};