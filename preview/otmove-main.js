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
      var marqueeEl = document.querySelector('.marquee');
      var overlapHeroEl = document.querySelector('.hero');
      function updateOverlap(){
        var headerMarginTop = parseFloat(getComputedStyle(siteHeader).marginTop) || 0;
        var h = siteHeader.offsetHeight
          + headerMarginTop
          + (utilBarEl ? utilBarEl.getBoundingClientRect().height : 0)
          + (ribbonEl ? ribbonEl.getBoundingClientRect().height : 0);
        document.documentElement.style.setProperty('--overlap-h', h + 'px');

        // 위 합산값은 실제 렌더링과 몇 px 어긋날 수 있어(브라우저 레이아웃 엔진의
        // sticky/fixed 형제 요소 처리 차이 등) 히어로 실제 위치를 마퀴 하단과 직접
        // 비교해 오차를 보정한다 — 그래야 헤더/유틸바 글씨가 항상 히어로 이미지
        // 위(어두운 오버레이 위)에 정확히 올라가고, 카페24 배경 위로 새어나오지 않는다.
        if(overlapHeroEl && marqueeEl){
          var diff = overlapHeroEl.getBoundingClientRect().top - marqueeEl.getBoundingClientRect().bottom;
          if(Math.abs(diff) > 0.5){
            document.documentElement.style.setProperty('--overlap-h', (h + diff) + 'px');
          }
        }
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

      // .hero-slide 구조를 우선 쓰고, 없으면(예전 .hero-media img 구조) 슬라이더를 아예 초기화하지 않는다 —
      // 그 경우 CSS가 opacity 제어를 하지 않으므로 이미지가 기본 상태로 그대로 보인다.
      var heroSlideEls = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
      var heroIndexEl = document.querySelector('.hero-index');
      var heroPrevBtn = document.querySelector('.hero-arrow.prev');
      var heroNextBtn = document.querySelector('.hero-arrow.next');
      var currentSlideEl = null;
      var heroTimer = null;
      var brokenHeroSlides = [];

      function isBroken(slide){
        return brokenHeroSlides.indexOf(slide) !== -1;
      }
      function markHeroSlideBroken(slide){
        if(isBroken(slide)) return;
        brokenHeroSlides.push(slide);
        if(slide.classList.contains('active')){
          showHeroSlide(1);
        }
      }
      // 로드 실패한(또는 이미지가 없는 카페24 CDN 경로 등으로 깨진) 슬라이드는 회전에서 제외한다.
      function heroNodes(){
        return heroSlideEls.filter(function(slide){ return !isBroken(slide); });
      }

      heroSlideEls.forEach(function(slide){
        var img = slide.querySelector('img');
        if(!img) return;
        if(img.complete){
          if(img.naturalWidth === 0) markHeroSlideBroken(slide);
        }else{
          img.addEventListener('error', function(){ markHeroSlideBroken(slide); });
          img.addEventListener('load', function(){
            if(img.naturalWidth === 0) markHeroSlideBroken(slide);
          });
        }
      });

      function showHeroSlide(step){
        var nodes = heroNodes();
        if(!nodes.length) return;
        var currentIdx = currentSlideEl ? nodes.indexOf(currentSlideEl) : -1;
        var nextIdx = currentIdx === -1 ? 0 : (currentIdx + step + nodes.length) % nodes.length;
        currentSlideEl = nodes[nextIdx];
        heroSlideEls.forEach(function(slide){
          slide.classList.toggle('active', slide === currentSlideEl);
        });
        if(heroIndexEl){
          var num = String(nextIdx + 1).padStart(2, '0');
          heroIndexEl.textContent = num + ' / ' + String(nodes.length).padStart(2, '0');
        }
      }
      function startHeroAutoplay(){
        if(heroTimer) clearInterval(heroTimer);
        if(heroNodes().length > 1){
          heroTimer = setInterval(function(){
            showHeroSlide(1);
          }, 2000);
        }
      }
      if(heroSlideEls.length){
        showHeroSlide(0);
        startHeroAutoplay();
        if(heroPrevBtn){
          heroPrevBtn.addEventListener('click', function(){
            showHeroSlide(-1);
            startHeroAutoplay();
          });
        }
        if(heroNextBtn){
          heroNextBtn.addEventListener('click', function(){
            showHeroSlide(1);
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