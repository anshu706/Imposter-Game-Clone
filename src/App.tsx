import React, { useState, useEffect, useReducer, useRef } from 'react';
import { soundEngine } from './soundEngine';

// --- THEME & CONSTANTS ---
const THEME = {
  bg:          '#0A0A0F',
  surface:     'rgba(18, 18, 26, 0.7)',
  surfaceSolid:'#12121A',
  surfaceHover:'rgba(28, 28, 46, 0.9)',
  border:      '#2A2A3D',
  accent:      '#FF2D55',
  accentAlt:   '#00F5A0',
  accentGold:  '#FFD60A',
  accentPurple:'#BF5AF2',
  text:        '#F5F5F7',
  textMuted:   '#8E8E9E',
  textDim:     '#3A3A4A',
  danger:      '#FF453A',
  overlay:     'rgba(0,0,0,0.85)',
};

const FONTS = {
  display: "'Syne', sans-serif",
  body:    "'DM Sans', sans-serif",
};

const COLORS = ['#FF2D55', '#00F5A0', '#FFD60A', '#BF5AF2', '#0A84FF', '#FF9F0A', '#32ADE6', '#FF375F', '#30D158', '#FFD60A'];
const AVATAR_EMOJIS = ['🦊', '🐼', '🦖', '🦄', '🐙', '🐸', '🦉', '🦋', '🐺', '🐰', '🦁', '🐢', '🐧', '🐯', '🐒', '🐶'];

const WORD_PACKS: Record<string, { label: string, emoji: string, words: string[], locked?: boolean }> = {
  general: {
    label: "General", emoji: "🌍",
    words: ["Pizza", "Beach", "Library", "Doctor", "Netflix", "Airport", "Yoga", "Wedding", "Supermarket", "Gym", "Coffee Shop", "Hospital", "Birthday Party", "Bank", "Kindergarten", "Tennis", "Camping", "Cinema"]
  },
  party: {
    label: "Party", emoji: "🎉",
    words: ["Beer Pong", "Karaoke", "DJ Booth", "Dance Floor", "Hangover", "Bouncer", "VIP Section", "Shots", "Conga Line", "Photo Booth", "After Party", "Designated Driver", "Party Bus", "Confetti"]
  },
  food: {
    label: "Food & Drink", emoji: "🍕",
    words: ["Sushi", "Burger", "Tacos", "Ramen", "Pizza", "Croissant", "Avocado Toast", "Pad Thai", "BBQ", "Fondue", "Dim Sum", "Cheesecake", "Espresso", "Smoothie", "Hot Pot", "Nachos"]
  },
  movies: {
    label: "Movies & TV", emoji: "🎬",
    words: ["Netflix Binge", "Cliffhanger", "Jump Scare", "Plot Twist", "Director's Cut", "Box Office", "Oscar", "Sequel", "Reboot", "Streaming", "Binge Watch", "Spoiler", "Trailer", "Premiere"]
  },
  work: {
    label: "Work Life", emoji: "💼",
    words: ["Standup Meeting", "Deadline", "Inbox Zero", "Zoom Call", "Performance Review", "Side Hustle", "Burnout", "Remote Work", "Salary Negotiation", "Office Politics", "Watercooler", "PowerPoint"]
  },
  adults: {
    label: "Adults Only", emoji: "🔞", locked: true,
    words: ["One Night Stand", "Walk of Shame", "Ghosting", "Situationship", "Tinder Date", "Ex Drama", "Friends with Benefits", "Red Flag", "Body Count", "Oversharing", "Drunk Text", "Morning After"]
  },
  family: {
    label: "Family", emoji: "👨‍👩‍👧",
    words: ["Bedtime Story", "Family Dinner", "Road Trip", "Board Game", "School Run", "Homework", "Piggyback Ride", "Tooth Fairy", "Family Portrait", "Grounding", "Curfew", "Allowance"]
  },
  trivia: {
    label: "Trivia", emoji: "🧠",
    words: ["Black Hole", "Eiffel Tower", "Moon Landing", "DNA", "Magna Carta", "Olympics", "Renaissance", "Algorithm", "Periodic Table", "Shakespeare", "Solar System", "Democracy"]
  }
};

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-tap-highlight-color: transparent; }
    body { 
      background-color: ${THEME.bg}; 
      color: ${THEME.text}; 
      font-family: ${FONTS.body}; 
      overflow: hidden; 
    }

    input { user-select: auto; }

    @keyframes float {
      0% { transform: translateY(0) translateX(0); opacity: 0.2; }
      33% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
      66% { transform: translateY(-10px) translateX(-10px); opacity: 0.3; }
      100% { transform: translateY(0) translateX(0); opacity: 0.2; }
    }

    @keyframes pulseBorder {
      0% { box-shadow: 0 0 0 0 rgba(255, 45, 85, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(255, 45, 85, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 45, 85, 0); }
    }

    @keyframes confettiFall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
      75% { transform: translateX(-5px); }
    }

    @keyframes slideInRight {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes neonBounce {
      0% { 
        transform: scale(0.2); 
        opacity: 0; 
        text-shadow: 0 0 0px transparent; 
      }
      50% { 
        transform: scale(1.1); 
        opacity: 1; 
        text-shadow: 0 0 10px ${THEME.accentGold}, 0 0 20px ${THEME.accentGold}, 0 0 40px ${THEME.accentGold}; 
      }
      75% { 
        transform: scale(0.95); 
        opacity: 1; 
        text-shadow: 0 0 5px ${THEME.accentGold}, 0 0 15px ${THEME.accentGold}, 0 0 30px ${THEME.accentGold}; 
      }
      100% { 
        transform: scale(1); 
        opacity: 1; 
        text-shadow: 0 0 10px ${THEME.accentGold}, 0 0 20px ${THEME.accentGold}, 0 0 40px ${THEME.accentGold}, 0 0 60px ${THEME.accentGold}; 
      }
    }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// --- REUSABLE COMPONENTS ---
const FadeIn = ({ children, delay = 0, y = 20, style = {} }: any) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  
  return (
    <div style={{
      opacity: mounted ? 1 : 0,
      transform: `translateY(${mounted ? 0 : y}px) scale(${mounted ? 1 : 0.98})`,
      transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      ...style
    }}>
      {children}
    </div>
  );
};

const Button = ({ text, onClick, variant = 'primary', disabled = false, style = {}, className = '' }: any) => {
  const [pressed, setPressed] = useState(false);
  const baseStyle: any = {
    padding: '0 24px',
    minHeight: '56px',
    borderRadius: '16px',
    fontFamily: FONTS.body,
    fontSize: '14px',
    fontWeight: '900',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#fff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: '100%',
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transform: pressed ? 'scale(0.96)' : 'scale(1)',
    opacity: disabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };

  if (variant === 'primary') {
    baseStyle.backgroundColor = THEME.accent;
    if (!disabled) baseStyle.boxShadow = `0 0 30px ${THEME.accent}4D`;
  } else if (variant === 'outline') {
    baseStyle.backgroundColor = '#12121A';
    baseStyle.border = `1px solid ${THEME.border}`;
  }

  return (
    <button 
      className={className}
      style={baseStyle}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => !disabled && setPressed(false)}
      onMouseLeave={() => !disabled && setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => !disabled && setPressed(false)}
      onClick={() => !disabled && onClick()}
    >
      {text}
    </button>
  );
};

const Card = ({ children, style = {}, pulse = false }: any) => (
  <div style={{
    backgroundColor: THEME.surface,
    border: `1px solid ${THEME.border}`,
    borderRadius: '20px',
    backdropFilter: 'blur(8px)',
    padding: '24px',
    animation: pulse ? 'pulseBorder 2s infinite' : 'none',
    ...style
  }}>
    {children}
  </div>
);

const Confetti = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 100 }}>
    {Array.from({ length: 40 }).map((_, i) => {
      const left = Math.random() * 100;
      const width = 8 + Math.random() * 8;
      const color = COLORS[i % COLORS.length];
      const delay = Math.random() * 0.5;
      const duration = 1.5 + Math.random();
      return (
        <div key={i} style={{
          position: 'absolute', left: `${left}%`, top: '-10%', width: `${width}px`, height: `${width * 2}px`,
          backgroundColor: color, borderRadius: '4px',
          animation: `confettiFall ${duration}s ${delay}s ease-in forwards`
        }} />
      );
    })}
  </div>
);

// --- APP STATE & LOGIC ---
type Player = { id: string, name: string, color: string, avatar: string, role?: 'player' | 'imposter' };

const INITIAL_STATE = {
  screen: 'home', // home, setup, roleReveal, discussion, voting, results, scoreboard, gameOver
  showHowToPlay: false,
  players: [
    { id: '1', name: 'Alice', color: COLORS[0], avatar: AVATAR_EMOJIS[0] },
    { id: '2', name: 'Bob', color: COLORS[1], avatar: AVATAR_EMOJIS[1] },
    { id: '3', name: 'Charlie', color: COLORS[2], avatar: AVATAR_EMOJIS[2] },
  ] as Player[],
  imposterCount: 1,
  selectedCategory: 'general',
  timerDuration: 60,
  unlockedCategories: ['general', 'party', 'food', 'movies', 'work', 'family', 'trivia'],
  round: 1,
  maxRounds: 3,
  secretWord: '',
  playerRoles: [] as Player[],
  currentRevealIndex: 0,
  timeRemaining: 60,
  votes: {} as Record<string, string>,
  voteTally: {} as Record<string, number>,
  imposterCaught: false,
  imposterWordGuess: '',
  wordGuessedRight: false,
  scores: {} as Record<string, number>,
  lastRoundScores: {} as Record<string, number>,
  mostVotedId: null as string | null,
};

function assignRoles(players: Player[], imposterCount: number) {
  const roles = players.map((_, i) => (i < imposterCount ? 'imposter' : 'player'));
  roles.sort(() => Math.random() - 0.5);
  return players.map((p, i) => ({ ...p, role: roles[i] as 'imposter'|'player' }));
}

function reducer(state: typeof INITIAL_STATE, action: any): typeof INITIAL_STATE {
  switch (action.type) {
    case 'GOTO': return { ...state, screen: action.payload };
    case 'TOGGLE_HOW_TO_PLAY': return { ...state, showHowToPlay: !state.showHowToPlay };
    case 'ADD_PLAYER': {
      if (state.players.length >= 10 || !action.payload.trim()) return state;
      const color = COLORS[state.players.length % COLORS.length];
      const avatar = AVATAR_EMOJIS[state.players.length % AVATAR_EMOJIS.length];
      return { ...state, players: [...state.players, { id: Date.now().toString(), name: action.payload.trim(), color, avatar }] };
    }
    case 'REMOVE_PLAYER': return { ...state, players: state.players.filter(p => p.id !== action.payload) };
    case 'SET_IMPOSTER_COUNT': return { ...state, imposterCount: action.payload };
    case 'SET_CATEGORY': {
      const isAdultLocked = action.payload === 'adults' && !state.unlockedCategories.includes('adults');
      return { 
        ...state, 
        selectedCategory: action.payload,
        unlockedCategories: isAdultLocked ? [...state.unlockedCategories, 'adults'] : state.unlockedCategories
      };
    }
    case 'SET_TIMER': return { ...state, timerDuration: action.payload };
    case 'START_GAME': {
      const cat = WORD_PACKS[state.selectedCategory].words;
      const word = cat[Math.floor(Math.random() * cat.length)];
      const maxImps = Math.max(1, Math.floor(state.players.length / 3));
      const adjustedImps = Math.min(state.imposterCount, maxImps);
      const roles = assignRoles(state.players, adjustedImps);
      const initialScores = state.round === 1 ? state.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}) : state.scores;
      
      return {
        ...state,
        imposterCount: adjustedImps,
        secretWord: word.toUpperCase(),
        playerRoles: roles,
        currentRevealIndex: 0,
        screen: 'roleReveal',
        timeRemaining: state.timerDuration,
        votes: {},
        voteTally: {},
        imposterCaught: false,
        imposterWordGuess: '',
        wordGuessedRight: false,
        scores: initialScores,
        lastRoundScores: {},
        mostVotedId: null,
      };
    }
    case 'NEXT_REVEAL': return { ...state, currentRevealIndex: state.currentRevealIndex + 1 };
    case 'START_DISCUSSION': return { ...state, screen: 'discussion', timeRemaining: state.timerDuration };
    case 'TICK_TIMER': return { ...state, timeRemaining: Math.max(0, state.timeRemaining - 1) };
    case 'END_DISCUSSION': return { ...state, screen: 'voting', votes: {} };
    case 'CAST_VOTE': return { ...state, votes: { ...state.votes, [action.payload.voterId]: action.payload.targetId } };
    case 'CALCULATE_RESULTS': {
      const tally: Record<string, number> = {};
      Object.values(state.votes).forEach((tId: any) => tally[tId] = (tally[tId] || 0) + 1);
      
      let max = 0;
      let mostVotedIds: string[] = [];
      for (const [id, count] of Object.entries(tally)) {
        if (count > max) { max = count; mostVotedIds = [id]; }
        else if (count === max) { mostVotedIds.push(id); }
      }
      
      // If tie, no one is eliminated. imposter wins.
      const isTie = mostVotedIds.length !== 1;
      const mostVotedId = isTie ? null : mostVotedIds[0];
      const imposterCaught = !isTie && (state.playerRoles.find(p => p.id === mostVotedId)?.role === 'imposter');

      return { ...state, voteTally: tally, imposterCaught, screen: 'results', mostVotedId };
    }
    case 'SUBMIT_GUESS': {
      const guessedRight = action.payload.trim().toLowerCase() === state.secretWord.toLowerCase();
      return { ...state, imposterWordGuess: action.payload, wordGuessedRight: guessedRight };
    }
    case 'TALLY_SCORE': {
      const lastRoundScores: Record<string, number> = {};
      const newScores = { ...state.scores };
      
      state.playerRoles.forEach(p => {
        let pts = 0;
        if (p.role === 'imposter') {
           if (!state.imposterCaught) pts += 2;
           if (state.wordGuessedRight) pts += 1;
        } else {
           if (state.imposterCaught) pts += 1;
        }
        lastRoundScores[p.id] = pts;
        newScores[p.id] = (newScores[p.id] || 0) + pts;
      });
      return { ...state, screen: 'scoreboard', scores: newScores, lastRoundScores };
    }
    case 'NEXT_ROUND': {
      if (state.round >= state.maxRounds) return { ...state, screen: 'gameOver' };
      return { ...state, round: state.round + 1, screen: 'setup' };
    }
    case 'HOME': return { ...INITIAL_STATE, players: state.players };
    default: return state;
  }
}

// --- SCREENS ---

const HomeScreen = ({ dispatch }: any) => (
  <FadeIn delay={100} style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: THEME.accent,
          left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%`,
          animation: `float ${3 + Math.random()*3}s ease-in-out infinite step-end`
        }} />
      ))}
    </div>
    
    <div style={{ textAlign: 'center', zIndex: 10, width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: FONTS.display, fontSize: '72px', color: '#fff', margin: 0, letterSpacing: '-0.05em', fontStyle: 'italic', fontWeight: 900, textShadow: `0 0 40px ${THEME.accent}40` }}>FAKE<span style={{ color: THEME.accent }}>IT</span></h1>
      <div style={{ width: '60px', height: '4px', backgroundColor: THEME.accent, margin: '8px auto 24px', borderRadius: '2px' }} />
      <p style={{ fontFamily: FONTS.body, fontSize: '16px', color: THEME.textMuted, fontWeight: 500, marginBottom: '64px' }}>One of you is lying. Find them.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button text="START GAME" onClick={() => dispatch({ type: 'GOTO', payload: 'setup' })} />
        <Button text="HOW TO PLAY" variant="outline" onClick={() => dispatch({ type: 'TOGGLE_HOW_TO_PLAY' })} />
      </div>
      <p style={{ marginTop: '32px', fontSize: '12px', color: THEME.textDim }}>v1.0.0</p>
    </div>
  </FadeIn>
);

const SetupScreen = ({ state, dispatch }: any) => {
  const [name, setName] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const addPlayer = () => {
    if (name.trim()) { dispatch({ type: 'ADD_PLAYER', payload: name }); setName(''); }
  };

  const handleStart = () => {
    if (state.players.length < 3) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }
    dispatch({ type: 'START_GAME' });
  };

  return (
    <FadeIn style={{ padding: '24px 20px', overflowY: 'auto' }} className="hide-scrollbar">
      <h2 style={{ fontFamily: FONTS.body, fontSize: '12px', fontWeight: 'bold', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>WHO'S PLAYING?</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input 
          value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()}
          placeholder="Enter player name..."
          style={{ flex: 1, backgroundColor: THEME.surfaceSolid, border: `1px solid ${THEME.border}`, color: THEME.text, padding: '16px', borderRadius: '14px', fontFamily: FONTS.body, fontSize: '16px', outline: 'none' }}
        />
        <Button text="+" onClick={addPlayer} style={{ width: '56px', padding: 0 }} />
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px', minHeight: '40px' }}>
        {state.players.map((p: any) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: THEME.surfaceHover, padding: '8px 12px', borderRadius: '999px', border: `1px solid ${THEME.border}` }}>
            <span style={{ fontSize: '14px', marginRight: '6px' }}>{p.avatar}</span>
            <span style={{ fontSize: '14px', fontWeight: 600, marginRight: '8px', color: p.color }}>{p.name}</span>
            <button onClick={() => dispatch({ type: 'REMOVE_PLAYER', payload: p.id })} style={{ background: 'none', border: 'none', color: THEME.textMuted, fontSize: '18px', cursor: 'pointer', padding: 0, lineHeight: 1 }}>&times;</button>
          </div>
        ))}
        {state.players.length === 0 && <span style={{ color: THEME.textDim, fontSize: '14px', alignSelf: 'center' }}>Add at least 3 players...</span>}
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: FONTS.body, fontSize: '12px', fontWeight: 'bold', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>IMPOSTERS</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => dispatch({ type: 'SET_IMPOSTER_COUNT', payload: Math.max(1, state.imposterCount - 1) })} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: THEME.surface, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '20px', cursor: 'pointer' }}>-</button>
          <span style={{ fontFamily: FONTS.display, fontSize: '24px', fontWeight: 800, width: '30px', textAlign: 'center' }}>{Math.min(state.imposterCount, Math.max(1, Math.floor(state.players.length / 3)))}</span>
          <button onClick={() => dispatch({ type: 'SET_IMPOSTER_COUNT', payload: Math.min(Math.floor(state.players.length / 3), state.imposterCount + 1) })} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: THEME.surface, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '20px', cursor: 'pointer' }}>+</button>
        </div>
        <p style={{ marginTop: '8px', fontSize: '12px', color: THEME.textDim }}>1 imposter recommended for 3–5 players</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: FONTS.body, fontSize: '12px', fontWeight: 'bold', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>TOPIC CATEGORY</p>
        <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '4px' }}>
          {Object.entries(WORD_PACKS).map(([key, pack]) => {
            const isSelected = state.selectedCategory === key;
            const isUnlocked = state.unlockedCategories.includes(key);
            return (
              <button key={key} onClick={() => dispatch({ type: 'SET_CATEGORY', payload: key })} style={{
                flexShrink: 0, padding: '12px 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: isSelected ? 'rgba(255,45,85,0.1)' : THEME.surfaceSolid,
                border: `1.5px solid ${isSelected ? THEME.accent : THEME.border}`,
                color: isSelected ? THEME.text : THEME.textMuted, fontFamily: FONTS.body, fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <span>{pack.emoji}</span> {pack.label} {pack.locked && !isUnlocked && ' 🔒'}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: FONTS.body, fontSize: '12px', fontWeight: 'bold', color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>DISCUSSION TIME</p>
        <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: THEME.surfaceSolid, borderRadius: '14px', border: `1px solid ${THEME.border}` }}>
          {[30, 60, 90, 120].map(opt => (
            <button key={opt} onClick={() => dispatch({ type: 'SET_TIMER', payload: opt })} style={{
              flex: 1, padding: '12px 0', border: 'none', borderRadius: '10px',
              backgroundColor: state.timerDuration === opt ? THEME.accent : 'transparent',
              color: state.timerDuration === opt ? '#fff' : THEME.textMuted,
              fontFamily: FONTS.body, fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {opt}s
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', animation: errorShake ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : 'none' }}>
        <Button text="START MATCH →" onClick={handleStart} />
        <div style={{ textAlign: 'center', marginTop: '16px', color: THEME.textDim, fontSize: '12px' }}>
          ROUND {state.round} OF {state.maxRounds}
        </div>
      </div>
    </FadeIn>
  );
};

const RoleRevealScreen = ({ state, dispatch }: any) => {
  const [flipped, setFlipped] = useState(false);
  const [showAllReady, setShowAllReady] = useState(false);

  useEffect(() => {
    if (state.currentRevealIndex >= state.players.length) {
      setShowAllReady(true);
      const t = setTimeout(() => dispatch({ type: 'START_DISCUSSION' }), 1500);
      return () => clearTimeout(t);
    }
  }, [state.currentRevealIndex]);

  if (showAllReady) {
    return (
      <FadeIn style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.accent, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: FONTS.display, fontSize: '40px', textAlign: 'center', color: '#fff' }}>ALL READY</h1>
        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>LET THE GAME BEGIN</p>
      </FadeIn>
    );
  }

  const cp = state.playerRoles[state.currentRevealIndex];
  if (!cp) return null;

  return (
    <FadeIn key={state.currentRevealIndex} style={{ padding: '24px 20px', alignItems: 'center' }}>
      <p style={{ fontFamily: FONTS.body, fontSize: '14px', color: THEME.textMuted, fontWeight: 600, marginBottom: '40px', letterSpacing: '1px' }}>
        PLAYER {state.currentRevealIndex + 1} OF {state.players.length}
      </p>
      
      <div style={{ perspective: '1000px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '100%', height: '360px', position: 'relative', transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', cursor: flipped ? 'default' : 'pointer'
        }} onClick={() => { if (!flipped) { soundEngine.playFlip(); setFlipped(true); } }}>
          
          {/* Front (Face Down) */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', backgroundColor: THEME.surfaceSolid,
            border: `2px solid ${THEME.border}`, borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <h2 style={{ fontFamily: FONTS.display, fontSize: '28px', color: '#fff', marginBottom: '16px' }}>Pass to <span style={{ color: cp.color }}>{cp.name}</span></h2>
            <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: THEME.surfaceHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: THEME.textDim, marginBottom: '24px' }}>?</div>
            <p style={{ color: THEME.textMuted, fontSize: '14px' }}>TAP TO REVEAL</p>
            <p style={{ color: THEME.danger, fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>(Don't show others!)</p>
          </div>

          {/* Back (Face Up) */}
          <div style={{
            position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
            backgroundColor: THEME.surface, border: `2px solid ${cp.role === 'imposter' ? THEME.accent : THEME.accentAlt}`,
            borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px',
            boxShadow: `0 0 40px ${cp.role === 'imposter' ? 'rgba(255,45,85,0.2)' : 'rgba(0,245,160,0.1)'}`
          }}>
            <div style={{ padding: '8px 16px', borderRadius: '999px', backgroundColor: cp.role === 'imposter' ? 'rgba(255,45,85,0.1)' : 'rgba(0,245,160,0.1)', color: cp.role === 'imposter' ? THEME.accent : THEME.accentAlt, fontWeight: 800, fontSize: '14px', letterSpacing: '1px', marginBottom: '32px' }}>
              {cp.role === 'imposter' ? '🔴 IMPOSTER' : '🟢 PLAYER'}
            </div>
            
            <h2 style={{ fontFamily: FONTS.display, fontSize: '42px', color: cp.role === 'imposter' ? THEME.textDim : '#fff', textAlign: 'center', marginBottom: '8px', letterSpacing: '-1px' }}>
              {cp.role === 'imposter' ? '???' : state.secretWord}
            </h2>
            <p style={{ color: THEME.textMuted, fontSize: '14px', marginBottom: '40px' }}>
              {WORD_PACKS[state.selectedCategory].label}
            </p>
            
            <p style={{ textAlign: 'center', color: THEME.text, fontSize: '16px', lineHeight: 1.5, padding: '0 16px' }}>
              {cp.role === 'imposter' ? "You don't know the word.\nListen. Bluff. Survive." : "Give carefully vague clues.\nFind the imposter."}
            </p>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '56px', position: 'relative' }}>
         <div style={{ position: 'absolute', width: '100%', transition: 'opacity 0.3s', opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none' }}>
           <Button text="DONE — PASS PHONE →" variant="outline" onClick={() => {
             setFlipped(false);
             setTimeout(() => dispatch({ type: 'NEXT_REVEAL' }), 200);
           }} />
         </div>
      </div>
    </FadeIn>
  );
};

const DiscussionScreen = ({ state, dispatch }: any) => {
  useEffect(() => {
    if (state.timeRemaining > 0) {
      const t = setTimeout(() => {
        soundEngine.playTick();
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [state.timeRemaining]);

  const percentage = state.timeRemaining / state.timerDuration;
  const dashoffset = 283 - (283 * percentage);
  
  let color = THEME.accentAlt;
  if (percentage <= 0.5) color = THEME.accentGold;
  if (percentage <= 0.25) color = THEME.danger;

  return (
    <FadeIn style={{ padding: '24px 20px', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: '18px', fontWeight: 800, color: THEME.textMuted }}>ROUND {state.round}</div>
      </div>

      <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '40px' }}>
        <svg width="160" height="160" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke={THEME.border} strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray="283" strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.display, fontSize: '48px', fontWeight: 800 }}>
          {state.timeRemaining}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '40px' }}>
        <div style={{
          backgroundColor: THEME.surfaceSolid, border: `2px solid ${THEME.border}`, width: '100%', padding: '40px 20px', 
          borderRadius: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, #1C1C2E, transparent)`, opacity: 0.5 }}></div>
          <p style={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '14px', marginBottom: '16px', position: 'relative', zIndex: 10 }}>The Secret Word</p>
          <h2 style={{ fontFamily: FONTS.display, fontSize: '48px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.05em', color: '#F5F5F7', position: 'relative', zIndex: 10, margin: 0, lineHeight: 1 }}>
            {state.secretWord}
          </h2>
          <div style={{ marginTop: '24px', padding: '6px 16px', backgroundColor: 'rgba(0, 245, 160, 0.1)', border: '1px solid rgba(0, 245, 160, 0.2)', borderRadius: '999px', color: THEME.accentAlt, fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', position: 'relative', zIndex: 10 }}>
            {WORD_PACKS[state.selectedCategory].label}
          </div>
        </div>
        <p style={{ color: THEME.text, fontSize: '14px', fontStyle: 'italic', marginTop: '24px', textAlign: 'center' }}>"Everyone give ONE clue. Imposters, blend in."</p>
      </div>

      <Button text={state.timeRemaining === 0 ? "START VOTING →" : "SKIP TO VOTE"} variant={state.timeRemaining === 0 ? "primary" : "outline"} onClick={() => dispatch({ type: 'END_DISCUSSION' })} />
    </FadeIn>
  );
};

const VotingScreen = ({ state, dispatch }: any) => {
  const [voterIndex, setVoterIndex] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const currentVoter = state.players[voterIndex];
  const isDone = voterIndex >= state.players.length;

  useEffect(() => {
    if (isDone) {
      dispatch({ type: 'CALCULATE_RESULTS' });
    }
  }, [isDone]);

  if (isDone || !currentVoter) return null;

  const handleConfirm = () => {
    if (selectedTarget) {
      soundEngine.playVote();
      dispatch({ type: 'CAST_VOTE', payload: { voterId: currentVoter.id, targetId: selectedTarget } });
      setSelectedTarget(null);
      setVoterIndex(i => i + 1);
    }
  };

  return (
    <FadeIn key={currentVoter.id} style={{ padding: '24px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: FONTS.body, fontSize: '14px', color: THEME.textMuted, fontWeight: 600, marginBottom: '8px' }}>
          VOTING {voterIndex + 1} OF {state.players.length}
        </p>
        <h2 style={{ fontFamily: FONTS.display, fontSize: '28px', color: '#fff', lineHeight: 1.2 }}>
          <span style={{ color: currentVoter.color }}>{currentVoter.name}</span>, who is the imposter?
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1, alignContent: 'start', overflowY: 'auto' }} className="hide-scrollbar">
        {state.players.map((p: any) => {
          if (p.id === currentVoter.id) return null; // Cannot vote for self
          const isSelected = selectedTarget === p.id;
          return (
            <div key={p.id} onClick={() => setSelectedTarget(p.id)} style={{
              padding: '20px 16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: isSelected ? 'rgba(255,45,85,0.15)' : THEME.surfaceSolid,
              border: `2px solid ${isSelected ? THEME.accent : THEME.border}`,
              transform: isSelected ? 'scale(0.98)' : 'scale(1)'
            }}>
              <span style={{ fontSize: '24px' }}>{p.avatar}</span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: isSelected ? THEME.accent : p.color }}>{p.name}</span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '24px' }}>
        <Button text="CONFIRM VOTE →" onClick={handleConfirm} disabled={!selectedTarget} />
      </div>
    </FadeIn>
  );
};

const ResultsScreen = ({ state, dispatch }: any) => {
  const [phase, setPhase] = useState('tally'); // tally -> highlight -> flash -> reveal -> outcome -> guess
  const [guess, setGuess] = useState('');

  useEffect(() => {
    let t1:any, t2:any, t3:any, t4:any;
    if (phase === 'tally') t1 = setTimeout(() => setPhase('highlight'), 2000);
    if (phase === 'highlight') t2 = setTimeout(() => {
      soundEngine.playReveal();
      setPhase('flash');
    }, 1500);
    if (phase === 'flash') {
      t3 = setTimeout(() => setPhase('reveal'), 100);
      t4 = setTimeout(() => {
        if (state.imposterCaught) soundEngine.playWinPlayers();
        else soundEngine.playWinImposter();
        setPhase('outcome');
      }, 2000);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); }
  }, [phase, state.imposterCaught]);

  const sortedPlayers = [...state.players].sort((a,b) => (state.voteTally[b.id]||0) - (state.voteTally[a.id]||0));
  const isTie = state.mostVotedId === null;
  const caughtPlayer = sortedPlayers.find(p => p.id === state.mostVotedId);

  const handleGuessSubmit = () => {
    if (guess.trim()) {
      dispatch({ type: 'SUBMIT_GUESS', payload: guess });
      setPhase('outcome'); // re-render to show result
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Flash Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 100, pointerEvents: 'none', transition: 'opacity 0.4s', opacity: phase === 'flash' ? 1 : 0 }} />

      <FadeIn style={{ padding: '24px 20px', zIndex: 10 }}>
        {phase === 'tally' || phase === 'highlight' ? (
          <>
            <h2 style={{ fontFamily: FONTS.display, fontSize: '28px', color: '#fff', marginBottom: '32px', textAlign: 'center' }}>VOTES ARE IN</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {sortedPlayers.map((p, idx) => {
                const count = state.voteTally[p.id] || 0;
                const pct = state.players.length ? (count / state.players.length) * 100 : 0;
                const isHighlight = phase === 'highlight' && count > 0 && count === (state.voteTally[sortedPlayers[0].id] || 0);
                
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.4s', transform: isHighlight ? 'scale(1.05)' : 'scale(1)', zIndex: isHighlight ? 10 : 1 }}>
                    <div style={{ fontSize: '18px' }}>{p.avatar}</div>
                    <div style={{ width: '80px', fontSize: '15px', fontWeight: 600, color: isHighlight ? '#fff' : p.color }}>{p.name}</div>
                    <div style={{ flex: 1, backgroundColor: THEME.surfaceSolid, height: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: phase === 'tally' ? '0%' : `${pct}%`, 
                        backgroundColor: isHighlight ? THEME.accent : p.color,
                        transition: `width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 150}ms, background-color 0.4s` 
                      }} />
                    </div>
                    <div style={{ width: '24px', fontSize: '18px', fontWeight: 800, textAlign: 'right', color: isHighlight ? THEME.accent : THEME.text }}>{count}</div>
                  </div>
                )
              })}
            </div>
            {isTie && phase === 'highlight' && <h3 style={{ textAlign: 'center', color: THEME.textMuted, fontSize: '20px', marginTop: '24px', animation: 'float 2s infinite' }}>IT'S A TIE. NOBODY ELIMINATED.</h3>}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {state.imposterCaught ? <Confetti /> : null}
            
            <h3 style={{ fontFamily: FONTS.display, fontSize: '20px', color: THEME.textMuted, marginBottom: '16px' }}>
              {isTie ? "TIE VOTE" : `${caughtPlayer?.name} WAS`}
            </h3>
            
            <h1 style={{ fontFamily: FONTS.display, fontSize: '48px', color: state.imposterCaught ? THEME.accentAlt : THEME.accent, textAlign: 'center', lineHeight: 1.1, marginBottom: '32px', letterSpacing: '-1.5px' }}>
              {isTie ? "IMPOSTERS SURVIVED" : (state.imposterCaught ? "THE IMPOSTER!" : "NOT THE IMPOSTER.")}
            </h1>

            {phase === 'outcome' && (
              <FadeIn delay={500} style={{ width: '100%', flex: 0 }}>
                {state.imposterCaught && state.imposterWordGuess === '' ? (
                  <Card style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, color: THEME.text, marginBottom: '16px' }}>Imposter, you have one chance to guess the word for a bonus point!</p>
                    <input 
                      value={guess} onChange={e => setGuess(e.target.value)}
                      placeholder="Type the secret word..."
                      style={{ width: '100%', backgroundColor: THEME.surfaceSolid, border: `1px solid ${THEME.border}`, color: THEME.text, padding: '16px', borderRadius: '12px', fontFamily: FONTS.body, fontSize: '16px', outline: 'none', marginBottom: '16px', textAlign: 'center' }}
                    />
                    <Button text="SUBMIT GUESS" onClick={handleGuessSubmit} disabled={!guess.trim()} />
                  </Card>
                ) : state.imposterCaught && state.imposterWordGuess !== '' ? (
                  <Card style={{ textAlign: 'center' }}>
                     <p style={{ fontSize: '14px', color: THEME.textMuted, marginBottom: '8px' }}>They guessed: <strong style={{color:'#fff'}}>{state.imposterWordGuess}</strong></p>
                     {state.wordGuessedRight ? (
                        <h2 style={{ color: THEME.accentAlt, fontFamily: FONTS.display, fontSize: '24px' }}>Correct! (+1 Bonus)</h2>
                     ) : (
                        <h2 style={{ color: THEME.danger, fontFamily: FONTS.display, fontSize: '24px' }}>Wrong! Word was {state.secretWord}.</h2>
                     )}
                     <div style={{ marginTop: '24px' }}>
                       <Button text="CONTINUE →" onClick={() => dispatch({ type: 'TALLY_SCORE' })} />
                     </div>
                  </Card>
                ) : (
                  <div style={{ marginTop: 'auto', width: '100%' }}>
                     <p style={{ textAlign: 'center', color: THEME.textMuted, marginBottom: '24px' }}>The Imposters win this round.</p>
                     <Button text="CONTINUE →" onClick={() => dispatch({ type: 'TALLY_SCORE' })} />
                  </div>
                )}
              </FadeIn>
            )}
          </div>
        )}
      </FadeIn>
    </div>
  );
};

const ScoreboardScreen = ({ state, dispatch }: any) => {
  const sorted = [...state.players].sort((a,b) => (state.scores[b.id]||0) - (state.scores[a.id]||0));

  return (
    <FadeIn style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontFamily: FONTS.display, fontSize: '24px', color: THEME.textMuted, textAlign: 'center', marginBottom: '32px' }}>ROUND {state.round} COMPLETE</h2>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }} className="hide-scrollbar">
        {sorted.map((p, i) => {
          const score = state.scores[p.id] || 0;
          const gained = state.lastRoundScores[p.id] || 0;
          return (
            <Card key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px' }}>
              <div style={{ width: '32px', fontSize: '24px', fontWeight: 800, color: i === 0 ? THEME.accentGold : THEME.textDim }}>#{i+1}</div>
              <div style={{ fontSize: '20px' }}>{p.avatar}</div>
              <div style={{ flex: 1, fontSize: '18px', fontWeight: 600, color: i === 0 ? THEME.accentGold : p.color }}>{p.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                 <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: FONTS.display }}>{score}</div>
                 {gained > 0 && <div style={{ fontSize: '12px', color: THEME.accentAlt, fontWeight: 800, animation: 'slideInRight 0.5s ease forwards' }}>+{gained} pts</div>}
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{ padding: '20px 0', fontSize: '12px', color: THEME.textDim, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>• Catch Imposter: +1 pt</div>
        <div>• Imposter Survives: +2 pts</div>
        <div>• Imposter Word Guess: +1 pt</div>
      </div>

      <Button text={state.round >= state.maxRounds ? "FINISH GAME" : "NEXT ROUND →"} onClick={() => dispatch({ type: 'NEXT_ROUND' })} />
    </FadeIn>
  );
};

const GameOverScreen = ({ state, dispatch }: any) => {
  const sorted = [...state.players].sort((a,b) => (state.scores[b.id]||0) - (state.scores[a.id]||0));
  const winner = sorted[0];

  return (
    <FadeIn style={{ padding: '24px 20px', alignItems: 'center', justifyContent: 'center' }}>
      <Confetti />
      <div style={{ fontSize: '80px', marginBottom: '16px', animation: 'float 3s infinite ease-in-out' }}>🏆</div>
      <h2 style={{ fontFamily: FONTS.display, fontSize: '24px', color: THEME.textMuted, marginBottom: '8px' }}>CHAMPION</h2>
      <h1 style={{ fontFamily: FONTS.display, fontSize: '56px', color: '#FFF', textAlign: 'center', marginBottom: '40px', letterSpacing: '-1px', animation: 'neonBounce 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>{winner?.name.toUpperCase()} WINS!</h1>
      
      <Card style={{ width: '100%', marginBottom: '40px' }}>
        {sorted.slice(0,3).map((p, i) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? `1px solid ${THEME.border}` : 'none' }}>
             <span style={{ fontSize: '16px', fontWeight: 600, color: i === 0 ? THEME.accentGold : p.color }}>{i+1}. {p.avatar} {p.name}</span>
             <span style={{ fontSize: '16px', fontWeight: 800, fontFamily: FONTS.display }}>{state.scores[p.id]}</span>
          </div>
        ))}
      </Card>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button text="PLAY AGAIN" onClick={() => dispatch({ type: 'GOTO', payload: 'setup' })} />
        <Button text="HOME" variant="outline" onClick={() => dispatch({ type: 'HOME' })} />
      </div>
    </FadeIn>
  );
}

const HowToPlayModal = ({ onClose }: any) => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: THEME.overlay, backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '24px 20px' }}>
    <h2 style={{ fontFamily: FONTS.display, fontSize: '32px', color: '#fff', marginBottom: '24px', marginTop: '24px' }}>HOW TO PLAY</h2>
    
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }} className="hide-scrollbar">
      <Card>
         <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
         <p style={{ fontSize: '15px', color: THEME.text, lineHeight: 1.5 }}><strong>Everyone gets a role.</strong> Look at your phone secretly. You are either a Player or an Imposter.</p>
      </Card>
      <Card>
         <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗣️</div>
         <p style={{ fontSize: '15px', color: THEME.text, lineHeight: 1.5 }}><strong>Players know the secret word.</strong> Imposters don't have a clue what the word is.</p>
      </Card>
      <Card>
         <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
         <p style={{ fontSize: '15px', color: THEME.text, lineHeight: 1.5 }}><strong>Take turns giving ONE clue.</strong> Players must prove they know the word without being too obvious. Imposters must bluff to blend in.</p>
      </Card>
      <Card>
         <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗳️</div>
         <p style={{ fontSize: '15px', color: THEME.text, lineHeight: 1.5 }}><strong>Time to vote.</strong> Discuss and vote for who you think the Imposter is.</p>
      </Card>
      <Card>
         <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
         <p style={{ fontSize: '15px', color: THEME.text, lineHeight: 1.5 }}><strong>Win.</strong> Players win if they catch all Imposters. Imposters win if they survive!</p>
      </Card>
    </div>

    <div style={{ marginTop: '24px' }}>
      <Button text="GOT IT" onClick={onClose} />
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    soundEngine.initializeOnInteraction();

    // Dynamic import for Google Fonts injected into head.
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); }
  }, []);

  return (
    <div style={{
      height: '100dvh', width: '100vw', backgroundColor: THEME.bg, color: THEME.text,
      fontFamily: FONTS.body, display: 'flex', justifyContent: 'center', overflow: 'hidden', position: 'relative'
    }}>
      <GlobalStyles />
      <div style={{ position: 'absolute', top: '-10%', left: '-20%', width: '60vw', height: '60vh', backgroundColor: THEME.accent, opacity: 0.05, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: '60vw', height: '60vh', backgroundColor: THEME.accentPurple, opacity: 0.05, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
      
      <div style={{ width: '100%', maxWidth: '420px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        
        {state.screen === 'home' && <HomeScreen dispatch={dispatch} />}
        {state.screen === 'setup' && <SetupScreen state={state} dispatch={dispatch} />}
        {state.screen === 'roleReveal' && <RoleRevealScreen state={state} dispatch={dispatch} />}
        {state.screen === 'discussion' && <DiscussionScreen state={state} dispatch={dispatch} />}
        {state.screen === 'voting' && <VotingScreen state={state} dispatch={dispatch} />}
        {state.screen === 'results' && <ResultsScreen state={state} dispatch={dispatch} />}
        {state.screen === 'scoreboard' && <ScoreboardScreen state={state} dispatch={dispatch} />}
        {state.screen === 'gameOver' && <GameOverScreen state={state} dispatch={dispatch} />}

        {state.showHowToPlay && <HowToPlayModal onClose={() => dispatch({ type: 'TOGGLE_HOW_TO_PLAY' })} />}

      </div>
    </div>
  );
}
