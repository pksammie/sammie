const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const admin = require("firebase-admin");

// 1. INITIALIZE FIREBASE
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "blogging-website-1fc45.appspot.com" // Replace with your Project ID
});

const bucket = admin.storage().bucket();
const app = express();
let initial_path = path.join(__dirname, "public");

app.use(express.static(initial_path));
app.use(fileupload());

// Standard routes
app.get('/', (req, res) => res.sendFile(path.join(initial_path, "index.html")));
app.get('/editor', (req, res) => res.sendFile(path.join(initial_path, "editor.html")));

// 2. FIXED UPLOAD ROUTE (Uploading to Firebase)
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    let file = req.files.image;
    let imagename = Date.now() + "_" + file.name;
    
    // Create a reference to the file in Firebase Storage
    const blob = bucket.file(`uploads/${imagename}`);
    const blobStream = blob.createWriteStream({
        metadata: { contentType: file.mimetype },
        resumable: false
    });

    blobStream.on('error', (err) => {
        return res.status(500).json({ error: "Upload failed: " + err.message });
    });

    blobStream.on('finish', async () => {
        // Generate a public URL to send back to your frontend
        try {
            await blob.makePublic(); // Optional: Makes file accessible via URL
            const publicUrl = `https://storage.googleapis.com{bucket.name}/${blob.name}`;
            res.json(publicUrl);
        } catch (err) {
            res.status(500).json({ error: "Could not make file public" });
        }
    });

    blobStream.end(file.data); // Send the file buffer to Firebase
});

// Other routes remain the same...
app.get("/:blog", (req, res) => res.sendFile(path.join(initial_path, "blog.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}......`));
