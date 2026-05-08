const blogSection = document.querySelector('.blogs-section');

// Just get everything. No "if" check needed on the main homepage.
db.collection("blogs").get().then((blogs) => {
    blogs.forEach(blog => {
        createBlog(blog);
    });
}).catch(err => console.log("Error loading blogs:", err));

const createBlog = (blog) => {
    let data = blog.data();
    // We use / before blog.id to ensure the link works from any page
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
