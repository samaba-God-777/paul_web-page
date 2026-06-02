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
                    <a href="#" class="candidate-btn">Conocer más</a>
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
            <div class="dashboard-card fade-in">
                <div class="dashboard-icon">${g.icon}</div>
                <div class="dashboard-number" data-target="${g.value}">0</div>
                <div class="dashboard-label">${g.label}</div>
            </div>`;
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

    const carousel=document.getElementById('testimonialsCarousel');
    const dotsContainer=document.getElementById('testimonialDots');
    let currentSlide=0;
    testimonials.forEach((t,i)=>{
        carousel.innerHTML+=`
            <div class="testimonial-card${i===0?' active':''}">
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-role">${t.role}</div>
            </div>`;
        dotsContainer.innerHTML+=`<span class="dot${i===0?' active':''}" data-index="${i}"></span>`;
    });
    const dots=document.querySelectorAll('.dot');
    const totalSlides=testimonials.length;
    function goToSlide(index){
        document.querySelectorAll('.testimonial-card').forEach((c,i)=>{
            c.classList.toggle('active',i===index);
        });
        dots.forEach((d,i)=>d.classList.toggle('active',i===index));
        currentSlide=index;
    }
    document.getElementById('prevTestimonial').addEventListener('click',()=>{
        goToSlide((currentSlide-1+totalSlides)%totalSlides);
    });
    document.getElementById('nextTestimonial').addEventListener('click',()=>{
        goToSlide((currentSlide+1)%totalSlides);
    });
    dots.forEach(d=>d.addEventListener('click',()=>goToSlide(parseInt(d.dataset.index))));
    setInterval(()=>goToSlide((currentSlide+1)%totalSlides),5000);

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
});
