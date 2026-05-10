auth.onAuthStateChanged((user) => {
    let ul = document.querySelector('.links-container');
    
    // Clear only old login links to prevent doubling
    document.querySelectorAll('.dynamic-link').forEach(el => el.remove());

    if (user) {
        user.getIdTokenResult(true).then(idTokenResult => {
            let links = `
                <li class="link-item dynamic-link"><a href="/dashboard.html" class="link">Dashboard</a></li>
                <li class="link-item dynamic-link"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
            `;
            if (idTokenResult.claims.admin) {
                links += `<li class="link-item dynamic-link"><a href="/admin-panel" class="link" style="color: red;">Admin</a></li>`;
            }
            ul.insertAdjacentHTML('afterbegin', links); // Keeps your Menu Button safe at the end
        });
    } else {
        ul.insertAdjacentHTML('afterbegin', `<li class="link-item dynamic-link"><a href="/dashboard.html" class="link">Login</a></li>`);
    }
});
