const express = require("express");
const routers = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const libre = require('libreoffice-convert');
var toPdf = require("office-to-pdf")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
    },
});



const docsToPDF = (req , file , callback) => {
    let ext = path.extname(file.originalname)


    console.log(ext )

    if(ext !== '.docx' && ext !== '.doc' ){
        return callback('this is not supported')
    }

    callback(null , true)
}



const docxToPDF = multer({
    storage: storage,
    fileFilter : docsToPDF
});

routers.get('/down', (req, res)=>{
    res.send('ok')
})

const pdfToDocxFilter = (req , file , callback) => {
    var ext = path.extname(file.originalname)

    if(ext !== '.pdf' ){
        return callback('not supported')
    }
    callback(null , true)
}

const pdfToDocx = multer({
    storage: storage,
    fileFilter : pdfToDocxFilter
});


const pptToPDFFilter = (req , file , callback) => {
    var ext = path.extname(file.originalname)

    if(ext !== '.ppt' && ext !== '.pptx' ){
        return callback('not supported')
    }
    callback(null , true)
}


const pptTOoPDF = multer({
    storage : storage,
    fileFilter : pptToPDFFilter
})








routers.post("/docxToPDF",  docxToPDF.single('file') ,(req , res) => {
    if(req.file){
        const file =  fs.readFileSync(req.file.path)
        let outputFilePath = Date.now() + "output.pdf"

        libre.convert(file , '.pdf' , undefined , (err , done) => {
            if(err){
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(outputFilePath)

                res.send('some error has taken in convertion')
            }

            try {
                fs.writeFileSync(`./uploads/${outputFilePath}`, done)
                console.log({outputFilePath})

            }catch(err){
                console.log(({err}))
            }
            res.download(`./uploads/${outputFilePath}` , (err , done) => {
                if(err){
                    console.log({err})
                    fs.unlinkSync(req.file.path)
                    fs.unlinkSync(outputFilePath)

                    res.send('some error has taken in download ')
                }
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(`./uploads/${outputFilePath}`)

            })
        } )

    }



});


routers.post('/pdfToOffice' , pdfToDocx.single('file') , async (req , res) => {
    let path = `./${req.file.path}`
    var wordBuffer = fs.readFileSync(path)


    var pdfBuffer = await toPdf(wordBuffer)

    console.log(pdfBuffer);
    res.send(pdfBuffer)

} )




routers.post("/ppttopdf",  pptTOoPDF.single('file') ,(req , res) => {
    if(req.file){
        const file =  fs.readFileSync(req.file.path)
        let outputFilePath = Date.now() + "output.pdf"

        libre.convert(file , '.pdf' , undefined , (err , done) => {
            if(err){
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(outputFilePath)

                res.send('some error has taken in convertion')
            }

            try {
                fs.writeFileSync(`./uploads/${outputFilePath}`, done)
                console.log({outputFilePath})

            }catch(err){
                console.log(({err}))
            }
            res.download(`./uploads/${outputFilePath}` , (err , done) => {
                if(err){
                    console.log({err})
                    fs.unlinkSync(req.file.path)
                    fs.unlinkSync(outputFilePath)

                    res.send('some error has taken in download ')
                }
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(`./uploads/${outputFilePath}`)

            })
        } )

    }



});


const uploadFiles = imageToPDF.array("files", 10); // limit to 10 images
const uploadImages =  (req, res, next) => {
    uploadFiles(req, res, err => {
        if (err instanceof multer.MulterError) { // A Multer error occurred when uploading.
            if (err.code === "LIMIT_UNEXPECTED_FILE") { // Too many images exceeding the allowed limit
                console.log('Too many images exceeding the allowed limit')
            }
        } else if (err) {
            console.log('handle other errors')
        }


        const saveImages = [];
        req.files.forEach((item, index) => {
            saveImages.push(item.path)
        })


        let outputFilePath = Date.now() + "output.pdf"



        imgToPDF(saveImages, 'A4').pipe(fs.createWriteStream(`./uploads/${outputFilePath}` ).on('close' , (err , done) => {
            res.send(done)
        }));




    });
};

routers.post('/imgToPDF' , uploadImages )


module.exports = routers