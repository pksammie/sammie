const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const admin = require("firebase-admin");
const cloudinary = require('cloudinary').v2;

const app = express();
let initial_path = path.join(__dirname, "public");

// 1. Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// 2. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.static(initial_path));
app.use(fileupload());

// --- ROUTES START ---

// Home Page
app.get('/', (req, res) => res.sendFile(path.join(initial_path, "index.html")));

// NEW BLOG ROUTE (Must be before /:blog)
app.get('/editor', (req, res) => res.sendFile(path.join(initial_path, "editor.html")));

// Route to list all registered users
app.get('/admin/get-users', async (req, res) => {
    try {
        const listUsers = await admin.auth().listUsers();
        res.json(listUsers.users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to serve the admin page
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(initial_path, "admin.html"));
});


// EDIT BLOG ROUTE (Must be before /:blog)
app.get('/:blog/editor', (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
});

// VIEW BLOG ROUTE (Must be LAST as it catches everything)
app.get("/:blog", (req, res) => res.sendFile(path.join(initial_path, "blog.html")));

// Upload Route
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    let file = req.files.image;
    cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'blog' }, (error, result) => {
        if (error) return res.status(500).json({ error: "Upload failed" });
        res.json(result.secure_url); 
    }).end(file.data);
});

// Admin Delete User Route
app.post('/admin/delete-user', async (req, res) => {
    const { targetUid, adminUid } = req.body;
    try {
        const adminUser = await admin.auth().getUser(adminUid);
        if (adminUser.customClaims && adminUser.customClaims.admin) {
            await admin.auth().deleteUser(targetUid);
            res.json({ message: "User removed successfully" });
        } else {
            res.status(403).send("Unauthorized");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- SERVER & ADMIN BOOSTER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}......`));

const makeMeAdmin = async () => {
    try {
        const user = await admin.auth().getUserByEmail('samsonpamilerin959@gmail.com');
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        console.log("BOOSTER: You are now officially an ADMIN!");
    } catch (err) {
        console.log("BOOSTER ERROR:", err.message);
    }
}
makeMeAdmin();
