let blogId = decodeURI(location.pathname.split("/").pop());
let docRef = db.collection("blogs").doc(blogId);

// 1. FETCH BLOG DATA
docRef.get().then((doc) => {
    if (doc.exists) {
        setupBlog(doc.data());
    } else {
        location.replace("/");
    }
});

const setupBlog = (data) => {
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');

    banner.style.backgroundImage = `url("${data.bannerImage}")`;
    titleTag.innerHTML += blogTitle.innerHTML = data.title;
    publish.innerHTML += data.publishedAt;
    publish.innerHTML += ` -- ${data.author}`;

    // 2. CHECK FOR EDIT PERMISSIONS (ADMIN OR AUTHOR)
    auth.onAuthStateChanged((user) => {
        if (user) {
            user.getIdTokenResult(true).then((idTokenResult) => {
                const isAdmin = idTokenResult.claims.admin;
                const isAuthor = data.author === user.email.split('@')[0];

                if (isAdmin || isAuthor) {
                    let editBtn = document.getElementById('edit-blog-btn');
                    editBtn.style.display = "inline";
                    editBtn.href = `/${blogId}/editor`;
                }
            });
        }
    });

    const article = document.querySelector('.article');
    addArticle(article, data.article);
};

const addArticle = (ele, data) => {
    data = data.split("\n").filter(item => item.length);
    data.forEach(item => {
        if (item[0] == '#') {
            let hCount = 0, i = 0;
            while (item[i] == '#') { hCount++; i++; }
            let tag = `h${hCount}`;
            ele.innerHTML += `<${tag}>${item.slice(hCount, item.length)}</${tag}>`;
        } else if (item[0] == "!" && item[1] == "[") {
            let seperator;
            for (let i = 0; i <= item.length; i++) {
                if (item[i] == "]" && item[i + 1] == "(" && item[item.length - 1] == ")") {
                    seperator = i;
                }
            }
            let alt = item.slice(2, seperator);
            let src = item.slice(seperator + 2, item.length - 1);
            ele.innerHTML += `<img src="${src}" alt="${alt}" class="article-image">`;
        } else {
            ele.innerHTML += `<p>${item}</p>`;
        }
    });
};

// 3. COMMENT LOGIC
const commentInput = document.querySelector('#comment-input');
const addCommentBtn = document.querySelector('#add-comment-btn');
const commentsContainer = document.querySelector('.comments-container');

addCommentBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to post a comment.");
        location.replace("./dashboard.html");
        return;
    }

    if (commentInput.value.length) {
        db.collection("comments").add({
            blogId: blogId,
            comment: commentInput.value,
            author: user.email.split('@')[0],
            publishedAt: new Date().getTime()
        })
        .then(() => {
            commentInput.value = '';
        })
        .catch(err => console.error("Error adding comment: ", err));
    }
});

// 4. FETCH AND DISPLAY COMMENTS (WITH DELETE BUTTON FOR OWNER/ADMIN)
db.collection("comments")
    .where("blogId", "==", blogId)
    .orderBy("publishedAt", "desc")
    .onSnapshot((snapshot) => {
        commentsContainer.innerHTML = ''; 
        snapshot.forEach((doc) => {
            let data = doc.data();
            let commentId = doc.id;
            
            // Check if current user can delete this comment
            auth.onAuthStateChanged((user) => {
                if(user){
                    user.getIdTokenResult().then(idTokenResult => {
                        const isAdmin = idTokenResult.claims.admin;
                        const isOwner = user.email.split('@')[0] === data.author;

                        let deleteBtnHtml = (isAdmin || isOwner) ? `
                            <button class="options-btn" onclick="toggleMenu('${commentId}')">⋮</button>
                            <div class="delete-menu" id="menu-${commentId}">
                                <div class="delete-btn" onclick="deleteComment('${commentId}')">Delete</div>
                            </div>
                        ` : '';

                        let commentHtml = `
                            <div class="comment-card">
                                <p class="comment-author">@${data.author}</p>
                                <p class="comment-text">${data.comment}</p>
                                ${deleteBtnHtml}
                            </div>
                        `;
                        commentsContainer.innerHTML += commentHtml;
                    });
                } else {
                    // Public view of comments
                    commentsContainer.innerHTML += `
                        <div class="comment-card">
                            <p class="comment-author">@${data.author}</p>
                            <p class="comment-text">${data.comment}</p>
                        </div>
                    `;
                }
            });
        });
    });

// Helper functions for menu
window.toggleMenu = (id) => {
    let menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};

window.deleteComment = (id) => {
    if (confirm("Delete this comment?")) {
        db.collection("comments").doc(id).delete()
            .then(() => console.log("Deleted"))
            .catch(err => console.error(err));
    }
};
