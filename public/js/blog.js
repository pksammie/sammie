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

addCommentBtn.addEventListener('click', () => {
    if(commentInput.value.length) {
        db.collection("comments").add({
            blogId: blogId, // Links comment to this specific blog
            comment: commentInput.value,
            author: auth.currentUser ? auth.currentUser.email.split('@')[0] : 'Anonymous',
            publishedAt: new Date().getTime()
        })
        .then(() => {
            commentInput.value = ''; // Clear input
        })
        .catch(err => console.error("Error adding comment: ", err));
    }
});

// Function to fetch and display comments
db.collection("comments")
    .where("blogId", "==", blogId)
    .orderBy("publishedAt", "desc")
    .onSnapshot((snapshot) => {
        commentsContainer.innerHTML = ''; // Clear current display
        snapshot.forEach((doc) => {
            let data = doc.data();
            commentsContainer.innerHTML += `
                <div class="comment-card">
                    <p class="comment-author">${data.author}</p>
                    <p class="comment-text">${data.comment}</p>
                </div>
            `;
        });
    });
