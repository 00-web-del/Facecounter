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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data
const MOCK_INTERVIEWS: Interview[] = [
  {
    id: '1',
    role: '高级软件工程师',
    company: 'Google',
    date: 'October 12, 2023',
    score: 85,
    duration: '15分钟',
    questionsCount: 8,
    status: 'COMPLETED',
    messages: []
  },
  {
    id: '2',
    role: '产品经理',
    company: 'Airbnb',
    date: 'October 08, 2023',
    score: 78,
    duration: '12分钟',
    questionsCount: 6,
    status: 'COMPLETED',
    messages: []
  },
  {
    id: '3',
    role: 'UI/UX设计师',
    company: 'Figma',
    date: 'September 24, 2023',
    score: 92,
    duration: '18分钟',
    questionsCount: 10,
    status: 'COMPLETED',
    messages: []
  }
];

// 保存用户信息到 localStorage
const saveProfile = (profile: UserProfile) => {
  localStorage.setItem('user_profile', JSON.stringify(profile));
};

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeInterview?.messages]);

  const startNewInterview = (role: string = '软件工程师') => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      role,
      company: 'AI面试',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      score: 0,
      duration: '0分钟',
      questionsCount: 0,
      status: 'IN_PROGRESS',
      messages: []
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
      let systemPrompt = `你是一个专业的AI面试教练，名叫Facecounter。你的目标是帮助用户练习面试。请保持专业、鼓励且具有挑战性。目前`;
      
      if (userProfile) {
        systemPrompt += `\n用户信息：
- 姓名：${userProfile.name}
- 当前职位：${userProfile.currentJob}
- 目标职位：${userProfile.targetJob}
- 经验：${userProfile.experience}
- 行业：${userProfile.industry || '未指定'}`;
      }

      const aiResponse = await getAiResponse(updatedMessages, systemPrompt);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveInterview({ ...activeInterview, messages: [...updatedMessages, aiMessage] });
    } catch (error) {
      console.error("AI响应错误:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "抱歉，我遇到了一些问题。请稍后再试。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setActiveInterview({ ...activeInterview, messages: [...updatedMessages, errorMessage] });
    } finally {
      setIsTyping(false);
    }
  };

  const getAiResponse = async (messages: Message[], systemInstruction: string): Promise<string> => {
    // 模拟AI响应
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (messages.length <= 1) {
      return "你好！我是你的AI面试教练。请先介绍一下你自己，以及你希望面试的职位。";
    }
    
    return "很好，请继续分享更多细节。你的经验很丰富，接下来我想了解你如何处理团队协作中的挑战。";
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
        return activeInterview ? (
          <InterviewScreen
            interview={activeInterview}
            onBack={() => setCurrentScreen(Screen.HOME)}
            onSend={handleSendMessage}
            inputText={inputText}
            setInputText={setInputText}
            isTyping={isTyping}
            chatEndRef={chatEndRef}
          />
        ) : null;
      case Screen.RESULT:
        return activeInterview ? (
          <ResultScreen
            interview={activeInterview}
            onBack={() => setCurrentScreen(Screen.HOME)}
            onNew={() => {
              setCurrentScreen(Screen.SETUP);
            }}
          />
        ) : null;
      case Screen.ANALYSIS:
        return <AnalysisScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.QUESTION_BANK:
        return <QuestionBankScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.SETTINGS:
        return <SettingsScreen onBack={() => setCurrentScreen(Screen.HOME)} userProfile={userProfile} />;
      default:
        return <LoginScreen onLogin={() => setCurrentScreen(Screen.HOME)} onGoToSignUp={() => setCurrentScreen(Screen.SIGNUP)} />;
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
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const appRef = useRef(null);
  if (!appRef.current) {
    appRef.current = cloudbase.init({
      env: "facecounter-env-7g2jbdgb64fe92b4"
    });
  }
  const auth = appRef.current.auth();

  const handleSendCode = async () => {
    if (!email) {
      setError('请输入邮箱');
      return;
    }
    setIsSendingCode(true);
    setError('');
    try {
      await auth.getVerification({
        email: email
      });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || '验证码发送失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLoginWithCode = async () => {
    if (!email || !verificationCode) {
      setError('请输入邮箱和验证码');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await auth.signInWithEmail({
        email: email,
        verificationCode: verificationCode
      });
      onLogin();
    } catch (err) {
      setError(err.message || '登录失败，请检查验证码');
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
            <p className="text-slate-500">输入邮箱获取验证码即可登录/注册</p>
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
              <label className="block text-sm font-semibold mb-1">验证码</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="6位验证码"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  onClick={handleSendCode}
                  disabled={isSendingCode || countdown > 0}
                  className="w-28 h-12 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}秒` : (isSendingCode ? '发送中...' : '获取验证码')}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLoginWithCode}
              disabled={isLoading}
              className="w-full h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isLoading ? '登录中...' : '登录 / 注册'}
            </button>
            
            <p className="text-center text-sm text-slate-500 mt-4">
              还没有账号？{' '}
              <button onClick={onGoToSignUp} className="text-primary font-semibold hover:underline">
                立即注册
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignUpScreen({ onSignUp, onGoToLogin }: { onSignUp: () => void, onGoToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const appRef = useRef(null);
  if (!appRef.current) {
    appRef.current = cloudbase.init({
      env: "facecounter-env-7g2jbdgb64fe92b4"
    });
  }
  const auth = appRef.current.auth();

  const handleSendCode = async () => {
    if (!email) {
      setError('请输入邮箱');
      return;
    }
    setIsSendingCode(true);
    setError('');
    try {
      await auth.sendVerificationCode({
        email: email
      });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || '验证码发送失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSignUpWithCode = async () => {
    if (!email || !verificationCode) {
      setError('请输入邮箱和验证码');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await auth.signInWithEmail({
        email: email,
        verificationCode: verificationCode
      });
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
            <p className="text-slate-500">输入邮箱获取验证码即可注册</p>
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
              <label className="block text-sm font-semibold mb-1">验证码</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="6位验证码"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  onClick={handleSendCode}
                  disabled={isSendingCode || countdown > 0}
                  className="w-28 h-12 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}秒` : (isSendingCode ? '发送中...' : '获取验证码')}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleSignUpWithCode}
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

function OnboardingScreen({ onComplete, onSkip }: { onComplete: (profile: UserProfile) => void, onSkip: () => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    currentJob: '',
    targetJob: '',
    experience: 'Less than 1 year',
    industry: ''
  });

  const handleSubmit = () => {
    onComplete(profile);
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold mb-2">个性化您的体验</h1>
        <p className="text-slate-500">让我们更好地了解您，以便提供更精准的面试练习</p>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-semibold mb-1">姓名</label>
          <input
            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            placeholder="请输入您的姓名"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">当前职位</label>
          <input
            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            placeholder="例如：前端开发工程师"
            value={profile.currentJob}
            onChange={(e) => setProfile({ ...profile, currentJob: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">目标职位</label>
          <input
            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            placeholder="例如：产品经理"
            value={profile.targetJob}
            onChange={(e) => setProfile({ ...profile, targetJob: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">工作经验</label>
          <select
            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none bg-white"
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          >
            <option value="Less than 1 year">少于1年</option>
            <option value="1-3 years">1-3年</option>
            <option value="3-5 years">3-5年</option>
            <option value="5-10 years">5-10年</option>
            <option value="10+ years">10年以上</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">行业（可选）</label>
          <input
            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            placeholder="例如：互联网、金融"
            value={profile.industry}
            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onSkip}
          className="flex-1 h-12 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          跳过
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 h-12 bg-primary text-white font-semibold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ 
  interviews, 
  onStart, 
  onLogout, 
  onNavigate,
  onViewResult 
}: { 
  interviews: Interview[]; 
  onStart: () => void; 
  onLogout: () => void; 
  onNavigate: (screen: Screen) => void;
  onViewResult: (id: string) => void;
}) {
  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
  const averageScore = Math.round(completedInterviews.reduce((acc, i) => acc + i.score, 0) / (completedInterviews.length || 1));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Facecounter</h1>
            <p className="text-sm text-slate-500">为您的职场飞跃做好准备</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-primary transition-colors"
          >
            <LoginIcon size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Upload Card */}
        <div className="bg-primary/5 rounded-2xl p-6 mb-6 border-2 border-dashed border-primary/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <UploadFile className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-bold">上传简历</h3>
              <p className="text-xs text-slate-500">支持 PDF, DOCX (最大 5MB)</p>
            </div>
          </div>
          <button 
            onClick={onStart}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            开始新的面试练习
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-primary mb-1">{completedInterviews.length}</div>
            <div className="text-xs text-slate-500">练习次数</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-primary mb-1">{averageScore}%</div>
            <div className="text-xs text-slate-500">平均分</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <button 
            onClick={() => onNavigate(Screen.ANALYSIS)}
            className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100"
          >
            <Equalizer className="text-primary mb-1" size={20} />
            <span className="text-xs">分析</span>
          </button>
          <button 
            onClick={() => onNavigate(Screen.QUESTION_BANK)}
            className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100"
          >
            <Book className="text-primary mb-1" size={20} />
            <span className="text-xs">题库</span>
          </button>
          <button 
            onClick={() => onNavigate(Screen.SETTINGS)}
            className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100"
          >
            <Settings className="text-primary mb-1" size={20} />
            <span className="text-xs">设置</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            <History className="text-primary mb-1" size={20} />
            <span className="text-xs">历史</span>
          </button>
        </div>

        {/* Past Interviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">往期面试</h3>
            <button className="text-sm text-primary">查看全部</button>
          </div>
          <div className="space-y-3">
            {completedInterviews.slice(0, 3).map(interview => (
              <button
                key={interview.id}
                onClick={() => onViewResult(interview.id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between text-left"
              >
                <div>
                  <div className="font-semibold mb-1">{interview.role}</div>
                  <div className="text-xs text-slate-500">{interview.company} · {interview.score}分</div>
                </div>
                <ChevronRight className="text-slate-400" size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupInterviewScreen({ onBack, onConfirm }: { onBack: () => void, onConfirm: (role: string) => void }) {
  const [role, setRole] = useState('软件工程师');
  const [customRole, setCustomRole] = useState('');

  const handleConfirm = () => {
    onConfirm(customRole || role);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
          <ArrowBack size={20} />
          <span>返回</span>
        </button>
      </div>

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-extrabold mb-2">准备面试</h2>
        <p className="text-slate-500 mb-6">请选择或输入您想面试的职位</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">常见职位</label>
            <div className="grid grid-cols-2 gap-2">
              {['软件工程师', '产品经理', 'UI/UX设计师', '数据分析师'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl border ${
                    role === r && !customRole 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 hover:border-primary/50'
                  } transition-colors`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">或自定义职位</label>
            <input
              className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
              placeholder="例如：技术产品经理"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-200">
        <button
          onClick={handleConfirm}
          className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          开始面试
        </button>
      </div>
    </div>
  );
}

function InterviewScreen({ 
  interview, 
  onBack, 
  onSend, 
  inputText, 
  setInputText, 
  isTyping, 
  chatEndRef 
}: { 
  interview: Interview; 
  onBack: () => void; 
  onSend: () => void; 
  inputText: string; 
  setInputText: (text: string) => void; 
  isTyping: boolean; 
  chatEndRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
            <ArrowBack size={20} />
            <span>退出</span>
          </button>
          <div className="text-sm text-primary font-semibold">面试进行中...</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(interview.messages || []).map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-slate-200'
              }`}
            >
              {message.role === 'ai' && (
                <div className="flex items-center gap-2 mb-1 text-sm text-primary">
                  <SmartToy size={16} />
                  <span className="font-semibold">AI面试官</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            className="flex-1 h-12 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            placeholder="输入您的回答..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
          />
          <button
            onClick={onSend}
            className="w-12 h-12 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ interview, onBack, onNew }: { interview: Interview; onBack: () => void; onNew: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
          <ArrowBack size={20} />
          <span>返回</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-primary">{interview.score}%</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">面试完成！</h2>
          <p className="text-slate-500">干得不错，继续努力</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">问题数量</div>
            <div className="text-xl font-bold">{interview.questionsCount}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">用时</div>
            <div className="text-xl font-bold">{interview.duration}</div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <h3 className="font-semibold mb-2">优势</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                <li>表达清晰，逻辑性强</li>
                <li>有丰富的项目经验</li>
                <li>回答问题有深度</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">待改进</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>可以多使用STAR方法</li>
                <li>回答可以更简洁</li>
                <li>适当加入量化结果</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={onNew}
          className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          新的面试
        </button>
      </div>
    </div>
  );
}

function AnalysisScreen({ onBack }: { onBack: () => void }) {
  const data = [
    { name: '第1次', score: 65 },
    { name: '第2次', score: 72 },
    { name: '第3次', score: 78 },
    { name: '第4次', score: 85 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
          <ArrowBack size={20} />
          <span>返回</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-2xl font-extrabold mb-6">能力分析</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-semibold mb-4">能力维度</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>表达能力</span>
                  <span className="text-primary">75%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>专业知识</span>
                  <span className="text-primary">82%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>逻辑思维</span>
                  <span className="text-primary">88%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>自信程度</span>
                  <span className="text-primary">70%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-semibold mb-4">进步趋势</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#1E40AF" fill="#1E40AF20" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionBankScreen({ onBack }: { onBack: () => void }) {
  const categories = ['通用行为面试', '软件工程', '产品经理', 'UI/UX设计', '数据分析'];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
          <ArrowBack size={20} />
          <span>返回</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-2xl font-extrabold mb-6">面试题库</h2>

        <div className="mb-4">
          <input
            className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary outline-none"
            placeholder="搜索问题..."
          />
        </div>

        <div className="space-y-4">
          {categories.map(category => (
            <div key={category} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold mb-2">{category}</h3>
              <p className="text-sm text-slate-500 mb-3">精选10个高频问题</p>
              <button className="text-sm text-primary font-semibold">查看全部 →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ onBack, userProfile }: { onBack: () => void; userProfile: UserProfile | null }) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
          <ArrowBack size={20} />
          <span>返回</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-2xl font-extrabold mb-6">设置</h2>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Person size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{userProfile?.name || 'Alex Chen'}</h3>
              <p className="text-sm text-slate-500">{userProfile?.targetJob || '产品经理'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <span>个人资料</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <span>通知设置</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <span>隐私与安全</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <span>帮助与支持</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
