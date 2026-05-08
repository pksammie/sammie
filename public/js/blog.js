let blogId = decodeURI(location.pathname.split("/").pop());

// 1. IMPORTANT: If the URL is just 'editor', don't run the blog code
if (blogId == 'editor') {
    // Do nothing, the server will handle sending editor.html
} else {
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
}

const setupBlog = (data) => {
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');

    banner.style.backgroundImage = `url("${data.bannerImage}")`;
    titleTag.innerHTML += blogTitle.innerHTML = data.title;
    publish.innerHTML += `Published at - ${data.publishedAt} -- ${data.author}`;

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
    article.innerHTML = data; // Renders HTML (images) properly
};

// --- COMMENT LOGIC ---
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
            let user = auth.currentUser;
            let deleteBtnHtml = '';

            if (user) {
                const isOwner = user.email.split('@')[0] === data.author;
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
