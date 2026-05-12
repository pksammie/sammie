auth.onAuthStateChanged((user) => {
    let ul = document.querySelector('.links-container');
    let ur = document.querySelector('.responsive-side-bar');
    
    // Remove old dynamic links so they don't stack up
    document.querySelectorAll('.dynamic-auth-link').forEach(el => el.remove());

    let links = '';

    if (user) {
        links = `
            <li class="link-item dynamic-auth-link"><a href="/dashboard.html" class="link">Dashboard</a></li>
            <li class="link-item dynamic-auth-link"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
        `;
        user.getIdTokenResult(true).then(idTokenResult => {
            if (idTokenResult.claims.admin) {
                let adminLink = `<li class="link-item dynamic-auth-link"><a href="/admin-panel" class="link" style="color: red; font-weight: bold;">Admin</a></li>`;
                ul.insertAdjacentHTML('beforeend', adminLink);
                if(ur) ur.insertAdjacentHTML('beforeend', adminLink.replace(/link-item/g, 'links-item'));
            }
        });
    } else {
        links = `<li class="link-item dynamic-auth-link"><a href="/dashboard.html" class="link">Login</a></li>`;
    }

    // Add links to the main navbar
    ul.insertAdjacentHTML('beforeend', links);

    // FIX: Add links to sidebar WITHOUT deleting the 'X' button
    if (ur) {
        let sidebarLinks = links.replace(/link-item/g, 'links-item');
        ur.insertAdjacentHTML('beforeend', sidebarLinks);
    }
});
// ... existing auth.onAuthStateChanged code ...

function showSidebar() {
    const sidebar = document.querySelector(".responsive-side-bar");
    const alertBar = document.getElementById("global-alert");
    
    if (sidebar) {
        // Safety check for pages where alertBar might be missing
        if (alertBar && window.getComputedStyle(alertBar).display !== "none") {
            let alertHeight = alertBar.offsetHeight;
            sidebar.style.top = alertHeight + "px";
            sidebar.style.height = `calc(100vh - ${alertHeight}px)`;
        } else {
            sidebar.style.top = "0";
            sidebar.style.height = "100vh";
        }
        sidebar.style.display = "flex";
    }
}

function hideSidebar() {
    const sidebar = document.querySelector(".responsive-side-bar");
    if (sidebar) {
        sidebar.style.display = "none";
    }
}
