(() => {
  // Free Google Analytics 4 integration.
  // Replace the value below with your GA4 Measurement ID (starts with G-).
  const GA_MEASUREMENT_ID = 'G-REPLACE_ME';

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

    document.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => {
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
      });
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
})();