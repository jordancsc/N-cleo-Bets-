import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [analyses, setAnalyses] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', is_admin: false });
  const [newAnalysis, setNewAnalysis] = useState({
    match: '',
    league: '',
    date: '',
    prediction_type: 'Casa',
    odds: '',
    description: '',
    result: null
  });
  const [editingAnalysis, setEditingAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('analyses');

  const predictionTypes = ['Casa', 'Empate', 'Fora', 'Over', 'Under', 'Dupla Chance 1', 'Dupla Chance 2'];

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchAnalyses();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.is_admin) {
          fetchUsers();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const analysesData = await response.json();
        setAnalyses(analysesData);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        setUser(data.user);
        setLoginForm({ username: '', password: '' });
        fetchAnalyses();
        if (data.user.is_admin) {
          fetchUsers();
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setCurrentView('analyses');
  };

  const createUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        setNewUser({ username: '', password: '', is_admin: false });
        fetchUsers();
        alert('Usuário criado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchUsers();
          alert('Usuário excluído com sucesso!');
        } else {
          const error = await response.json();
          alert(error.detail || 'Erro ao excluir usuário');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Erro ao excluir usuário');
      }
    }
  };

  const createAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newAnalysis,
          date: new Date(newAnalysis.date).toISOString(),
          odds: parseFloat(newAnalysis.odds)
        })
      });
      
      if (response.ok) {
        setNewAnalysis({
          match: '',
          league: '',
          date: '',
          prediction_type: 'Casa',
          odds: '',
          description: '',
          result: null
        });
        fetchAnalyses();
        alert('Análise criada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao criar análise');
      }
    } catch (error) {
      console.error('Error creating analysis:', error);
      alert('Erro ao criar análise');
    } finally {
      setLoading(false);
    }
  };

  const updateAnalysis = async (analysisId, updates) => {
    try {
      const response = await fetch(`${API_URL}/api/analyses/${analysisId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        fetchAnalyses();
        alert('Análise atualizada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao atualizar análise');
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
      alert('Erro ao atualizar análise');
    }
  };

  const deleteAnalysis = async (analysisId) => {
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      try {
        const response = await fetch(`${API_URL}/api/analyses/${analysisId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchAnalyses();
          alert('Análise excluída com sucesso!');
        } else {
          const error = await response.json();
          alert(error.detail || 'Erro ao excluir análise');
        }
      } catch (error) {
        console.error('Error deleting analysis:', error);
        alert('Erro ao excluir análise');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="logo">
            <h1>🐺 Núcleo Bets</h1>
            <p>Análises Profissionais de Apostas</p>
          </div>
          <form onSubmit={login} className="login-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Usuário"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Senha"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🐺 Núcleo Bets</h1>
          <div className="header-actions">
            <span>Olá, {user?.username}!</span>
            {user?.is_admin && (
              <div className="nav-buttons">
                <button 
                  className={currentView === 'analyses' ? 'active' : ''}
                  onClick={() => setCurrentView('analyses')}
                >
                  Análises
                </button>
                <button 
                  className={currentView === 'users' ? 'active' : ''}
                  onClick={() => setCurrentView('users')}
                >
                  Usuários
                </button>
              </div>
            )}
            <button onClick={logout} className="logout-btn">Sair</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'analyses' && (
          <div className="analyses-section">
            <h2>Análises de Apostas</h2>
            
            {user?.is_admin && (
              <div className="create-analysis-form">
                <h3>Nova Análise</h3>
                <form onSubmit={createAnalysis} className="analysis-form">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Partida (ex: Flamengo vs Corinthians)"
                      value={newAnalysis.match}
                      onChange={(e) => setNewAnalysis({...newAnalysis, match: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Liga/Campeonato"
                      value={newAnalysis.league}
                      onChange={(e) => setNewAnalysis({...newAnalysis, league: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="datetime-local"
                      value={newAnalysis.date}
                      onChange={(e) => setNewAnalysis({...newAnalysis, date: e.target.value})}
                      required
                    />
                    <select
                      value={newAnalysis.prediction_type}
                      onChange={(e) => setNewAnalysis({...newAnalysis, prediction_type: e.target.value})}
                    >
                      {predictionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Odds"
                      value={newAnalysis.odds}
                      onChange={(e) => setNewAnalysis({...newAnalysis, odds: e.target.value})}
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Descrição da análise..."
                    value={newAnalysis.description}
                    onChange={(e) => setNewAnalysis({...newAnalysis, description: e.target.value})}
                    required
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Análise'}
                  </button>
                </form>
              </div>
            )}

            <div className="analyses-grid">
              {analyses.map(analysis => (
                <div key={analysis.id} className="analysis-card">
                  <div className="analysis-header">
                    <h3>{analysis.match}</h3>
                    {user?.is_admin && (
                      <div className="analysis-actions">
                        <button 
                          onClick={() => updateAnalysis(analysis.id, { result: analysis.result === 'Green' ? null : 'Green' })}
                          className={`result-btn ${analysis.result === 'Green' ? 'active green' : ''}`}
                        >
                          ✅
                        </button>
                        <button 
                          onClick={() => updateAnalysis(analysis.id, { result: analysis.result === 'Red' ? null : 'Red' })}
                          className={`result-btn ${analysis.result === 'Red' ? 'active red' : ''}`}
                        >
                          🔴
                        </button>
                        <button 
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="delete-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="analysis-info">
                    <p><strong>Liga:</strong> {analysis.league}</p>
                    <p><strong>Data:</strong> {formatDateTime(analysis.date)}</p>
                    <p><strong>Palpite:</strong> {analysis.prediction_type}</p>
                    <p><strong>Odds:</strong> {analysis.odds}</p>
                    {analysis.result && (
                      <p className={`result ${analysis.result.toLowerCase()}`}>
                        <strong>Resultado:</strong> {analysis.result === 'Green' ? 'Green ✅' : 'Red 🔴'}
                      </p>
                    )}
                  </div>
                  
                  <div className="analysis-description">
                    <p>{analysis.description}</p>
                  </div>
                  
                  <div className="analysis-footer">
                    <small>Criado em {formatDateTime(analysis.created_at)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'users' && user?.is_admin && (
          <div className="users-section">
            <h2>Gerenciamento de Usuários</h2>
            
            <div className="create-user-form">
              <h3>Novo Usuário</h3>
              <form onSubmit={createUser} className="user-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Nome de usuário"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newUser.is_admin}
                      onChange={(e) => setNewUser({...newUser, is_admin: e.target.checked})}
                    />
                    Administrador
                  </label>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </button>
              </form>
            </div>

            <div className="users-list">
              <h3>Usuários Cadastrados</h3>
              <div className="users-grid">
                {users.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-header">
                      <h4>{user.username}</h4>
                      <div className="user-badges">
                        {user.is_admin && <span className="badge admin">Admin</span>}
                        <span className={`badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="user-info">
                      <p><strong>Criado:</strong> {formatDateTime(user.created_at)}</p>
                      <p><strong>Expira:</strong> {formatDateTime(user.expires_at)}</p>
                    </div>
                    {!user.is_admin && (
                      <div className="user-actions">
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="delete-btn"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;