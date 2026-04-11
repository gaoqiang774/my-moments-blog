const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the admin panel
app.use('/admin', express.static(path.join(__dirname, 'public')));
// Serve blog files for preview
app.use('/', express.static(path.join(__dirname, '../')));

const dataFilePath = path.join(__dirname, '../data.json');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../images');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'post-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// API: Get posts
app.get('/api/posts', (req, res) => {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return res.json({ posts: [] });
        }
        const data = fs.readFileSync(dataFilePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Save post (Create or Update)
app.post('/api/posts', (req, res) => {
    try {
        const newPost = req.body;
        let data = { posts: [] };
        
        if (fs.existsSync(dataFilePath)) {
            data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        }
        
        if (newPost.id) {
            // Update
            const index = data.posts.findIndex(p => String(p.id) === String(newPost.id));
            if (index >= 0) {
                data.posts[index] = newPost;
            } else {
                data.posts.push(newPost);
            }
        } else {
            // Create
            newPost.id = Date.now().toString();
            data.posts.push(newPost);
        }
        
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true, post: newPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Delete post
app.delete('/api/posts/:id', (req, res) => {
    try {
        const id = req.params.id;
        if (!fs.existsSync(dataFilePath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        let data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        const index = data.posts.findIndex(p => String(p.id) === String(id));
        if (index === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }
        data.posts.splice(index, 1);
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return relative path to be used right away
    res.json({ url: `./images/${req.file.filename}` });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🌟 本地后台已启动！`);
    console.log(`👉 请在浏览器打开: http://localhost:${PORT}/admin`);
    console.log(`=================================`);
});
