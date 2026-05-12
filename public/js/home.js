const blogSection = document.querySelector('.blogs-section');

// 1. Get the current blog ID from the URL (if any)
let currentBlogId = location.pathname.split("/").filter(x => x && x !== 'editor').pop();

// FIX: Only fetch blogs if blogSection exists on the current page
if (blogSection) {
    db.collection("blogs").get().then((blogs) => {
        blogs.forEach(blog => {
            // 2. ONLY show the blog if it's NOT the one we are currently reading
            if(blog.id !== currentBlogId) {
                createBlog(blog);
            }
        });
    }).catch(err => console.log("Error loading blogs:", err));
}

function createBlog(blog) {
    let data = blog.data();
    // FIX: Remove image code from the overview text
    let cleanArticle = data.article.replace(/<img[^>]*>/g, ""); 

    // FIX: Only try to update innerHTML if blogSection is found
    if (blogSection) {
        blogSection.innerHTML += `
        <div class="blog-card">
            <img src="${data.bannerImage}" class="blog-image" alt="">
            <h1 class="blog-title">${data.title.substring(0, 50)}...</h1>
            <p class="blog-overview">${cleanArticle}</p>
            <div class="card-btns">
                <a href="/${blog.id}" class="btn dark">read more</a>
                <a href="/${blog.id}#comment-section" class="comment-btn">comment</a>
            </div>
        </div>
        `;
    }
}

// Global Alert Listener
db.collection("announcements").doc("current").onSnapshot(doc => {
    const data = doc.data();
    const bar = document.getElementById('global-alert');
    const msg = document.getElementById('alert-msg');
    
    // Safety check to ensure alert elements exist on the page
    if (data && data.active && msg && bar) {
        bar.style.display = 'block';
        msg.innerText = data.text;
    } else if (bar) {
        bar.style.display = 'none';
    }
});
