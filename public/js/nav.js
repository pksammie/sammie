let ul = document.querySelector('.links-container');
let ur = document.querySelector('.responsive-side-bar');

auth.onAuthStateChanged((user) => {
    // We clear the innerHTML first to prevent buttons from doubling up
    let links = '';
    if(user){
        links = `
            <li class="link-item"><a href="/dashboard.html" class="link">Dashboard</a></li>
            <li class="link-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
        `;
    } else {
        links = `<li class="link-item"><a href="/dashboard.html" class="link">Login</a></li>`;
    }
    
    // Check if elements exist before adding (prevents errors on different pages)
    if(ul) ul.innerHTML += links;
    if(ur) ur.innerHTML += links.replace(/link-item/g, 'links-item');
});
