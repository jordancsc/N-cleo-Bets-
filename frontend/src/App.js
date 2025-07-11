import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { username, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post(`${API}/auth/register`, { username, email, password });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components
const LoginForm = ({ onToggle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);
    if (!success) {
      setError('Credenciais inválidas ou conta não aprovada');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center nucleobets-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Núcleo Bets
          </h2>
          <p className="mt-2 text-slate-300">Entre na sua conta</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                className="w-full px-4 py-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-4 py-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-center text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Entrar
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={onToggle}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Não tem conta? Registre-se
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = ({ onToggle }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const success = await register(username, email, password);
    if (success) {
      setMessage('Conta criada com sucesso! Aguarde aprovação do administrador. Sua conta expira em 31 dias.');
      setUsername('');
      setEmail('');
      setPassword('');
    } else {
      setError('Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center nucleobets-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Núcleo Bets
          </h2>
          <p className="mt-2 text-slate-300">Crie sua conta</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuário"
                className="w-full px-4 py-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-4 py-3 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-center text-sm">{error}</div>
          )}

          {message && (
            <div className="text-green-400 text-center text-sm">{message}</div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Registrar
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={onToggle}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Já tem conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-slate-900/90 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Núcleo Bets
              </h1>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('analyses')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'analyses'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Análises
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>

            {/* Espaço vazio - removido usuário e sair */}
            <div></div>
          </div>
        </div>
      </nav>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 h-full w-80 bg-slate-800 shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Menu
              </h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Informações do Usuário */}
              <div className="p-3 rounded-lg bg-slate-700/50 border border-purple-500/20">
                <div className="text-white font-medium">{user?.username}</div>
                <div className="text-slate-400 text-sm">({user?.role})</div>
              </div>

              {/* Grupo Telegram */}
              <a
                href="https://t.me/nucleoBets"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.236 1.258-.957 4.466-1.35 5.93-.166.617-.492.82-.805.84-.687.062-1.208-.45-1.873-.88l-2.693-1.946c-1.188-.848-2.04-1.373-3.308-2.202-1.478-1.016-.52-1.574.323-2.486.22-.238 4.034-3.695 4.11-4.014.01-.04.018-.188-.07-.266-.088-.078-.218-.052-.311-.03-.133.03-2.242 1.424-6.334 4.187-.6.415-1.143.617-1.632.605-.537-.014-1.57-.303-2.338-.552-.942-.306-1.693-.468-1.629-.988.033-.27.402-.546 1.105-.825 4.327-1.886 7.215-3.128 8.666-3.726 4.137-1.743 4.998-2.048 5.558-2.058.123-.002.398.029.576.176.15.123.191.29.211.408.019.117.043.384.024.593z"/>
                </svg>
                <span className="text-white">Grupo Telegram</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/nucleo_bets?igsh=azdsbnRpN3BoaTZv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-white">Instagram</span>
              </a>

              {/* Trocar Senha */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveTab('change-password');
                }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors w-full text-left"
              >
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l4.707-4.707A6 6 0 0121 9z"></path>
                </svg>
                <span className="text-white">Trocar Senha</span>
              </button>

              {/* Painel Admin - Apenas para Admin */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActiveTab('admin');
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors w-full text-left"
                >
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-white">Painel Admin</span>
                </button>
              )}

              {/* Sair */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-red-700 hover:bg-red-600 transition-colors w-full text-left"
              >
                <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span className="text-white">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getBetTypeLabel = (betType) => {
  const labels = {
    '1': 'Casa',
    'X': 'Empate',
    '2': 'Fora',
    'over': 'Over',
    'under': 'Under',
    '1x': 'Dupla Chance 1',
    '2x': 'Dupla Chance 2'
  };
  return labels[betType] || betType;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analyses');
  const [analyses, setAnalyses] = useState([]);
  const [valuableTips, setValuableTips] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [editingValuableTip, setEditingValuableTip] = useState(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showCreateValuableTipForm, setShowCreateValuableTipForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [dateFilter, setDateFilter] = useState('all'); // 'yesterday', 'today', 'tomorrow', 'all'
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [newAnalysis, setNewAnalysis] = useState({
    title: '',
    match_info: '',
    bet_type: '1',
    confidence: 0,
    detailed_analysis: '',
    odds: '',
    match_date: ''
  });
  const [newValuableTip, setNewValuableTip] = useState({
    title: '',
    description: '',
    games: '',
    total_odds: '',
    stake_suggestion: '',
    created_at: new Date().toISOString().slice(0, 16)
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
    fetchAnalyses();
    fetchValuableTips();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, []);

  const getFilteredAnalyses = () => {
    if (dateFilter === 'all') return analyses;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return analyses.filter(analysis => {
      const matchDate = new Date(analysis.match_date);
      const analysisDay = matchDate.toDateString();
      
      switch (dateFilter) {
        case 'yesterday':
          return analysisDay === yesterday.toDateString();
        case 'today':
          return analysisDay === today.toDateString();
        case 'tomorrow':
          return analysisDay === tomorrow.toDateString();
        default:
          return true;
      }
    });
  };

  const quickUpdateResult = async (analysisId, result) => {
    try {
      await axios.put(`${API}/admin/analysis/${analysisId}`, { result });
      fetchAnalyses();
      fetchStats();
    } catch (error) {
      console.error('Error updating analysis result:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    try {
      await axios.put(`${API}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (error) {
      alert('Erro ao alterar senha. Verifique a senha atual.');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(`${API}/analysis`);
      setAnalyses(response.data);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchValuableTips = async () => {
    try {
      const response = await axios.get(`${API}/valuable-tips`);
      setValuableTips(response.data);
    } catch (error) {
      console.error('Error fetching valuable tips:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/create-user`, {
        ...newUser,
        approved_by_admin: true
      });
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user'
      });
      setShowCreateUserForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/analysis`, newAnalysis);
      setNewAnalysis({
        title: '',
        match_info: '',
        bet_type: '1',
        confidence: 0,
        detailed_analysis: '',
        odds: '',
        match_date: ''
      });
      fetchAnalyses();
      fetchStats();
    } catch (error) {
      console.error('Error creating analysis:', error);
    }
  };

  const handleCreateValuableTip = async (e) => {
    e.preventDefault();
    try {
      const tipData = {
        title: newValuableTip.title,
        description: newValuableTip.description,
        games: newValuableTip.games,
        total_odds: newValuableTip.total_odds,
        stake_suggestion: newValuableTip.stake_suggestion
      };
      
      console.log('Enviando palpite valioso:', tipData);
      await axios.post(`${API}/admin/valuable-tips`, tipData);
      
      setNewValuableTip({
        title: '',
        description: '',
        games: '',
        total_odds: '',
        stake_suggestion: '',
        created_at: new Date().toISOString().slice(0, 16)
      });
      setShowCreateValuableTipForm(false);
      fetchValuableTips();
      alert('Palpite valioso criado com sucesso!');
    } catch (error) {
      console.error('Error creating valuable tip:', error);
      alert('Erro ao criar palpite valioso: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUpdateAnalysis = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/analysis/${editingAnalysis.id}`, editingAnalysis);
      setEditingAnalysis(null);
      fetchAnalyses();
      fetchStats();
    } catch (error) {
      console.error('Error updating analysis:', error);
    }
  };

  const handleUpdateValuableTip = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/valuable-tips/${editingValuableTip.id}`, editingValuableTip);
      setEditingValuableTip(null);
      fetchValuableTips();
    } catch (error) {
      console.error('Error updating valuable tip:', error);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    if (window.confirm('Tem certeza que deseja deletar esta análise?')) {
      try {
        await axios.delete(`${API}/admin/analysis/${analysisId}`);
        fetchAnalyses();
        fetchStats();
      } catch (error) {
        console.error('Error deleting analysis:', error);
      }
    }
  };

  const deleteValuableTip = async (tipId) => {
    if (window.confirm('Tem certeza que deseja deletar este palpite valioso?')) {
      try {
        await axios.delete(`${API}/admin/valuable-tips/${tipId}`);
        fetchValuableTips();
      } catch (error) {
        console.error('Error deleting valuable tip:', error);
      }
    }
  };

  const approveUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/approve-user/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const deactivateUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/deactivate-user/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário permanentemente?')) {
      try {
        await axios.delete(`${API}/admin/delete-user/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return 'Permanente';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} dias` : 'Expirado';
  };

  // Handle active tab from navigation menu
  useEffect(() => {
    if (activeTab === 'change-password') {
      setShowChangePassword(true);
      setActiveTab('analyses'); // Reset to analyses but show password form
    }
  }, [activeTab]);

  const filteredAnalyses = getFilteredAnalyses();

  return (
    <div className="min-h-screen nucleobets-background">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowChangePassword(false)}></div>
              <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Trocar Senha</h3>
                    <button
                      onClick={() => setShowChangePassword(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <input
                      type="password"
                      placeholder="Senha atual"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Alterar Senha
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowChangePassword(false)}
                        className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 mb-8">
            <h3 className="text-xl font-semibold text-purple-400 mb-4">Estatísticas das Análises</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.total_analyses}</div>
                <div className="text-slate-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.green} ✅</div>
                <div className="text-slate-400">Green</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{stats.red} 🔴</div>
                <div className="text-slate-400">Red</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-slate-400">Pendentes</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.accuracy}%</div>
              <div className="text-slate-400">Precisão</div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        {activeTab === 'analyses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Análises de Futebol</h2>
              
              {/* Date Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setDateFilter('yesterday')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    dateFilter === 'yesterday'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Ontem
                </button>
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    dateFilter === 'today'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setDateFilter('tomorrow')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    dateFilter === 'tomorrow'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Amanhã
                </button>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    dateFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            {/* Palpites Valiosos Section */}
            {valuableTips.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400">💎 Palpites Valiosos</h3>
                <div className="grid gap-4">
                  {valuableTips.map((tip) => (
                    <div key={tip.id} className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/40">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-yellow-300">{tip.title}</h4>
                          <p className="text-slate-300 mt-2">{tip.description}</p>
                          <div className="mt-4 space-y-2">
                            <div className="bg-slate-800/50 p-3 rounded-lg">
                              <h5 className="text-yellow-400 font-medium mb-2">Jogos:</h5>
                              <p className="text-white whitespace-pre-wrap">{tip.games}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                                <div className="text-green-400 text-lg font-bold">{tip.total_odds}</div>
                                <div className="text-slate-400 text-sm">Odds Total</div>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                                <div className="text-blue-400 text-lg font-bold">{tip.stake_suggestion}</div>
                                <div className="text-slate-400 text-sm">Stake Sugerido</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {user?.role === 'admin' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setEditingValuableTip(tip)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteValuableTip(tip.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                            >
                              Deletar
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(tip.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Analyses */}
            <div className="grid gap-6">
              {filteredAnalyses.map((analysis) => (
                <div key={analysis.id} className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{analysis.title}</h3>
                      <p className="text-slate-400 mt-1">{analysis.match_info}</p>
                      <div className="mt-4 text-slate-300">
                        <p className="whitespace-pre-wrap">{analysis.detailed_analysis}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-purple-400">
                        {getBetTypeLabel(analysis.bet_type)}
                      </div>
                      <div className="text-sm text-slate-400">{analysis.confidence}% confiança</div>
                      {analysis.odds && (
                        <div className="text-sm text-green-400">Odds: {analysis.odds}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-300">
                      {new Date(analysis.match_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        analysis.result === 'green' ? 'bg-green-500/20 text-green-400' :
                        analysis.result === 'red' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {analysis.result === 'green' ? 'Green ✅' : 
                         analysis.result === 'red' ? 'Red 🔴' : 'Pendente'}
                      </div>
                      
                      {/* Quick Result Buttons - Only for Admin */}
                      {user?.role === 'admin' && analysis.result === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => quickUpdateResult(analysis.id, 'green')}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => quickUpdateResult(analysis.id, 'red')}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            🔴
                          </button>
                        </div>
                      )}

                      {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingAnalysis(analysis)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                          >
                            Deletar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredAnalyses.length === 0 && (
                <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30 text-center">
                  <p className="text-slate-400">
                    {dateFilter === 'all' 
                      ? 'Nenhuma análise disponível no momento.' 
                      : `Nenhuma análise encontrada para ${
                          dateFilter === 'yesterday' ? 'ontem' : 
                          dateFilter === 'today' ? 'hoje' : 'amanhã'
                        }.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Painel Admin</h2>
            
            {/* Create/Edit Valuable Tip Form */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/40">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-yellow-400">💎 {editingValuableTip ? 'Editar' : 'Criar'} Palpite Valioso</h3>
                <button
                  onClick={() => setShowCreateValuableTipForm(!showCreateValuableTipForm)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  {showCreateValuableTipForm || editingValuableTip ? 'Cancelar' : 'Novo Palpite Valioso'}
                </button>
              </div>

              {(showCreateValuableTipForm || editingValuableTip) && (
                <form onSubmit={editingValuableTip ? handleUpdateValuableTip : handleCreateValuableTip} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título do palpite valioso"
                    value={editingValuableTip ? editingValuableTip.title : newValuableTip.title}
                    onChange={(e) => editingValuableTip ? 
                      setEditingValuableTip({...editingValuableTip, title: e.target.value}) :
                      setNewValuableTip({...newValuableTip, title: e.target.value})
                    }
                    className="w-full px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                  <textarea
                    placeholder="Descrição do palpite"
                    value={editingValuableTip ? editingValuableTip.description : newValuableTip.description}
                    onChange={(e) => editingValuableTip ? 
                      setEditingValuableTip({...editingValuableTip, description: e.target.value}) :
                      setNewValuableTip({...newValuableTip, description: e.target.value})
                    }
                    className="w-full px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 h-20 resize-none"
                    required
                  />
                  <textarea
                    placeholder="Lista de jogos (um por linha)&#10;Ex:&#10;Flamengo vs Palmeiras - Casa (1.80)&#10;Santos vs Corinthians - Over 2.5 (2.10)&#10;Real Madrid vs Barcelona - Fora (2.50)"
                    value={editingValuableTip ? editingValuableTip.games : newValuableTip.games}
                    onChange={(e) => editingValuableTip ? 
                      setEditingValuableTip({...editingValuableTip, games: e.target.value}) :
                      setNewValuableTip({...newValuableTip, games: e.target.value})
                    }
                    className="w-full px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 h-32 resize-none"
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Odds total (ex: 9.45)"
                      value={editingValuableTip ? editingValuableTip.total_odds : newValuableTip.total_odds}
                      onChange={(e) => editingValuableTip ? 
                        setEditingValuableTip({...editingValuableTip, total_odds: e.target.value}) :
                        setNewValuableTip({...newValuableTip, total_odds: e.target.value})
                      }
                      className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Stake sugerido (ex: 5-10% da banca)"
                      value={editingValuableTip ? editingValuableTip.stake_suggestion : newValuableTip.stake_suggestion}
                      onChange={(e) => editingValuableTip ? 
                        setEditingValuableTip({...editingValuableTip, stake_suggestion: e.target.value}) :
                        setNewValuableTip({...newValuableTip, stake_suggestion: e.target.value})
                      }
                      className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      {editingValuableTip ? 'Atualizar Palpite Valioso' : 'Criar Palpite Valioso'}
                    </button>
                    {editingValuableTip && (
                      <button
                        type="button"
                        onClick={() => setEditingValuableTip(null)}
                        className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-200"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Create/Edit Analysis Form */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">
                {editingAnalysis ? 'Editar Análise' : 'Criar Nova Análise'}
              </h3>
              <form onSubmit={editingAnalysis ? handleUpdateAnalysis : handleCreateAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Título da análise"
                    value={editingAnalysis ? editingAnalysis.title : newAnalysis.title}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, title: e.target.value}) :
                      setNewAnalysis({...newAnalysis, title: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Informações da partida"
                    value={editingAnalysis ? editingAnalysis.match_info : newAnalysis.match_info}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, match_info: e.target.value}) :
                      setNewAnalysis({...newAnalysis, match_info: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={editingAnalysis ? editingAnalysis.bet_type : newAnalysis.bet_type}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, bet_type: e.target.value}) :
                      setNewAnalysis({...newAnalysis, bet_type: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1">Casa</option>
                    <option value="X">Empate</option>
                    <option value="2">Fora</option>
                    <option value="over">Over</option>
                    <option value="under">Under</option>
                    <option value="1x">Dupla Chance 1</option>
                    <option value="2x">Dupla Chance 2</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Confiança (%)"
                    value={editingAnalysis ? editingAnalysis.confidence : newAnalysis.confidence}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, confidence: parseFloat(e.target.value)}) :
                      setNewAnalysis({...newAnalysis, confidence: parseFloat(e.target.value)})
                    }
                    className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Odds (opcional)"
                    value={editingAnalysis ? editingAnalysis.odds : newAnalysis.odds}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, odds: e.target.value}) :
                      setNewAnalysis({...newAnalysis, odds: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="datetime-local"
                    value={editingAnalysis ? editingAnalysis.match_date : newAnalysis.match_date}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, match_date: e.target.value}) :
                      setNewAnalysis({...newAnalysis, match_date: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                {editingAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <select
                      value={editingAnalysis.result}
                      onChange={(e) => setEditingAnalysis({...editingAnalysis, result: e.target.value})}
                      className="px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="green">Green ✅</option>
                      <option value="red">Red 🔴</option>
                    </select>
                  </div>
                )}
                <textarea
                  placeholder="Análise detalhada"
                  value={editingAnalysis ? editingAnalysis.detailed_analysis : newAnalysis.detailed_analysis}
                  onChange={(e) => editingAnalysis ? 
                    setEditingAnalysis({...editingAnalysis, detailed_analysis: e.target.value}) :
                    setNewAnalysis({...newAnalysis, detailed_analysis: e.target.value})
                  }
                  className="w-full px-4 py-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                  required
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    {editingAnalysis ? 'Atualizar Análise' : 'Criar Análise'}
                  </button>
                  {editingAnalysis && (
                    <button
                      type="button"
                      onClick={() => setEditingAnalysis(null)}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* User Management */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-purple-400">Gerenciar Usuários</h3>
                <button
                  onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {showCreateUserForm ? 'Cancelar' : 'Adicionar Usuário'}
                </button>
              </div>

              {/* Create User Form */}
              {showCreateUserForm && (
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-purple-500/20">
                  <h4 className="text-lg font-semibold text-purple-300 mb-4">Criar Novo Usuário</h4>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nome de usuário"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="password"
                        placeholder="Senha"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="user">Usuário</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      Criar Usuário
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-slate-400 text-sm">{user.email}</div>
                      <div className="text-slate-500 text-xs">
                        {user.role} • {getDaysLeft(user.expires_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        user.approved_by_admin ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.approved_by_admin ? 'Aprovado' : 'Pendente'}
                      </span>
                      {!user.approved_by_admin && (
                        <button
                          onClick={() => approveUser(user.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                        >
                          Aprovar
                        </button>
                      )}
                      {user.is_active && (
                        <button
                          onClick={() => deactivateUser(user.id)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg transition-colors"
                        >
                          Desativar
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                        >
                          Deletar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen nucleobets-background flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard />
      ) : (
        isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )
      )}
    </div>
  );
};

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}