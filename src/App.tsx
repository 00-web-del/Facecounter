/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import cloudbase from "@cloudbase/js-sdk";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Psychology, 
  AccountCircle, 
  UploadFile, 
  Terminal, 
  Analytics, 
  Brush, 
  ChevronRight, 
  Home as HomeIcon, 
  Equalizer, 
  Book, 
  Settings,
  ArrowBack,
  Share,
  Quiz,
  Timer,
  Verified,
  TrendingUp,
  Description,
  AddCircle,
  History,
  Person,
  SmartToy,
  Mic,
  Send,
  Login as LoginIcon,
  Visibility,
  Check,
  Lightbulb
} from './components/Icons';
import { Screen, Interview, Message, UserProfile } from './types';
import { getAIResponse, getInterviewFeedback } from './services/geminiService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const STATS_DATA = [
  { name: '1月', score: 65 },
  { name: '2月', score: 72 },
  { name: '3月', score: 68 },
  { name: '4月', score: 82 },
  { name: '5月', score: 78 },
  { name: '6月', score: 85 },
];

// Mock Data
const MOCK_INTERVIEWS: Interview[] = [
  {
    id: '1',
    role: '高级软件工程师',
    status: 'COMPLETED',
    score: 82,
    duration: '15分钟',
    questionsCount: 5,
    strengths: ['表达清晰专业', '技术知识扎实', '肢体语言自信'],
    improvements: ['运用 STAR 原则', '言简意赅'],
  },
  {
    id: '2',
    role: '产品经理',
    status: 'COMPLETED',
    score: 75,
    duration: '20分钟',
    questionsCount: 8,
  },
  {
    id: '3',
    role: 'UI/UX设计师',
    status: 'DRAFT',
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [interviews, setInterviews] = useState<Interview[]>(MOCK_INTERVIEWS);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const saveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeInterview?.messages, isTyping]);

  const startNewInterview = (role: string = '软件工程师') => {
    const welcomeMsg = userProfile?.name 
      ? `你好，${userProfile.name}！我是你的 AI 教练。今天我们将重点关注 ${role} 的面试。首先，你能告诉我一次你带领团队度过重大挑战的经历吗？`
      : `你好！我是你的 AI 教练。今天我们将重点关注 ${role} 的面试。首先，你能告诉我一次你带领团队度过重大挑战的经历吗？`;

    const newInterview: Interview = {
      id: Date.now().toString(),
      role: role,
      status: 'DRAFT',
      messages: [
        {
          id: '1',
          role: 'ai',
          content: welcomeMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setActiveInterview(newInterview);
    setCurrentScreen(Screen.INTERVIEW);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeInterview) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...(activeInterview.messages || []), userMessage];
    setActiveInterview({ ...activeInterview, messages: updatedMessages });
    setInputText('');
    setIsTyping(true);

    try {
      let systemPrompt = `你是一个专业的AI面试教练，名叫Facecounter。你的目标是帮助用户练习面试。请保持专业、鼓励且具有挑战性。目前的面试职位是：${activeInterview.role}。`;
      
      if (userProfile) {
        systemPrompt += `\n用户信息：
        - 姓名：${userProfile.name || '未提供'}
        - 当前职位：${userProfile.currentJob || '未提供'}
        - 目标职位：${userProfile.targetJob || '未提供'}
        - 工作经验：${userProfile.experience || '未提供'}
        
        请根据用户的目标职位询问相关的面试问题。如果他们目标是产品经理，重点关注产品感、策略和行为面试题。偶尔可以称呼用户的名字。`;
      }

      const aiResponseText = await getAIResponse(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        systemPrompt
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveInterview(prev => prev ? { ...prev, messages: [...(prev.messages || []), aiMessage] } : null);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const finishInterview = async () => {
    if (!activeInterview) return;
    setIsTyping(true);
    
    try {
      const feedback = await getInterviewFeedback(
        (activeInterview.messages || []).map(m => ({ role: m.role, content: m.content }))
      );

      const completedInterview: Interview = {
        ...activeInterview,
        status: 'COMPLETED',
        score: feedback?.feedback?.score || 80,
        strengths: feedback?.feedback?.strengths || ['表达清晰', '逻辑性强'],
        improvements: feedback?.feedback?.improvements || ['增加具体案例', '注意语速'],
        duration: '10分钟',
        questionsCount: (activeInterview.messages?.filter(m => m.role === 'ai').length || 0)
      };

      setInterviews([completedInterview, ...interviews]);
      setActiveInterview(completedInterview);
      setCurrentScreen(Screen.RESULT);
    } catch (error) {
      console.error("Feedback Error:", error);
      setCurrentScreen(Screen.HOME);
    } finally {
      setIsTyping(false);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.LOGIN:
        return <LoginScreen onLogin={() => setCurrentScreen(Screen.HOME)} onGoToSignUp={() => setCurrentScreen(Screen.SIGNUP)} />;
      case Screen.SIGNUP:
        return <SignUpScreen onSignUp={() => setCurrentScreen(Screen.ONBOARDING)} onGoToLogin={() => setCurrentScreen(Screen.LOGIN)} />;
      case Screen.ONBOARDING:
        return <OnboardingScreen onComplete={(profile) => {
          saveProfile(profile);
          setCurrentScreen(Screen.HOME);
        }} onSkip={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.HOME:
        return <HomeScreen 
          interviews={interviews} 
          onStart={() => setCurrentScreen(Screen.SETUP)} 
          onLogout={() => setCurrentScreen(Screen.LOGIN)}
          onNavigate={(s) => setCurrentScreen(s)}
          onViewResult={(id) => {
            const interview = interviews.find(i => i.id === id);
            if (interview && interview.status === 'COMPLETED') {
              setActiveInterview(interview);
              setCurrentScreen(Screen.RESULT);
            }
          }} 
        />;
      case Screen.SETUP:
        return <SetupInterviewScreen onBack={() => setCurrentScreen(Screen.HOME)} onConfirm={startNewInterview} />;
      case Screen.INTERVIEW:
        return (
          <InterviewScreen 
            interview={activeInterview} 
            isTyping={isTyping} 
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSendMessage}
            onFinish={finishInterview}
            onBack={() => setCurrentScreen(Screen.HOME)}
            chatEndRef={chatEndRef}
          />
        );
      case Screen.RESULT:
        return <ResultScreen interview={activeInterview} onBack={() => setCurrentScreen(Screen.HOME)} onRestart={() => setCurrentScreen(Screen.SETUP)} />;
      case Screen.ANALYSIS:
        return <AnalysisScreen onBack={() => setCurrentScreen(Screen.HOME)} onNavigate={(s) => setCurrentScreen(s)} />;
      case Screen.QUESTION_BANK:
        return <QuestionBankScreen onBack={() => setCurrentScreen(Screen.HOME)} onNavigate={(s) => setCurrentScreen(s)} />;
      case Screen.SETTINGS:
        return <SettingsScreen onBack={() => setCurrentScreen(Screen.HOME)} onLogout={() => setCurrentScreen(Screen.LOGIN)} onNavigate={(s) => setCurrentScreen(s)} />;
      default:
        return <HomeScreen 
          interviews={interviews} 
          onStart={() => setCurrentScreen(Screen.SETUP)} 
          onLogout={() => setCurrentScreen(Screen.LOGIN)}
          onNavigate={(s) => setCurrentScreen(s)}
          onViewResult={() => {}} 
        />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background-light flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col relative z-10"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full -z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

// --- Sub-Screens ---

function LoginScreen({ onLogin, onGoToSignUp }: { onLogin: () => void, onGoToSignUp: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const appRef = useRef(null);
  if (!appRef.current) {
    appRef.current = cloudbase.init({
      env: "facecounter-env-7g2jbdgb64fe92b4"
    });
  }
  const auth = appRef.current.auth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await auth.signInWithEmailAndPassword(email, password);
      onLogin();
    } catch (err) {
      setError(err.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <span className="text-primary font-bold tracking-tight text-sm uppercase">Facecounter</span>
            <h1 className="text-3xl font-extrabold mt-4 mb-2">欢迎回来</h1>
            <p className="text-slate-500">登录以继续您的面试练习并决胜下一场面试。</p>
          </div>
          
          <div className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            
            <div>
              <label className="block text-sm font-semibold mb-1">邮箱</label>
              <input
                className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                placeholder="例如：alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-semibold">密码</label>
                <button className="text-sm font-semibold text-primary">忘记密码？</button>
              </div>
              <div className="relative">
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="absolute right-3 top-3 text-slate-400">
                  <Visibility size={20} />
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? '登录中...' : '登录'}
              <LoginIcon size={18} />
            </button>
          </div>
          
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-2 text-xs text-slate-400 uppercase">或通过以下方式继续</span>
          </div>
          
          <button className="w-full h-12 border border-slate-300 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            还没有账号？{' '}
            <button onClick={onGoToSignUp} className="text-primary font-semibold hover:underline">
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignUpScreen({ onSignUp, onGoToLogin }: { onSignUp: () => void, onGoToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const appRef = useRef(null);
  if (!appRef.current) {
    appRef.current = cloudbase.init({
      env: "facecounter-env-7g2jbdgb64fe92b4"
    });
  }
  const auth = appRef.current.auth();

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await auth.signUpWithEmailAndPassword(email, password);
      alert('注册成功！请登录您的邮箱点击验证链接激活账号');
      onGoToLogin();
    } catch (err) {
      setError(err.message || '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <span className="text-primary font-bold tracking-tight text-sm uppercase">Facecounter</span>
            <h1 className="text-3xl font-extrabold mt-4 mb-2">创建账号</h1>
            <p className="text-slate-500">开启您的 AI 面试教练之旅。</p>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">邮箱</label>
              <input
                className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                placeholder="例如：alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">密码</label>
              <div className="relative">
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                  type="password"
                  placeholder="至少6位密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? '注册中...' : '立即注册'}
            </button>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              已有账号？{' '}
              <button onClick={onGoToLogin} className="text-primary font-semibold hover:underline">
                去登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full">
      <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <span className="text-primary font-bold tracking-tight text-sm uppercase">Facecounter</span>
            <h1 className="text-3xl font-extrabold mt-4 mb-2">创建账号</h1>
            <p className="text-slate-500">开启您的 AI 面试教练之旅。</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">邮箱</label>
              <input className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" placeholder="例如：alex@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">密码</label>
              <div className="relative">
                <input className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" type="password" placeholder="••••••••" />
                <button className="absolute right-3 top-3 text-slate-400"><Visibility size={20} /></button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">确认密码</label>
              <div className="relative">
                <input className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none" type="password" placeholder="••••••••" />
                <button className="absolute right-3 top-3 text-slate-400"><Visibility size={20} /></button>
              </div>
            </div>
            <button onClick={onSignUp} className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              创建账号 <LoginIcon size={18} />
            </button>
          </div>
        </div>
        <div className="bg-slate-50 py-6 text-center border-t border-slate-200">
          <p className="text-sm text-slate-500">已有账号？ <button onClick={onGoToLogin} className="text-primary font-bold">立即登录</button></p>
        </div>
      </div>
    </div>
  );

function OnboardingScreen({ onComplete, onSkip }: { onComplete: (profile: UserProfile) => void, onSkip: () => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    currentJob: '',
    targetJob: '',
    experience: 'Less than 1 year',
    industry: ''
  });

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold mb-2">个性化您的体验</h1>
        <p className="text-slate-500 text-sm">告诉我们更多关于您的信息，以便 AI 提供更好的建议。</p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">真实姓名</label>
          <input 
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
            placeholder="例如：张三"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">当前职位</label>
          <input 
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
            placeholder="例如：前端开发工程师"
            value={profile.currentJob}
            onChange={(e) => setProfile({...profile, currentJob: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">目标职位</label>
          <input 
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
            placeholder="例如：产品经理"
            value={profile.targetJob}
            onChange={(e) => setProfile({...profile, targetJob: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">工作经验</label>
          <select 
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white"
            value={profile.experience}
            onChange={(e) => setProfile({...profile, experience: e.target.value})}
          >
            <option>Less than 1 year</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
            <option>5-10 years</option>
            <option>10+ years</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">所属行业 (可选)</label>
          <input 
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" 
            placeholder="例如：互联网、金融"
            value={profile.industry}
            onChange={(e) => setProfile({...profile, industry: e.target.value})}
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button 
          onClick={() => onComplete(profile)}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          保存并继续
        </button>
        <button 
          onClick={onSkip}
          className="w-full h-14 bg-slate-100 text-slate-500 font-bold rounded-xl active:scale-95 transition-transform"
        >
          暂时跳过
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ interviews, onStart, onViewResult, onLogout, onNavigate }: { interviews: Interview[], onStart: () => void, onViewResult: (id: string) => void, onLogout: () => void, onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white/80 backdrop-blur-md border-b border-primary/10 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg text-white"><Psychology size={24} /></div>
          <h1 className="text-lg font-bold tracking-tight">Facecounter</h1>
        </div>
        <button onClick={onLogout} className="w-10 h-10 rounded-full hover:bg-primary/10 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
          <AccountCircle size={24} />
        </button>
      </header>
      
      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-24">
        <section className="relative overflow-hidden rounded-2xl shadow-sm border border-primary/10 p-6 text-center space-y-4 min-h-[240px] flex flex-col justify-center">
          <div className="absolute inset-0 -z-10">
            <img 
              src="https://picsum.photos/seed/ai-tech-bg/800/600?blur=2" 
              alt="Background" 
              className="w-full h-full object-cover opacity-10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white"></div>
          </div>
          <div className="flex justify-center gap-4 relative z-10">
            <div className="w-16 h-20 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center text-red-500 shadow-sm">
              <Description size={32} />
              <span className="text-[10px] font-bold uppercase mt-1">PDF</span>
            </div>
            <div className="w-16 h-20 bg-blue-50 border border-blue-100 rounded-lg flex flex-col items-center justify-center text-blue-500 shadow-sm">
              <Description size={32} />
              <span className="text-[10px] font-bold uppercase mt-1">Word</span>
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <h2 className="text-xl font-bold tracking-tight">为您的职场飞跃做好准备</h2>
            <p className="text-slate-500 text-sm">我们的 AI 会分析您的简历，为您生成个性化的面试题目。</p>
          </div>
          <button onClick={onStart} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform relative z-10">
            <UploadFile size={20} /> 上传简历
          </button>
          <p className="text-xs text-slate-400 italic relative z-10">支持 PDF, DOCX (最大 5MB)</p>
        </section>

        {/* New Feature Preview Section (Representing image3) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold flex items-center gap-2"><SmartToy size={20} className="text-primary" /> 模拟面试预览</h3>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden border border-primary/10 shadow-sm group cursor-pointer">
            <div className="relative h-40 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/professional-interview/600/300" 
                alt="AI Interview Preview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex flex-col justify-end p-4">
                <p className="text-white font-bold">沉浸式 AI 对话体验</p>
                <p className="text-white/90 text-xs">实时语音与文字互动，还原真实面试场景</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold flex items-center gap-2"><History size={20} className="text-primary" /> 往期面试</h3>
            <button className="text-primary text-sm font-semibold">查看全部</button>
          </div>
          <div className="space-y-3">
            {interviews.map(interview => (
              <div 
                key={interview.id} 
                onClick={() => onViewResult(interview.id)}
                className="bg-white p-4 rounded-xl border border-primary/5 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {interview.role.includes('软件') ? <Terminal size={24} /> : interview.role.includes('产品') ? <Analytics size={24} /> : <Brush size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{interview.role}</h4>
                    <p className="text-xs text-slate-500">我们的 AI 会分析您的简历，为您生成个性化的面试题目。</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${interview.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    {interview.status}
                  </span>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-primary" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="bg-white border-t border-primary/10 py-2 pb-6 flex justify-around sticky bottom-0 z-10 shadow-lg">
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center gap-1 text-primary">
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold uppercase">主页</span>
        </button>
        <button onClick={() => onNavigate(Screen.ANALYSIS)} className="flex flex-col items-center gap-1 text-slate-400">
          <Equalizer size={24} />
          <span className="text-[10px] font-bold uppercase">分析</span>
        </button>
        <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="flex flex-col items-center gap-1 text-slate-400">
          <Book size={24} />
          <span className="text-[10px] font-bold uppercase">题库</span>
        </button>
        <button onClick={() => onNavigate(Screen.SETTINGS)} className="flex flex-col items-center gap-1 text-slate-400">
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase">设置</span>
        </button>
      </nav>
    </div>
  );
}

function SetupInterviewScreen({ onBack, onConfirm }: { onBack: () => void, onConfirm: (role: string) => void }) {
  const [selectedRole, setSelectedRole] = useState('软件工程师');
  const roles = ['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师', '市场运营'];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center px-4 py-6 justify-between bg-white border-b border-slate-200">
        <button onClick={onBack} className="text-slate-600 p-1 hover:bg-slate-100 rounded-lg"><ArrowBack size={24} /></button>
        <h1 className="text-lg font-bold tracking-tight">开始新面试</h1>
        <div className="w-10"></div>
      </header>
      
      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">选择面试职位</h2>
          <div className="grid grid-cols-1 gap-3">
            {roles.map(role => (
              <button 
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${selectedRole === role ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 bg-white'}`}
              >
                <span className={`font-bold ${selectedRole === role ? 'text-primary' : 'text-slate-700'}`}>{role}</span>
                {selectedRole === role && <Check size={20} className="text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">上传简历 (可选)</h2>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
              <UploadFile size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700">点击或拖拽上传</p>
            <p className="text-xs text-slate-400">支持 PDF, DOCX (最大 5MB)</p>
          </div>
        </div>
      </main>

      <div className="p-6 bg-white border-t border-slate-200">
        <button 
          onClick={() => onConfirm(selectedRole)}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          确认并开始面试 <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function InterviewScreen({ interview, isTyping, inputText, setInputText, onSend, onFinish, onBack, chatEndRef }: any) {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full h-1 bg-slate-100">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: '35%' }}></div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600"><ArrowBack size={20} /></button>
            <div className="relative">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                <img src="https://picsum.photos/seed/ai-coach/64/64" alt="AI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Facecounter</h1>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">面试进行中...</p>
              </div>
            </div>
          </div>
          <button onClick={onFinish} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg transition-colors">结束面试</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        <div className="flex justify-center">
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-full uppercase tracking-widest">AI HR</span>
        </div>

        {interview?.messages?.map((msg: Message) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <div className="size-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden border border-primary/20">
                <img src="https://picsum.photos/seed/ai-coach/64/64" alt="AI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className={`flex flex-col gap-1.5 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <p className="text-[11px] font-bold text-slate-400">{msg.role === 'ai' ? 'AI 教练' : '您'} • {msg.timestamp}</p>
              <div className={`p-4 rounded-xl shadow-sm border ${msg.role === 'ai' ? 'bg-white border-slate-100 rounded-tl-none' : 'bg-primary text-white border-primary rounded-tr-none'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="size-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center border border-slate-300">
                <Person size={18} className="text-slate-500" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden border border-primary/20">
              <img src="https://picsum.photos/seed/ai-coach/64/64" alt="AI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1">
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
              <div className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative bg-slate-100 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-3 px-4 pr-12 resize-none hide-scrollbar placeholder:text-slate-500" 
              placeholder="在此输入您的回答..." 
              rows={1}
            />
            <button className="absolute right-2 bottom-2 p-1.5 text-slate-400 hover:text-primary"><Mic size={20} /></button>
          </div>
          <button onClick={onSend} className="bg-primary text-white size-11 rounded-xl flex items-center justify-center hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-tight">回车发送 • 您的回答将被记录以用于提供反馈</p>
      </footer>
    </div>
  );
}

function ResultScreen({ interview, onBack, onRestart }: { interview: Interview | null, onBack: () => void, onRestart: () => void }) {
  if (!interview) return null;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center px-4 py-6 justify-between bg-white border-b border-slate-200">
        <button onClick={onBack} className="text-slate-600 p-1 hover:bg-slate-100 rounded-lg"><ArrowBack size={24} /></button>
        <h1 className="text-lg font-bold tracking-tight">面试结果</h1>
        <button className="text-slate-600 p-1 hover:bg-slate-100 rounded-lg"><Share size={24} /></button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 text-center">
          <div className="relative inline-flex items-center justify-center mb-2">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-slate-200" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - (interview.score || 0) / 100)} strokeWidth="8" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-primary">{interview.score}%</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">总分</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">做得好！你展现出了强大的潜力。</p>
        </div>

        <div className="grid grid-cols-2 gap-4 px-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Quiz size={18} className="text-primary" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">回答问题</span>
            </div>
            <p className="text-2xl font-bold">{interview.questionsCount}</p>
            <p className="text-[10px] text-slate-400">个</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Timer size={18} className="text-primary" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">面试用时</span>
            </div>
            <p className="text-2xl font-bold">{interview.duration}</p>
            <p className="text-[10px] text-slate-400">总计时</p>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-primary/5 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Verified size={18} className="text-primary" />
                <h2 className="font-bold text-slate-800">优势</h2>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">{interview.strengths?.length}项</span>
            </div>
            <div className="p-4 space-y-4">
              {interview.strengths?.map((s, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{s}</p>
                    <p className="text-xs text-slate-500 mt-0.5">表现优异，继续保持。</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-500" />
                <h2 className="font-bold text-slate-800">待提升项</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase">成长空间</span>
            </div>
            <div className="p-4 space-y-4">
              {interview.improvements?.map((imp, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600">
                    <Lightbulb size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{imp}</p>
                    <p className="text-xs text-slate-500 mt-0.5">建议在后续练习中重点关注此项。</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4">
          <button className="w-full flex items-center justify-between bg-slate-100 p-4 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <Description size={20} />
              <span className="font-semibold text-sm">查看完整记录</span>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-4 pt-4 pb-8 z-50">
        <button onClick={onRestart} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95">
          <AddCircle size={20} /> 开始新面试
        </button>
        <div className="flex justify-around mt-4">
          <button onClick={onBack} className="flex flex-col items-center gap-1 text-slate-400">
            <HomeIcon size={24} />
            <span className="text-[10px] font-bold uppercase">主页</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <History size={24} />
            <span className="text-[10px] font-bold uppercase">历史</span>
          </button>
          <button onClick={onBack} className="flex flex-col items-center gap-1 text-slate-400">
            <Person size={24} />
            <span className="text-[10px] font-bold uppercase">个人</span>
          </button>
          <button onClick={onBack} className="flex flex-col items-center gap-1 text-slate-400">
            <Settings size={24} />
            <span className="text-[10px] font-bold uppercase">设置</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalysisScreen({ onBack, onNavigate }: { onBack: () => void, onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-primary/10 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-slate-600 p-1 hover:bg-slate-100 rounded-lg"><ArrowBack size={24} /></button>
          <h1 className="text-lg font-bold tracking-tight">能力分析</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-24">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 space-y-4">
          <h3 className="font-bold text-slate-800">面试得分趋势</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={STATS_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#197fe6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#197fe6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#197fe6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">平均分</p>
            <p className="text-2xl font-bold text-primary">78.5</p>
            <p className="text-[10px] text-green-500 font-bold mt-1">↑ 12% 较上月</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-primary/10 shadow-sm">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">面试次数</p>
            <p className="text-2xl font-bold text-slate-800">24</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">累计练习</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 space-y-4">
          <h3 className="font-bold text-slate-800">核心能力分布</h3>
          <div className="space-y-4">
            {[
              { label: '表达能力', value: 85 },
              { label: '专业知识', value: 72 },
              { label: '逻辑思维', value: 90 },
              { label: '自信程度', value: 65 },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-primary">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="bg-white border-t border-primary/10 py-2 pb-6 flex justify-around sticky bottom-0 z-10 shadow-lg">
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center gap-1 text-slate-400">
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold uppercase">主页</span>
        </button>
        <button onClick={() => onNavigate(Screen.ANALYSIS)} className="flex flex-col items-center gap-1 text-primary">
          <Equalizer size={24} />
          <span className="text-[10px] font-bold uppercase">分析</span>
        </button>
        <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="flex flex-col items-center gap-1 text-slate-400">
          <Book size={24} />
          <span className="text-[10px] font-bold uppercase">题库</span>
        </button>
        <button onClick={() => onNavigate(Screen.SETTINGS)} className="flex flex-col items-center gap-1 text-slate-400">
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase">设置</span>
        </button>
      </nav>
    </div>
  );
}

function QuestionBankScreen({ onBack, onNavigate }: { onBack: () => void, onNavigate: (s: Screen) => void }) {
  const categories = [
    { title: '通用行为面试', count: 120, icon: <Psychology size={20} /> },
    { title: '软件工程', count: 85, icon: <Terminal size={20} /> },
    { title: '产品经理', count: 64, icon: <Analytics size={20} /> },
    { title: 'UI/UX设计', count: 42, icon: <Brush size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-primary/10 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-slate-600 p-1 hover:bg-slate-100 rounded-lg"><ArrowBack size={24} /></button>
          <h1 className="text-lg font-bold tracking-tight">面试题库</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-24">
        <div className="relative">
          <input 
            type="text" 
            placeholder="搜索面试题..." 
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <div className="absolute left-4 top-3.5 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="bg-white p-4 rounded-2xl border border-primary/5 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{cat.title}</h4>
                  <p className="text-xs text-slate-500">{cat.count} 道精选题目</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-primary" />
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 px-1">热门题目</h3>
          <div className="space-y-3">
            {[
              "请介绍一下你自己。",
              "你最大的缺点是什么？",
              "为什么我们要录用你？",
              "你如何处理团队冲突？",
            ].map((q) => (
              <div key={q} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm font-medium text-slate-700">
                {q}
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="bg-white border-t border-primary/10 py-2 pb-6 flex justify-around sticky bottom-0 z-10 shadow-lg">
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center gap-1 text-slate-400">
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold uppercase">主页</span>
        </button>
        <button onClick={() => onNavigate(Screen.ANALYSIS)} className="flex flex-col items-center gap-1 text-slate-400">
          <Equalizer size={24} />
          <span className="text-[10px] font-bold uppercase">分析</span>
        </button>
        <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="flex flex-col items-center gap-1 text-primary">
          <Book size={24} />
          <span className="text-[10px] font-bold uppercase">题库</span>
        </button>
        <button onClick={() => onNavigate(Screen.SETTINGS)} className="flex flex-col items-center gap-1 text-slate-400">
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase">设置</span>
        </button>
      </nav>
    </div>
  );
}

function SettingsScreen({ onBack, onLogout, onNavigate }: { onBack: () => void, onLogout: () => void, onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-primary/10 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-slate-600 p-1 hover:bg-slate-100 rounded-lg"><ArrowBack size={24} /></button>
          <h1 className="text-lg font-bold tracking-tight">设置</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-24">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 flex items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 border border-primary/20 overflow-hidden">
            <img src="https://picsum.photos/seed/user-avatar/128/128" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Alex Chen</h3>
            <p className="text-sm text-slate-500">alex@example.com</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
          {[
            { label: '个人资料', icon: <Person size={20} /> },
            { label: '通知设置', icon: <Settings size={20} /> },
            { label: '隐私与安全', icon: <Verified size={20} /> },
            { label: '帮助与支持', icon: <Quiz size={20} /> },
          ].map((item, idx) => (
            <button key={item.label} className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${idx !== 3 ? 'border-b border-slate-100' : ''}`}>
              <div className="flex items-center gap-3 text-slate-700">
                <span className="text-slate-400">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          ))}
        </section>

        <button 
          onClick={onLogout}
          className="w-full p-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LoginIcon size={20} className="rotate-180" /> 退出登录
        </button>

        <div className="text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Facecounter v1.0.0</p>
          <p className="text-[10px] text-slate-400">© 2026 Facecounter AI</p>
        </div>
      </main>

      <nav className="bg-white border-t border-primary/10 py-2 pb-6 flex justify-around sticky bottom-0 z-10 shadow-lg">
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center gap-1 text-slate-400">
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold uppercase">主页</span>
        </button>
        <button onClick={() => onNavigate(Screen.ANALYSIS)} className="flex flex-col items-center gap-1 text-slate-400">
          <Equalizer size={24} />
          <span className="text-[10px] font-bold uppercase">分析</span>
        </button>
        <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="flex flex-col items-center gap-1 text-slate-400">
          <Book size={24} />
          <span className="text-[10px] font-bold uppercase">题库</span>
        </button>
        <button onClick={() => onNavigate(Screen.SETTINGS)} className="flex flex-col items-center gap-1 text-primary">
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase">设置</span>
        </button>
      </nav>
    </div>
  );
}
