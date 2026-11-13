(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const header = $('.site-header');
  const nav = $('#nav');
  const toggle = $('.menu-toggle');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Ouvrir le menu');
  }
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    $$('.main-nav a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', e => { if (header && !header.contains(e.target)) closeMenu(); });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const sections = $$('.main-nav a[href^="#"]').map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    if (sections.length) {
      const sectionObserver = new IntersectionObserver(entries => {
        entries.filter(e => e.isIntersecting).forEach(({ target }) => {
          $$('.main-nav a[href^="#"]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${target.id}`));
        });
      }, {rootMargin: '-30% 0px -55% 0px'});
      sections.forEach(s => sectionObserver.observe(s));
    }
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveals.unobserve(entry.target);
        }
      });
    }, {threshold: 0.09, rootMargin:'0px 0px -15px 0px'});
    $$('.reveal').forEach((el) => {
      if (el.classList.contains('service-card')) {
        const index = $$('.service-card').indexOf(el);
        el.style.setProperty('--delay', `${(index % 5) * .075}s`);
      }
      reveals.observe(el);
    });
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 16);
    addEventListener('scroll', onScroll, {passive: true});
    onScroll();
  }

  // Authored from the gallery image addresses of MS22's original Jimdo website.
  // Each remote image is loaded directly from the image CDN, never from an old-site link.
  const galleryPhoto = $('#gallery-photo');
  const galleryShell = $('.gallery-shell');
  const lightbox = $('#lightbox');
  const lightboxPhoto = $('#lightbox-photo');
  if (galleryPhoto && galleryShell) {
    const base = 'https://image.jimcdn.com/app/cms/image/transf/none/path/s94e8d193dcf754a9/image/';
    const photos = [
      {src:'assets/chantier.webp',label:'Chantier extérieur MS 22 multi-service'},
      {src:base+'iaadc2a1cc66f0a1b/version/1505398806/image.jpg',label:'Photo de chantier 2'},
      {src:base+'i6d9bd6a61e95e2d2/version/1505398806/image.jpg',label:'Photo de chantier 3'},
      {src:base+'i4f8f4e9a045bceb5/version/1505398806/image.jpg',label:'Photo de chantier 4'},
      {src:base+'i9b99b52a3a6dafb8/version/1505398806/image.jpg',label:'Photo de chantier 5'},
      {src:base+'i9e698f28b258a7fe/version/1505398806/image.jpg',label:'Photo de chantier 6'},
      {src:base+'i3c5fa966701d128f/version/1505398807/image.jpg',label:'Photo de chantier 7'},
      {src:base+'iaeeb8c14bd7c57a1/version/1505398807/image.jpg',label:'Photo de chantier 8'},
      {src:base+'ic3d203c2b79ada09/version/1505398807/image.jpg',label:'Photo de chantier 9'},
      {src:base+'i9cedc949b1a11bf0/version/1505398807/image.jpg',label:'Photo de chantier 10'},
      {src:'https://image.jimcdn.com/app/cms/image/transf/dimension=2048x2048:format=jpg/path/s94e8d193dcf754a9/image/ib19ca344ecb78688/version/1505509251/image.jpg',label:'Photo de chantier 11'},
      {src:'https://image.jimcdn.com/app/cms/image/transf/dimension=2048x2048:format=jpg/path/s94e8d193dcf754a9/image/id413a68f2102b858/version/1505509283/image.jpg',label:'Photo de chantier 12'}
    ];
    const caption = $('#gallery-caption');
    const count = $('#gallery-count');
    const dots = $('#gallery-dots');
    const zoom = $('#open-lightbox');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let position = 0, request = 0, available = photos.map((_,i) => i);
    let startX = null;

    function updateDots() {
      if (!dots) return;
      dots.innerHTML='';
      available.forEach((index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `Afficher la photo ${available.indexOf(index) + 1}`);
        button.setAttribute('aria-current', String(photos.indexOf(photos[index]) === available[position]));
        button.addEventListener('click', () => show(available.indexOf(index)));
        dots.appendChild(button);
      });
      const disabled = available.length < 2;
      $$('.gallery-arrow').forEach(button => button.disabled = disabled);
    }
    function show(index, tries=0) {
      if (!available.length || tries >= photos.length) return;
      position = (index+available.length)%available.length;
      const assetIndex=available[position];
      const asset=photos[assetIndex];
      const ticket=++request;
      const preload=new Image();
      preload.onload=()=>{
        if (ticket!==request) return;
        galleryPhoto.src=asset.src;
        galleryPhoto.alt=`${asset.label} — MS 22 multi-service`;
        galleryPhoto.classList.remove('loading');
        if (caption) caption.textContent=asset.label;
        if (count) count.textContent=`${String(position+1).padStart(2,'0')} / ${String(available.length).padStart(2,'0')}`;
        updateDots();
        if (lightbox?.open && lightboxPhoto) { lightboxPhoto.src=asset.src;lightboxPhoto.alt=galleryPhoto.alt; }
      };
      preload.onerror=()=>{
        if(ticket!==request)return;
        if(available.length>1){
          available=available.filter(id=>id!==assetIndex);
          position=Math.min(position,available.length-1);
          show(position,tries+1);
        } else {
          galleryPhoto.src='assets/chantier.webp';galleryPhoto.alt='Photo de chantier MS 22 multi-service';
          galleryPhoto.classList.remove('loading');
          if(count)count.textContent='01 / 01';
          if(caption)caption.textContent='Chantier MS 22 multi-service';
          available=[0];position=0;updateDots();
        }
      };
      galleryPhoto.classList.add('loading');
      preload.src=asset.src;
    }
    $('.gallery-prev')?.addEventListener('click',()=>show(position-1));
    $('.gallery-next')?.addEventListener('click',()=>show(position+1));
    // Touch swipe navigation
    galleryShell.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});
    galleryShell.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX; if(Math.abs(dx)>48)show(position+(dx<0?1:-1));startX=null;},{passive:true});
    if(lightbox&&zoom&&lightboxPhoto){
      zoom.addEventListener('click',()=>{lightboxPhoto.src=galleryPhoto.src;lightboxPhoto.alt=galleryPhoto.alt;lightbox.showModal();});
      $('.close-lightbox')?.addEventListener('click',()=>lightbox.close());
      lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});
      document.addEventListener('keydown',e=>{
        if(lightbox.open){if(e.key==='ArrowRight')show(position+1);if(e.key==='ArrowLeft')show(position-1)}
      });
    }
    // Initialize the first verified image; progressive loading for remaining sources.
    updateDots();show(0);
    // Autoplay pauses when browser tab is hidden or pointer is hovering over carousel.
    if (!reduceMotion){
      setInterval(()=>{if(!document.hidden && !galleryShell.matches(':hover') && !lightbox?.open && available.length>1)show(position+1)},6200);
    }
  }
})();
