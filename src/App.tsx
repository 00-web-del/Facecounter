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
  Analytics,
  Brush,
  ArrowBack,
  Login as LoginIcon,
  Visibility,
  Mail,
  Lock
} from './components/Icons';

// 定义屏幕枚举
enum Screen {
  LOGIN = "LOGIN",
  HOME = "HOME",
  ANALYSIS = "ANALYSIS",
  QUESTION_BANK = "QUESTION_BANK",
  SETTINGS = "SETTINGS",
}

export default function App() {
  // 从登录页开始
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.LOGIN:
        return <LoginScreen onLogin={() => setCurrentScreen(Screen.HOME)} onSignUp={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.HOME:
        return <HomeScreen onNavigate={(s) => setCurrentScreen(s)} />;
      case Screen.ANALYSIS:
        return <AnalysisScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.QUESTION_BANK:
        return <QuestionBankScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.SETTINGS:
        return <SettingsScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      default:
        return <LoginScreen onLogin={() => setCurrentScreen(Screen.HOME)} onSignUp={() => setCurrentScreen(Screen.HOME)} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
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

// 登录页
function LoginScreen({ onLogin, onSignUp }: { onLogin: () => void, onSignUp: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Psychology size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Facecounter</h1>
          <p className="text-slate-500">AI面试教练 · 助你斩获Offer</p>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <Visibility size={20} />
              </button>
            </div>
            <div className="text-right mt-2">
              <button className="text-sm text-blue-500 hover:underline">忘记密码？</button>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 mb-3"
          >
            登录
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">或使用以下方式</span>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full border border-slate-200 bg-white text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>

        {/* 注册链接 */}
        <p className="text-center text-sm text-slate-500">
          还没有账号？{' '}
          <button onClick={onSignUp} className="text-blue-500 font-semibold hover:underline">
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
}

// 首页
function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b px-4 h-16 flex items-center justify-between">
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

      <main className="flex-1 p-4 overflow-y-auto">
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
          <button className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl">
            <UploadFile size={20} className="inline mr-2" /> 上传简历
          </button>
          <p className="text-xs text-slate-400 mt-2">支持 PDF, DOCX (最大 5MB)</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-blue-500 mb-1">3</div>
            <div className="text-xs text-slate-500">练习次数</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-blue-500 mb-1">82%</div>
            <div className="text-xs text-slate-500">平均分</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => onNavigate(Screen.ANALYSIS)} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center">
            <Equalizer className="text-blue-500 mb-1" size={24} />
            <span className="text-xs">分析</span>
          </button>
          <button onClick={() => onNavigate(Screen.QUESTION_BANK)} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center">
            <Book className="text-blue-500 mb-1" size={24} />
            <span className="text-xs">题库</span>
          </button>
          <button onClick={() => onNavigate(Screen.SETTINGS)} className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center">
            <Settings className="text-blue-500 mb-1" size={24} />
            <span className="text-xs">设置</span>
          </button>
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <h3 className="font-bold">往期面试</h3>
            <button className="text-sm text-blue-500">查看全部</button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
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

      <nav className="bg-white border-t py-2 flex justify-around">
        <button className="flex flex-col items-center text-blue-500">
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
        <div className="bg-white rounded-2xl p-6 mb-4">
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
            <div key={cat} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
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
function SettingsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b px-4 h-16 flex items-center gap-4">
        <button onClick={onBack} className="text-slate-600">
          <ArrowBack size={24} />
        </button>
        <h1 className="text-lg font-bold">设置</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
            <AccountCircle size={32} />
          </div>
          <div>
            <h3 className="font-semibold">访客用户</h3>
            <p className="text-sm text-slate-500">点击登录保存记录</p>
          </div>
        </div>
        <div className="space-y-2">
          {['个人资料', '通知设置', '隐私与安全', '帮助与支持'].map(item => (
            <button key={item} className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
              <span>{item}</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
