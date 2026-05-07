let blogId = decodeURI(location.pathname.split("/").pop());

let docRef = db.collection("blogs").doc(blogId);

docRef.get().then((doc) => {
    if(doc.exists){
        setupBlog(doc.data());
    } else {
        location.replace("/");
    }
})

const setupBlog = (data) => {
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');

    banner.style.backgroundImage = `url("${data.bannerImage}")`;

    titleTag.innerHTML += blogTitle.innerHTML = data.title;
    publish.innerHTML += data.publishedAt;
    publish.innerHTML += ` -- ${data.author}`;

    try {
        if(data.author == auth.currentUser.email.split('@')[0]){
        let editBtn = document.getElementById('edit-blog-btn');
        editBtn.style.display = "inline";
        editBtn.href = `${blogId}/editor`;
      }
    } catch {
        // do nothing here
    }
    
    const article = document.querySelector('.article');
    addArticle(article, data.article);
}

const addArticle = (ele, data) => {
    data = data.split("\n").filter(item => item.length);
    // console.log(data);

    data.forEach(item => {
        // check for headings
        if(item[0] == '#'){
            let hCount = 0;
            let i = 0;
            while(item[i] == '#'){
                hCount++;
                i++;
            }
            let tag = `h${hCount}`;
            ele.innerHTML += `<${tag}>${item.slice(hCount, item.length)}</${tag}>`
        }

        // checking for image format
        else if(item[0] == "!" && item[1] == "["){
            let seperator;

            for(let i = 0; i <= item.length; i++){
                if(item[i] == "]" && item[i + 1] == "(" && item[item.length - 1] ==
                    ")"){
                    seperator = i;
                }
            }

            let alt = item.slice(2, seperator);
            let src = item.slice(seperator + 2, item.length - 1);
            ele.innerHTML += `
            <img src="${src}" alt="${alt}" class="article-image">
            `;
        }

        else {
            ele.innerHTML += `<p>${item}</p>`;
        }
    })
}

const commentInput = document.querySelector('#comment-input');
const addCommentBtn = document.querySelector('#add-comment-btn');
const commentsContainer = document.querySelector('.comments-container');

addCommentBtn.addEventListener('click', (e) => {
    e.preventDefault(); // STOP THE REFRESH

    if(commentInput.value.length) {
        // Ensure blogId is defined from your earlier code
        let currentBlogId = decodeURI(location.pathname.split("/").pop());

        db.collection("comments").add({
            blogId: currentBlogId,
            comment: commentInput.value,
            author: auth.currentUser ? auth.currentUser.email.split('@')[0] : 'Anonymous',
            publishedAt: new Date().getTime()
        })
        .then(() => {
            commentInput.value = ''; // Clear the box
            console.log("Comment posted!");
        })
        .catch(err => {
            alert("Error: Check your console");
            console.error(err);
        });
    }
});

// Fetch comments
db.collection("comments")
    .where("blogId", "==", decodeURI(location.pathname.split("/").pop()))
    .orderBy("publishedAt", "desc")
    .onSnapshot((snapshot) => {
        commentsContainer.innerHTML = ''; 
        // Inside the onSnapshot listener in blog.js
snapshot.forEach((doc) => {
    let data = doc.data();
    let commentId = doc.id;
    let isOwner = auth.currentUser && auth.currentUser.email.split('@')[0] === data.author;

    commentsContainer.innerHTML += `
        <div class="comment-card">
            <p class="comment-author">@${data.author}</p>
            <p class="comment-text">${data.comment}</p>
            
            ${isOwner ? `
                <button class="options-btn" onclick="toggleMenu('${commentId}')">⋮</button>
                <div class="delete-menu" id="menu-${commentId}">
                    <div class="delete-btn" onclick="deleteComment('${commentId}')">Delete</div>
                </div>
            ` : ''}
        </div>
    `;
});

// Helper functions for the menu
window.toggleMenu = (id) => {
    let menu = document.getElementById(`menu-${id}`);
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

window.deleteComment = (id) => {
    if(confirm("Delete this comment?")) {
        db.collection("comments").doc(id).delete()
        .then(() => console.log("Deleted"))
        .catch(err => console.error(err));
    }
}
});
