// Add sticky blur effect to navbar on scroll
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.7)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.4)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Fetch posts
async function fetchPosts() {
    try {
        const response = await fetch('./data.json?t=' + new Date().getTime());
        const data = await response.json();
        return data.posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

// Wait for all images inside a container to finish loading
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // don't block on broken images
        });
    });
    return Promise.all(promises);
}

// Render dynamic lists (Home or Journeys)
async function renderCards() {
    const grid = document.querySelector('.masonry-grid');
    if (!grid) return;

    const isJourney = window.location.pathname.includes('journeys.html');
    const posts = await fetchPosts();
    
    const filtered = posts.filter(p => isJourney ? p.category === 'journey' : p.category === 'moment');
    
    grid.innerHTML = '';
    
    // Build all card elements first (hidden via CSS opacity:0)
    const cards = [];
    filtered.reverse().forEach((post) => {
        const a = document.createElement('a');
        a.href = `post.html?id=${post.id}`;
        
        if (isJourney) {
            a.className = 'journey-card moment-card';
            a.innerHTML = `
                <div class="journey-img">
                    <img src="${post.coverImage}" alt="${post.title}">
                </div>
                <div class="journey-content">
                    <h3>${post.title}</h3>
                    <div class="date">${post.date}</div>
                    <p>${post.summary}</p>
                </div>
            `;
        } else {
            a.className = 'moment-card';
            a.innerHTML = `
                <img src="${post.coverImage}" alt="${post.title}">
                <div class="card-content">
                    <h3>${post.title}</h3>
                    <div class="date">${post.date}</div>
                    <p>${post.summary}</p>
                </div>
            `;
        }
        
        grid.appendChild(a);
        cards.push(a);
    });

    // Wait for ALL images to load so the browser can calculate correct column heights
    await waitForImages(grid);

    // Now reveal cards with staggered animation
    cards.forEach((a, index) => {
        setTimeout(() => {
            a.classList.add('reveal');
        }, (index % 3) * 150 + 50);
    });
}

// Render post.html detail view
async function renderPostDetail() {
    const main = document.querySelector('.post-container');
    if (!main) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || "1";
    
    const posts = await fetchPosts();
    const post = posts.find(p => p.id === id);
    
    if (!post) {
        main.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>文章未找到</h2><a href="index.html">返回首页</a></div>';
        return;
    }

    document.title = `${post.title} | Moments in Light`;

    let contentHtml = post.content;
    if (typeof marked !== 'undefined') {
        contentHtml = marked.parse(post.content);
    } else {
        contentHtml = contentHtml
            .replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1">')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        contentHtml = `<p>${contentHtml}</p>`;
    }

    const html = `
        <article class="post-card">
            <header class="post-header">
                <img src="${post.coverImage}" alt="${post.title}">
                <div class="post-title-overlay">
                    <h1>${post.title}</h1>
                    <div class="date">${post.date}</div>
                </div>
            </header>
            
            <div class="post-body">
                <div class="post-intro">
                    <p>${post.summary}</p>
                </div>
                
                <div class="post-content-html">
                    ${contentHtml}
                </div>
            </div>
        </article>
    `;
    
    main.innerHTML = html;
    
    setTimeout(() => {
        const article = main.querySelector('.post-card');
        if (article) {
            article.style.opacity = '0';
            article.style.animation = 'fadeUp 0.8s ease-out forwards';
        }
    }, 50);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    renderPostDetail();
});
