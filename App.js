import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, Animated, Dimensions, Modal, StatusBar,
  SafeAreaView, Alert, FlatList
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── DATA ─────────────────────────────────────────────────────────────────────
const AD_BANNERS = [
  { brand: 'Amazon India',  text: '🛍️ Great Indian Sale — 80% Off!',     color: '#FF9900' },
  { brand: 'PhonePe',       text: '💳 Send Money Free — Zero Charges!',   color: '#5F259F' },
  { brand: 'Zomato Gold',   text: '🍕 Free Delivery All Week!',           color: '#E23744' },
  { brand: 'Dream11',       text: '🏏 Win ₹1 Crore — Join Now!',         color: '#1A4D2E' },
  { brand: 'Myntra',        text: '👗 Fashion Week — Flat 70% Off!',      color: '#FF3F6C' },
];

const LEVELS = [
  { name: 'Starter',  min: 0,       max: 10000,   color: '#8E8E93', emoji: '🌱' },
  { name: 'Bronze',   min: 10000,   max: 50000,   color: '#CD7F32', emoji: '🥉' },
  { name: 'Silver',   min: 50000,   max: 200000,  color: '#C0C0C0', emoji: '🥈' },
  { name: 'Gold',     min: 200000,  max: 500000,  color: '#FFD60A', emoji: '🥇' },
  { name: 'Platinum', min: 500000,  max: 1500000, color: '#00C7BE', emoji: '💎' },
  { name: 'Legend',   min: 1500000, max: Infinity, color: '#FF375F', emoji: '👑' },
];

// 1 Lakh (100,000) coins = ₹100
const COIN_TO_INR = 100 / 100000; // ₹0.001 per coin

const WITHDRAW_RULES = [
  { coins: 100000,  inr: 100  },
  { coins: 250000,  inr: 250  },
  { coins: 500000,  inr: 500  },
  { coins: 1000000, inr: 1000 },
  { coins: 2500000, inr: 2500 },
  { coins: 5000000, inr: 5000 },
];

// Motivational withdraw messages shown at bottom
const MOTIVATIONAL_MSGS = [
  { user: 'Rahul S.',      amount: 100,  time: '1 min ago',    coins: '1,00,000' },
  { user: 'Priya M.',      amount: 250,  time: '2 min ago',    coins: '2,50,000' },
  { user: 'Amit K.',       amount: 500,  time: '3 min ago',    coins: '5,00,000' },
  { user: 'Sneha R.',      amount: 100,  time: '4 min ago',    coins: '1,00,000' },
  { user: 'Vikas T.',      amount: 1000, time: '5 min ago',    coins: '10,00,000' },
  { user: 'Pooja D.',      amount: 250,  time: '6 min ago',    coins: '2,50,000' },
  { user: 'Rohan B.',      amount: 100,  time: '7 min ago',    coins: '1,00,000' },
  { user: 'Anjali S.',     amount: 500,  time: '9 min ago',    coins: '5,00,000' },
  { user: 'Deepak N.',     amount: 100,  time: '11 min ago',   coins: '1,00,000' },
  { user: 'Kavya P.',      amount: 2500, time: '12 min ago',   coins: '25,00,000' },
  { user: 'Suresh M.',     amount: 100,  time: '14 min ago',   coins: '1,00,000' },
  { user: 'Neha G.',       amount: 500,  time: '15 min ago',   coins: '5,00,000' },
  { user: 'Karan J.',      amount: 250,  time: '17 min ago',   coins: '2,50,000' },
  { user: 'Divya R.',      amount: 100,  time: '19 min ago',   coins: '1,00,000' },
  { user: 'Mohit S.',      amount: 1000, time: '21 min ago',   coins: '10,00,000' },
  { user: 'Riya K.',       amount: 100,  time: '23 min ago',   coins: '1,00,000' },
  { user: 'Arjun P.',      amount: 500,  time: '25 min ago',   coins: '5,00,000' },
  { user: 'Simran T.',     amount: 250,  time: '27 min ago',   coins: '2,50,000' },
  { user: 'Raj V.',        amount: 100,  time: '29 min ago',   coins: '1,00,000' },
  { user: 'Meera D.',      amount: 2500, time: '31 min ago',   coins: '25,00,000' },
  { user: 'Aakash N.',     amount: 100,  time: '33 min ago',   coins: '1,00,000' },
  { user: 'Sunita B.',     amount: 500,  time: '35 min ago',   coins: '5,00,000' },
  { user: 'Harsh M.',      amount: 250,  time: '37 min ago',   coins: '2,50,000' },
  { user: 'Tanya S.',      amount: 100,  time: '39 min ago',   coins: '1,00,000' },
  { user: 'Vikram R.',     amount: 1000, time: '41 min ago',   coins: '10,00,000' },
  { user: 'Nisha K.',      amount: 100,  time: '43 min ago',   coins: '1,00,000' },
  { user: 'Gaurav L.',     amount: 500,  time: '45 min ago',   coins: '5,00,000' },
  { user: 'Pallavi J.',    amount: 250,  time: '48 min ago',   coins: '2,50,000' },
  { user: 'Sandeep T.',    amount: 100,  time: '51 min ago',   coins: '1,00,000' },
  { user: 'Ananya V.',     amount: 5000, time: '53 min ago',   coins: '50,00,000' },
  { user: 'Manoj P.',      amount: 100,  time: '55 min ago',   coins: '1,00,000' },
  { user: 'Ritika S.',     amount: 500,  time: '57 min ago',   coins: '5,00,000' },
  { user: 'Nikhil G.',     amount: 250,  time: '59 min ago',   coins: '2,50,000' },
  { user: 'Swati M.',      amount: 100,  time: '1 hr ago',     coins: '1,00,000' },
  { user: 'Pankaj R.',     amount: 1000, time: '1 hr 5m ago',  coins: '10,00,000' },
  { user: 'Komal D.',      amount: 100,  time: '1 hr 10m ago', coins: '1,00,000' },
  { user: 'Saurabh K.',    amount: 500,  time: '1 hr 15m ago', coins: '5,00,000' },
  { user: 'Lavanya N.',    amount: 250,  time: '1 hr 20m ago', coins: '2,50,000' },
  { user: 'Tarun B.',      amount: 100,  time: '1 hr 25m ago', coins: '1,00,000' },
  { user: 'Ishaan C.',     amount: 2500, time: '1 hr 30m ago', coins: '25,00,000' },
  { user: 'Bhavna S.',     amount: 100,  time: '1 hr 35m ago', coins: '1,00,000' },
  { user: 'Yash M.',       amount: 500,  time: '1 hr 40m ago', coins: '5,00,000' },
  { user: 'Preeti A.',     amount: 250,  time: '1 hr 45m ago', coins: '2,50,000' },
  { user: 'Dev R.',        amount: 100,  time: '1 hr 50m ago', coins: '1,00,000' },
  { user: 'Kritika V.',    amount: 1000, time: '2 hrs ago',    coins: '10,00,000' },
  { user: 'Akash T.',      amount: 100,  time: '2 hrs ago',    coins: '1,00,000' },
  { user: 'Shruti P.',     amount: 500,  time: '2 hrs ago',    coins: '5,00,000' },
  { user: 'Manish K.',     amount: 250,  time: '2 hrs ago',    coins: '2,50,000' },
  { user: 'Diksha L.',     amount: 100,  time: '2 hrs ago',    coins: '1,00,000' },
  { user: 'Rohit S.',      amount: 5000, time: '2 hrs ago',    coins: '50,00,000' },
  { user: 'Shweta N.',     amount: 100,  time: '3 hrs ago',    coins: '1,00,000' },
];

const fmt = (n) =>
  n >= 10000000 ? (n/10000000).toFixed(1)+'Cr' :
  n >= 100000  ? (n/100000).toFixed(1)+'L' :
  n >= 1000    ? (n/1000).toFixed(1)+'K' : String(n);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // AUTH
  const [screen, setScreen]         = useState('login');
  const [users, setUsers]           = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab]       = useState('login');
  const [authForm, setAuthForm]     = useState({ name:'', phone:'', email:'', password:'', confirm:'' });
  const [authErr, setAuthErr]       = useState('');

  // MENU & PAGES
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activePage, setActivePage] = useState('home');
  const menuAnim = useRef(new Animated.Value(SW)).current;

  // GAME
  const [coins, setCoins]           = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [tapPower, setTapPower]     = useState(1);
  const [energy, setEnergy]         = useState(100);
  const maxEnergy                   = 100;
  const [tapCount, setTapCount]     = useState(0);
  const tapScale  = useRef(new Animated.Value(1)).current;

  // ADS
  const [adIdx, setAdIdx]           = useState(0);
  const adOpacity = useRef(new Animated.Value(1)).current;
  const [showAdModal, setShowAdModal] = useState(false);
  const [adReward, setAdReward]     = useState(0);
  const [adTimer, setAdTimer]       = useState(5);
  const [adCooldown, setAdCooldown] = useState(0);

  // BOOST
  const [boostActive, setBoostActive] = useState(false);
  const [boostTime, setBoostTime]   = useState(0);

  // WITHDRAW
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [withdrawUPI, setWithdrawUPI] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi'); // upi | bank

  // MOTIVATIONAL TICKER
  const [msgIdx, setMsgIdx]         = useState(0);
  const tickerAnim = useRef(new Animated.Value(0)).current;
  const tickerOpacity = useRef(new Animated.Value(1)).current;

  // ── Effects ──────────────────────────────────────────────────────────────────
  // Ad rotation
  useEffect(() => {
    const iv = setInterval(() => {
      Animated.timing(adOpacity, { toValue:0, duration:350, useNativeDriver:true }).start(() => {
        setAdIdx(i => (i+1) % AD_BANNERS.length);
        Animated.timing(adOpacity, { toValue:1, duration:350, useNativeDriver:true }).start();
      });
    }, 4500);
    return () => clearInterval(iv);
  }, []);

  // Energy regen
  useEffect(() => {
    const iv = setInterval(() => setEnergy(e => Math.min(e+2, maxEnergy)), 3000);
    return () => clearInterval(iv);
  }, []);

  // Ad cooldown
  useEffect(() => {
    if (!adCooldown) return;
    const iv = setInterval(() => setAdCooldown(c => Math.max(0,c-1)), 1000);
    return () => clearInterval(iv);
  }, [adCooldown]);

  // Boost timer
  useEffect(() => {
    if (!boostActive) return;
    const iv = setInterval(() => {
      setBoostTime(t => { if(t<=1){ setBoostActive(false); return 0; } return t-1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [boostActive]);

  // Motivational ticker
  useEffect(() => {
    const iv = setInterval(() => {
      Animated.sequence([
        Animated.timing(tickerOpacity, { toValue:0, duration:400, useNativeDriver:true }),
      ]).start(() => {
        setMsgIdx(i => (i+1) % MOTIVATIONAL_MSGS.length);
        Animated.timing(tickerOpacity, { toValue:1, duration:400, useNativeDriver:true }).start();
      });
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  // Menu animation
  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue:0, useNativeDriver:true, tension:65, friction:11 }).start();
  };
  const closeMenu = () => {
    Animated.timing(menuAnim, { toValue:SW, duration:280, useNativeDriver:true }).start(() => setMenuOpen(false));
  };
  const navTo = (page) => { setActivePage(page); closeMenu(); };

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    const key = authForm.phone || authForm.email;
    const u = users[key];
    if (!u) { setAuthErr('❌ Account not found. Please register.'); return; }
    if (u.password !== authForm.password) { setAuthErr('❌ Wrong password.'); return; }
    setCurrentUser({ ...u, key });
    setCoins(u.savedCoins || 0);
    setTotalEarned(u.savedTotal || 0);
    setTapPower(u.savedPower || 1);
    setWithdrawHistory(u.savedHistory || []);
    setScreen('app'); setAuthErr('');
  };

  const handleRegister = () => {
    if (!authForm.name || (!authForm.phone && !authForm.email) || !authForm.password) {
      setAuthErr('❌ Fill all required fields.'); return;
    }
    if (authForm.password !== authForm.confirm) { setAuthErr('❌ Passwords do not match.'); return; }
    const key = authForm.phone || authForm.email;
    if (users[key]) { setAuthErr('❌ Account already exists.'); return; }
    const u = {
      password: authForm.password, name: authForm.name,
      phone: authForm.phone, email: authForm.email,
      savedCoins: 0, savedTotal: 0, savedPower: 1, savedHistory: [],
    };
    setUsers(p => ({ ...p, [key]: u }));
    setCurrentUser({ ...u, key });
    setCoins(0); setTotalEarned(0); setTapPower(1); setWithdrawHistory([]);
    setScreen('app'); setAuthErr('');
  };

  // Save user data on coin change
  useEffect(() => {
    if (!currentUser) return;
    setUsers(p => ({
      ...p,
      [currentUser.key]: {
        ...p[currentUser.key],
        savedCoins: coins,
        savedTotal: totalEarned,
        savedPower: tapPower,
        savedHistory: withdrawHistory,
      }
    }));
  }, [coins, totalEarned, tapPower, withdrawHistory]);

  // ── Tap ───────────────────────────────────────────────────────────────────────
  const handleTap = () => {
    if (energy <= 0) { Alert.alert('No Energy!', 'Wait for recharge or buy refill.'); return; }
    const power = tapPower * (boostActive ? 3 : 1);
    setCoins(c => c + power);
    setTotalEarned(t => t + power);
    setEnergy(e => Math.max(0, e-1));
    setTapCount(t => t+1);
    Animated.sequence([
      Animated.timing(tapScale, { toValue:0.88, duration:65, useNativeDriver:true }),
      Animated.spring(tapScale, { toValue:1, useNativeDriver:true, tension:220, friction:8 }),
    ]).start();
  };

  // ── Watch Ad ─────────────────────────────────────────────────────────────────
  const watchAd = () => {
    if (adCooldown > 0) return;
    const r = 300; // Fixed 300 coins per ad
    setAdReward(r); setAdTimer(5); setShowAdModal(true);
    const iv = setInterval(() => setAdTimer(t => { if(t<=1){clearInterval(iv);return 0;} return t-1; }), 1000);
  };
  const claimAd = () => {
    setCoins(c => c+adReward); setTotalEarned(t => t+adReward);
    setShowAdModal(false); setAdCooldown(60);
  };

  // ── Withdraw ─────────────────────────────────────────────────────────────────
  const doWithdraw = (rule) => {
    if (coins < rule.coins) {
      Alert.alert('Insufficient Coins', `You need ${fmt(rule.coins)} coins (₹${rule.inr}).`); return;
    }
    if (!withdrawUPI || !withdrawUPI.includes('@')) {
      Alert.alert('Invalid UPI', 'Enter valid UPI ID.\nExample: name@paytm or 9876543210@ybl'); return;
    }
    setCoins(c => c - rule.coins);
    const entry = {
      id: Date.now(), amount: rule.inr, coins: rule.coins,
      upi: withdrawUPI, date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
      status: 'Pending',
    };
    setWithdrawHistory(h => [entry, ...h]);
    Alert.alert(
      '✅ Withdraw Request Sent!',
      `₹${rule.inr} will be credited to\n${withdrawUPI}\n\nProcessing time: 1–3 working days`,
      [{ text: 'OK' }]
    );
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const level     = LEVELS.find(l => totalEarned >= l.min && totalEarned < l.max) || LEVELS[LEVELS.length-1];
  const nextLevel = LEVELS[LEVELS.indexOf(level)+1];
  const levelPct  = nextLevel ? Math.min(100,((totalEarned-level.min)/(nextLevel.min-level.min))*100) : 100;
  const ad        = AD_BANNERS[adIdx];
  const upgradeCost = tapPower * 500;
  const boostCost   = 5000;
  const energyCost  = 800;
  const msg         = MOTIVATIONAL_MSGS[msgIdx];
  const inrBalance  = (coins * COIN_TO_INR).toFixed(2);

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTH SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen !== 'app') {
    return (
      <SafeAreaView style={s.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ScrollView contentContainerStyle={s.authScroll} keyboardShouldPersistTaps="handled">
          <View style={s.logoWrap}>
            <View style={s.logoBox}><Text style={s.logoEmoji}>🪙</Text></View>
            <Text style={s.logoTitle}>TapEarn Pro</Text>
            <Text style={s.logoSub}>Tap. Earn. Withdraw. Repeat.</Text>
          </View>

          <View style={s.authCard}>
            <View style={s.authTabs}>
              {['login','register'].map(t => (
                <TouchableOpacity key={t} onPress={() => { setAuthTab(t); setAuthErr(''); }}
                  style={[s.authTab, authTab===t && s.authTabActive]}>
                  <Text style={[s.authTabTxt, authTab===t && s.authTabTxtActive]}>
                    {t==='login' ? 'Sign In' : 'Register'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {authTab==='register' && <AuthInput label="Full Name *" placeholder="Rahul Sharma" value={authForm.name} onChange={v=>setAuthForm(f=>({...f,name:v}))} icon="👤" />}
            <AuthInput label={authTab==='register'?"Phone Number *":"Phone / Email"} placeholder="9876543210" value={authForm.phone} onChange={v=>setAuthForm(f=>({...f,phone:v}))} icon="📱" keyType="phone-pad" />
            {authTab==='register' && <AuthInput label="Email (Optional)" placeholder="rahul@gmail.com" value={authForm.email} onChange={v=>setAuthForm(f=>({...f,email:v}))} icon="📧" keyType="email-address" />}
            <AuthInput label="Password *" placeholder="Min 6 characters" value={authForm.password} onChange={v=>setAuthForm(f=>({...f,password:v}))} icon="🔒" secure />
            {authTab==='register' && <AuthInput label="Confirm Password *" placeholder="Re-enter password" value={authForm.confirm} onChange={v=>setAuthForm(f=>({...f,confirm:v}))} icon="🔒" secure />}

            {!!authErr && <Text style={s.authErr}>{authErr}</Text>}

            <TouchableOpacity style={s.authBtn} onPress={authTab==='login'?handleLogin:handleRegister} activeOpacity={0.85}>
              <Text style={s.authBtnTxt}>{authTab==='login' ? 'Sign In →' : 'Create Account →'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.termsNote}>By continuing you agree to our Terms & Privacy Policy</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* NAV */}
      <View style={s.nav}>
        <View style={s.navLeft}>
          <View style={s.navLogo}><Text style={{fontSize:18}}>🪙</Text></View>
          <View>
            <Text style={s.navTitle}>TapEarn Pro</Text>
            <Text style={s.navSub}>Hi, {currentUser?.name?.split(' ')[0]} 👋</Text>
          </View>
        </View>
        <View style={s.navRight}>
          <View style={s.coinBadge}><Text style={s.coinBadgeTxt}>🪙 {fmt(coins)}</Text></View>
          <TouchableOpacity onPress={openMenu} style={s.menuBtn} activeOpacity={0.7}>
            <View style={[s.menuLine,{width:20}]}/>
            <View style={[s.menuLine,{width:14}]}/>
            <View style={[s.menuLine,{width:20}]}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* AD BANNER */}
      <Animated.View style={[s.adBanner,{opacity:adOpacity,borderColor:ad.color+'44'}]}>
        <Text style={s.adLabel}>AD</Text>
        <Text style={s.adText} numberOfLines={1}>{ad.text}</Text>
        <Text style={[s.adBrand,{color:ad.color}]}>{ad.brand}</Text>
      </Animated.View>

      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:30}} showsVerticalScrollIndicator={false}>

        {/* ── HOME ───────────────────────────────────────────────────────────── */}
        {activePage==='home' && (
          <View style={s.page}>
            {/* Stats */}
            <View style={s.statsRow}>
              <StatCard label="Balance" val={`🪙 ${fmt(coins)}`} sub={`≈ ₹${inrBalance}`} color="#FFD60A" />
              <StatCard label="Total Earned" val={`🏆 ${fmt(totalEarned)}`} sub="All time" color="#30D158" />
              <StatCard label="Tap Power" val={`⚡ x${tapPower}`} sub={boostActive?`🔥 ${boostTime}s`:'per tap'} color="#0A84FF" />
            </View>

            {/* Level */}
            <View style={s.levelCard}>
              <View style={s.levelRow}>
                <Text style={[s.levelName,{color:level.color}]}>{level.emoji} {level.name}</Text>
                {nextLevel && <Text style={s.levelNext}>Next: {nextLevel.emoji} {nextLevel.name}</Text>}
              </View>
              <View style={s.levelBg}>
                <View style={[s.levelFill,{width:`${levelPct}%`,backgroundColor:level.color}]}/>
              </View>
              {nextLevel && <Text style={s.levelCount}>{fmt(totalEarned)} / {fmt(nextLevel.min)} coins</Text>}
            </View>

            {/* TAP BUTTON */}
            <View style={s.tapWrap}>
              <Animated.View style={{transform:[{scale:tapScale}]}}>
                <TouchableOpacity onPress={handleTap} activeOpacity={0.85}
                  style={[s.tapBtn,{backgroundColor:energy>0?(boostActive?'#FF453A':'#FFD60A'):'#3a3a3c'}]}>
                  <Text style={s.tapEmoji}>{energy>0?(boostActive?'🔥':'🪙'):'😴'}</Text>
                  <Text style={[s.tapLabel,{color:energy>0?'#000':'#666'}]}>
                    {energy>0?'TAP TO EARN':'RECHARGING...'}
                  </Text>
                  <Text style={[s.tapSub,{color:energy>0?'#333':'#555'}]}>
                    +{tapPower*(boostActive?3:1)} coins per tap
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Text style={s.tapCount}>Total Taps: {tapCount.toLocaleString('en-IN')}</Text>

            {/* Energy */}
            <View style={s.energyWrap}>
              <View style={s.energyLabelRow}>
                <Text style={s.energyLabel}>⚡ ENERGY</Text>
                <Text style={[s.energyVal,{color:energy>30?'#30D158':'#FF453A'}]}>{energy}/{maxEnergy}</Text>
              </View>
              <View style={s.energyBg}>
                <View style={[s.energyFill,{width:`${(energy/maxEnergy)*100}%`,backgroundColor:energy>30?'#30D158':'#FF453A'}]}/>
              </View>
            </View>

            {/* Actions */}
            <View style={s.actionGrid}>
              <ActionBtn icon="📺" label="Watch Ad" sub={adCooldown>0?`⏳ ${adCooldown}s`:'+300 coins'} color="#BF5AF2" disabled={adCooldown>0} onPress={watchAd}/>
              <ActionBtn icon="⬆️" label="Upgrade Tap" sub={`Cost: ${fmt(upgradeCost)} 🪙`} color="#0A84FF" disabled={coins<upgradeCost} onPress={()=>{if(coins>=upgradeCost){setCoins(c=>c-upgradeCost);setTapPower(p=>p+1);}}}/>
              <ActionBtn icon="⚡" label="Refill Energy" sub={`Cost: ${fmt(energyCost)} 🪙`} color="#30D158" disabled={coins<energyCost||energy===maxEnergy} onPress={()=>{if(coins>=energyCost&&energy<maxEnergy){setCoins(c=>c-energyCost);setEnergy(maxEnergy);}}}/>
              <ActionBtn icon="🔥" label="3x Boost 30s" sub={boostActive?`Active! ${boostTime}s`:`Cost: ${fmt(boostCost)} 🪙`} color="#FF9F0A" disabled={coins<boostCost||boostActive} onPress={()=>{if(coins>=boostCost&&!boostActive){setCoins(c=>c-boostCost);setBoostActive(true);setBoostTime(30);}}}/>
            </View>

            <TouchableOpacity style={s.withdrawMainBtn} onPress={()=>setActivePage('withdraw')} activeOpacity={0.85}>
              <Text style={s.withdrawMainTxt}>💸  Withdraw Now  →</Text>
              <Text style={s.withdrawMainSub}>Min: 1,00,000 coins = ₹100</Text>
            </TouchableOpacity>

            {/* ── MOTIVATIONAL TICKER ─────────────────────────────────────── */}
            <Animated.View style={[s.tickerCard,{opacity:tickerOpacity}]}>
              <View style={s.tickerDot}/>
              <View style={{flex:1}}>
                <Text style={s.tickerMain}>
                  🎉 <Text style={{color:'#FFD60A',fontWeight:'800'}}>{msg.user}</Text>
                  {' '}just withdrew{' '}
                  <Text style={{color:'#30D158',fontWeight:'900'}}>₹{msg.amount}</Text>
                  {' '}({msg.coins} coins)
                </Text>
                <Text style={s.tickerTime}>⏱ {msg.time}</Text>
              </View>
            </Animated.View>

          </View>
        )}

        {/* ── HOW TO EARN ────────────────────────────────────────────────────── */}
        {activePage==='earn' && (
          <View style={s.page}>
            <Text style={s.pageTitle}>💡 How to Earn</Text>
            <SectionTitle title="🪙 Coin to Rupee Rate" />
            {[
              ['10,000 Coins','= ₹10'],
              ['50,000 Coins','= ₹50'],
              ['1,00,000 Coins','= ₹100 ⭐'],
              ['5,00,000 Coins','= ₹500'],
              ['10,00,000 Coins','= ₹1,000'],
            ].map(([l,v])=><InfoRow key={l} label={l} value={v}/>)}

            <SectionTitle title="📈 Earning Methods"/>
            {[
              ['👆 Tap Button','Main earning. Each tap = coins based on your Tap Power level.'],
              ['📺 Watch Ads','Earn 2,000–7,000 bonus coins per ad. 60 second cooldown.'],
              ['⬆️ Upgrade Tap','Increase coins per tap. Higher power = faster earnings!'],
              ['🔥 3x Boost','Triple your earnings for 30 seconds!'],
              ['⚡ Energy Refill','Instantly refill energy to keep tapping nonstop.'],
            ].map(([t,d])=>(
              <View key={t} style={s.earnCard}>
                <Text style={s.earnCardTitle}>{t}</Text>
                <Text style={s.earnCardDesc}>{d}</Text>
              </View>
            ))}

            <SectionTitle title="🏅 Levels"/>
            {LEVELS.map(l=>(
              <View key={l.name} style={s.levelListRow}>
                <Text style={[s.levelListName,{color:l.color}]}>{l.emoji} {l.name}</Text>
                <Text style={s.levelListRange}>{l.max===Infinity?`${fmt(l.min)}+`:`${fmt(l.min)}–${fmt(l.max)}`}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── WITHDRAW ───────────────────────────────────────────────────────── */}
        {activePage==='withdraw' && (
          <View style={s.page}>
            <Text style={s.pageTitle}>💸 Withdraw</Text>

            <View style={s.balanceCard}>
              <Text style={s.balanceLabel}>AVAILABLE BALANCE</Text>
              <Text style={s.balanceVal}>🪙 {fmt(coins)}</Text>
              <Text style={s.balanceSub}>≈ ₹{inrBalance}</Text>
            </View>

            <SectionTitle title="📱 UPI ID"/>
            <TextInput style={s.upiInput} value={withdrawUPI} onChangeText={setWithdrawUPI}
              placeholder="yourname@paytm  /  9876543210@ybl"
              placeholderTextColor="rgba(255,255,255,0.3)" autoCapitalize="none"/>
            <Text style={s.upiHint}>Supported: @paytm @ybl @ibl @oksbi @okaxis @upi</Text>

            <SectionTitle title="💰 Select Amount"/>
            <View style={s.withdrawGrid}>
              {WITHDRAW_RULES.map(r=>(
                <TouchableOpacity key={r.inr} activeOpacity={0.75}
                  style={[s.withdrawCard, coins<r.coins && s.withdrawCardDis]}
                  onPress={()=>doWithdraw(r)}>
                  <Text style={[s.wAmt, coins<r.coins&&{color:'rgba(255,255,255,0.2)'}]}>₹{r.inr}</Text>
                  <Text style={s.wCoins}>{fmt(r.coins)} coins</Text>
                  {coins>=r.coins && <View style={s.wReady}><Text style={s.wReadyTxt}>✓ Ready</Text></View>}
                </TouchableOpacity>
              ))}
            </View>

            <SectionTitle title="ℹ️ Rules"/>
            {[
              'Minimum withdrawal: ₹100 (1,00,000 coins)',
              'Maximum per day: ₹5,000',
              'Processing time: 1–3 working days',
              'UPI ID must be active and verified',
              'Coins deducted immediately on request',
              'Withdrawals processed Mon–Sat only',
            ].map(r=><Text key={r} style={s.ruleText}>• {r}</Text>)}
          </View>
        )}

        {/* ── HISTORY ────────────────────────────────────────────────────────── */}
        {activePage==='history' && (
          <View style={s.page}>
            <Text style={s.pageTitle}>📋 Withdraw History</Text>
            {withdrawHistory.length===0 ? (
              <View style={s.emptyWrap}>
                <Text style={s.emptyEmoji}>📭</Text>
                <Text style={s.emptyTxt}>No withdrawals yet</Text>
                <Text style={s.emptySub}>Keep tapping to earn more!</Text>
              </View>
            ) : withdrawHistory.map(h=>(
              <View key={h.id} style={s.histCard}>
                <View>
                  <Text style={s.histAmt}>₹{h.amount}</Text>
                  <Text style={s.histUpi}>{h.upi}</Text>
                  <Text style={s.histDate}>{h.date} {h.time}</Text>
                </View>
                <View style={s.histStatus}><Text style={s.histStatusTxt}>{h.status}</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* ── TERMS ──────────────────────────────────────────────────────────── */}
        {activePage==='terms' && (
          <View style={s.page}>
            <Text style={s.pageTitle}>📄 Terms & Conditions</Text>
            <Text style={s.lastUpdated}>Last updated: March 2025</Text>
            {[
              ['1. Acceptance','By using TapEarn Pro you agree to these Terms. If you disagree, please do not use this app.'],
              ['2. Eligibility','You must be 18+ years old to use this app and withdraw earnings.'],
              ['3. Coin System','Coins are virtual currency. 1,00,000 coins = ₹100. Coins earned via cheating or bots will be forfeited.'],
              ['4. Earning Rules','Earning rates may be adjusted at any time. Automated tapping or bots are strictly prohibited.'],
              ['5. Withdrawal Policy','Min ₹100 (1,00,000 coins). Max ₹5,000/day. Processed in 1–3 working days via UPI only.'],
              ['6. Advertisements','Third-party ads are displayed. We are not responsible for external ad content.'],
              ['7. Account Termination','Accounts may be suspended for fraud, bots, multiple accounts, or violations.'],
              ['8. Liability','TapEarn Pro is not liable for technical errors or unforeseeable coin loss.'],
              ['9. Modifications','Terms may be updated at any time. Continued use = acceptance.'],
              ['10. Governing Law','Governed by laws of India. Disputes subject to Indian courts.'],
            ].map(([t,d])=>(
              <View key={t} style={s.termItem}>
                <Text style={s.termTitle}>{t}</Text>
                <Text style={s.termDesc}>{d}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── PRIVACY ────────────────────────────────────────────────────────── */}
        {activePage==='policy' && (
          <View style={s.page}>
            <Text style={s.pageTitle}>🔐 Privacy Policy</Text>
            <Text style={s.lastUpdated}>Last updated: March 2025</Text>
            {[
              ['Data We Collect','Name, phone number, email, and in-app activity to provide our service.'],
              ['How We Use It','Account management, withdrawal processing, ad delivery, fraud prevention.'],
              ['Data Sharing','We never sell your data. Payment processors receive only withdrawal info.'],
              ['Advertisements','Ad partners may use device identifiers. Opt out via device settings.'],
              ['Security','Industry-standard encryption protects your data.'],
              ['Your Rights','Access, correct or delete data: privacy@tapearnapro.in'],
              ['Contact','support@tapearnapro.in | 1800-XXX-XXXX | New Delhi, India'],
            ].map(([t,d])=>(
              <View key={t} style={s.termItem}>
                <Text style={[s.termTitle,{color:'#0A84FF'}]}>{t}</Text>
                <Text style={s.termDesc}>{d}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── ABOUT ──────────────────────────────────────────────────────────── */}
        {activePage==='about' && (
          <View style={s.page}>
            <Text style={s.pageTitle}>ℹ️ About TapEarn Pro</Text>
            <View style={s.aboutLogoWrap}>
              <View style={s.logoBox}><Text style={s.logoEmoji}>🪙</Text></View>
              <Text style={s.logoTitle}>TapEarn Pro</Text>
              <Text style={s.logoSub}>Version 2.0.0</Text>
            </View>
            {[
              ['🎯 Mission','India ka #1 tap-to-earn app. Connecting users with advertisers for real rewards.'],
              ['💰 How We Pay You','Ad revenue is shared with users. You tap, watch ads, we earn — and share it back!'],
              ['📞 Contact','support@tapearnapro.in\n1800-XXX-XXXX | Mon–Sat 9AM–6PM'],
              ['🔗 Follow Us','Instagram: @tapearnapro\nTelegram: t.me/tapearnapro\nYouTube: TapEarn Pro'],
            ].map(([t,d])=>(
              <View key={t} style={s.earnCard}>
                <Text style={s.earnCardTitle}>{t}</Text>
                <Text style={s.earnCardDesc}>{d}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* ── SLIDE MENU ───────────────────────────────────────────────────────── */}
      <Modal visible={menuOpen} transparent animationType="none">
        <TouchableOpacity style={s.menuOverlay} activeOpacity={1} onPress={closeMenu}/>
        <Animated.View style={[s.menuPanel,{transform:[{translateX:menuAnim}]}]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.menuUserCard}>
              <View style={s.menuAvatar}><Text style={{fontSize:28}}>😊</Text></View>
              <Text style={s.menuUserName}>{currentUser?.name}</Text>
              <Text style={s.menuUserPhone}>📱 {currentUser?.phone || currentUser?.email}</Text>
              <View style={[s.menuLevelBadge,{backgroundColor:level.color+'22'}]}>
                <Text style={[s.menuLevelTxt,{color:level.color}]}>{level.emoji} {level.name}</Text>
              </View>
              <Text style={[s.menuUserPhone,{marginTop:6,color:'#30D158'}]}>
                🪙 {fmt(coins)} coins  ≈  ₹{inrBalance}
              </Text>
            </View>
            {[
              {id:'home',    icon:'🏠', label:'Home'},
              {id:'earn',    icon:'💡', label:'How to Earn'},
              {id:'withdraw',icon:'💸', label:'Withdraw'},
              {id:'history', icon:'📋', label:'Withdraw History'},
              {id:'terms',   icon:'📄', label:'Terms & Conditions'},
              {id:'policy',  icon:'🔐', label:'Privacy Policy'},
              {id:'about',   icon:'ℹ️',  label:'About Us'},
            ].map(item=>(
              <TouchableOpacity key={item.id} onPress={()=>navTo(item.id)}
                style={[s.menuItem, activePage===item.id&&s.menuItemActive]} activeOpacity={0.7}>
                <Text style={s.menuItemIcon}>{item.icon}</Text>
                <Text style={[s.menuItemLabel, activePage===item.id&&{color:'#FFD60A'}]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.logoutBtn} activeOpacity={0.8}
              onPress={()=>{setScreen('login');closeMenu();setCoins(0);setTotalEarned(0);setTapPower(1);setEnergy(100);}}>
              <Text style={s.logoutTxt}>🚪  Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* ── AD MODAL ─────────────────────────────────────────────────────────── */}
      <Modal visible={showAdModal} transparent animationType="fade">
        <View style={s.adModalBg}>
          <View style={s.adModalCard}>
            <Text style={s.adModalLabel}>ADVERTISEMENT</Text>
            <View style={[s.adModalBanner,{backgroundColor:ad.color+'33',borderColor:ad.color+'66'}]}>
              <Text style={{fontSize:48,marginBottom:8}}>🎯</Text>
              <Text style={[s.adModalBrand,{color:ad.color}]}>{ad.brand}</Text>
              <Text style={s.adModalText}>{ad.text}</Text>
            </View>
            <Text style={s.adModalReward}>
              Reward: <Text style={{color:'#FFD60A',fontWeight:'900'}}>+300 🪙 coins</Text>
            </Text>
            <TouchableOpacity style={[s.adClaimBtn,adTimer>0&&s.adClaimBtnDis]}
              onPress={adTimer===0?claimAd:null} activeOpacity={adTimer===0?0.85:1}>
              <Text style={[s.adClaimTxt,adTimer>0&&{color:'rgba(255,255,255,0.4)'}]}>
                {adTimer>0?`⏳ Please wait ${adTimer}s...`:'✅ Claim Reward'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function AuthInput({label,placeholder,value,onChange,icon,secure,keyType}) {
  return (
    <View style={{marginBottom:14}}>
      <Text style={s.inputLabel}>{label}</Text>
      <View style={s.inputWrap}>
        <Text style={s.inputIcon}>{icon}</Text>
        <TextInput style={s.input} placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.25)"
          value={value} onChangeText={onChange} secureTextEntry={secure}
          autoCapitalize="none" keyboardType={keyType||'default'}/>
      </View>
    </View>
  );
}
function StatCard({label,val,sub,color}) {
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{label.toUpperCase()}</Text>
      <Text style={[s.statVal,{color}]}>{val}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </View>
  );
}
function ActionBtn({icon,label,sub,color,disabled,onPress}) {
  return (
    <TouchableOpacity onPress={!disabled?onPress:null} activeOpacity={disabled?1:0.75}
      style={[s.actionBtn,{borderColor:disabled?'rgba(255,255,255,0.06)':color+'44',backgroundColor:disabled?'rgba(255,255,255,0.03)':color+'15'}]}>
      <Text style={{fontSize:24}}>{icon}</Text>
      <Text style={[s.actionLabel,{color:disabled?'rgba(255,255,255,0.25)':color}]}>{label}</Text>
      <Text style={s.actionSub}>{sub}</Text>
    </TouchableOpacity>
  );
}
function SectionTitle({title}) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}
function InfoRow({label,value}) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:'#000'},
  authScroll:{flexGrow:1,padding:24,paddingTop:60},
  logoWrap:{alignItems:'center',marginBottom:36},
  logoBox:{width:80,height:80,borderRadius:22,backgroundColor:'#FFD60A',alignItems:'center',justifyContent:'center',marginBottom:16,elevation:10},
  logoEmoji:{fontSize:40},
  logoTitle:{fontSize:28,fontWeight:'900',color:'#fff',letterSpacing:-0.5},
  logoSub:{color:'rgba(255,255,255,0.4)',fontSize:14,marginTop:6},
  authCard:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:24,padding:24},
  authTabs:{flexDirection:'row',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:14,padding:4,marginBottom:24},
  authTab:{flex:1,padding:10,borderRadius:10,alignItems:'center'},
  authTabActive:{backgroundColor:'rgba(255,255,255,0.15)'},
  authTabTxt:{color:'rgba(255,255,255,0.45)',fontWeight:'600',fontSize:14},
  authTabTxtActive:{color:'#fff'},
  authErr:{color:'#FF453A',fontSize:13,textAlign:'center',marginBottom:12},
  authBtn:{backgroundColor:'#FFD60A',borderRadius:14,padding:16,alignItems:'center',marginTop:4,elevation:6},
  authBtnTxt:{color:'#000',fontWeight:'900',fontSize:16},
  termsNote:{textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:11,marginTop:16,paddingBottom:30},
  inputLabel:{fontSize:11,color:'rgba(255,255,255,0.45)',fontWeight:'700',letterSpacing:0.3,marginBottom:6},
  inputWrap:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.07)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:12,paddingHorizontal:12},
  inputIcon:{fontSize:18,marginRight:8},
  input:{flex:1,color:'#fff',fontSize:15,paddingVertical:13},
  nav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.08)',backgroundColor:'rgba(0,0,0,0.97)'},
  navLeft:{flexDirection:'row',alignItems:'center',gap:10},
  navLogo:{width:36,height:36,borderRadius:10,backgroundColor:'#FFD60A',alignItems:'center',justifyContent:'center'},
  navTitle:{color:'#fff',fontWeight:'800',fontSize:15},
  navSub:{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:1},
  navRight:{flexDirection:'row',alignItems:'center',gap:10},
  coinBadge:{backgroundColor:'rgba(255,214,10,0.12)',borderWidth:1,borderColor:'rgba(255,214,10,0.25)',borderRadius:10,paddingHorizontal:12,paddingVertical:5},
  coinBadgeTxt:{color:'#FFD60A',fontWeight:'700',fontSize:13},
  menuBtn:{backgroundColor:'rgba(255,255,255,0.08)',borderRadius:10,width:38,height:38,alignItems:'center',justifyContent:'center',gap:5},
  menuLine:{height:2,backgroundColor:'#fff',borderRadius:2},
  adBanner:{marginHorizontal:14,marginTop:12,borderRadius:12,borderWidth:1,padding:10,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.03)'},
  adLabel:{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:1,width:24},
  adText:{flex:1,color:'#fff',fontSize:12,fontWeight:'600',textAlign:'center',paddingHorizontal:6},
  adBrand:{fontSize:10,fontWeight:'700'},
  page:{padding:16},
  pageTitle:{fontSize:20,fontWeight:'800',color:'#fff',marginBottom:18,letterSpacing:-0.3},
  statsRow:{flexDirection:'row',gap:8,marginBottom:14},
  statCard:{flex:1,backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:14,padding:10},
  statLabel:{fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:'700',letterSpacing:0.3,marginBottom:4},
  statVal:{fontSize:13,fontWeight:'800'},
  statSub:{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2},
  levelCard:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:14,padding:14,marginBottom:14},
  levelRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  levelName:{fontSize:14,fontWeight:'700'},
  levelNext:{fontSize:12,color:'rgba(255,255,255,0.35)'},
  levelBg:{height:6,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:10,overflow:'hidden'},
  levelFill:{height:'100%',borderRadius:10},
  levelCount:{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:6},
  tapWrap:{alignItems:'center',marginVertical:20},
  tapBtn:{width:190,height:190,borderRadius:95,alignItems:'center',justifyContent:'center',elevation:15},
  tapEmoji:{fontSize:60},
  tapLabel:{fontSize:14,fontWeight:'900',marginTop:8,letterSpacing:1},
  tapSub:{fontSize:12,marginTop:2},
  tapCount:{textAlign:'center',color:'rgba(255,255,255,0.3)',fontSize:12,marginBottom:16},
  energyWrap:{marginBottom:16},
  energyLabelRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:5},
  energyLabel:{color:'rgba(255,255,255,0.4)',fontSize:12,fontWeight:'700'},
  energyVal:{fontSize:12,fontWeight:'700'},
  energyBg:{height:8,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:10,overflow:'hidden'},
  energyFill:{height:'100%',borderRadius:10},
  actionGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:10},
  actionBtn:{width:(SW-52)/2,padding:14,borderRadius:14,borderWidth:1,alignItems:'center'},
  actionLabel:{fontSize:13,fontWeight:'700',marginTop:4},
  actionSub:{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:2,textAlign:'center'},
  withdrawMainBtn:{backgroundColor:'rgba(255,214,10,0.12)',borderWidth:1,borderColor:'rgba(255,214,10,0.3)',borderRadius:14,padding:16,alignItems:'center',marginTop:4,marginBottom:16},
  withdrawMainTxt:{color:'#FFD60A',fontWeight:'800',fontSize:16},
  withdrawMainSub:{color:'rgba(255,255,255,0.35)',fontSize:12,marginTop:4},
  // TICKER
  tickerCard:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'rgba(48,209,88,0.08)',borderWidth:1,borderColor:'rgba(48,209,88,0.25)',borderRadius:14,padding:14,marginTop:4},
  tickerDot:{width:8,height:8,borderRadius:4,backgroundColor:'#30D158'},
  tickerMain:{color:'#fff',fontSize:13,lineHeight:20},
  tickerTime:{color:'rgba(255,255,255,0.4)',fontSize:11,marginTop:2},
  sectionTitle:{fontSize:12,color:'rgba(255,255,255,0.35)',fontWeight:'700',letterSpacing:0.8,marginTop:16,marginBottom:10},
  infoRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.05)'},
  infoLabel:{color:'rgba(255,255,255,0.6)',fontSize:14},
  infoValue:{color:'#FFD60A',fontWeight:'700',fontSize:14},
  earnCard:{backgroundColor:'rgba(255,255,255,0.04)',borderRadius:12,padding:14,marginBottom:8},
  earnCardTitle:{color:'#fff',fontWeight:'700',fontSize:14,marginBottom:4},
  earnCardDesc:{color:'rgba(255,255,255,0.55)',fontSize:13,lineHeight:20},
  levelListRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.05)'},
  levelListName:{fontWeight:'700',fontSize:14},
  levelListRange:{color:'rgba(255,255,255,0.4)',fontSize:13},
  balanceCard:{backgroundColor:'rgba(255,214,10,0.08)',borderWidth:1,borderColor:'rgba(255,214,10,0.2)',borderRadius:14,padding:16,marginBottom:16},
  balanceLabel:{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:'700',letterSpacing:0.8,marginBottom:4},
  balanceVal:{fontSize:32,fontWeight:'900',color:'#FFD60A'},
  balanceSub:{fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:2},
  upiInput:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)',borderRadius:12,padding:14,color:'#fff',fontSize:14,marginBottom:6},
  upiHint:{color:'rgba(255,255,255,0.3)',fontSize:11,marginBottom:4},
  withdrawGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:4},
  withdrawCard:{width:(SW-52)/2,borderWidth:1,borderColor:'rgba(255,214,10,0.3)',backgroundColor:'rgba(255,214,10,0.08)',borderRadius:14,padding:16,alignItems:'center'},
  withdrawCardDis:{borderColor:'rgba(255,255,255,0.06)',backgroundColor:'rgba(255,255,255,0.03)'},
  wAmt:{fontSize:24,fontWeight:'900',color:'#FFD60A'},
  wCoins:{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:3},
  wReady:{backgroundColor:'rgba(48,209,88,0.15)',borderRadius:6,paddingHorizontal:8,paddingVertical:2,marginTop:5},
  wReadyTxt:{color:'#30D158',fontSize:11,fontWeight:'700'},
  ruleText:{color:'rgba(255,255,255,0.5)',fontSize:13,paddingVertical:5,lineHeight:20},
  emptyWrap:{alignItems:'center',paddingVertical:60},
  emptyEmoji:{fontSize:48,marginBottom:12},
  emptyTxt:{color:'rgba(255,255,255,0.4)',fontSize:16,fontWeight:'600'},
  emptySub:{color:'rgba(255,255,255,0.25)',fontSize:13,marginTop:4},
  histCard:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.07)',borderRadius:14,padding:14,marginBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  histAmt:{fontSize:18,fontWeight:'900',color:'#FFD60A'},
  histUpi:{color:'rgba(255,255,255,0.45)',fontSize:13,marginTop:2},
  histDate:{color:'rgba(255,255,255,0.3)',fontSize:12,marginTop:2},
  histStatus:{backgroundColor:'rgba(255,159,10,0.15)',borderWidth:1,borderColor:'rgba(255,159,10,0.3)',borderRadius:8,paddingHorizontal:10,paddingVertical:4},
  histStatusTxt:{color:'#FF9F0A',fontWeight:'700',fontSize:12},
  lastUpdated:{color:'rgba(255,255,255,0.3)',fontSize:12,marginBottom:16},
  termItem:{marginBottom:16},
  termTitle:{color:'#FFD60A',fontWeight:'700',fontSize:14,marginBottom:4},
  termDesc:{color:'rgba(255,255,255,0.6)',fontSize:13,lineHeight:22},
  aboutLogoWrap:{alignItems:'center',paddingVertical:20,marginBottom:10},
  menuOverlay:{position:'absolute',top:0,left:0,width:SW,height:SH,backgroundColor:'rgba(0,0,0,0.6)'},
  menuPanel:{position:'absolute',top:0,right:0,width:280,height:SH,backgroundColor:'rgba(10,10,18,0.99)',borderLeftWidth:1,borderLeftColor:'rgba(255,255,255,0.08)'},
  menuUserCard:{paddingTop:60,paddingHorizontal:24,paddingBottom:24,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.07)'},
  menuAvatar:{width:60,height:60,borderRadius:18,backgroundColor:'#FFD60A',alignItems:'center',justifyContent:'center',marginBottom:12},
  menuUserName:{color:'#fff',fontWeight:'800',fontSize:18},
  menuUserPhone:{color:'rgba(255,255,255,0.4)',fontSize:13,marginTop:2},
  menuLevelBadge:{marginTop:10,borderRadius:8,paddingHorizontal:10,paddingVertical:4,alignSelf:'flex-start'},
  menuLevelTxt:{fontWeight:'700',fontSize:13},
  menuItem:{flexDirection:'row',alignItems:'center',paddingVertical:14,paddingHorizontal:24,borderLeftWidth:3,borderLeftColor:'transparent'},
  menuItemActive:{borderLeftColor:'#FFD60A',backgroundColor:'rgba(255,214,10,0.07)'},
  menuItemIcon:{fontSize:18,marginRight:14},
  menuItemLabel:{color:'rgba(255,255,255,0.75)',fontWeight:'600',fontSize:15},
  logoutBtn:{margin:24,padding:14,borderRadius:12,borderWidth:1,borderColor:'rgba(255,69,58,0.3)',backgroundColor:'rgba(255,69,58,0.1)',alignItems:'center'},
  logoutTxt:{color:'#FF453A',fontWeight:'700',fontSize:14},
  adModalBg:{flex:1,backgroundColor:'rgba(0,0,0,0.92)',alignItems:'center',justifyContent:'center',padding:24},
  adModalCard:{width:'100%',maxWidth:360,backgroundColor:'rgba(28,28,30,0.99)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)',borderRadius:24,padding:28,alignItems:'center'},
  adModalLabel:{fontSize:11,color:'rgba(255,255,255,0.3)',letterSpacing:2,marginBottom:16},
  adModalBanner:{width:'100%',borderWidth:1,borderRadius:16,padding:24,alignItems:'center',marginBottom:20},
  adModalBrand:{fontSize:18,fontWeight:'900'},
  adModalText:{color:'rgba(255,255,255,0.7)',fontSize:14,marginTop:6,textAlign:'center'},
  adModalReward:{fontSize:16,color:'rgba(255,255,255,0.7)',marginBottom:20},
  adClaimBtn:{width:'100%',padding:16,borderRadius:14,backgroundColor:'#FFD60A',alignItems:'center'},
  adClaimBtnDis:{backgroundColor:'rgba(255,255,255,0.08)'},
  adClaimTxt:{color:'#000',fontWeight:'900',fontSize:16},
});
