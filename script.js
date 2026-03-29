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
        // Added cache bust to ensure freshness during dev
        const response = await fetch('./data.json?t=' + new Date().getTime());
        const data = await response.json();
        return data.posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

// Render dynamic lists (Home or Journeys)
async function renderCards() {
    const grid = document.querySelector('.masonry-grid');
    if (!grid) return; // Only execute if grid exists

    const isJourney = window.location.pathname.includes('journeys.html');
    const posts = await fetchPosts();
    
    // Filter by category
    const filtered = posts.filter(p => isJourney ? p.category === 'journey' : p.category === 'moment');
    
    // Sort array so newest id is typically top, though relying directly on array order is also fine.
    grid.innerHTML = '';
    
    filtered.reverse().forEach((post, index) => {
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
        
        // Trigger reveal animation
        setTimeout(() => {
            a.classList.add('reveal');
        }, (index % 3) * 150 + 50);
    });
}

// Render post.html detail view
async function renderPostDetail() {
    const main = document.querySelector('.post-container');
    if (!main) return; // Only execute on post page

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || "1";
    
    const posts = await fetchPosts();
    const post = posts.find(p => p.id === id);
    
    if (!post) {
        main.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>文章未找到</h2><a href="index.html">返回首页</a></div>';
        return;
    }

    // Set page title
    document.title = `${post.title} | Moments in Light`;

    // Process markdown (basic simple string replacement for markdown images and paragraphs if marked.js is not present)
    let contentHtml = post.content;
    if (typeof marked !== 'undefined') {
        contentHtml = marked.parse(post.content);
    } else {
        // Fallback naive parser
        contentHtml = contentHtml
            .replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1" style="width: 100%; border-radius: 20px; box-shadow: 0 16px 35px rgba(31,53,80,0.08); margin: 30px 0;">')
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
                
                <div class="post-content-html" style="margin-top: 40px; font-size: 1.15rem; line-height: 1.8; color: #42586c;">
                    ${contentHtml}
                </div>
            </div>
        </article>
    `;
    
    main.innerHTML = html;
    
    // Animate
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
