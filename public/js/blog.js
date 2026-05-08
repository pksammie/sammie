let blogId = decodeURI(location.pathname.split("/").pop());
let docRef = db.collection("blogs").doc(blogId);

docRef.get().then((doc) => {
    if (doc.exists) {
        setupBlog(doc.data());
    } else {
        // Only redirect if document definitely doesn't exist
        location.replace("/");
    }
}).catch(err => {
    console.error("Error loading blog:", err);
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

    // Admin/Author Edit Button Logic
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
    // We use innerHTML directly so the <img> tags saved by the new editor render as pictures
    ele.innerHTML = data;
};

// Comment Section Logic
const commentInput = document.querySelector('#comment-input');
const addCommentBtn = document.querySelector('#add-comment-btn');
const commentsContainer = document.querySelector('.comments-container');

addCommentBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
        alert("Please login to comment");
        return location.replace("/dashboard.html");
    }
    if (commentInput.value.length) {
        db.collection("comments").add({
            blogId: blogId,
            comment: commentInput.value,
            author: auth.currentUser.email.split('@')[0],
            publishedAt: new Date().getTime()
        }).then(() => {
            commentInput.value = '';
        });
    }
});

db.collection("comments")
    .where("blogId", "==", blogId)
    .orderBy("publishedAt", "desc")
    .onSnapshot((snapshot) => {
        commentsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            let data = doc.data();
            let commentId = doc.id;
            
            // Check permissions for delete button
            let user = auth.currentUser;
            let deleteBtnHtml = '';

            if (user) {
                // For simplicity in a real-time loop, we check author name directly
                const isOwner = user.email.split('@')[0] === data.author;
                // Note: Admin check usually happens inside getIdTokenResult
                deleteBtnHtml = isOwner ? `<button class="options-btn" onclick="toggleMenu('${commentId}')">⋮</button>
                    <div class="delete-menu" id="menu-${commentId}"><div class="delete-btn" onclick="deleteComment('${commentId}')">Delete</div></div>` : '';
            }

            commentsContainer.innerHTML += `
                <div class="comment-card">
                    <p class="comment-author">@${data.author}</p>
                    <p class="comment-text">${data.comment}</p>
                    ${deleteBtnHtml}
                </div>`;
        });
    });

window.toggleMenu = (id) => {
    let menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};

window.deleteComment = (id) => {
    if (confirm("Delete comment?")) db.collection("comments").doc(id).delete();
};
