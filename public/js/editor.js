// Show warning when entering the editor
window.onload = () => {
    alert("⚠️ IMPORTANT: When you upload an image, a 'link' starting with <img src=... will appear in your text. \n\nDO NOT delete or change any part of that link, or your image will not show up in the blog!");
};

const blogTitleField = document.querySelector('.title');
const articleField = document.querySelector('.article');
const bannerImage = document.querySelector('#banner-upload');
const banner = document.querySelector(".banner");
let bannerPath = "";

const publishBtn = document.querySelector('.publish-btn');
const uploadInput = document.querySelector('#image-upload');

bannerImage.addEventListener('change', () => uploadImage(bannerImage, "banner"));
uploadInput.addEventListener('change', () => uploadImage(uploadInput, "image"));

const uploadImage = (uploadFile, uploadType) => {
    const [file] = uploadFile.files;
    if (file && file.type.includes("image")) {
        const formdata = new FormData();
        formdata.append('image', file);

        fetch('/upload', { method: 'post', body: formdata })
            .then(res => res.json())
            .then(data => {
                if (uploadType == "image") {
                    addImage(data, file.name);
                } else {
                    bannerPath = data;
                    banner.style.backgroundImage = `url("${bannerPath}")`;
                }
            });
    } else {
        alert("Upload images only");
    }
};

const addImage = (imagepath, alt) => {
    let curPos = articleField.selectionStart;
    let textToInsert = `\n<img src="${imagepath}" class="article-image" alt="${alt}">\n`;
    articleField.value = articleField.value.slice(0, curPos) + textToInsert + articleField.value.slice(curPos);
};

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- FIXED PUBLISH BUTTON ---
publishBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Session expired. Please login again.");
        return location.replace("/dashboard.html");
    }

    if (!bannerPath) return alert("You must upload a banner image!");
    if (blogTitleField.value.length < 5) return alert("Title is too short!");
    if (articleField.value.includes('<img') && !articleField.value.includes('src="http')) {
        return alert("❌ Image link looks broken!");
    }
    if (articleField.value.length < 10) return alert("Article content is too short!");

    let blogPath = location.pathname.split("/").filter(x => x);
    let docName;

    if (blogPath.length === 1 && blogPath[0] === 'editor') {
        let letters = 'abcdefghijklmnopqrstuvwxyz';
        let blogTitle = blogTitleField.value.split(" ").join("-");
        let id = '';
        for(let i = 0; i < 6; i++) id += letters[Math.floor(Math.random() * letters.length)];
        docName = `${blogTitle}-${id}`;
    } else {
        docName = decodeURI(blogPath[0]);
    }

    let date = new Date();
    db.collection("blogs").doc(docName).set({
        title: blogTitleField.value,
        article: articleField.value,
        bannerImage: bannerPath,
        publishedAt: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
        author: user.email.split("@")[0]
    }).then(() => {
        // Successful redirect
        location.href = `/${docName}`;
    }).catch((err) => {
        console.error(err);
        alert("Error publishing.");
    });
});

auth.onAuthStateChanged((user) => {
    if (!user) location.replace("/dashboard.html");
});

// LOGIC FOR LOADING EXISTING DATA
let blogPathArr = location.pathname.split("/").filter(x => x);

// Check if we are in the edit mode (e.g., /blog-name/editor)
if (blogPathArr.length >= 2 && blogPathArr.includes('editor')) {
    let actualBlogId = blogPathArr[0]; // The blog name is the first part
    let docRef = db.collection("blogs").doc(decodeURI(actualBlogId));
    
    docRef.get().then((doc) => {
        if (doc.exists) {
            let data = doc.data();
            bannerPath = data.bannerImage;
            banner.style.backgroundImage = `url("${bannerPath}")`;
            blogTitleField.value = data.title;
            articleField.value = data.article;
        } else {
            location.replace("/");
        }
    });
}

