(() => {
  // Free Google Analytics 4 integration.
  // Replace the value below with your GA4 Measurement ID (starts with G-).
  const GA_MEASUREMENT_ID = 'G-STZRGV7QX4';

  const loadAnalytics = () => {
    if (!/^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

    // Event delegation: also catches links added to the page later
    // (e.g. the Substack article cards rendered by substack-feed.js).
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      {
        const href = link.href;
        const label = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
        let eventName = 'link_click';
        if (/substack\.com/i.test(href)) eventName = 'substack_click';
        else if (/resources\.html/i.test(href)) eventName = 'resource_click';
        else if (/blog\.html/i.test(href)) eventName = 'blog_click';
        else if (/linkedin\.com/i.test(href)) eventName = 'linkedin_click';
        else if (/\.pdf($|[?#])/i.test(href)) eventName = 'resume_download';

        window.gtag('event', eventName, {
          link_url: href,
          link_text: label,
          page_path: window.location.pathname
        });
      }
    });
  };

  loadAnalytics();
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded','false');
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, {rootMargin:'-35% 0px -55% 0px', threshold:0});
  sections.forEach(section => observer.observe(section));

  document.querySelector('#year').textContent = new Date().getFullYear();

  // Motion-first portfolio choreography. The supplied reference video uses a pinned
  // scroll scene where one gesture controls multiple layers at once.
  const initMotionStory = () => {
    const story = document.querySelector('.motion-story');
    if (!story || !window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const q = (s) => story.querySelector(s);
    const progress = q('.motion-progress span');
    const profile = q('.motion-profile');
    const person = q('.motion-person-frame');
    const id = q('.motion-id-card');
    const giant = q('.motion-giant');
    const about = q('.motion-copy-about');
    const stack = q('.motion-copy-stack');
    const work = q('.motion-copy-work');
    const impact = q('.motion-copy-impact');
    const tiles = gsap.utils.toArray('.motion-tile', story);
    const projects = gsap.utils.toArray('.motion-project', story);
    const impactStats = q('.motion-impact');

    const tl = gsap.timeline({
      scrollTrigger:{
        trigger:story,
        start:'top top',
        end:'+=3600',
        scrub:1.15,
        pin:'.motion-stage',
        anticipatePin:1,
        invalidateOnRefresh:true,
        onUpdate:self => gsap.set(progress,{scaleX:self.progress})
      }
    });

    // 0 → 20%: the profile breathes into the screen and the ID card peels forward.
    tl.fromTo(profile,{y:120,scale:.78,rotate:-5},{y:0,scale:1,rotate:0,duration:.18,ease:'power3.out'},0)
      .fromTo(person,{scale:1.08},{scale:1,duration:.18,ease:'power2.out'},0)
      .fromTo(id,{x:180,y:100,rotate:18,scale:.7,opacity:0},{x:0,y:0,rotate:7,scale:1,opacity:1,duration:.18,ease:'back.out(1.7)'},.04)
      .fromTo(giant,{x:-40,scale:.9,opacity:.2},{x:0,scale:1.04,opacity:1,duration:.18,ease:'none'},0)
      .fromTo(about,{x:-70,opacity:0},{x:0,opacity:1,duration:.12,ease:'power2.out'},.08)
      .to(about,{x:-80,opacity:0,duration:.1,ease:'power2.in'},.2);

    // 20 → 55%: ID card rotates away while the stack tiles pop into a deliberate grid.
    tl.to(profile,{x:-190,y:20,scale:.84,rotate:-4,duration:.16,ease:'power2.inOut'},.2)
      .to(id,{x:280,y:-80,rotate:-18,scale:.58,opacity:0,duration:.13,ease:'power3.in'},.2)
      .to(giant,{x:-170,scale:.82,opacity:.35,duration:.2,ease:'none'},.2)
      .fromTo(stack,{x:-80,opacity:0},{x:0,opacity:1,duration:.12,ease:'power3.out'},.24)
      .fromTo(tiles,{scale:.5,opacity:0,y:80,rotation:-8},{scale:1,opacity:1,y:0,rotation:0,stagger:{each:.018,from:'random'},duration:.16,ease:'back.out(1.7)'},.27)
      .to(tiles,{y:(i)=> i%2 ? -12 : 12,rotation:(i)=> i%2 ? 2 : -2,duration:.12,stagger:{each:.012,from:'edges'},ease:'sine.inOut'},.43)
      .to(stack,{x:-70,opacity:0,duration:.09,ease:'power2.in'},.51)
      .to(tiles,{scale:.75,opacity:.18,x:-90,duration:.11,stagger:.008,ease:'power2.in'},.52);

    // 55 → 82%: cards travel horizontally while the copy changes.
    tl.fromTo(work,{x:-80,opacity:0},{x:0,opacity:1,duration:.11,ease:'power3.out'},.54)
      .fromTo('.motion-project-track',{x:'22vw'},{x:'-720px',duration:.25,ease:'none'},.55)
      .to(work,{x:-70,opacity:0,duration:.08,ease:'power2.in'},.76)
      .to(giant,{x:180,scale:1.12,opacity:.18,duration:.18,ease:'none'},.72);

    // 82 → 100%: impact numbers snap in, then the scene clears for the next section.
    tl.fromTo(impact,{y:100,opacity:0,scale:.9},{y:0,opacity:1,scale:1,duration:.14,ease:'back.out(1.4)'},.78)
      .fromTo(impactStats,{y:80,opacity:0},{y:0,opacity:1,duration:.12,ease:'power3.out'},.8)
      .fromTo(impact,{scale:1},{scale:.94,duration:.1,ease:'power2.inOut'},.94)
      .to(giant,{scale:1.2,opacity:.06,duration:.06},.94);

    // Give the rest of the portfolio the same scroll choreography: sections rise,
    // cards stagger in, and project/archive rows get subtle depth.
    const revealTargets = document.querySelectorAll('.section:not(.hero):not(.motion-story) .section-kicker, .section:not(.hero):not(.motion-story) h2, .section:not(.hero):not(.motion-story) .timeline-item, .section:not(.hero):not(.motion-story) .capability, .section:not(.hero):not(.motion-story) .project-card, .section:not(.hero):not(.motion-story) .archive-project-card, .section:not(.hero):not(.motion-story) .achievement-card, .section:not(.hero):not(.motion-story) .resource-card');
    revealTargets.forEach((el,i)=>{
      gsap.fromTo(el,{y:55,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });

    const projectGrid=document.querySelector('.project-grid');
    if(projectGrid){
      gsap.fromTo(projectGrid,{x:120},{x:0,ease:'none',scrollTrigger:{trigger:projectGrid,start:'top 90%',end:'top 40%',scrub:.7}});
    }
  };

  initMotionStory();

})();