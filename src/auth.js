// src/auth.js — pełny, zsynchronizowany plik

import { auth } from './app.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

import { openModal, closeModal, getEl } from './ui/modals.js';

/* — fallbacki, gdy globalnych helperów brak — */
function __openModalFallback(m){if(!m)return;m.setAttribute('aria-hidden','false');m.classList.remove('opacity-0','pointer-events-none');m.querySelector('.modal-content')?.classList.remove('scale-95');}
function __closeModalFallback(m){if(!m)return;m.setAttribute('aria-hidden','true');m.classList.add('opacity-0','pointer-events-none');m.querySelector('.modal-content')?.classList.add('scale-95');}
const openModalSafe  = (m)=>typeof window.openModal ==='function'?window.openModal(m):__openModalFallback(m);
const closeModalSafe = (m)=>typeof window.closeModal==='function'?window.closeModal(m):__closeModalFallback(m);

/* — utils — */
const $  = (sel)=>document.querySelector(sel);
const $$ = (sel)=>Array.from(document.querySelectorAll(sel));
const show  =(el)=>el?.classList.remove('hidden');
const hide  =(el)=>el?.classList.add('hidden');
const setTxt=(el,txt)=>{if(el)el.textContent=txt;};

function mapAuthError(err){
  const m={
    'auth/invalid-email':'Nieprawidłowy adres e-mail.',
    'auth/user-disabled':'Konto użytkownika jest zablokowane.',
    'auth/user-not-found':'Nie znaleziono konta z tym e-mailem.',
    'auth/wrong-password':'Błędne hasło.',
    'auth/too-many-requests':'Zbyt wiele prób. Spróbuj ponownie później.',
    'auth/email-already-in-use':'E-mail jest już używany.',
    'auth/weak-password':'Hasło jest zbyt słabe (min. 6 znaków).',
    'auth/network-request-failed':'Błąd sieci. Sprawdź połączenie.',
    'auth/popup-closed-by-user':'Zamknięto okno logowania.',
    'auth/cancelled-popup-request':'Przerwano logowanie.',
    'auth/operation-not-supported-in-this-environment':'Operacja nieobsługiwana w tym środowisku.',
    'auth/popup-blocked':'Przeglądarka zablokowała okno logowania.',
    'auth/account-exists-with-different-credential':'Konto istnieje z innym dostawcą.'
  };
  return m[err?.code] || err?.message || 'Wystąpił błąd uwierzytelniania.';
}

/* — widok login/signup — */
function setAuthMode(mode){
  const isIn = mode==='signin';
  $('#auth-tab-signin')?.setAttribute('aria-selected',isIn);
  $('#auth-tab-signup')?.setAttribute('aria-selected',!isIn);
  $('#auth-tab-signin')?.classList.toggle('bg-white',isIn);
  $('#auth-tab-signup')?.classList.toggle('bg-white',!isIn);
  show(isIn?$('#auth-form-signin'):$('#auth-form-signup'));
  hide(isIn?$('#auth-form-signup'):$('#auth-form-signin'));
}

/* — widok zalogowany/wylogowany — */
function updateLoggedInView(user){
  const logged=!!user;
  if(logged){hide($('#auth-logged-out'));show($('#auth-logged-in'));
    setTxt($('#user-email-display'),user.email||'');
    const verified=!!user.emailVerified;
    setTxt($('#user-verified'),verified?'Zweryfikowany e-mail':'E-mail niezweryfikowany');
    $('#user-verified')?.classList.toggle('text-emerald-600',verified);
    $('#user-verified')?.classList.toggle('text-amber-600',!verified);
    $('#auth-resend-verification')?.classList.toggle('hidden',verified);
    const letter=(user.email||'?')[0]?.toUpperCase()||'U';
    setTxt($('#auth-avatar'),letter);
  }else{show($('#auth-logged-out'));hide($('#auth-logged-in'));setAuthMode('signin');}
  $('#auth-icon-user') ?.classList.toggle('hidden',logged);
  $('#auth-icon-logout')?.classList.toggle('hidden',!logged);
}

/* — inicjalizacja UI — */
export function initAuthUI(){
  const modal = $('#auth-modal');
  if(!modal){console.warn('[AUTH] brak #auth-modal');return;}

  /* start: ukryj modal */
  modal.setAttribute('aria-hidden','true');
  modal.classList.add('opacity-0','pointer-events-none');
  modal.querySelector('.modal-content')?.classList.add('scale-95');

  /* przycisk w navbarze */
  $('#show-auth-btn')?.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    updateLoggedInView(auth.currentUser);
    openModalSafe(modal);
  });

  /* zamykanie */
  $$('[data-auth-close], #auth-close').forEach(el=>el.addEventListener('click',()=>closeModalSafe(modal)));

  /* zakładki */
  $('#auth-tab-signin')?.addEventListener('click',()=>{hide($('#auth-error'));hide($('#auth-info'));setAuthMode('signin');});
  $('#auth-tab-signup')?.addEventListener('click',()=>{hide($('#auth-error'));hide($('#auth-info'));setAuthMode('signup');});

  /* przełączniki hasła */
  $$('button[data-toggle-password]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id=btn.getAttribute('data-toggle-password');const inp=document.getElementById(id);if(!inp)return;
      const pass=inp.type==='password';inp.type=pass?'text':'password';btn.textContent=pass?'Ukryj':'Pokaż';inp.focus();
    });
  });

  /* logowanie */
  $('#auth-form-signin')?.addEventListener('submit',async e=>{
    e.preventDefault();hide($('#auth-error'));hide($('#auth-info'));
    const email=$('#auth-email-in')?.value.trim();const pass=$('#auth-password-in')?.value||'';
    $('#auth-login-submit')?.setAttribute('disabled','true');
    try{await signInWithEmailAndPassword(auth,email,pass);closeModalSafe(modal);}
    catch(err){setTxt($('#auth-error'),mapAuthError(err));show($('#auth-error'));}
    finally{$('#auth-login-submit')?.removeAttribute('disabled');}
  });

  /* reset hasła */
  $('#auth-forgot')?.addEventListener('click',async e=>{
    e.preventDefault();const email=$('#auth-email-in')?.value.trim();
    if(!email){setTxt($('#auth-error'),'Podaj e-mail.');show($('#auth-error'));return;}
    try{await sendPasswordResetEmail(auth,email);setTxt($('#auth-info'),'Wysłaliśmy link.');show($('#auth-info'));}
    catch(err){setTxt($('#auth-error'),mapAuthError(err));show($('#auth-error'));}
  });

  /* rejestracja */
  $('#auth-form-signup')?.addEventListener('submit',async e=>{
    e.preventDefault();hide($('#auth-error'));hide($('#auth-info'));
    const email=$('#auth-email-up')?.value.trim();
    const p1=$('#auth-password-up')?.value||'';const p2=$('#auth-password-confirm')?.value||'';
    if(p1!==p2){setTxt($('#auth-error'),'Hasła nie są identyczne.');show($('#auth-error'));return;}
    $('#auth-register-submit')?.setAttribute('disabled','true');
    try{
      const cred=await createUserWithEmailAndPassword(auth,email,p1);
      try{await sendEmailVerification(cred.user);setTxt($('#auth-info'),'Sprawdź e-mail aby potwierdzić.');show($('#auth-info'));}catch(_){}
      closeModalSafe(modal);
    }catch(err){setTxt($('#auth-error'),mapAuthError(err));show($('#auth-error'));}
    finally{$('#auth-register-submit')?.removeAttribute('disabled');}
  });

  /* Google */
  $('#auth-google')?.addEventListener('click',async e=>{
    e.preventDefault();hide($('#auth-error'));hide($('#auth-info'));
    const provider=new GoogleAuthProvider();
    try{await signInWithPopup(auth,provider);closeModalSafe(modal);}
    catch(err){
      if(err?.code==='auth/operation-not-supported-in-this-environment'){await signInWithRedirect(auth,provider);}
      else{setTxt($('#auth-error'),mapAuthError(err));show($('#auth-error'));}
    }
  });

  /* logout */
  $('#logout-btn')?.addEventListener('click',async e=>{
    e.preventDefault();try{await signOut(auth);}finally{closeModalSafe(modal);}
  });

  /* ponowne wysłanie weryfikacji */
  $('#auth-resend-verification')?.addEventListener('click',async e=>{
    e.preventDefault();const user=auth.currentUser;if(!user)return;
    try{await sendEmailVerification(user);setTxt($('#auth-info'),'Wysłaliśmy ponownie e-mail weryfikacyjny.');show($('#auth-info'));}
    catch(err){setTxt($('#auth-error'),mapAuthError(err));show($('#auth-error'));}
  });

  /* obserwacja stanu */
  onAuthStateChanged(auth,user=>{
    updateLoggedInView(user);
    if(!modal.classList.contains('opacity-0'))updateLoggedInView(user);
  });
}