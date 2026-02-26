import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home as HomeIcon,
  Equalizer,
  Book,
  Settings,
  ChevronRight,
  Psychology,
  AccountCircle,
  UploadFile,
  Terminal,
  ArrowBack,
  Login as LoginIcon,
  Visibility
} from './components/Icons';

// 定义屏幕枚举
enum Screen {
  LOGIN = "LOGIN",
  SIGNUP = "SIGNUP",
  HOME = "HOME",
  ANALYSIS = "ANALYSIS",
  QUESTION_BANK = "QUESTION_BANK",
  SETTINGS = "SETTINGS",
}

export default function App() {
  // 初始进入登录页
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.LOGIN:
        return <LoginScreen 
          onLogin={() => setCurrentScreen(Screen.HOME)} 
          onGoToSignUp={() => setCurrentScreen(Screen.SIGNUP)} 
        />;
      case Screen.SIGNUP:
        return <SignUpScreen 
          onSignUp={() => setCurrentScreen(Screen.HOME)} 
          onGoToLogin={() => setCurrentScreen(Screen.LOGIN)} 
        />;
      case Screen.HOME:
        return <HomeScreen onNavigate={(s) => setCurrentScreen(s)} />;
      case Screen.ANALYSIS:
        return <AnalysisScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.QUESTION_BANK:
        return <QuestionBankScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.SETTINGS:
        return <SettingsScreen onBack={() => setCurrentScreen(Screen.HOME)} onLogout={() => setCurrentScreen(Screen.LOGIN)} />;
      default:
        return <HomeScreen onNavigate={(s) => setCurrentScreen(s)} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- 登录界面 ---
function LoginScreen({ onLogin, onGoToSignUp }: { onLogin: () => void, onGoToSignUp: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full min-h-screen bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-100">
            <Psychology size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Facecounter</h1>
          <p className="text-slate-500 text-sm mt-2">欢迎回来，开启您的面试练习</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">邮箱</label>
            <input className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="您的邮箱" defaultValue="test@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">密码</label>
            <input className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" type="password" placeholder="您的密码" defaultValue="123456" />
          </div>
          <button onClick={onLogin} className="w-full h-12 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            立即登录
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">还没有账号？ <button onClick={onGoToSignUp} className="text-blue-500 font-bold">立即注册</button></p>
        </div>
      </div>
    </div>
  );
}

// --- 注册界面 ---
function SignUpScreen({ onSignUp, onGoToLogin }: { onSignUp: () => void, onGoToLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full min-h-screen bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-100">
            <Psychology size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">创建账号</h1>
          <p className="text-slate-500 text-sm mt-2">开启您的 AI 面试教练之旅</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">邮箱</label>
            <input className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="设置您的邮箱" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">密码</label>
            <input className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" type="password" placeholder="设置您的密码" />
          </div>
          <button onClick={onSignUp} className="w-full h-12 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            创建账号
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">已有账号？ <button onClick={onGoToLogin} className="text-blue-500 font-bold">立即登录</button></p>
        </div>
      </div>
    </div>
  );
}

// 首页
function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <header className="bg-white border-b px-4 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg text-white">
            <Psychology size={24} />
          </div>
          <h1 className="text-lg font-bold">Facecounter</h1>
        </div>
        <button className="text-slate-500">
          <AccountCircle size={24} />
        </button>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* 上传简历卡片 */}
        <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-dashed border-blue-200 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-16 h-20 bg-red-50 rounded-lg flex flex-col items-center justify-center text-red-500">
              <UploadFile size={32} />
              <span className="text-xs font-bold mt-1">PDF</span>
            </div>
            <div className="w-16 h-20 bg-blue-50 rounded-lg flex flex-col items-center justify-center text-blue-500">
              <UploadFile size={32} />
              <span className="text-xs font-bold mt-1">WORD</span>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">为您的职场飞跃做好准备</h2>
          <p className="text-slate-500 text-sm mb-4">AI会分析您的简历，生成个性化面试题目</p>
          <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl shadow-md">
            <UploadFile size={20} className="inline mr-2" /> 上传简历
          </button>
          <p className="text-xs text-slate-400 mt-2">支持 PDF, DOCX (最大 5MB)</p>
        </div>

        {/* 导航卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-blue-500 mb-1">3</div>
            <div className="text-xs text-slate-500">练习次数</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-blue-500 mb-1">82%</div>
            <div className="text-xs text-slate-500">平均分</div>
          </div>
        </div>

        {/* 快速入口 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => onNavigate(Screen.ANALYSIS)} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center active:bg-slate-50">
            <Equalizer className="text-blue-500 mb-1" size={24} />
            <span className="text-xs">分析</span>
          </button>
          <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center active:bg-slate-50">
            <Book className="text-blue-500 mb-1" size={24} />
            <span className="text-xs">题库</span>
          </button>
          <button onClick={() => onNavigate(Screen.SETTINGS)} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center active:bg-slate-50">
            <Settings className="text-blue-500 mb-1" size={24} />
            <span className="text-xs">设置</span>
          </button>
        </div>

        {/* 往期面试 */}
        <div>
          <div className="flex justify-between mb-3">
            <h3 className="font-bold">往期面试</h3>
            <button className="text-sm text-blue-500">查看全部</button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">高级软件工程师</div>
                    <div className="text-xs text-slate-500">85分</div>
                  </div>
                </div>
                <ChevronRight className="text-slate-400" size={20} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 底部导航 */}
      <nav className="bg-white border-t py-2 flex justify-around sticky bottom-0">
        <button onClick={() => onNavigate(Screen.HOME)} className="flex flex-col items-center text-blue-500">
          <HomeIcon size={24} />
          <span className="text-xs">主页</span>
        </button>
        <button onClick={() => onNavigate(Screen.ANALYSIS)} className="flex flex-col items-center text-slate-400">
          <Equalizer size={24} />
          <span className="text-xs">分析</span>
        </button>
        <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="flex flex-col items-center text-slate-400">
          <Book size={24} />
          <span className="text-xs">题库</span>
        </button>
        <button onClick={() => onNavigate(Screen.SETTINGS)} className="flex flex-col items-center text-slate-400">
          <Settings size={24} />
          <span className="text-xs">设置</span>
        </button>
      </nav>
    </div>
  );
}

// 分析页
function AnalysisScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b px-4 h-16 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-600">
          <ArrowBack size={24} />
        </button>
        <h1 className="text-lg font-bold">能力分析</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <h3 className="font-bold mb-4">核心能力分布</h3>
          <div className="space-y-4">
            {[
              { label: '表达能力', value: 75 },
              { label: '专业知识', value: 82 },
              { label: '逻辑思维', value: 88 },
              { label: '自信程度', value: 70 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="text-blue-500">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// 题库页
function QuestionBankScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b px-4 h-16 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-600">
          <ArrowBack size={24} />
        </button>
        <h1 className="text-lg font-bold">面试题库</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="space-y-3">
          {['通用行为面试', '软件工程', '产品经理', 'UI/UX设计'].map(cat => (
            <div key={cat} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between active:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                  <Book size={20} />
                </div>
                <div>
                  <div className="font-semibold">{cat}</div>
                  <div className="text-xs text-slate-500">精选题目</div>
                </div>
              </div>
              <ChevronRight className="text-slate-400" size={20} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// 设置页
function SettingsScreen({ onBack, onLogout }: { onBack: () => void, onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b px-4 h-16 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-600">
          <ArrowBack size={24} />
        </button>
        <h1 className="text-lg font-bold">设置</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <AccountCircle size={32} />
          </div>
          <div>
            <h3 className="font-semibold">访客用户</h3>
            <p className="text-sm text-slate-500">欢迎回来练习</p>
          </div>
        </div>
        <div className="space-y-2">
          {['个人资料', '通知设置', '隐私与安全', '帮助与支持'].map(item => (
            <button key={item} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm active:bg-slate-50">
              <span className="text-sm font-medium">{item}</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          ))}
          <button onClick={onLogout} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm text-red-500 mt-4 active:bg-red-50">
            <span className="text-sm font-bold">退出登录</span>
            <ChevronRight size={18} className="text-red-400" />
          </button>
        </div>
      </main>
    </div>
  );
}
