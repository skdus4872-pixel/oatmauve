(function(){

      var menuToggle = document.getElementById('menuToggle');
      var sideDrawer = document.getElementById('sideDrawer');
      var drawerOverlay = document.getElementById('drawerOverlay');
      var drawerClose = document.getElementById('drawerClose');

      function openDrawer(){
        sideDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      function closeDrawer(){
        sideDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
      menuToggle.addEventListener('click', openDrawer);
      drawerClose.addEventListener('click', closeDrawer);
      drawerOverlay.addEventListener('click', closeDrawer);

      var siteHeader = document.querySelector('header.site-header');
      var utilBarEl = document.querySelector('.util-bar');
      var ribbonEl = document.querySelector('.ribbon-divider');
      function updateOverlap(){
        var headerMarginTop = parseFloat(getComputedStyle(siteHeader).marginTop) || 0;
        var h = siteHeader.offsetHeight
          + headerMarginTop
          + (utilBarEl ? utilBarEl.getBoundingClientRect().height : 0)
          + (ribbonEl ? ribbonEl.getBoundingClientRect().height : 0);
        document.documentElement.style.setProperty('--overlap-h', h + 'px');
      }
      updateOverlap();
      window.addEventListener('resize', updateOverlap);
      if(document.fonts && document.fonts.ready){
        document.fonts.ready.then(updateOverlap);
      }

      var heroEl = document.querySelector('.hero');
      function updateHeaderBg(){
        if(!heroEl) return;
        var heroBottom = heroEl.getBoundingClientRect().bottom;
        if(heroBottom <= siteHeader.offsetHeight){
          siteHeader.classList.add('header-scrolled');
        }else{
          siteHeader.classList.remove('header-scrolled');
        }
      }
      updateHeaderBg();
      window.addEventListener('scroll', updateHeaderBg, {passive:true});
      window.addEventListener('resize', updateHeaderBg);

      var heroSlides = document.querySelectorAll('.hero-slide');
      var heroIndexEl = document.querySelector('.hero-index');
      var heroPrevBtn = document.querySelector('.hero-arrow.prev');
      var heroNextBtn = document.querySelector('.hero-arrow.next');
      var currentHeroSlide = 0;
      var heroTimer = null;

      function showHeroSlide(i){
        if(!heroSlides.length) return;
        currentHeroSlide = (i + heroSlides.length) % heroSlides.length;
        heroSlides.forEach(function(slide, idx){
          slide.classList.toggle('active', idx === currentHeroSlide);
        });
        if(heroIndexEl){
          var total = heroSlides.length;
          var num = String(currentHeroSlide + 1).padStart(2, '0');
          heroIndexEl.textContent = num + ' / ' + String(total).padStart(2, '0');
        }
      }
      function startHeroAutoplay(){
        if(heroTimer) clearInterval(heroTimer);
        if(heroSlides.length > 1){
          heroTimer = setInterval(function(){
            showHeroSlide(currentHeroSlide + 1);
          }, 2000);
        }
      }
      if(heroSlides.length){
        showHeroSlide(0);
        startHeroAutoplay();
        if(heroPrevBtn){
          heroPrevBtn.addEventListener('click', function(){
            showHeroSlide(currentHeroSlide - 1);
            startHeroAutoplay();
          });
        }
        if(heroNextBtn){
          heroNextBtn.addEventListener('click', function(){
            showHeroSlide(currentHeroSlide + 1);
            startHeroAutoplay();
          });
        }
      }

      var newSlider = document.getElementById('newProductSlider');
      var newSection = newSlider ? newSlider.closest('.product-section') : null;
      if(newSlider && newSection){
        var newPrevBtn = newSection.querySelector('.slider-arrow.prev');
        var newNextBtn = newSection.querySelector('.slider-arrow.next');
        function cardStep(){
          var card = newSlider.querySelector('.card');
          if(!card) return 0;
          var cardWidth = card.getBoundingClientRect().width;
          var gap = parseFloat(getComputedStyle(newSlider).gap) || 0;
          return cardWidth + gap;
        }
        function scrollByCard(dir){
          var step = cardStep();
          if(!step) return;
          var maxScroll = newSlider.scrollWidth - newSlider.clientWidth;
          if(dir > 0){
            if(newSlider.scrollLeft >= maxScroll - 2){
              newSlider.scrollTo({left: 0, behavior:'smooth'});
            }else{
              newSlider.scrollTo({left: Math.min(newSlider.scrollLeft + step, maxScroll), behavior:'smooth'});
            }
          }else{
            if(newSlider.scrollLeft <= 2){
              newSlider.scrollTo({left: maxScroll, behavior:'smooth'});
            }else{
              newSlider.scrollTo({left: Math.max(newSlider.scrollLeft - step, 0), behavior:'smooth'});
            }
          }
        }
        if(newPrevBtn) newPrevBtn.addEventListener('click', function(){ scrollByCard(-1); restartNewAutoplay(); });
        if(newNextBtn) newNextBtn.addEventListener('click', function(){ scrollByCard(1); restartNewAutoplay(); });

        var newAutoTimer = null;
        function startNewAutoplay(){
          if(newAutoTimer) clearInterval(newAutoTimer);
          newAutoTimer = setInterval(function(){ scrollByCard(1); }, 5000);
        }
        function restartNewAutoplay(){ startNewAutoplay(); }
        startNewAutoplay();
        newSlider.addEventListener('mouseenter', function(){ if(newAutoTimer) clearInterval(newAutoTimer); });
        newSlider.addEventListener('mouseleave', startNewAutoplay);
      }

      var filterTabs = document.querySelectorAll('.filter-tab');
      var bestCards = document.querySelectorAll('#bestGrid .card');
      filterTabs.forEach(function(tab){
        tab.addEventListener('click', function(){
          filterTabs.forEach(function(t){ t.classList.remove('active'); });
          tab.classList.add('active');
          var filter = tab.getAttribute('data-filter');
          bestCards.forEach(function(card){
            if(filter === 'all' || card.getAttribute('data-category') === filter){
              card.classList.remove('is-hidden');
            }else{
              card.classList.add('is-hidden');
            }
          });
        });
      });
    })();