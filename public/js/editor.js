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

        fetch('/upload', {
            method: 'post',
            body: formdata
        }).then(res => res.json())
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

publishBtn.addEventListener('click', () => {
    // 1. FORCED RE-CHECK: Is the user still logged in?
    auth.onAuthStateChanged((user) => {
        if (!user) {
            alert("Your session expired. Please login again before publishing.");
            return location.replace("/dashboard.html");
        }
        
    // 1. Existing Validations
    if (!bannerPath) return alert("You must upload a banner image!");
    if (blogTitleField.value.length < 5) return alert("Title is too short!");
    
    // 2. NEW Safety Check: Ensure image tags aren't broken
    // This checks if they accidentally typed inside the <img > tag
    if (articleField.value.includes('<img') && !articleField.value.includes('src="https://cloudinary.com')) {
        return alert("❌ One of your image links looks broken. Please make sure you didn't delete the 'https' or any other part of the image source upload!");
    }

    if (articleField.value.length < 10) return alert("Article content is too short!");

    let blogPath = location.pathname.split("/").filter(x => x);
    let docName;

    // Check if we are creating a new blog or editing
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
        author: auth.currentUser.email.split("@")[0]
    }).then(() => {
        location.href = `/${docName}`;
    }).catch((err) => {
        console.error(err);
        alert("Error publishing.");
    });
});
});

auth.onAuthStateChanged((user) => {
    if (!user) location.replace("/dashboard.html");
});

// LOGIC FOR EDITING
let blogPath = location.pathname.split("/").filter(x => x);
// Only fetch if URL is /BLOG-ID/editor (length of 2)
if (blogPath.length === 2 && blogPath[1] === 'editor') {
    let actualBlogId = blogPath[0];
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
