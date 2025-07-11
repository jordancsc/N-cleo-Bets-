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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-xl shadow-2xl border border-purple-500/30">
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
      setMessage('Conta criada com sucesso! Aguarde aprovação do administrador.');
      setUsername('');
      setEmail('');
      setPassword('');
    } else {
      setError('Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-slate-800 rounded-xl shadow-2xl border border-purple-500/30">
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

  return (
    <nav className="bg-slate-900 border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
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

          <div className="flex items-center space-x-4">
            <span className="text-slate-300">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analyses');
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [newAnalysis, setNewAnalysis] = useState({
    title: '',
    match_info: '',
    prediction: '1',
    confidence: 0,
    detailed_analysis: '',
    odds: '',
    match_date: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
    fetchAnalyses();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, []);

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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/analysis`, newAnalysis);
      setNewAnalysis({
        title: '',
        match_info: '',
        prediction: '1',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        {stats && (
          <div className="bg-slate-800 rounded-xl p-6 border border-purple-500/30 mb-8">
            <h3 className="text-xl font-semibold text-purple-400 mb-4">Estatísticas das Análises</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.total_analyses}</div>
                <div className="text-slate-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.won}</div>
                <div className="text-slate-400">Acertos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{stats.lost}</div>
                <div className="text-slate-400">Erros</div>
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
            <h2 className="text-2xl font-bold text-white mb-6">Análises de Futebol</h2>
            <div className="grid gap-6">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="bg-slate-800 rounded-xl p-6 border border-purple-500/30">
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
                        {analysis.prediction === '1' ? 'Casa' : analysis.prediction === 'X' ? 'Empate' : 'Fora'}
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
                        analysis.status === 'won' ? 'bg-green-500/20 text-green-400' :
                        analysis.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {analysis.status === 'won' ? 'Ganhou' : analysis.status === 'lost' ? 'Perdeu' : 'Pendente'}
                      </div>
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
              {analyses.length === 0 && (
                <div className="bg-slate-800 rounded-xl p-8 border border-purple-500/30 text-center">
                  <p className="text-slate-400">Nenhuma análise disponível no momento.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Painel Admin</h2>
            
            {/* Create/Edit Analysis Form */}
            <div className="bg-slate-800 rounded-xl p-6 border border-purple-500/30">
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
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={editingAnalysis ? editingAnalysis.prediction : newAnalysis.prediction}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, prediction: e.target.value}) :
                      setNewAnalysis({...newAnalysis, prediction: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1">Casa</option>
                    <option value="X">Empate</option>
                    <option value="2">Fora</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Confiança (%)"
                    value={editingAnalysis ? editingAnalysis.confidence : newAnalysis.confidence}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, confidence: parseFloat(e.target.value)}) :
                      setNewAnalysis({...newAnalysis, confidence: parseFloat(e.target.value)})
                    }
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="datetime-local"
                    value={editingAnalysis ? editingAnalysis.match_date : newAnalysis.match_date}
                    onChange={(e) => editingAnalysis ? 
                      setEditingAnalysis({...editingAnalysis, match_date: e.target.value}) :
                      setNewAnalysis({...newAnalysis, match_date: e.target.value})
                    }
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                {editingAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={editingAnalysis.result || ''}
                      onChange={(e) => setEditingAnalysis({...editingAnalysis, result: e.target.value})}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Resultado (opcional)</option>
                      <option value="1">Casa</option>
                      <option value="X">Empate</option>
                      <option value="2">Fora</option>
                    </select>
                    <select
                      value={editingAnalysis.status}
                      onChange={(e) => setEditingAnalysis({...editingAnalysis, status: e.target.value})}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="won">Ganhou</option>
                      <option value="lost">Perdeu</option>
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
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
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
            <div className="bg-slate-800 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Gerenciar Usuários</h3>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-slate-400 text-sm">{user.email}</div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
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