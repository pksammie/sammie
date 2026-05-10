auth.onAuthStateChanged((user) => {
    let ul = document.querySelector('.links-container');
    let ur = document.querySelector('.responsive-side-bar');
    
    // Remove only existing dynamic links to prevent duplicates
    document.querySelectorAll('.dynamic-auth-link').forEach(el => el.remove());

    if (user) {
        user.getIdTokenResult(true).then(idTokenResult => {
            let links = `
                <li class="link-item dynamic-auth-link"><a href="/dashboard.html" class="link">Dashboard</a></li>
                <li class="link-item dynamic-auth-link"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
            `;
            if (idTokenResult.claims.admin) {
                links += `<li class="link-item dynamic-auth-link"><a href="/admin-panel" class="link" style="color: red; font-weight: bold;">Admin</a></li>`;
            }
            // Adds links WITHOUT deleting the menu button
            ul.insertAdjacentHTML('beforeend', links);
            if(ur) ur.innerHTML = links.replace(/link-item/g, 'links-item');
        });
    } else {
        ul.insertAdjacentHTML('beforeend', `<li class="link-item dynamic-auth-link"><a href="/dashboard.html" class="link">Login</a></li>`);
    }
});
