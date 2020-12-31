var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`) //Appending extension
  }
});
var upload = multer({
  storage: storage
}); 


const IMAGES_DIR = 'public/images';

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'image.io backend server' });
});

router.post("/api/images", upload.array('photos'), (req, res, next) => {
  res.json({ "message": "Images uploaded" });
})

router.get("/api/images", async (req, res, next) => {
  var arr = [];
  var files = [];
  try {
    files = await fs.promises.readdir(IMAGES_DIR);
    files = files.filter(file => !(/(^|\/)\.[^\/\.]/g).test(file));
  } catch(err) {
    return next(err);
  }
  
  for(var i = files.length - 1; i >= 0; i--) {
    var file = files[i];
    var host = process.env.MODE == 'development' ? `http://${process.env.HOST}:${process.env.PORT}` : `https://${process.env.HOST}`;
    var img = `${host}/images/${file}`;
    if(req.query.search) {
      if(img.includes(req.query.search)) arr.push(img);
    } else {
      arr.push(img);
    }
  }
  return res.json(arr);;
})

module.exports = router;
