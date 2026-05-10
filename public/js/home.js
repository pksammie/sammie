const blogSection = document.querySelector('.blogs-section');

// 1. Get the current blog ID from the URL (if any)
let currentBlogId = location.pathname.split("/").filter(x => x && x !== 'editor').pop();

db.collection("blogs").get().then((blogs) => {
    blogs.forEach(blog => {
        // 2. ONLY show the blog if it's NOT the one we are currently reading
        if(blog.id !== currentBlogId) {
            createBlog(blog);
        }
    });
}).catch(err => console.log("Error loading blogs:", err));

const createBlog = (blog) => {
    let data = blog.data();
    blogSection.innerHTML += `
    <div class="blog-card">
        <img src="${data.bannerImage}" class="blog-image" alt="">
        <h1 class="blog-title">${data.title.substring(0, 100) + '...'}</h1>
        <p class="blog-overview">${data.article.substring(0, 200) + '...'}</p>
        <div class="card-btns">
            <a href="/${blog.id}" class="btn dark">read more</a>
            <a href="/${blog.id}#comment-section" class="comment-btn">comment</a>
        </div>
    </div>
    `;
}

// Global Alert Listener
db.collection("announcements").doc("current").onSnapshot(doc => {
    const data = doc.data();
    const bar = document.getElementById('global-alert');
    const msg = document.getElementById('alert-msg');
    
    if (data && data.active && msg && bar) {
        bar.style.display = 'block';
        msg.innerText = data.text;
    } else if (bar) {
        bar.style.display = 'none';
    }
});
