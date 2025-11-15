import { useState, useEffect } from 'react';
import { Users, Music, TrendingUp, Shield, UserCog, Trash2, Edit, Plus } from 'lucide-react';
import { Song, User as UserType } from '../types';
import { usersAPI, statsAPI } from '../lib/api';

interface AdminDashboardProps {
  songs: Song[];
}

const styles = {
  container: {
    padding: '24px',
    minHeight: '100%',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#B8D4E8',
    fontSize: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'rgba(26, 43, 66, 0.8)',
    border: '2px solid rgba(74, 159, 184, 0.4)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
  },
  statLabel: {
    color: '#B8D4E8',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabsContainer: {
    background: 'rgba(26, 43, 66, 0.8)',
    border: '2px solid rgba(74, 159, 184, 0.4)',
    borderRadius: '12px',
    padding: '24px',
  },
  tabsList: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid rgba(44, 95, 125, 0.3)',
    paddingBottom: '8px',
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    color: '#B8D4E8',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, rgba(74, 159, 184, 0.2) 0%, rgba(91, 192, 222, 0.1) 100%)',
    color: '#5BC0DE',
    fontWeight: '600',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  searchInput: {
    background: '#0F1E30',
    border: '2px solid rgba(74, 159, 184, 0.5)',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    width: '300px',
    outline: 'none',
  },
  userCard: {
    background: 'rgba(15, 30, 48, 0.6)',
    border: '1px solid rgba(44, 95, 125, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '16px',
  },
  userName: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: '4px',
  },
  userEmail: {
    color: '#B8D4E8',
    fontSize: '13px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '12px',
  },
  badgeAdmin: {
    background: 'rgba(91, 192, 222, 0.1)',
    color: '#5BC0DE',
    border: '1px solid rgba(91, 192, 222, 0.3)',
  },
  badgeArtist: {
    background: 'rgba(74, 159, 184, 0.1)',
    color: '#4A9FB8',
    border: '1px solid rgba(74, 159, 184, 0.3)',
  },
  badgeListener: {
    background: 'rgba(44, 95, 125, 0.1)',
    color: '#B8D4E8',
    border: '1px solid rgba(44, 95, 125, 0.3)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  buttonEdit: {
    background: 'rgba(74, 159, 184, 0.2)',
    color: '#5BC0DE',
  },
  buttonDelete: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#FCA5A5',
  },
  songCard: {
    background: 'rgba(15, 30, 48, 0.6)',
    border: '1px solid rgba(44, 95, 125, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  songInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  songCover: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
  },
  songTitle: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: '4px',
  },
  songDetails: {
    color: '#B8D4E8',
    fontSize: '13px',
  },
  reportCard: {
    background: 'rgba(26, 43, 66, 0.8)',
    border: '2px solid rgba(74, 159, 184, 0.4)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  reportTitle: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  reportItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    background: 'rgba(15, 30, 48, 0.4)',
    transition: 'all 0.2s ease',
  },
  reportRank: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#5BC0DE',
    width: '32px',
    textAlign: 'center' as const,
  },
};

export function AdminDashboard({ songs }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    nombre_artistico: '',
    role: 'listener' as UserType['role'],
  });
  const [rolesMap, setRolesMap] = useState<Record<string, number>>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userPendingDelete, setUserPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [livePlays, setLivePlays] = useState<Record<string, number>>({});
  const [liveTotalPlays, setLiveTotalPlays] = useState<number>(songs.reduce((s, x) => s + x.plays, 0));

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const usersData = await usersAPI.getAll();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error('Error loading users:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios. Por favor, verifica tu conexión y permisos.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Poll real-time stats
  useEffect(() => {
    let timer: any;
    const poll = async () => {
      try {
        const ids = songs.map(s => s.id);
        if (ids.length) {
          // getBulkSongPlays devuelve Record<string, number>
          const statsMap = await statsAPI.getBulkSongPlays(ids);
          if (statsMap && typeof statsMap === 'object') {
            setLivePlays(prev => ({ ...prev, ...statsMap }));
          }
        }
        const summary = await statsAPI.getAdminSummary();
        if (summary && typeof summary.total_reproducciones === 'number') {
          setLiveTotalPlays(summary.total_reproducciones);
        }
      } catch (e) {
        // Loguear el error para diagnóstico pero no romper el render
        console.warn('Polling stats error:', e);
      } finally {
        timer = setTimeout(poll, 3000);
      }
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [songs]);

  // Cargar roles (para mapear admin/artist/listener -> id de rol backend)
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://localhost:8000/api/auth/roles/', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) return;
        const roles = await res.json();
        const map: Record<string, number> = {};
        roles.forEach((r: { id: number; nombre: string }) => {
          const lname = (r.nombre || '').toLowerCase();
          if (lname.includes('admin')) map['admin'] = r.id;
          else if (lname.includes('artista')) map['artist'] = r.id;
          else if (lname.includes('oyente') || lname.includes('usuario')) map['listener'] = r.id;
        });
        setRolesMap(map);
      } catch { /* ignore */ }
    };
    loadRoles();
  }, []);

  const filteredUsers = searchTerm 
    ? users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (user.email || '').toLowerCase().includes(searchLower) ||
          (user.nombres || '').toLowerCase().includes(searchLower) ||
          (user.apellidos || '').toLowerCase().includes(searchLower) ||
          (user.username || '').toLowerCase().includes(searchLower);
      })
    : users;

  const totalUsers = users.length;
  const totalArtists = users.filter(u => (u.role || '').toLowerCase() === 'artist').length;
  const totalSongs = songs.length;
  const totalPlays = liveTotalPlays;

  const requestDeleteUser = (user: UserType) => {
    setUserPendingDelete({ id: String(user.id), name: user.nombres?.trim() || user.username || user.email || 'Usuario' });
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userPendingDelete) return;
    setIsLoading(true);
    setError(null);
    try {
      await usersAPI.delete(userPendingDelete.id);
      setUsers(prev => prev.filter(u => String(u.id) !== userPendingDelete.id));
      setConfirmDeleteOpen(false);
      setUserPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      const allUsers = await usersAPI.getAll();
      setUsers(allUsers);
      return;
    }

    try {
      const results = await usersAPI.search(value);
      setUsers(results);
      setError(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Error al buscar usuarios');
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return styles.badgeAdmin;
      case 'artist':
        return styles.badgeArtist;
      default:
        return styles.badgeListener;
    }
  };

  const getRoleLabel = (backendRol?: string) => {
    const r = backendRol ? backendRol.toLowerCase() : '';
    if (!r) return '—';
    if (r === 'admin') return 'Administrador';
    if (r === 'artista' || r === 'artist') return 'Artista';
    if (r === 'usuario' || r === 'listener') return 'Oyente';
    return r;
  };

  const openCreateUser = () => {
    setEditUserId(null);
    setModalError(null);
    setForm({ email: '', password: '', nombres: '', apellidos: '', nombre_artistico: '', role: 'listener' });
    setShowUserModal(true);
  };

  const openEditUser = (user: UserType) => {
    setEditUserId(String(user.id));
    setModalError(null);
    setForm({
      email: user.email || '',
      password: '',
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      nombre_artistico: user.nombre_artistico || '',
      role: (user.role || 'listener') as UserType['role'],
    });
    setShowUserModal(true);
  };

  const submitUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setModalError(null);
      if (!editUserId) {
        // Crear
        const created = await usersAPI.create({
          email: form.email,
          password: form.password,
          nombres: form.nombres,
          apellidos: form.apellidos,
          nombre_artistico: form.nombre_artistico,
          role: form.role,
        });
        setUsers(prev => [created as any, ...prev]);
      } else {
        // Actualizar (parcial). Si cambia el role y tenemos map, enviar "rol" id
        const payload: any = {
          email: form.email,
          nombres: form.nombres,
          apellidos: form.apellidos,
          nombre_artistico: form.nombre_artistico,
        };
        const roleId = form.role ? rolesMap[form.role] : undefined;
        if (roleId) payload.rol = roleId;
        const updated = await usersAPI.update(editUserId, payload);
        setUsers(prev => prev.map(u => (String(u.id) === String(editUserId) ? (updated as any) : u)));

        // Si se indicó una nueva contraseña en edición, actualizarla
        if (form.password && form.password.length >= 6) {
          await usersAPI.setPassword(editUserId, form.password);
        }
      }
      setShowUserModal(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar usuario';
      if (showUserModal) setModalError(msg); else setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel de Administración</h1>
          <p style={styles.subtitle}>Gestión completa de la plataforma</p>
        </div>
        <Shield style={{ width: '48px', height: '48px', color: '#5BC0DE' }} />
      </div>

      {/* Estadísticas Generales */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Usuarios</div>
          <div style={styles.statContent}>
            <Users style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{totalUsers}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Artistas</div>
          <div style={styles.statContent}>
            <UserCog style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{totalArtists}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Catálogo Musical</div>
          <div style={styles.statContent}>
            <Music style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{totalSongs}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Reproducciones</div>
          <div style={styles.statContent}>
            <TrendingUp style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{(totalPlays / 1000000).toFixed(1)}M</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsList}>
          <button
            style={{...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('users')}
          >
            <Users style={{ width: '16px', height: '16px' }} />
            Usuarios
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'catalog' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('catalog')}
          >
            <Music style={{ width: '16px', height: '16px' }} />
            Catálogo
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'reports' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('reports')}
          >
            <TrendingUp style={{ width: '16px', height: '16px' }} />
            Reportes
          </button>
        </div>

        {/* Gestión de Usuarios */}
        {activeTab === 'users' && (
          <div>
            <div style={styles.searchContainer}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Gestión de Usuarios
                </h2>
                <p style={{ color: '#B8D4E8', fontSize: '14px' }}>
                  Administra roles y permisos
                </p>
                <button
                  onClick={openCreateUser}
                  style={{
                    marginLeft: 12,
                    background: 'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)',
                    color: '#042031',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    boxShadow: '0 8px 18px rgba(11,39,64,0.35)'
                  }}
                >
                  <Plus style={{ width: 16, height: 16 }} /> Nuevo usuario
                </button>
              </div>
              <input
                style={styles.searchInput}
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#B8D4E8' }}>
                  Cargando usuarios...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', color: '#FCA5A5', padding: '16px' }}>{error}</div>
              ) : filteredUsers.map((user) => {
                const backendRole = (user.role || '').toLowerCase();
                const normalizedRole = backendRole === 'admin' ? 'admin' : backendRole === 'artista' || backendRole === 'artist' ? 'artist' : 'listener';
                return (
                <div
                  key={user.id}
                  style={styles.userCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(44, 95, 125, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(74, 159, 184, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 30, 48, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(44, 95, 125, 0.3)';
                  }}
                >
                  <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                      {(user.nombres?.[0] || user.email?.[0] || user.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.userName}>
                        {user.nombres && user.apellidos 
                          ? `${user.nombres} ${user.apellidos}`
                          : user.username || user.email || 'Usuario sin nombre'}
                      </div>
                      <div style={styles.userEmail}>{user.email || 'Sin correo'}</div>
                    </div>
                    <span style={{...styles.badge, ...getRoleBadgeStyle(normalizedRole)}}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.button, ...styles.buttonEdit, background: 'rgba(74, 159, 184, 0.2)' }}
                      onClick={() => openEditUser(user)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(74, 159, 184, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
                      }}
                    >
                      <Edit style={{ width: '16px', height: '16px', color: '#5BC0DE' }} />
                      <span style={{ color: '#5BC0DE' }}>Editar</span>
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.buttonDelete, background: 'rgba(239, 68, 68, 0.2)' }}
                      onClick={() => requestDeleteUser(user)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px', color: '#FCA5A5' }} />
                      <span style={{ color: '#FCA5A5' }}>Eliminar</span>
                    </button>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        )}

        {/* Gestión de Catálogo */}
        {activeTab === 'catalog' && (
          <div>
            <div style={styles.searchContainer}>
              <div>
                <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Catálogo Musical
                </h2>
                <p style={{ color: '#B8D4E8', fontSize: '14px' }}>
                  Gestiona el contenido de la plataforma
                </p>
              </div>
              <input
                style={styles.searchInput}
                placeholder="Buscar canción..."
              />
            </div>

            <div>
              {songs.length === 0 && (
                <div style={{ padding: '12px', color: '#B8D4E8', fontSize: 14 }}>
                  No hay canciones todavía.
                </div>
              )}
              {songs.map((song) => {
                // Adaptar a la forma normalizada de Song en frontend
                const cover = song.coverUrl || '/images/placeholder-cover.png';
                const titulo = song.title;
                const artista = song.artistName;
                const playsLive = livePlays[song.id] ?? song.plays;
                return (
                <div
                  key={song.id}
                  style={styles.songCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(44, 95, 125, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(74, 159, 184, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15, 30, 48, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(44, 95, 125, 0.3)';
                  }}
                >
                  <div style={styles.songInfo}>
                    <img src={cover} alt={titulo} style={styles.songCover} />
                    <div>
                      <div style={styles.songTitle}>{titulo}</div>
                      <div style={styles.songDetails}>{artista} • —</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: '#B8D4E8', fontSize: '13px', fontWeight: '500' }}>
                      {(playsLive / 1000000).toFixed(1)}M plays
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ ...styles.button, ...styles.buttonEdit }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(74, 159, 184, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
                        }}
                      >
                        <Edit style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        style={{ ...styles.button, ...styles.buttonDelete }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ); })}
            </div>
          </div>
        )}

        {/* Reportes */}
        {activeTab === 'reports' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Canciones Más Escuchadas</h3>
              <div>
                {[...songs].sort((a, b) => b.plays - a.plays).slice(0, 5).map((song, index) => {
                  const cover = song.coverUrl || '/images/placeholder-cover.png';
                  const titulo = song.title;
                  const artista = song.artistName;
                  const playsLive = livePlays[song.id] ?? song.plays;
                  return (
                  <div
                    key={song.id}
                    style={styles.reportItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 30, 48, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15, 30, 48, 0.4)';
                    }}
                  >
                    <div style={styles.reportRank}>{index + 1}</div>
                    <img
                      src={cover}
                      alt={titulo}
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#FFFFFF', fontWeight: '500', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {titulo}
                      </div>
                      <div style={{ color: '#B8D4E8', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {artista}
                      </div>
                    </div>
                    <div style={{ color: '#B8D4E8', fontSize: '13px', fontWeight: '600' }}>
                      {(playsLive / 1000000).toFixed(1)}M
                    </div>
                  </div>
                ); })}
              </div>
            </div>

            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>Géneros Populares</h3>
              <div>
                {/* Géneros no disponibles en modelo actual; mostrar agrupación ficticia por artista */}
                {Array.from(new Set(songs.map(s => s.artistName))).map((artista, index) => {
                  const artistSongs = songs.filter(s => s.artistName === artista);
                  const totalArtistPlays = artistSongs.reduce((sum, s) => sum + (livePlays[s.id] ?? s.plays), 0);
                  return (
                    <div
                      key={artista}
                      style={styles.reportItem}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 30, 48, 0.6)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 30, 48, 0.4)'; }}
                    >
                      <div style={styles.reportRank}>{index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#FFFFFF', fontWeight: '500', marginBottom: '2px' }}>{artista}</div>
                        <div style={{ color: '#B8D4E8', fontSize: '13px' }}>{artistSongs.length} canciones</div>
                      </div>
                      <div style={{ color: '#B8D4E8', fontSize: '13px', fontWeight: '600' }}>
                        {(totalArtistPlays / 1000000).toFixed(1)}M plays
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {showUserModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
        >
          <div style={{
            width: 520, maxWidth: '90%', background: 'rgba(15,30,48,0.95)',
            border: '1px solid rgba(74,159,184,0.4)', borderRadius: 12, padding: 20,
            boxShadow: '0 18px 45px rgba(11,39,64,0.45)'
          }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {editUserId ? 'Editar usuario' : 'Crear nuevo usuario'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#a8c9e6', fontSize: 12 }}>Nombres</span>
                <input value={form.nombres} onChange={e=>setForm({...form,nombres:e.target.value})}
                  style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#a8c9e6', fontSize: 12 }}>Apellidos</span>
                <input value={form.apellidos} onChange={e=>setForm({...form,apellidos:e.target.value})}
                  style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }} />
              </label>
              <label style={{ gridColumn:'1 / span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#a8c9e6', fontSize: 12 }}>Email</span>
                <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  type="email"
                  style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }} />
              </label>
              {!editUserId && (
                <label style={{ gridColumn:'1 / span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#a8c9e6', fontSize: 12 }}>Contraseña</span>
                  <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    type="password"
                    style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }} />
                </label>
              )}
              {editUserId && (
                <label style={{ gridColumn:'1 / span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ color: '#a8c9e6', fontSize: 12 }}>Nueva contraseña (opcional)</span>
                  <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    placeholder="Dejar vacío para no cambiar"
                    type="password"
                    style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }} />
                </label>
              )}
              <label style={{ gridColumn:'1 / span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#a8c9e6', fontSize: 12 }}>Nombre artístico (opcional)</span>
                <input value={form.nombre_artistico} onChange={e=>setForm({...form,nombre_artistico:e.target.value})}
                  style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }} />
              </label>
              <label style={{ gridColumn:'1 / span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: '#a8c9e6', fontSize: 12 }}>Rol</span>
                <select value={form.role} onChange={e=>setForm({...form, role: e.target.value as any})}
                  style={{ background:'#0f1f33', border:'1px solid #1d2f46', color:'#fff', borderRadius:8, padding:'8px 10px' }}>
                  <option value="listener">Oyente</option>
                  <option value="artist">Artista</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
            </div>
              {modalError && (
                <div style={{ color:'#FCA5A5', marginTop:8 }}>{modalError}</div>
              )}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
              <button onClick={()=>setShowUserModal(false)}
                style={{ background:'rgba(44,95,125,0.2)', color:'#a8c9e6', border:'1px solid rgba(44,95,125,0.4)', borderRadius:8, padding:'8px 12px' }}>
                Cancelar
              </button>
              <button onClick={submitUser}
                style={{ background:'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)', color:'#042031', border:'none', borderRadius:8, padding:'8px 14px', boxShadow:'0 8px 18px rgba(11,39,64,0.35)' }}>
                {editUserId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
          }}
        >
          <div style={{ width: 420, maxWidth: '90%', background: 'rgba(15,30,48,0.95)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirmar eliminación</h3>
            <p style={{ color: '#FCA5A5', marginBottom: 12 }}>
              ¿Seguro que deseas eliminar a "{userPendingDelete?.name}"? Esta acción no se puede deshacer.
            </p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap: 8 }}>
              <button onClick={() => { setConfirmDeleteOpen(false); setUserPendingDelete(null); }}
                style={{ background:'rgba(44,95,125,0.2)', color:'#a8c9e6', border:'1px solid rgba(44,95,125,0.4)', borderRadius:8, padding:'8px 12px' }}>
                Cancelar
              </button>
              <button onClick={confirmDeleteUser}
                style={{ background:'rgba(239,68,68,0.9)', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', boxShadow:'0 8px 18px rgba(239,68,68,0.25)' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
