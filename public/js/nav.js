auth.onAuthStateChanged((user) => {
    let ul = document.querySelector('.links-container');
    let ur = document.querySelector('.responsive-side-bar');
    
    // 1. Remove only the old auth links to avoid doubling
    document.querySelectorAll('.auth-link').forEach(el => el.remove());

    let links = '';
    if (user) {
        user.getIdTokenResult(true).then(idTokenResult => {
            links = `
                <li class="link-item auth-link"><a href="/dashboard.html" class="link">Dashboard</a></li>
                <li class="link-item auth-link"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
            `;
            if (idTokenResult.claims.admin) {
                links += `<li class="link-item auth-link"><a href="/admin-panel" class="link" style="color: red; font-weight: bold;">Admin</a></li>`;
            }
            // 2. Add links BEFORE the menu button so the icon never moves
            ul.insertAdjacentHTML('afterbegin', links);
            if(ur) ur.innerHTML += links.replace(/link-item/g, 'links-item');
        });
    } else {
        links = `<li class="link-item auth-link"><a href="/dashboard.html" class="link">Login</a></li>`;
        ul.insertAdjacentHTML('afterbegin', links);
        if(ur) ur.innerHTML += links.replace(/link-item/g, 'links-item');
    }
});
