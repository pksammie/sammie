const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const admin = require("firebase-admin");
const cloudinary = require('cloudinary').v2;

const app = express();
let initial_path = path.join(__dirname, "public");

// 1. Initialize Firebase (Using the Env Var you set on Render)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// --- ADMIN BOOTSTRAP CODE ---
// Replace 'your-email@gmail.com' with the email you use to login
admin.auth().getUserByEmail('your-email@gmail.com') 
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log("SUCCESS: You are now an admin!");
  })
  .catch(error => {
    console.log("Admin error:", error);
  });
// ----------------------------


// 2. Configure Cloudinary (Free Image Hosting)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.static(initial_path));
app.use(fileupload());

app.get('/', (req, res) => res.sendFile(path.join(initial_path, "index.html")));
app.get('/editor', (req, res) => res.sendFile(path.join(initial_path, "editor.html")));

// 3. Cloudinary Upload Route
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    let file = req.files.image;

    cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'blog' }, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Upload failed" });
        }
        res.json(result.secure_url); 
    }).end(file.data);
});

app.get("/:blog", (req, res) => res.sendFile(path.join(initial_path, "blog.html")));
// This route handles editing an existing blog
app.get('/:blog/editor', (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}......`));
