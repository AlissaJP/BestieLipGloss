'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

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

const PAYS = [
  { id: 'HT', code: '+509', drapeau: '🇭🇹', nom: 'Haiti' },
  { id: 'US', code: '+1',   drapeau: '🇺🇸', nom: 'United States' },
  { id: 'CA', code: '+1',   drapeau: '🇨🇦', nom: 'Canada' },
  { id: 'FR', code: '+33',  drapeau: '🇫🇷', nom: 'France' },
  { id: 'MQ', code: '+596', drapeau: '🇲🇶', nom: 'Martinique' },
  { id: 'GP', code: '+590', drapeau: '🇬🇵', nom: 'Guadeloupe' },
  { id: 'DO', code: '+1',   drapeau: '🇩🇴', nom: 'Dominican Republic' },
  { id: 'BR', code: '+55',  drapeau: '🇧🇷', nom: 'Brazil' },
  { id: 'GB', code: '+44',  drapeau: '🇬🇧', nom: 'United Kingdom' },
];

export default function InscriptionPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang].pages.register;
  const tAddr = translations[lang].pages.info.address;

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    pseudo: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [selectedPaysId, setSelectedPaysId] = useState('HT');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Address
  const [addrCountry, setAddrCountry] = useState<'hti' | 'usa'>('hti');
  const [addrForm, setAddrForm] = useState({
    label: '',
    adresse: '',
    departement: '',
    ville: '',
    quartier: '',
    usCity: '',
    state: '',
    zipCode: '',
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom || !form.pseudo || !form.email || !phoneNumber.trim() || !form.password || !form.confirm) {
      setError(t.fillAll);
      return;
    }
    const pseudoClean = form.pseudo.trim().replace(/\s+/g, '');
    if (pseudoClean.length < 3) {
      setError(t.invalidUsername);
      return;
    }
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError(t.invalidEmail);
      return;
    }
    if (form.password.length < 6) {
      setError(t.pwdTooShort);
      return;
    }
    if (form.password !== form.confirm) {
      setError(t.pwdMismatch);
      return;
    }
    setIsLoading(true);
    setError('');
    const pays = PAYS.find((p) => p.id === selectedPaysId)!;
    const fullPhone = `${pays.code} ${phoneNumber.trim()}`;
    const name = form.prenom + (form.nom ? ' ' + form.nom : '');

    // Stocke prenom, nom et adresse dans sessionStorage pour les récupérer après vérification OTP
    sessionStorage.setItem(`pending_prenom_${form.email}`, form.prenom);
    sessionStorage.setItem(`pending_nom_${form.email}`, form.nom);
    if (addrForm.label && addrForm.adresse) {
      const addr = {
        id: Date.now().toString(),
        label: addrForm.label,
        country: addrCountry,
        adresse: addrForm.adresse,
        departement: addrCountry === 'hti' ? addrForm.departement : undefined,
        ville: addrCountry === 'hti' ? addrForm.ville : addrForm.usCity,
        quartier: addrCountry === 'hti' ? addrForm.quartier : undefined,
        state: addrCountry === 'usa' ? addrForm.state : undefined,
        zipCode: addrCountry === 'usa' ? addrForm.zipCode : undefined,
      };
      sessionStorage.setItem(`pending_addr_${form.email}`, JSON.stringify(addr));
    }

    try {
      const res = await fetch('/api/otp/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name, telephone: fullPhone, pseudo: pseudoClean }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string; token?: string };
      if (!res.ok) {
        setError(data.error ?? t.fillAll);
        setIsLoading(false);
        return;
      }
      // Stocke le token signé dans sessionStorage (stateless OTP — fonctionne sur Vercel)
      if (data.token) {
        sessionStorage.setItem(`otp_token_${form.email}`, data.token);
      }
      router.push(`/verification-email?email=${encodeURIComponent(form.email)}`);
    } catch {
      setError(t.fillAll);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E9E1] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-greatvibes text-5xl text-primary inline-block mb-3">
            Bestie LipGloss
          </Link>
          <h1 className="font-playfair font-bold text-3xl text-gray-800 mb-1">
            {t.heading}
          </h1>
          <p className="font-lato text-base text-gray-500">
            {t.sub}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                    {t.firstName} <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.prenom}
                      onChange={update('prenom')}
                      placeholder="Marie"
                      className="w-full pl-9 pr-3 py-3.5 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                    {t.lastName}
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={update('nom')}
                    placeholder="Duval"
                    className="w-full px-4 py-3.5 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                  {t.username} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-lato text-base pointer-events-none select-none">@</span>
                  <input
                    type="text"
                    value={form.pseudo}
                    onChange={(e) => setForm((prev) => ({ ...prev, pseudo: e.target.value.replace(/\s/g, '') }))}
                    placeholder={t.usernamePlaceholder}
                    className="w-full pl-8 pr-4 py-3.5 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="username"
                    maxLength={30}
                  />
                </div>
                <p className="font-lato text-xs text-gray-400 mt-1">{t.usernameNote}</p>
              </div>

              <div>
                <label className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                  {t.email} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3.5 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone-number" className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                  {t.whatsapp} <span className="text-primary">*</span>
                </label>
                <div className="flex border border-pink-200 rounded-xl overflow-hidden bg-gray-50 focus-within:border-primary transition-colors">
                  <select
                    value={selectedPaysId}
                    onChange={(e) => setSelectedPaysId(e.target.value)}
                    className="bg-transparent font-lato text-base text-gray-700 pl-3 pr-2 py-3.5 outline-none border-r border-pink-200 cursor-pointer shrink-0"
                    aria-label={t.countryCode}
                  >
                    {PAYS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} {p.code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="XXXX XXXX"
                    className="flex-1 px-3 py-3.5 font-lato text-base outline-none bg-transparent min-w-0"
                    autoComplete="tel-national"
                  />
                </div>
              </div>

              {/* Address (optional) */}
              <div className="border border-pink-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-primary" />
                  <span className="font-lato text-base font-medium text-gray-700">{tAddr.title} <span className="font-normal text-gray-400 text-sm">({lang === 'fr' ? 'optionnel' : lang === 'es' ? 'opcional' : 'optional'})</span></span>
                </div>

                <div>
                  <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.labelField}</label>
                  <input
                    type="text"
                    value={addrForm.label}
                    onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))}
                    placeholder={tAddr.labelPlaceholder}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                  />
                </div>

                <div>
                  <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.country}</label>
                  <div className="flex gap-3">
                    {([['hti', '🇭🇹', 'Haiti'], ['usa', '🇺🇸', 'United States']] as ['hti' | 'usa', string, string][]).map(([code, flag, name]) => (
                      <button key={code} type="button" onClick={() => setAddrCountry(code)}
                        className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-xl border-2 font-lato text-sm font-semibold transition-all ${
                          addrCountry === code ? 'border-primary bg-pink-50 text-primary' : 'border-pink-100 text-gray-500 hover:border-pink-200 bg-white'
                        }`}>
                        <span>{flag}</span><span>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.streetField}</label>
                  <input
                    type="text"
                    value={addrForm.adresse}
                    onChange={e => setAddrForm(p => ({ ...p, adresse: e.target.value }))}
                    placeholder={addrCountry === 'usa' ? '123 Main Street, Apt 4B' : 'Rue Martin Luther King, #12'}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {addrCountry === 'hti' && (
                    <motion.div key="ht" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.department}</label>
                          <select className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors appearance-none cursor-pointer"
                            value={addrForm.departement}
                            onChange={e => setAddrForm(p => ({ ...p, departement: e.target.value, ville: '' }))}>
                            <option value="">{tAddr.selectPlaceholder}</option>
                            {Object.keys(HAITI_CITIES).map(dep => <option key={dep} value={dep}>{dep}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.city}</label>
                          <select className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors appearance-none cursor-pointer"
                            value={addrForm.ville}
                            onChange={e => setAddrForm(p => ({ ...p, ville: e.target.value }))}
                            disabled={!addrForm.departement}>
                            <option value="">{addrForm.departement ? tAddr.selectPlaceholder : tAddr.selectDeptFirst}</option>
                            {(HAITI_CITIES[addrForm.departement] ?? []).map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.neighborhood}</label>
                        <input className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                          placeholder={tAddr.neighborhoodPlaceholder}
                          value={addrForm.quartier}
                          onChange={e => setAddrForm(p => ({ ...p, quartier: e.target.value }))} />
                      </div>
                    </motion.div>
                  )}
                  {addrCountry === 'usa' && (
                    <motion.div key="us" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.state}</label>
                          <select className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors appearance-none cursor-pointer"
                            value={addrForm.state}
                            onChange={e => setAddrForm(p => ({ ...p, state: e.target.value, usCity: '' }))}>
                            <option value="">{tAddr.selectPlaceholder}</option>
                            {US_STATES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.city}</label>
                          <select className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors appearance-none cursor-pointer"
                            value={addrForm.usCity}
                            onChange={e => setAddrForm(p => ({ ...p, usCity: e.target.value }))}
                            disabled={!addrForm.state}>
                            <option value="">{addrForm.state ? tAddr.selectPlaceholder : tAddr.selectStateFirst}</option>
                            {(US_CITIES[addrForm.state] ?? []).map(city => <option key={city} value={city}>{city}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="font-lato text-sm text-gray-500 mb-1 block">{tAddr.zip}</label>
                        <input className="w-full px-4 py-3 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                          placeholder={tAddr.zipPlaceholder} maxLength={10}
                          value={addrForm.zipCode}
                          onChange={e => setAddrForm(p => ({ ...p, zipCode: e.target.value.replace(/[^0-9-]/g, '') }))} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                  {t.pwd} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder={t.pwdPlaceholder}
                    className="w-full pl-11 pr-11 py-3.5 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-lato text-base font-medium text-gray-700 block mb-1.5">
                  {t.confirm} <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={update('confirm')}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 border border-pink-200 rounded-xl font-lato text-base outline-none focus:border-primary bg-gray-50 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-lato text-base text-red-500 bg-red-50 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary hover:bg-pink-400 disabled:opacity-70 text-white font-lato font-semibold py-4 rounded-xl transition-colors text-base min-h-[52px] flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t.sending}
                  </>
                ) : (
                  t.createBtn
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center font-lato text-base text-gray-500 mt-6">
            {t.haveAccount}{' '}
            <Link href="/connexion" className="text-primary font-semibold hover:underline">
              {t.signIn}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
