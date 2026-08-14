/*
  정적 미리보기 빌드 전용 — 로그인 상태 목업.

  실제 카페24는 서버 세션으로 로그인 여부를 판단하고 {$is_member} 같은 템플릿 변수로
  상단 링크를 바꿉니다. 프리뷰에는 서버가 없으므로 sessionStorage 에 아이디만 담아
  같은 화면 전환을 흉내냅니다. 탭을 닫으면 사라집니다.

  이 파일은 프리뷰에만 존재합니다. otmove-main.js 는 루트(카페24 업로드본)와
  1바이트도 다르지 않아야 하므로 이 로직을 그쪽에 넣지 마세요.
*/
(function(){
  'use strict';

  var KEY = 'otmove_login_id';

  function currentUser(){
    try{ return sessionStorage.getItem(KEY); }catch(e){ return null; }
  }

  function signOut(){
    try{ sessionStorage.removeItem(KEY); }catch(e){}
  }

  // 텍스트로 링크를 찾는다. 유틸바와 드로어 양쪽에 같은 문구가 있어 전부 훑는다.
  function linksByText(text){
    var scopes = document.querySelectorAll('.util-bar, .drawer-utility');
    var found  = [];
    Array.prototype.forEach.call(scopes, function(scope){
      Array.prototype.forEach.call(scope.querySelectorAll('a'), function(a){
        if(a.textContent.trim() === text) found.push(a);
      });
    });
    return found;
  }

  function apply(){
    var user = currentUser();

    // 마이페이지: 로그인 상태면 마이페이지로, 아니면 로그인 화면으로 보낸다.
    var myTarget = user ? 'mypage.html' : 'login.html';
    linksByText('마이페이지').forEach(function(a){ a.setAttribute('href', myTarget); });
    var iconMy = document.querySelector('.header-icons a[aria-label="마이페이지"]');
    if(iconMy) iconMy.setAttribute('href', myTarget);

    if(!user) return;

    linksByText('회원가입').forEach(function(a){
      a.style.display = 'none';
    });

    linksByText('로그인').forEach(function(a){
      a.textContent = '로그아웃';
      a.setAttribute('href', '#none');
      a.addEventListener('click', function(e){
        e.preventDefault();
        signOut();
        location.href = 'index.html';
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', apply);
  }else{
    apply();
  }
})();
