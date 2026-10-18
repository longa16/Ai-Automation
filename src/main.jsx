import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, Menu, X, Check, Zap, Workflow, MessageSquare, CalendarDays, ShieldCheck, Layers3, Bot, UsersRound, CheckCheck, MoveUpRight, LoaderCircle } from 'lucide-react';
import '@fontsource-variable/dm-sans/index.css';
import '@fontsource-variable/manrope/index.css';
import './styles.css';

const services = [
  { number: '01', icon: Zap, title: 'Transformez vos prospects en rendez-vous.', label: 'Conversion & acquisition', text: 'Chaque demande mérite une réponse. Créez un parcours fluide, du premier contact au rendez-vous confirmé.', tags: ['Suivi des prospects', 'CRM connecté', 'Prise de rendez-vous'], details: ['Accusé de réception et suivi des appels manqués', 'Relances selon des scénarios approuvés', 'Réservation, confirmations et rappels de rendez-vous', 'Mise à jour du pipeline CRM et reporting'] },
  { number: '02', icon: MessageSquare, title: 'Une relation client qui garde le lien.', label: 'Expérience & relation client', text: 'Des réponses utiles, des demandes bien orientées et une équipe disponible quand l’humain fait la différence.', tags: ['Assistant IA', 'Qualification', 'Suivi client'], details: ['Assistant FAQ à partir de vos contenus validés', 'Collecte, qualification et orientation des demandes', 'Transmission des cas complexes à votre équipe', 'Suivi après prestation et demandes d’avis clients'] },
  { number: '03', icon: Workflow, title: 'Faites avancer le travail. Pas la paperasse.', label: 'Opérations & back-office', text: 'Connectez vos outils et libérez votre équipe des saisies répétitives. Vos informations circulent, votre activité avance.', tags: ['Workflows sur mesure', 'Synchronisation', 'Reporting'], details: ['Traitement des formulaires et réception de documents', 'Création et attribution automatiques des tâches', 'Synchronisation des données entre vos applications', 'Rapports, suivi des erreurs et alertes opérationnelles'] },
];

function Brand({ footer = false }) {
  return <a className={`brand ${footer ? 'brand-footer' : ''}`} href="#accueil" aria-label="AI Automation Agency — Accueil"><span className="brand-symbol" aria-hidden="true"><span/><span/><span/></span><span>AI AUTOMATION<span className="brand-sub">AGENCY<span className="brand-dot">®</span></span></span></a>;
}

function FlowVisual() {
  return <div className="flow-visual" aria-label="Illustration : une demande client est traitée par un workflow IA, puis validée par un humain avant confirmation du rendez-vous.">
    <div className="visual-topline"><span><i className="live-dot"/> UN SYSTÈME. TOUT EST CONNECTÉ.</span><span>01 — 04</span></div>
    <div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/>
    <svg className="flow-lines" viewBox="0 0 600 440" fill="none" aria-hidden="true"><path d="M137 125H231Q250 125 250 146V194M351 234H421Q445 234 445 260V294M300 270V331H218"/><path className="animated-line" d="M137 125H231Q250 125 250 146V194M351 234H421Q445 234 445 260V294"/></svg>
    <div className="flow-node lead-node"><span className="node-icon"><MessageSquare size={18}/></span><div><small>NOUVEAU CONTACT</small><strong>Une opportunité entre.</strong></div><span className="tiny-dot"/></div>
    <div className="core-node"><span className="core-corner">✦</span><Workflow size={37} strokeWidth={1.4}/><span>Moins de friction.<br/><strong>Plus de mouvement.</strong></span><span className="core-bottom">POWERED BY AI <Zap size={12}/></span></div>
    <div className="human-node"><span className="human-avatar">H<span/></span><div><strong>L’humain valide.</strong><small>Vous gardez le contrôle.</small></div><ShieldCheck size={17}/></div>
    <div className="flow-node booking-node"><span className="node-icon mint"><CalendarDays size={19}/></span><div><small>LA SUITE EST DÉJÀ PRÊTE</small><strong>Rendez-vous confirmé</strong></div><span className="success-tick"><Check size={12}/></span></div>
    <div className="floating-label"><CheckCheck size={14}/> Les tâches avancent. Vous aussi.</div>
    <div className="visual-bottomline"><span><span className="square-dot"/> AUTOMATISATION + INTELLIGENCE HUMAINE</span><ArrowUpRight size={14}/></div>
  </div>;
}

function ServiceCard({ service, open, onToggle }) {
  const Icon = service.icon;
  return <article className={`service-card ${open ? 'expanded' : ''}`}><div className="card-top"><span className="service-icon"><Icon size={24} strokeWidth={1.5}/></span><span className="card-number">/{service.number}</span></div><p className="service-label">{service.label}</p><h3>{service.title}</h3><p className="service-description">{service.text}</p><div className="tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div><button className="service-toggle" onClick={onToggle} aria-expanded={open} aria-controls={`details-${service.number}`}>Ce qu’on met en place<span>{open ? <Minus size={17}/> : <Plus size={17}/>}</span></button><div id={`details-${service.number}`} hidden={!open}><ul className="service-details">{service.details.map(detail => <li key={detail}><Check size={14}/>{detail}</li>)}</ul><a className="text-link" href="#contact">Parlons de ce service <ArrowUpRight size={16}/></a></div></article>;
}

function ContactForm() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('Je souhaite être conseillé');
  const resultRef = useRef(null);
  useEffect(() => { if (status === 'success' || status === 'error') resultRef.current?.focus(); }, [status]);
  async function submit(event) {
    event.preventDefault();
    if (status === 'loading') return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setStatus('loading'); setError('');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, service: selected }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'L’enregistrement a échoué. Veuillez réessayer.');
      setStatus('success');
    } catch (err) { setError(err.message === 'Failed to fetch' ? 'La connexion est indisponible. Veuillez réessayer dans un instant.' : err.message); setStatus('error'); }
  }
  if (status === 'success') return <div className="contact-success" ref={resultRef} tabIndex={-1} role="status"><span className="success-large"><Check size={30}/></span><p className="eyebrow">PREMIER PAS, C’EST FAIT.</p><h3>Votre projet a trouvé<br/>son point de départ.</h3><p>Votre demande a bien été enregistrée. Merci de nous avoir partagé votre besoin.</p><button className="button button-dark" onClick={() => setStatus('idle')}>Préparer une autre demande <ArrowUpRight size={17}/></button></div>;
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-row"><label>Votre nom <span>*</span><input name="name" autoComplete="name" placeholder="Camille Martin" required minLength={2} maxLength={100}/></label><label>E-mail professionnel <span>*</span><input type="email" name="email" autoComplete="email" placeholder="camille@entreprise.fr" required maxLength={254}/></label></div>
    <label>Votre entreprise<input name="company" autoComplete="organization" placeholder="Le nom de votre entreprise" maxLength={150}/></label>
    <fieldset><legend>Qu’aimeriez-vous simplifier ?</legend><div className="choice-list">{['Mes prospects', 'Ma relation client', 'Mes opérations', 'Je souhaite être conseillé'].map(choice => <label className={`choice ${selected === choice ? 'selected' : ''}`} key={choice}><input type="radio" name="interest" value={choice} checked={selected === choice} onChange={() => setSelected(choice)}/>{selected === choice && <Check size={12}/>} {choice}</label>)}</div></fieldset>
    <label>Parlez-nous de votre besoin <span>*</span><textarea name="message" placeholder="Quelles tâches vous prennent trop de temps aujourd’hui ? Quels outils utilisez-vous ?" rows={3} required minLength={10} maxLength={5000}/></label>
    <div className="honeypot" aria-hidden="true"><label>Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="consent"><input type="checkbox" name="consent" required/><span>J’accepte que mes informations soient utilisées pour traiter ma demande. <a href="#confidentialite">En savoir plus</a></span></label>
    {status === 'error' && <p role="alert" className="form-error" tabIndex={-1} ref={resultRef}>{error}</p>}
    <button type="submit" className="button button-dark form-submit" disabled={status === 'loading'}>{status === 'loading' ? 'Enregistrement…' : 'Parlons de votre projet'}{status === 'loading' ? <LoaderCircle size={18} className="spin"/> : <ArrowUpRight size={20}/>}</button><p className="form-footnote">Un besoin concret. Un périmètre clair. On commence par là.</p>
  </form>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('accueil');
  const [openService, setOpenService] = useState(null);
  const [privacy, setPrivacy] = useState(false);
  const privacyCloseRef = useRef(null);
  const previousFocus = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }); }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    const onHash = () => { if (location.hash === '#confidentialite') { previousFocus.current = document.activeElement; setPrivacy(true); } };
    window.addEventListener('hashchange', onHash); onHash();
    return () => { observer.disconnect(); window.removeEventListener('hashchange', onHash); };
  }, []);
  useEffect(() => { document.body.style.overflow = menuOpen || privacy ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen, privacy]);
  function closePrivacy() { setPrivacy(false); history.replaceState(null, '', location.pathname + location.search + '#contact'); previousFocus.current?.focus(); }
  useEffect(() => {
    if (!privacy) return;
    privacyCloseRef.current?.focus();
    const onKey = e => { if (e.key === 'Escape') closePrivacy(); if (e.key === 'Tab') { e.preventDefault(); privacyCloseRef.current?.focus(); } };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [privacy]);
  useEffect(() => { if (!menuOpen) return; const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [menuOpen]);
  return <>
    <a className="skip-link" href="#contenu">Aller au contenu</a>
    <header className="header"><div className="container header-inner"><Brand/><nav className={menuOpen ? 'nav nav-open' : 'nav'} id="navigation" aria-label="Navigation principale">{[['a-propos', 'À propos'], ['services', 'Nos services'], ['contact', 'Contact']].map(([id, label]) => <a key={id} className={active === id ? 'active' : ''} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<span/></a>)}</nav><a className="header-cta" href="#contact">Parlons de votre projet <ArrowUpRight size={16}/></a><button className="menu-toggle" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button></div></header>
    <main id="contenu">
      <section className="hero" id="accueil"><div className="container"><div className="hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="live-dot"/> L’IA PRATIQUE. L’IMPACT CONCRET.</p><h1>Moins de tâches.<br/>Plus <span className="italic-accent">d’élan.</span><span className="heading-spark" aria-hidden="true">✳</span></h1><p className="hero-description">Votre entreprise mérite mieux que des journées à tout faire.<br className="desktop-break"/> Nous connectons vos outils, automatisons vos tâches<br className="desktop-break"/> et redonnons de l’espace à ce qui compte.</p><div className="hero-actions"><a href="#contact" className="button button-mint">Donnons de l’élan à votre activité <ArrowUpRight size={19}/></a><a href="#services" className="secondary-link">Explorer nos services <ArrowDown size={15}/></a></div><div className="hero-proof"><span className="proof-symbol"><ShieldCheck size={19}/></span><p>L’intelligence artificielle, <strong>l’humain aux commandes.</strong></p></div></div><FlowVisual/></div><div className="hero-bottom"><span>CONÇU POUR LES ENTREPRISES QUI AVANCENT.</span><a href="#a-propos">DÉCOUVRIR L’AGENCE <ArrowDown size={13}/></a></div></div></section>
      <div className="capabilities-strip"><div className="container capabilities-inner"><span>Des outils qui se parlent.<br/><strong>Une activité qui respire.</strong></span><div><Workflow size={20}/> Workflows connectés</div><i/><div><Bot size={21}/> Intelligence artificielle</div><i/><div><ShieldCheck size={21}/> Supervision humaine</div><span className="strip-star" aria-hidden="true">✳</span></div></div>
      <section className="about section-space" id="a-propos"><div className="container"><div className="section-heading"><p className="eyebrow"><span className="section-marker"/> 01 / À PROPOS DE L’ENTREPRISE</p><span className="section-aside">LA TECHNOLOGIE AVANCE.<br/>VOTRE ENTREPRISE AUSSI.</span></div><div className="about-grid"><h2>De l’intelligence.<br/>Du bon sens.<br/><span className="muted">Et de l’humain.</span></h2><div className="about-copy"><p className="large-text">Nous sommes AI Automation Agency.<br/>Nous rendons l’automatisation utile,<br className="desktop-break"/> accessible et concrète.</p><p>Nous accompagnons les petites entreprises de services qui veulent répondre plus vite à leurs prospects, mieux suivre leurs clients et alléger leur quotidien.</p><p>Notre approche associe des workflows intelligents et une assistance humaine encadrée. L’IA prépare et connecte. Les assistants vérifient et coordonnent. Vous gardez la main sur les décisions qui comptent.</p><a href="#services" className="text-link">Découvrez ce qu’on peut faire ensemble <ArrowUpRight size={18}/></a></div></div><div className="principles"><div><span>01</span><h3>Utile avant tout.</h3><p>Un besoin réel, une solution ciblée.<br/>La technologie sert votre activité.</p></div><div><span>02</span><h3>Connecté à votre réalité.</h3><p>Vos outils, vos équipes, vos méthodes.<br/>On construit autour de vous.</p></div><div><span>03</span><h3>Vous gardez le contrôle.</h3><p>Des règles claires, un suivi continu.<br/>L’humain reste dans la boucle.</p></div></div></div></section>
      <section className="services section-space" id="services"><div className="container"><div className="section-heading"><p className="eyebrow"><span className="section-marker"/> 02 / NOS SERVICES</p><span className="section-aside">MOINS DE FRICTION.<br/>À CHAQUE ÉTAPE.</span></div><div className="services-heading"><h2>Votre prochain cap.<br/><span className="muted">Nos solutions pour l’atteindre.</span></h2><p>Du premier contact aux opérations quotidiennes,<br className="desktop-break"/> on remet du mouvement là où ça coince.</p></div><div className="service-grid">{services.map((service, index) => <ServiceCard key={service.number} service={service} open={openService === index} onToggle={() => setOpenService(openService === index ? null : index)}/>)}</div><div className="support-grid"><div className="support-banner"><div className="support-symbol"><UsersRound size={24}/></div><div><h3>La bonne personne, au bon moment.</h3><p>Recherche et vérification de prospects, tenue du CRM, coordination des rendez-vous et premier niveau de support : nos assistants humains prennent le relais, dans un cadre défini ensemble.</p></div><a href="#contact" aria-label="Parler de l’assistance humaine"><ArrowUpRight size={24}/></a></div><div className="support-banner"><div className="support-symbol"><Layers3 size={24}/></div><div><h3>On ne vous laisse pas avec un bouton « on ».</h3><p>Supervision, maintenance, optimisation et assistance humaine selon vos besoins : on accompagne la suite.</p></div><a href="#contact" aria-label="Parler de l’accompagnement"><ArrowUpRight size={24}/></a></div></div></div></section>
      <section className="method section-space" id="methode"><div className="container"><div className="method-top"><div><p className="eyebrow"><span className="section-marker"/> NOTRE MÉTHODE</p><h2>Commencer petit.<br/>Faire une <span className="italic-accent">vraie différence.</span></h2></div><p>Pas de grand saut dans l’inconnu.<br/>Un premier problème résolu, puis la suite.<br/>Ensemble, à votre rythme.</p></div><div className="method-steps">{[{title:'On comprend.',text:'Nous échangeons sur vos objectifs, vos outils et les tâches qui freinent votre activité.',tag:'ÉCHANGE & DIAGNOSTIC'}, {title:'On fait la preuve.',text:'Un pilote ciblé, des critères définis ensemble et des tests avant toute mise en service.',tag:'PILOTE & VALIDATION'}, {title:'On fait grandir.',text:'Nous déployons, suivons les résultats et améliorons vos workflows au fil de vos besoins.',tag:'DÉPLOIEMENT & SUIVI'}].map((step,i) => <div className="method-step" key={step.title}><div className="step-line"><span>0{i+1}</span><ArrowRight size={19}/></div><h3>{step.title}</h3><p>{step.text}</p><span className="step-tag">{step.tag}</span></div>)}</div><div className="method-note"><ShieldCheck size={16}/> Des résultats observés, des décisions humaines et un périmètre convenu dès le départ.</div></div></section>
      <section className="contact section-space" id="contact"><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow"><span className="section-marker"/> 03 / CONTACT</p><h2>Et si on vous<br/>rendait du <span className="italic-accent">temps ?</span><span aria-hidden="true" className="contact-star">✳</span></h2><p>Une tâche qui se répète ? Un prospect qui attend ?<br/>Parlons de ce que votre entreprise pourrait faire<br className="desktop-break"/> avec un peu plus d’élan.</p><div className="contact-note"><span><MessageSquare size={20}/></span><p>Tout commence par une conversation.<br/><strong>Pas besoin d’avoir déjà toutes les réponses.</strong></p></div><MoveUpRight className="contact-decoration" aria-hidden="true" strokeWidth={.8}/></div><ContactForm/></div></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-top"><Brand footer/><p>La technologie au service de votre activité.<br/><span>Et l’humain au cœur de chaque décision.</span></p><a href="#accueil" className="back-top" aria-label="Retour en haut"><MoveUpRight size={23}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} AI Automation Agency</span><span>MOINS DE TÂCHES. PLUS D’ÉLAN.</span><a href="#confidentialite" onClick={() => { previousFocus.current = document.activeElement; setPrivacy(true); }}>Confidentialité <ArrowUpRight size={12}/></a></div></div></footer>
    {privacy && <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closePrivacy(); }}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title"><button ref={privacyCloseRef} onClick={closePrivacy} className="modal-close" aria-label="Fermer la fenêtre"><X size={22}/></button><p className="eyebrow">VOS INFORMATIONS</p><h2 id="privacy-title">En toute transparence.</h2><p>Le formulaire recueille votre nom, votre adresse e-mail, votre entreprise si vous la renseignez et votre besoin. Ces informations servent uniquement à traiter votre demande de contact, avec votre consentement.</p><p>Vos demandes sont conservées pour permettre leur traitement. Ce site n’utilise aucun outil de suivi publicitaire. Évitez de transmettre des données sensibles dans votre message.</p></section></div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
