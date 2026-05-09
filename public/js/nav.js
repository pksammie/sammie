auth.onAuthStateChanged((user) => {
    let ul = document.querySelector('.links-container');
    
    if (user) {
        // 1. First, check for the Admin Badge
        user.getIdTokenResult().then(idTokenResult => {
            let links = `
                <li class="link-item"><a href="/dashboard.html" class="link">Dashboard</a></li>
                <li class="link-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
            `;

            // 2. IF ADMIN: Add the Admin Panel link in RED
            if (idTokenResult.claims.admin) {
                links += `<li class="link-item"><a href="/admin-panel" class="link" style="color: red; font-weight: bold;">Admin</a></li>`;
            }

            ul.innerHTML = links; // Update the menu
        });
    } else {
        // User not logged in
        ul.innerHTML = `<li class="link-item"><a href="/dashboard.html" class="link">Login</a></li>`;
    }
});
