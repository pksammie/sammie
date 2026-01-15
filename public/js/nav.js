let ul = document.querySelector('.links-container');
let ur = document.querySelector('.responsive-side-bar');

auth.onAuthStateChanged((user) => {
    if(user){
        // user is logged in
        ul.innerHTML += `
        <li class="link-item"><a href="./dashboard.html" class="link">Dashboard</a></li>
        <li class="link-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
        `
    } else {
        // no one is logged in
        ul.innerHTML += `
        <li class="link-item"><a href="./dashboard.html" class="link">Login</a></li>
        `
    }
})

auth.onAuthStateChanged((user) => {
    if(user){
        // user is logged in
        ur.innerHTML += `
        <li class="links-item"><a href="./dashboard.html" class="link">Dashboard</a></li>
        <li class="links-item"><a href="#" onclick="logoutUser()" class="link">Logout</a></li>
        `
    } else {
        // no one is logged in
        ur.innerHTML += `
        <li class="links-item"><a href="./dashboard.html" class="link">Login</a></li>
        `
    }
})