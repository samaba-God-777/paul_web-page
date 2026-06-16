document.addEventListener('DOMContentLoaded',()=>{

const loader=document.getElementById('loader');
window.addEventListener('load',()=>{
    setTimeout(()=>loader.classList.add('hidden'),600);
});

const cursorGlow=document.getElementById('cursor-glow');
document.addEventListener('mousemove',e=>{
    cursorGlow.style.left=e.clientX+'px';
    cursorGlow.style.top=e.clientY+'px';
});
document.querySelectorAll('a,button,.candidate-card,.axis-card,.value-item,.gallery-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cursorGlow.style.width='400px';cursorGlow.style.height='400px';cursorGlow.style.background='radial-gradient(circle,rgba(244,180,0,0.1),transparent 70%)';});
    el.addEventListener('mouseleave',()=>{cursorGlow.style.width='300px';cursorGlow.style.height='300px';cursorGlow.style.background='radial-gradient(circle,rgba(244,180,0,0.06),transparent 70%)';});
});

const canvas=document.getElementById('particles-canvas');
const ctx=canvas.getContext('2d');
let particles=[];
function resizeCanvas(){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize',resizeCanvas);
class Particle{
    constructor(){
        this.x=Math.random()*canvas.width;
        this.y=Math.random()*canvas.height;
        this.size=Math.random()*2+1;
        this.speedX=Math.random()*0.5-0.25;
        this.speedY=Math.random()*0.5-0.25;
        this.opacity=Math.random()*0.5+0.1;
    }
    update(){
        this.x+=this.speedX;
        this.y+=this.speedY;
        if(this.x>canvas.width)this.x=0;
        if(this.x<0)this.x=canvas.width;
        if(this.y>canvas.height)this.y=0;
        if(this.y<0)this.y=canvas.height;
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${this.opacity})`;
        ctx.fill();
    }
}
for(let i=0;i<100;i++)particles.push(new Particle());
function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{p.update();p.draw();});
    for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
            const dx=particles[i].x-particles[j].x;
            const dy=particles[i].y-particles[j].y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<120){
                ctx.beginPath();
                ctx.strokeStyle=`rgba(255,255,255,${0.1*(1-dist/120)})`;
                ctx.lineWidth=0.5;
                ctx.moveTo(particles[i].x,particles[i].y);
                ctx.lineTo(particles[j].x,particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

const navbar=document.getElementById('navbar');
const backToTop=document.getElementById('backToTop');
window.addEventListener('scroll',()=>{
    const scrollY=window.scrollY;
    navbar.classList.toggle('scrolled',scrollY>100);
    backToTop.classList.toggle('show',scrollY>500);
});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

const menuToggle=document.getElementById('menuToggle');
const navLinks=document.querySelector('.nav-links');
menuToggle.addEventListener('click',()=>navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(link=>{
    link.addEventListener('click',()=>navLinks.classList.remove('open'));
});

const darkToggle=document.getElementById('darkToggle');
let isDark=localStorage.getItem('theme')==='dark';
if(isDark){document.body.setAttribute('data-theme','dark');darkToggle.textContent='☀️';}
darkToggle.addEventListener('click',()=>{
    isDark=!isDark;
    document.body.setAttribute('data-theme',isDark?'dark':'');
    darkToggle.textContent=isDark?'☀️':'🌙';
    localStorage.setItem('theme',isDark?'dark':'light');
});

async function loadJSON(url){
    const res=await fetch(url);
    return res.json();
}

function formatDate(dateStr){
    const d=new Date(dateStr);
    return d.toLocaleDateString('es',{year:'numeric',month:'long',day:'numeric'});
}

const authModal=document.getElementById('authModal');
const authBtn=document.getElementById('authBtn');
const authForm=document.getElementById('authForm');
let currentUser=JSON.parse(localStorage.getItem('currentUser'));

function updateAuthUI(){
    if(currentUser){
        const initial=currentUser.name.charAt(0).toUpperCase();
        authBtn.innerHTML=`<div class="user-info"><span class="user-avatar">${initial}</span>${currentUser.name.split(' ')[0]}</div>`;
        authBtn.title='Cerrar sesión';
        document.querySelector('.comment-login-msg').textContent=`Comentando como ${currentUser.name}`;
        document.getElementById('commentInput').disabled=false;
        document.getElementById('submitComment').disabled=false;
    }else{
        authBtn.innerHTML='👤';
        authBtn.title='Iniciar sesión';
        document.querySelector('.comment-login-msg').textContent='Inicia sesión con tu correo para comentar';
        document.getElementById('commentInput').disabled=true;
        document.getElementById('submitComment').disabled=true;
    }
}

authBtn.addEventListener('click',()=>{
    if(currentUser){
        localStorage.removeItem('currentUser');
        currentUser=null;
        updateAuthUI();
        return;
    }
    authModal.classList.add('show');
});

document.querySelector('.modal-close').addEventListener('click',()=>authModal.classList.remove('show'));
authModal.addEventListener('click',e=>{if(e.target===authModal)authModal.classList.remove('show');});

authForm.addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('authName').value.trim();
    const email=document.getElementById('authEmail').value.trim();
    if(!name||!email)return;
    currentUser={name,email};
    localStorage.setItem('currentUser',JSON.stringify(currentUser));
    authForm.reset();
    authModal.classList.remove('show');
    updateAuthUI();
});

let comments=JSON.parse(localStorage.getItem('comments'))||[];

function saveComments(){
    localStorage.setItem('comments',JSON.stringify(comments));
}

function renderComments(){
    const list=document.getElementById('commentsList');
    if(comments.length===0){
        list.innerHTML='<div class="comment-empty">No hay comentarios aún. ¡Sé el primero en comentar!</div>';
        return;
    }
    list.innerHTML=comments.map(c=>{
        const initial=c.name.charAt(0).toUpperCase();
        const date=new Date(c.date).toLocaleDateString('es',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
        const canDelete=currentUser&&currentUser.email===c.email;
        return `
            <div class="comment-item fade-in">
                <div class="comment-header">
                    <div class="comment-avatar">${initial}</div>
                    <div class="comment-meta">
                        <h4>${c.name}</h4>
                        <span>${date}</span>
                    </div>
                </div>
                <p class="comment-text">${c.text}</p>
                <div class="comment-footer">
                    ${canDelete?'<button class="comment-delete" data-id="'+c.id+'">Eliminar</button>':''}
                </div>
            </div>`;
    }).join('');
    document.querySelectorAll('.comment-delete').forEach(btn=>{
        btn.addEventListener('click',()=>{
            const id=parseInt(btn.dataset.id);
            comments=comments.filter(c=>c.id!==id);
            saveComments();
            renderComments();
        });
    });
    document.querySelectorAll('.comment-item.fade-in').forEach(el=>{
        el.classList.add('visible');
    });
}

async function loadSeedComments(){
    if(comments.length===0){
        try{
            const seed=await loadJSON('data/comments.json');
            comments=seed;
            saveComments();
        }catch(e){}
    }
    renderComments();
}

document.getElementById('submitComment').addEventListener('click',()=>{
    if(!currentUser)return;
    const input=document.getElementById('commentInput');
    const text=input.value.trim();
    if(!text)return;
    comments.unshift({
        id:Date.now(),
        name:currentUser.name,
        email:currentUser.email,
        text,
        date:new Date().toISOString()
    });
    saveComments();
    renderComments();
    input.value='';
});

document.getElementById('commentInput').addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){
        e.preventDefault();
        document.getElementById('submitComment').click();
    }
});

async function init(){
    const config=await loadJSON('data/config.json');
    const candidates=await loadJSON('data/candidates.json');
    const axes=await loadJSON('data/axes.json');
    const timeline=await loadJSON('data/timeline.json');
    const dashboard=await loadJSON('data/dashboard.json');
    const testimonials=await loadJSON('data/testimonials.json');
    const news=await loadJSON('data/news.json');
    const transparency=await loadJSON('data/transparency.json');
    const gallery=await loadJSON('data/gallery.json');

    document.getElementById('visionText').textContent=config.vision.text;
    updateAuthUI();
    loadSeedComments();

    const candidatesGrid=document.getElementById('candidatesGrid');
    candidates.forEach(c=>{
        const socialIcons=Object.entries(c.social).map(([k,v])=>{
            const emojis={facebook:'📘',twitter:'🐦',instagram:'📸'};
            return `<a href="${v}" target="_blank">${emojis[k]||'🔗'}</a>`;
        }).join('');
        candidatesGrid.innerHTML+=`
            <div class="candidate-card fade-in">
                <img src="${c.photo}" alt="${c.name}" class="candidate-img" loading="lazy">
                <div class="candidate-info">
                    <h3>${c.name}</h3>
                    <div class="candidate-role">${c.role}</div>
                    <p class="candidate-bio">${c.bio}</p>
                    <div class="candidate-social">${socialIcons}</div>
                    <a href="${c.page||'#'}" class="candidate-btn">Conocer más</a>
                </div>
            </div>`;
    });

    const axesGrid=document.getElementById('axesGrid');
    axes.forEach(a=>{
        const items=a.items.map(i=>`<li>${i}</li>`).join('');
        const href=a.page||'#';
        axesGrid.innerHTML+=`
            <a href="${href}" class="axis-card fade-in">
                <div class="axis-icon">${a.icon}</div>
                <h3>${a.title}</h3>
                <ul>${items}</ul>
            </a>`;
    });

    const timelineContainer=document.getElementById('timelineContainer');
    timeline.forEach((t,i)=>{
        timelineContainer.innerHTML+=`
            <div class="timeline-item fade-in">
                <div class="timeline-content">
                    <div class="timeline-year">${t.year}</div>
                    <div style="font-size:2rem;">${t.icon}</div>
                    <h4>${t.title}</h4>
                    <p>${t.description}</p>
                </div>
            </div>`;
    });

    const dashboardGrid=document.getElementById('dashboardGrid');
    dashboard.goals.forEach(g=>{
        dashboardGrid.innerHTML+=`
            <a href="${g.page||'#'}" class="dashboard-card fade-in">
                <div class="dashboard-icon">${g.icon}</div>
                <div class="dashboard-number" data-target="${g.value}">0</div>
                <div class="dashboard-label">${g.label}</div>
            </a>`;
    });

    const valuesGrid=document.getElementById('valuesGrid');
    config.values.forEach(v=>{
        const href=v.page||'#';
        valuesGrid.innerHTML+=`
            <a href="${href}" class="value-item fade-in">
                <span class="value-icon">${v.icon}</span>
                ${v.name}
            </a>`;
    });

    const galleryMasonry=document.getElementById('galleryMasonry');

    function renderGallery(){
        galleryMasonry.innerHTML='';
        gallery.forEach(g=>{
            galleryMasonry.innerHTML+=`
                <div class="gallery-item fade-in" data-src="${g.src}" data-caption="${g.alt}">
                    <div class="gallery-img-wrap">
                        <img src="${g.src}" alt="${g.alt}" loading="lazy">
                        <div class="gallery-overlay">
                            <span class="gallery-icon">🔍</span>
                            <span class="gallery-label">${g.alt}</span>
                        </div>
                    </div>
                </div>`;
        });
        document.querySelectorAll('.gallery-item.fade-in').forEach(el=>el.classList.add('visible'));
        attachGalleryListeners();
    }

    function attachGalleryListeners(){
        document.querySelectorAll('.gallery-item').forEach(item=>{
            item.addEventListener('click',()=>{
                lightbox.classList.add('show');
                lightboxImg.src=item.dataset.src;
                document.getElementById('lightboxCaption').textContent=item.dataset.caption||'';
            });
        });
    }

    renderGallery();

    const lightbox=document.getElementById('lightbox');
    const lightboxImg=document.getElementById('lightboxImg');
    document.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.classList.remove('show'));
    lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.classList.remove('show');});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')lightbox.classList.remove('show');});

    /* ── Card-Stack Fan Testimonials ─────────────────────── */
    (function initCardStack(items){
        const stage   = document.getElementById('csStage');
        const dotsEl  = document.getElementById('csDots');
        const btnPrev = document.getElementById('csPrev');
        const btnNext = document.getElementById('csNext');
        if(!stage || !items.length) return;

        const LEN        = items.length;
        const MAX_OFFSET = 3;          // cards visible each side
        const SPREAD_DEG = 46;         // total fan angle
        const STEP_DEG   = SPREAD_DEG / MAX_OFFSET;
        const isMobile   = () => window.innerWidth < 769;
        const SPACING    = () => isMobile() ? 150 : 260; // px between cards

        let active = 0;
        let dragStartX = null;
        let autoTimer  = null;

        /* helpers */
        function wrap(n){ return ((n % LEN) + LEN) % LEN; }
        function signedOffset(i, a){
            const raw = i - a;
            const alt = raw > 0 ? raw - LEN : raw + LEN;
            return Math.abs(alt) < Math.abs(raw) ? alt : raw;
        }

        /* build DOM once */
        const cards = items.map((t, i) => {
            const el = document.createElement('div');
            el.className = 'cs-card';
            el.innerHTML = `
                <div class="cs-card-quote">&#8220;</div>
                <p class="cs-card-text">${t.text.replace(/\n/g,' ')}</p>
                <div class="cs-card-author">
                    <div class="cs-card-name">${t.name}</div>
                    ${t.role ? `<div class="cs-card-role">${t.role.replace(/\n/g,' · ')}</div>` : ''}
                </div>`;
            el.addEventListener('click', () => { if(i !== active) goTo(i); });
            stage.appendChild(el);

            const dot = document.createElement('button');
            dot.className = 'cs-dot';
            dot.setAttribute('aria-label', `Ir al testimonio ${i+1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsEl.appendChild(dot);

            return { el, dot };
        });

        function applyPositions(){
            const sp = SPACING();
            cards.forEach(({ el, dot }, i) => {
                const off  = signedOffset(i, active);
                const abs  = Math.abs(off);
                const visible = abs <= MAX_OFFSET;
                const isAct   = off === 0;

                /* hide far cards */
                el.style.display  = visible ? '' : 'none';
                if(!visible) return;

                const rotZ  = off * STEP_DEG;
                const tx    = off * sp;
                const ty    = abs * 10 + (isAct ? -18 : 0);
                const scale = isAct ? 1.04 : Math.max(0.86, 1 - abs * 0.05);
                const zIdx  = 100 - abs;
                const opacity = isAct ? 1 : Math.max(0.55, 1 - abs * 0.15);

                el.style.zIndex   = zIdx;
                el.style.opacity  = opacity;
                el.style.transform =
                    `translateX(${tx}px) translateY(${ty}px) rotateZ(${rotZ}deg) scale(${scale})`;
                el.classList.toggle('is-active', isAct);
                dot.classList.toggle('active', isAct);
            });
        }

        function goTo(idx){
            active = wrap(idx);
            applyPositions();
        }

        /* button nav */
        btnPrev.addEventListener('click', () => goTo(active - 1));
        btnNext.addEventListener('click', () => goTo(active + 1));

        /* keyboard nav */
        stage.addEventListener('keydown', e => {
            if(e.key === 'ArrowLeft')  goTo(active - 1);
            if(e.key === 'ArrowRight') goTo(active + 1);
        });

        /* drag / swipe on active card */
        stage.addEventListener('pointerdown', e => {
            if(!e.target.closest('.cs-card.is-active')) return;
            dragStartX = e.clientX;
            stage.setPointerCapture(e.pointerId);
        });
        stage.addEventListener('pointerup', e => {
            if(dragStartX === null) return;
            const dx = e.clientX - dragStartX;
            const threshold = isMobile() ? 60 : 100;
            if(dx >  threshold) goTo(active - 1);
            if(dx < -threshold) goTo(active + 1);
            dragStartX = null;
        });

        /* auto-advance every 5 s */
        function startAuto(){
            autoTimer = setInterval(() => goTo(active + 1), 5000);
        }
        function stopAuto(){
            clearInterval(autoTimer);
        }
        stage.addEventListener('mouseenter', stopAuto);
        stage.addEventListener('mouseleave', startAuto);

        applyPositions();
        startAuto();

        /* re-apply on resize (spacing changes on mobile) */
        window.addEventListener('resize', applyPositions, { passive: true });

    })(testimonials);

    const newsGrid=document.getElementById('newsGrid');
    const filters=document.querySelectorAll('.filter-btn');
    function renderNews(filter='all'){
        newsGrid.innerHTML='';
        const filtered=filter==='all'?news:news.filter(n=>n.category===filter);
        filtered.forEach(n=>{
            const href=n.page||'#';
            newsGrid.innerHTML+=`
                <a href="${href}" class="news-card fade-in">
                    <img src="${n.image}" alt="${n.title}" loading="lazy">
                    <div class="news-content">
                        <div class="news-date">${formatDate(n.date)}</div>
                        <h3>${n.title}</h3>
                        <p>${n.summary}</p>
                    </div>
                </a>`;
        });
    }
    renderNews();
    filters.forEach(btn=>{
        btn.addEventListener('click',()=>{
            filters.forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            renderNews(btn.dataset.filter);
        });
    });

    const transparencyGrid=document.getElementById('transparencyGrid');
    transparency.forEach(t=>{
        transparencyGrid.innerHTML+=`
            <div class="transparency-card fade-in">
                <div class="icon">${t.icon}</div>
                <h3>${t.title}</h3>
                <p>${t.description}</p>
                <a href="${t.file}" class="download-btn">Ver más →</a>
            </div>`;
    });

    function updateCountdown(){
        const electionDate=new Date(config.electionDate).getTime();
        const now=new Date().getTime();
        const diff=electionDate-now;
        if(diff<=0){
            document.getElementById('days').textContent='00';
            document.getElementById('hours').textContent='00';
            document.getElementById('minutes').textContent='00';
            document.getElementById('seconds').textContent='00';
            return;
        }
        document.getElementById('days').textContent=String(Math.floor(diff/(1000*60*60*24))).padStart(2,'0');
        document.getElementById('hours').textContent=String(Math.floor((diff%(1000*60*60*24))/(1000*60*60))).padStart(2,'0');
        document.getElementById('minutes').textContent=String(Math.floor((diff%(1000*60*60))/(1000*60))).padStart(2,'0');
        document.getElementById('seconds').textContent=String(Math.floor((diff%(1000*60))/1000)).padStart(2,'0');
    }
    updateCountdown();
    setInterval(updateCountdown,1000);

    const contact=config.contact;
    document.getElementById('footerAddress').textContent=contact.address;

    const observer=new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.classList.add('visible');
            }
        });
    },{threshold:0.1});
    document.querySelectorAll('.fade-in').forEach(el=>observer.observe(el));

    const counterObserver=new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                const el=entry.target;
                const target=parseInt(el.dataset.target);
                let current=0;
                const increment=Math.ceil(target/60);
                const timer=setInterval(()=>{
                    current+=increment;
                    if(current>=target){
                        el.textContent=target.toLocaleString();
                        clearInterval(timer);
                    }else{
                        el.textContent=current.toLocaleString();
                    }
                },25);
                counterObserver.unobserve(el);
            }
        });
    },{threshold:0.5});
    document.querySelectorAll('.dashboard-number').forEach(el=>counterObserver.observe(el));
}

init();

// ==========================================
// SPHERE IMAGE GALLERY
// ==========================================
(async function initSphere(){
    const container = document.getElementById('sphereContainer');
    if(!container) return;

    // Load gallery images
    let images = [];
    try {
        const res = await fetch('data/gallery.json');
        images = await res.json();
    } catch(e){ return; }

    // Config
    const SIZE     = container.offsetWidth || 600;
    const RADIUS   = SIZE * 0.34;
    const IMG_SIZE = SIZE * 0.135;
    const AUTO_SPEED = 0.18;
    const DRAG_SENSITIVITY = 0.5;
    const MOMENTUM_DECAY   = 0.94;

    // Duplicate images to fill sphere (need ~30-40 nodes)
    const nodes = [];
    const targetCount = 36;
    for(let i = 0; i < targetCount; i++){
        nodes.push(images[i % images.length]);
    }

    // Fibonacci sphere positions
    const golden = (1 + Math.sqrt(5)) / 2;
    const positions = nodes.map((_, i) => {
        const t = i / nodes.length;
        const phi = Math.acos(1 - 2 * t);
        const theta = (2 * Math.PI * i / golden) % (2 * Math.PI);
        return { phi, theta };
    });

    // Rotation state
    let rotX = 15 * Math.PI/180;
    let rotY = 15 * Math.PI/180;
    let velX = 0, velY = 0;
    let dragging = false;
    let lastX = 0, lastY = 0;

    // Build DOM nodes
    const els = nodes.map((img, i) => {
        const el = document.createElement('div');
        el.className = 'sphere-node';
        const image = document.createElement('img');
        image.src = img.src;
        image.alt = img.alt;
        image.loading = 'lazy';
        el.appendChild(image);
        el.addEventListener('click', () => openModal(img));
        container.appendChild(el);
        return el;
    });

    // Modal
    const modal   = document.getElementById('sphereModal');
    const modalImg = document.getElementById('sphereModalImg');
    const modalCap = document.getElementById('sphereModalCaption');
    const modalClose = document.getElementById('sphereModalClose');

    function openModal(img){
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modalCap.textContent = img.alt;
        modal.classList.add('show');
    }
    modalClose.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('show'); });
    document.addEventListener('keydown', e => { if(e.key==='Escape') modal.classList.remove('show'); });

    // Render loop
    function render(){
        const cx = SIZE / 2;
        const cy = SIZE / 2;
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

        const projected = positions.map((pos, i) => {
            // Sphere to cartesian
            let x = RADIUS * Math.sin(pos.phi) * Math.cos(pos.theta);
            let y = RADIUS * Math.cos(pos.phi);
            let z = RADIUS * Math.sin(pos.phi) * Math.sin(pos.theta);

            // Rotate Y
            const x1 = x * cosY + z * sinY;
            const z1 = -x * sinY + z * cosY;
            x = x1; z = z1;

            // Rotate X
            const y2 = y * cosX - z * sinX;
            const z2 = y * sinX + z * cosX;
            y = y2; z = z2;

            const depth = (z + RADIUS) / (2 * RADIUS); // 0-1
            const scale = 0.5 + depth * 0.6;
            const opacity = z > -RADIUS * 0.3 ? Math.max(0, (z + RADIUS * 0.3) / (RADIUS * 1.3)) : 0;
            const size = IMG_SIZE * scale;
            const zIndex = Math.round(100 + z);

            return { x, y, z, scale, opacity, size, zIndex, index: i };
        });

        // Sort back to front
        projected.sort((a,b) => a.z - b.z);

        projected.forEach(p => {
            const el = els[p.index];
            const left = cx + p.x - p.size/2;
            const top  = cy + p.y - p.size/2;
            el.style.width   = p.size + 'px';
            el.style.height  = p.size + 'px';
            el.style.left    = left + 'px';
            el.style.top     = top  + 'px';
            el.style.opacity = p.opacity;
            el.style.zIndex  = p.zIndex;
            el.style.display = p.opacity < 0.02 ? 'none' : 'block';
        });
    }

    // Physics loop
    function tick(){
        if(!dragging){
            rotY += AUTO_SPEED * Math.PI/180;
            rotX += velX; rotY += velY;
            velX *= MOMENTUM_DECAY; velY *= MOMENTUM_DECAY;
        }
        render();
        requestAnimationFrame(tick);
    }

    // Drag events
    container.addEventListener('mousedown', e => {
        dragging = true; velX = 0; velY = 0;
        lastX = e.clientX; lastY = e.clientY;
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if(!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        velY = dx * DRAG_SENSITIVITY * Math.PI/180;
        velX = -dy * DRAG_SENSITIVITY * Math.PI/180;
        rotX += velX; rotY += velY;
        lastX = e.clientX; lastY = e.clientY;
    });
    document.addEventListener('mouseup', () => { dragging = false; });

    // Touch events
    container.addEventListener('touchstart', e => {
        dragging = true; velX = 0; velY = 0;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchmove', e => {
        if(!dragging) return;
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        velY = dx * DRAG_SENSITIVITY * Math.PI/180;
        velX = -dy * DRAG_SENSITIVITY * Math.PI/180;
        rotX += velX; rotY += velY;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    }, { passive: false });
    document.addEventListener('touchend', () => { dragging = false; });

    tick();
})();

/* =============================================
   HERO SCROLL ORBIT ANIMATION
   ============================================= */
(function initScrollOrbit(){
    const nodes   = Array.from({length:8}, (_,i) => document.getElementById('oNode'+i));
    const outer   = document.getElementById('orbitOuter');
    const middle  = document.getElementById('orbitMiddle');

    // Angles evenly spaced around a circle (matching React component)
    const ANGLES = [
        0,
        Math.PI / 4,
        Math.PI / 2,
        (3 * Math.PI) / 4,
        Math.PI,
        (5 * Math.PI) / 4,
        (3 * Math.PI) / 2,
        (7 * Math.PI) / 4
    ];

    // On mobile the orbit is scaled down, so use a smaller expansion radius
    function maxRadius(){ return window.innerWidth < 769 ? 150 : 300; }

    function update(){
        const scrollY   = window.scrollY;
        const progress  = Math.min(scrollY / 500, 1);
        const radius    = progress * maxRadius();

        nodes.forEach(function(node, i){
            if(!node) return;
            const x = radius * Math.cos(ANGLES[i]);
            const y = radius * Math.sin(ANGLES[i]);
            node.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
        });

        if(outer)  outer.classList.toggle('ring-on',  scrollY > 300);
        if(middle) middle.classList.toggle('ring-on', scrollY > 100);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
})();

});

/* ── VIDEO GALLERY ── */
(function(){
    const modal    = document.getElementById('videoModal');
    const modalVid = document.getElementById('vgModalVideo');
    const closeBtn = document.getElementById('vgModalClose');
    if(!modal) return;

    document.querySelectorAll('.vg-card').forEach(card => {
        const thumb = card.querySelector('.vg-thumb');
        card.addEventListener('mouseenter', () => { if(thumb) thumb.play().catch(()=>{}); });
        card.addEventListener('mouseleave', () => { if(thumb){ thumb.pause(); thumb.currentTime=0; } });
        card.addEventListener('click', () => {
            const src = card.dataset.src;
            if(!src) return;
            modalVid.src = src;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal(){
        modal.classList.remove('open');
        modalVid.pause();
        modalVid.src = '';
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
})();
