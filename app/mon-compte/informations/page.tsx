'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, MapPin, Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const HAITI_CITIES: Record<string, string[]> = {
  'Artibonite': ['Gonaïves', 'Saint-Marc', 'Dessalines', 'Verrettes', 'Petite-Rivière-de-l\'Artibonite', 'Marchand Dessalines', 'Grande-Saline', 'Gros-Morne'],
  'Centre': ['Hinche', 'Mirebalais', 'Lascahobas', 'Belladère', 'Cerca-la-Source', 'Thomonde', 'Maïssade'],
  'Grand\'Anse': ['Jérémie', 'Beaumont', 'Corail', 'Dame-Marie', 'Moron', 'Pestel', 'Roseaux'],
  'Nippes': ['Miragoâne', 'Baradères', 'L\'Asile', 'Paillant', 'Plaisance-du-Sud', 'Petit-Trou-de-Nippes', 'Anse-à-Veau'],
  'Nord': ['Cap-Haïtien', 'Acul-du-Nord', 'Borgne', 'Dondon', 'Grande-Rivière-du-Nord', 'Limbé', 'Milot', 'Plaisance', 'Quartier-Morin', 'Saint-Raphaël', 'Bahon', 'Pignon'],
  'Nord-Est': ['Fort-Liberté', 'Caracol', 'Ferrier', 'Ouanaminthe', 'Trou-du-Nord', 'Vallières', 'Sainte-Suzanne'],
  'Nord-Ouest': ['Port-de-Paix', 'Bassin-Bleu', 'Bombardopolis', 'Jean-Rabel', 'Môle-Saint-Nicolas', 'Saint-Louis-du-Nord'],
  'Ouest': ['Port-au-Prince', 'Pétion-Ville', 'Delmas', 'Tabarre', 'Carrefour', 'Cité Soleil', 'Croix-des-Bouquets', 'Gressier', 'Ganthier', 'Kenscoff', 'Thomazeau', 'Arcahaie', 'Cabaret', 'Léogâne'],
  'Sud': ['Les Cayes', 'Aquin', 'Camp-Perrin', 'Cavaillon', 'Chantal', 'Port-Salut', 'Saint-Louis-du-Sud', 'Torbeck'],
  'Sud-Est': ['Jacmel', 'Bainet', 'Belle-Anse', 'Cayes-Jacmel', 'Grand-Gosier', 'Marigot', 'Thiotte'],
};

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
];

const US_CITIES: Record<string, string[]> = {
  AL: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa'],
  AK: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
  AZ: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Tempe'],
  AR: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
  CA: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim'],
  CO: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder'],
  CT: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury'],
  DE: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
  FL: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Port St. Lucie', 'Fort Lauderdale', 'Tallahassee', 'Miramar', 'Pembroke Pines', 'Hollywood', 'Gainesville'],
  GA: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs'],
  HI: ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu'],
  ID: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'],
  IL: ['Chicago', 'Aurora', 'Joliet', 'Naperville', 'Rockford', 'Springfield', 'Elgin'],
  IN: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel'],
  IA: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
  KS: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe', 'Topeka'],
  KY: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
  LA: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Metairie', 'Lafayette'],
  ME: ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn'],
  MD: ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf', 'Rockville'],
  MA: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Quincy'],
  MI: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'],
  MN: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington'],
  MS: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
  MO: ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence'],
  MT: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
  NE: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
  NV: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
  NH: ['Manchester', 'Nashua', 'Concord', 'Derry', 'Dover'],
  NJ: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Trenton'],
  NM: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
  NY: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Mount Vernon', 'Brooklyn', 'Queens', 'Bronx'],
  NC: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville'],
  ND: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
  OH: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
  OK: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton'],
  OR: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Hillsboro'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'],
  RI: ['Providence', 'Cranston', 'Warwick', 'Pawtucket', 'East Providence'],
  SC: ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Greenville'],
  SD: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
  TN: ['Memphis', 'Nashville', 'Knoxville', 'Chattanooga', 'Clarksville'],
  TX: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Irving'],
  UT: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
  VT: ['Burlington', 'South Burlington', 'Rutland', 'Barre', 'Montpelier'],
  VA: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria'],
  WA: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kirkland'],
  WV: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
  WI: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine'],
  WY: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'],
};

type AddrCountry = 'ht' | 'us';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-pink-50">
        <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">{icon}</div>
        <h2 className="font-playfair font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function InformationsPage() {
  const { user, updateUser, addAddress, removeAddress } = useAuthStore();

  /* — Identité — */
  const [editIdent, setEditIdent] = useState(false);
  const [identForm, setIdentForm] = useState({ name: user?.name ?? '', pseudo: user?.pseudo ?? '' });
  const saveIdent = () => { updateUser({ name: identForm.name, pseudo: identForm.pseudo }); setEditIdent(false); };

  /* — Email — */
  const [editEmail, setEditEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: user?.email ?? '', confirm: '' });
  const [emailError, setEmailError] = useState('');
  const saveEmail = () => {
    if (!emailForm.email) { setEmailError("L'email ne peut pas être vide."); return; }
    if (emailForm.email !== emailForm.confirm) { setEmailError('Les emails ne correspondent pas.'); return; }
    updateUser({ email: emailForm.email });
    setEmailError('');
    setEditEmail(false);
  };

  /* — Mot de passe — */
  const [editPwd, setEditPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const savePwd = () => {
    if (!pwdForm.current) { setPwdError('Saisis ton mot de passe actuel.'); return; }
    if (pwdForm.next.length < 6) { setPwdError('Le nouveau mot de passe doit faire au moins 6 caractères.'); return; }
    if (pwdForm.next !== pwdForm.confirm) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdError('');
    setPwdSuccess(true);
    setTimeout(() => { setPwdSuccess(false); setEditPwd(false); setPwdForm({ current: '', next: '', confirm: '' }); }, 1800);
  };

  /* — Adresses — */
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrCountry, setAddrCountry] = useState<AddrCountry>('ht');
  const [addrForm, setAddrForm] = useState({
    label: '',
    adresse: '',
    // Haiti
    departement: '',
    ville: '',
    quartier: '',
    // USA
    usCity: '',
    state: '',
    zipCode: '',
  });
  const [addrError, setAddrError] = useState('');

  const resetAddrForm = () => {
    setAddrForm({ label: '', adresse: '', departement: '', ville: '', quartier: '', usCity: '', state: '', zipCode: '' });
    setAddrCountry('ht');
    setAddrError('');
  };

  const saveAddress = () => {
    if (!addrForm.label || !addrForm.adresse) { setAddrError('Remplis les champs obligatoires (*).'); return; }
    if (addrCountry === 'ht' && (!addrForm.departement || !addrForm.ville)) {
      setAddrError('Sélectionne un département et une ville.');
      return;
    }
    if (addrCountry === 'us' && (!addrForm.usCity || !addrForm.state || !addrForm.zipCode)) {
      setAddrError('Remplis tous les champs USA (ville, état, ZIP code).');
      return;
    }
    addAddress({
      id: Date.now().toString(),
      label: addrForm.label,
      country: addrCountry,
      adresse: addrForm.adresse,
      departement: addrCountry === 'ht' ? addrForm.departement : undefined,
      ville: addrCountry === 'ht' ? addrForm.ville : addrForm.usCity,
      quartier: addrCountry === 'ht' ? addrForm.quartier : undefined,
      state: addrCountry === 'us' ? addrForm.state : undefined,
      zipCode: addrCountry === 'us' ? addrForm.zipCode : undefined,
    });
    resetAddrForm();
    setShowAddAddr(false);
  };

  const inputCls = 'w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-sm outline-none focus:border-primary bg-gray-50 transition-colors';
  const labelCls = 'font-lato text-xs text-gray-500 mb-1 block';
  const btnSave = 'flex items-center gap-1.5 bg-primary hover:bg-pink-400 text-white font-lato text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors';
  const btnCancel = 'font-lato text-sm text-gray-400 hover:text-gray-600 transition-colors px-4 py-2.5';

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/mon-compte" className="inline-flex items-center gap-2 font-lato text-sm text-gray-500 hover:text-primary transition-colors mb-8">
          <ArrowLeft size={15} />Retour à mon compte
        </Link>

        <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-8">Mes informations</h1>

        <div className="space-y-4">

          {/* — Identité — */}
          <Section icon={<User size={17} className="text-primary" />} title="Identité">
            {!editIdent ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-lato text-sm text-gray-700"><span className="text-gray-400 mr-2">Nom :</span>{user?.name || '—'}</p>
                  <p className="font-lato text-sm text-gray-700 mt-1"><span className="text-gray-400 mr-2">Pseudo :</span>{user?.pseudo || <span className="text-gray-300 italic">Non défini</span>}</p>
                </div>
                <button onClick={() => { setIdentForm({ name: user?.name ?? '', pseudo: user?.pseudo ?? '' }); setEditIdent(true); }} className="font-lato text-sm text-primary hover:underline">Modifier</button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div>
                  <label className={labelCls}>Nom complet</label>
                  <input className={inputCls} value={identForm.name} onChange={e => setIdentForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Pseudo</label>
                  <input className={inputCls} placeholder="Ex. : BestieQueen" value={identForm.pseudo} onChange={e => setIdentForm(p => ({ ...p, pseudo: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={saveIdent} className={btnSave}><Check size={14} />Sauvegarder</button>
                  <button onClick={() => setEditIdent(false)} className={btnCancel}>Annuler</button>
                </div>
              </motion.div>
            )}
          </Section>

          {/* — Email — */}
          <Section icon={<Mail size={17} className="text-primary" />} title="Adresse e-mail">
            {!editEmail ? (
              <div className="flex items-center justify-between">
                <p className="font-lato text-sm text-gray-700">{user?.email || '—'}</p>
                <button onClick={() => { setEmailForm({ email: user?.email ?? '', confirm: '' }); setEmailError(''); setEditEmail(true); }} className="font-lato text-sm text-primary hover:underline">Modifier</button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div>
                  <label className={labelCls}>Nouvel e-mail</label>
                  <input type="email" className={inputCls} value={emailForm.email} onChange={e => setEmailForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Confirmer l&apos;e-mail</label>
                  <input type="email" className={inputCls} value={emailForm.confirm} onChange={e => setEmailForm(p => ({ ...p, confirm: e.target.value }))} />
                </div>
                {emailError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{emailError}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={saveEmail} className={btnSave}><Check size={14} />Sauvegarder</button>
                  <button onClick={() => setEditEmail(false)} className={btnCancel}>Annuler</button>
                </div>
              </motion.div>
            )}
          </Section>

          {/* — Mot de passe — */}
          <Section icon={<Lock size={17} className="text-primary" />} title="Mot de passe">
            {!editPwd ? (
              <div className="flex items-center justify-between">
                <p className="font-lato text-sm text-gray-400 tracking-widest">••••••••</p>
                <button onClick={() => { setPwdError(''); setPwdSuccess(false); setEditPwd(true); }} className="font-lato text-sm text-primary hover:underline">Modifier</button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {(['current', 'next', 'confirm'] as const).map((field, i) => (
                  <div key={field}>
                    <label className={labelCls}>
                      {field === 'current' ? 'Mot de passe actuel' : field === 'next' ? 'Nouveau mot de passe' : 'Confirmer le nouveau'}
                    </label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} className={inputCls + ' pr-11'}
                        value={pwdForm[field]} onChange={e => setPwdForm(p => ({ ...p, [field]: e.target.value }))} placeholder="••••••••" />
                      {i === 0 && (
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {pwdError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{pwdError}</p>}
                {pwdSuccess && <p className="font-lato text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">✓ Mot de passe mis à jour !</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={savePwd} className={btnSave}><Check size={14} />Sauvegarder</button>
                  <button onClick={() => setEditPwd(false)} className={btnCancel}>Annuler</button>
                </div>
              </motion.div>
            )}
          </Section>

          {/* — Adresses de livraison — */}
          <Section icon={<MapPin size={17} className="text-primary" />} title="Adresses de livraison">

            {/* Saved addresses list */}
            <div className="space-y-3 mb-4">
              {(user?.addresses ?? []).length === 0 && !showAddAddr && (
                <p className="font-lato text-sm text-gray-400 italic">Aucune adresse enregistrée.</p>
              )}
              {(user?.addresses ?? []).map((addr) => (
                <div key={addr.id} className="flex items-start justify-between gap-3 p-4 bg-pink-50/60 rounded-xl border border-pink-100">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{(addr.country ?? 'ht') === 'us' ? '🇺🇸' : '🇭🇹'}</span>
                    <div>
                      <p className="font-lato text-sm font-semibold text-gray-800">{addr.label}</p>
                      <p className="font-lato text-xs text-gray-500 mt-0.5">{addr.adresse}</p>
                      {(addr.country ?? 'ht') === 'ht' ? (
                        <p className="font-lato text-xs text-gray-500">
                          {addr.departement ? `${addr.departement} · ` : ''}{addr.quartier ? `${addr.quartier}, ` : ''}{addr.ville}, Haïti
                        </p>
                      ) : (
                        <p className="font-lato text-xs text-gray-500">{addr.ville}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode ?? ''}, USA</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeAddress(addr.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5" aria-label="Supprimer l'adresse">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add address form */}
            <AnimatePresence>
              {showAddAddr && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-4 mb-4 p-5 bg-gray-50 rounded-2xl border border-pink-100">

                  {/* Label */}
                  <div>
                    <label className={labelCls}>Libellé <span className="text-primary">*</span></label>
                    <input className={inputCls} placeholder="Ex. : Maison, Travail, Famille…" value={addrForm.label}
                      onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} />
                  </div>

                  {/* Country selector */}
                  <div>
                    <label className={labelCls}>Pays <span className="text-primary">*</span></label>
                    <div className="flex gap-3">
                      {([['ht', '🇭🇹', 'Haïti'], ['us', '🇺🇸', 'États-Unis']] as const).map(([code, flag, name]) => (
                        <button key={code} type="button" onClick={() => setAddrCountry(code)}
                          className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl border-2 font-lato text-sm font-semibold transition-all ${
                            addrCountry === code ? 'border-primary bg-pink-50 text-primary' : 'border-pink-100 text-gray-500 hover:border-pink-200 bg-white'
                          }`}>
                          <span className="text-base">{flag}</span><span>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Street address */}
                  <div>
                    <label className={labelCls}>Adresse (rue, numéro) <span className="text-primary">*</span></label>
                    <input className={inputCls}
                      placeholder={addrCountry === 'us' ? '123 Main Street, Apt 4B' : 'Rue Martin Luther King, #12'}
                      value={addrForm.adresse} onChange={e => setAddrForm(p => ({ ...p, adresse: e.target.value }))} />
                  </div>

                  {/* Conditional fields */}
                  <AnimatePresence mode="wait">
                    {addrCountry === 'ht' && (
                      <motion.div key="ht" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Département <span className="text-primary">*</span></label>
                            <select className={inputCls + ' appearance-none cursor-pointer'} value={addrForm.departement}
                              onChange={e => setAddrForm(p => ({ ...p, departement: e.target.value, ville: '' }))}>
                              <option value="">Choisir…</option>
                              {Object.keys(HAITI_CITIES).map(dep => <option key={dep} value={dep}>{dep}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Ville <span className="text-primary">*</span></label>
                            <select
                              className={inputCls + ' appearance-none cursor-pointer'}
                              value={addrForm.ville}
                              onChange={e => setAddrForm(p => ({ ...p, ville: e.target.value }))}
                              disabled={!addrForm.departement}
                            >
                              <option value="">{addrForm.departement ? 'Choisir…' : '— Sélectionne un départ. —'}</option>
                              {(HAITI_CITIES[addrForm.departement] ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Quartier</label>
                          <input className={inputCls} placeholder="Delmas 33, Lalue…" value={addrForm.quartier}
                            onChange={e => setAddrForm(p => ({ ...p, quartier: e.target.value }))} />
                        </div>
                      </motion.div>
                    )}

                    {addrCountry === 'us' && (
                      <motion.div key="us" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>État <span className="text-primary">*</span></label>
                            <select className={inputCls + ' appearance-none cursor-pointer'} value={addrForm.state}
                              onChange={e => setAddrForm(p => ({ ...p, state: e.target.value, usCity: '' }))}>
                              <option value="">Choisir…</option>
                              {US_STATES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Ville <span className="text-primary">*</span></label>
                            <select
                              className={inputCls + ' appearance-none cursor-pointer'}
                              value={addrForm.usCity}
                              onChange={e => setAddrForm(p => ({ ...p, usCity: e.target.value }))}
                              disabled={!addrForm.state}
                            >
                              <option value="">{addrForm.state ? 'Choisir…' : '— Sélectionne un état —'}</option>
                              {(US_CITIES[addrForm.state] ?? []).map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>ZIP Code <span className="text-primary">*</span></label>
                            <input className={inputCls} placeholder="33101" maxLength={10} value={addrForm.zipCode}
                              onChange={e => setAddrForm(p => ({ ...p, zipCode: e.target.value.replace(/[^0-9-]/g, '') }))} />
                          </div>
                          <div className="flex items-end pb-1">
                            <p className="font-lato text-xs text-gray-400">Format : 12345 ou 12345-6789</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {addrError && <p className="font-lato text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{addrError}</p>}

                  <div className="flex items-center gap-3">
                    <button onClick={saveAddress} className={btnSave}><Check size={14} />Enregistrer</button>
                    <button onClick={() => { setShowAddAddr(false); resetAddrForm(); }} className={btnCancel}>Annuler</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showAddAddr && (
              <button onClick={() => setShowAddAddr(true)} className="inline-flex items-center gap-2 font-lato text-sm text-primary hover:underline">
                <Plus size={15} />Ajouter une adresse
              </button>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}
