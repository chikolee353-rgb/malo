const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const app = express()
app.use(cors())

const UPLOAD_ROOT = path.join(__dirname, 'uploads')
function ensureDir(dir){ if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}) }
ensureDir(UPLOAD_ROOT)

app.use('/uploads', express.static(UPLOAD_ROOT))
// Serve frontend files (home.html, styles, app.js)
app.use(express.static(__dirname))

app.get('/api/ping',(req,res)=>res.json({ok:true}))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = (req.query.type||'others')
    const dir = path.join(UPLOAD_ROOT, type)
    ensureDir(dir)
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-]/g,'_')
    cb(null, name)
  }
})
const upload = multer({ storage })

app.post('/api/upload', upload.single('file'), (req,res)=>{
  if(!req.file) return res.status(400).json({error:'No file'})
  const type = req.query.type||'others'
  const url = `/uploads/${type}/${req.file.filename}`
  res.json({name:req.file.originalname, url})
})

app.get('/api/list', (req,res)=>{
  const type = req.query.type||'others'
  const dir = path.join(UPLOAD_ROOT, type)
  if(!fs.existsSync(dir)) return res.json([])
  const files = fs.readdirSync(dir).map(f=>({name:f, url:`/uploads/${type}/${f}`}))
  res.json(files)
})

const PORT = process.env.PORT||3000
app.listen(PORT, ()=>console.log(`Upload server running on http://localhost:${PORT}`))
