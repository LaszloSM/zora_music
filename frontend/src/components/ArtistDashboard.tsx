import { useState, useEffect } from 'react';
import { Upload, Music, TrendingUp, Users, BarChart, Trash2 } from 'lucide-react';
import { Song } from '../types';
import { songsAPI, genresAPI, statsAPI } from '../lib/api';

interface ArtistDashboardProps {
  songs: Song[];
  onSongsUpdate?: () => void;
}

interface Genre {
  id: number;
  name: string;
}

interface UploadFormData {
  title: string;
  album: string;
  genre: string;
  audioFile: File | null;
  coverFile: File | null;
}

const styles = {
  container: {
    padding: '24px',
    minHeight: '100%',
    width: '100%',
  },
  header: {
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
  card: {
    background: 'rgba(26, 43, 66, 0.8)',
    border: '2px solid rgba(74, 159, 184, 0.4)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    marginBottom: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  cardDescription: {
    color: '#B8D4E8',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(74, 159, 184, 0.3)',
    transition: 'all 0.3s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
  },
  input: {
    background: '#0F1E30',
    border: '2px solid #2C5F7D',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    background: '#0F1E30',
    border: '2px solid #2C5F7D',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    background: '#0F1E30',
    border: '2px solid #2C5F7D',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  uploadArea: {
    border: '2px dashed rgba(74, 159, 184, 0.3)',
    borderRadius: '8px',
    padding: '32px',
    textAlign: 'center' as const,
    background: 'rgba(15, 30, 48, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  uploadText: {
    color: '#B8D4E8',
    fontSize: '14px',
    marginTop: '12px',
  },
  uploadSubtext: {
    color: 'rgba(184, 212, 232, 0.6)',
    fontSize: '12px',
    marginTop: '8px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  buttonOutline: {
    padding: '10px 20px',
    background: 'transparent',
    border: '2px solid #4A9FB8',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  songStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    fontSize: '13px',
    color: '#B8D4E8',
  },
  songStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  buttonSmall: {
    padding: '6px 12px',
    background: 'rgba(74, 159, 184, 0.2)',
    border: 'none',
    borderRadius: '6px',
    color: '#5BC0DE',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export function ArtistDashboard({ songs, onSongsUpdate }: ArtistDashboardProps) {
  const [uploadMode, setUploadMode] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    album: '',
    genre: '',
    audioFile: null,
    coverFile: null,
  });
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [coverFileName, setCoverFileName] = useState<string>('');
  const [livePlays, setLivePlays] = useState<Record<string, number>>({});

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    let timer: any;
    const poll = async () => {
      try {
        const ids = songs.map(s => s.id);
        if (!ids.length) return;
        const statsMap = await statsAPI.getBulkSongPlays(ids); // devuelve Record<string, number>
        if (statsMap && typeof statsMap === 'object') {
          setLivePlays(prev => ({ ...prev, ...statsMap }));
        }
      } catch (e) {
        console.warn('Artist stats polling error:', e);
      } finally {
        timer = setTimeout(poll, 3000);
      }
    };
    poll();
    return () => timer && clearTimeout(timer);
  }, [songs]);

  const loadGenres = async () => {
    try {
      const data = await genresAPI.getAll();
      setGenres(data);
    } catch (error) {
      console.error('Error al cargar géneros:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, audioFile: file }));
      setAudioFileName(file.name);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverFile: file }));
      setCoverFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.audioFile) {
      alert('Por favor completa el título y selecciona un archivo de audio');
      return;
    }

    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      if (formData.album) uploadData.append('album', formData.album);
      if (formData.genre) uploadData.append('genre', formData.genre);
      uploadData.append('file', formData.audioFile);
      if (formData.coverFile) uploadData.append('cover', formData.coverFile);

      // Usar método correcto definido en songsAPI
      await songsAPI.upload(uploadData);
      
      // Reset form
      setFormData({
        title: '',
        album: '',
        genre: '',
        audioFile: null,
        coverFile: null,
      });
      setAudioFileName('');
      setCoverFileName('');
      setUploadMode(false);
      
      if (onSongsUpdate) onSongsUpdate();
      alert('Canción subida exitosamente');
    } catch (error) {
      console.error('Error al subir canción:', error);
      alert(error instanceof Error ? error.message : 'Error al subir la canción');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta canción?')) {
      return;
    }

    try {
      await songsAPI.delete(songId);
      if (onSongsUpdate) onSongsUpdate();
      alert('Canción eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar canción:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la canción');
    }
  };

  // Estadísticas
  const totalPlays = songs.reduce((sum, song) => sum + (livePlays[song.id] ?? song.plays), 0);
  const avgPlays = songs.length > 0 ? Math.floor(totalPlays / songs.length) : 0;
  const followers = 450000;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Panel de Artista</h1>
        <p style={styles.subtitle}>Gestiona tu contenido y estadísticas</p>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Reproducciones Totales</div>
          <div style={styles.statContent}>
            <BarChart style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{(totalPlays / 1000000).toFixed(1)}M</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Canciones</div>
          <div style={styles.statContent}>
            <Music style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{songs.length}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Seguidores</div>
          <div style={styles.statContent}>
            <Users style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{(followers / 1000).toFixed(0)}K</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Promedio de Plays</div>
          <div style={styles.statContent}>
            <TrendingUp style={{ width: '32px', height: '32px', color: '#5BC0DE' }} />
            <div style={styles.statValue}>{(avgPlays / 1000).toFixed(0)}K</div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>Subir Nueva Canción</div>
            <div style={styles.cardDescription}>Comparte tu música con el mundo</div>
          </div>
          <button
            onClick={() => setUploadMode(!uploadMode)}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #5BC0DE 0%, #6DD0F0 100%)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(91, 192, 222, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 159, 184, 0.3)';
            }}
          >
            <Upload style={{ width: '16px', height: '16px' }} />
            {uploadMode ? 'Cancelar' : 'Nueva Canción'}
          </button>
        </div>

        {uploadMode && (
          <form style={styles.form} onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="title" style={styles.label}>Título de la Canción *</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nombre de la canción"
                  style={styles.input}
                  required
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4A9FB8'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2C5F7D'}
                />
              </div>
              <div style={styles.formGroup}>
                <label htmlFor="album" style={styles.label}>Álbum (opcional)</label>
                <input
                  id="album"
                  name="album"
                  value={formData.album}
                  onChange={handleInputChange}
                  placeholder="Nombre del álbum"
                  style={styles.input}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4A9FB8'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2C5F7D'}
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="genre" style={styles.label}>Género</label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  style={styles.select}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4A9FB8'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#2C5F7D'}
                >
                  <option value="">Selecciona un género</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.name}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Archivo de Audio *</label>
              <input
                type="file"
                id="audioFile"
                accept="audio/mp3,audio/wav,audio/flac,audio/mpeg"
                onChange={handleAudioFileChange}
                style={{ display: 'none' }}
                required
              />
              <label
                htmlFor="audioFile"
                style={styles.uploadArea}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(91, 192, 222, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(74, 159, 184, 0.3)'}
              >
                <Upload style={{ width: '48px', height: '48px', color: '#5BC0DE', margin: '0 auto' }} />
                <p style={styles.uploadText}>
                  {audioFileName || 'Arrastra tu archivo de audio aquí o haz clic para seleccionar'}
                </p>
                <p style={styles.uploadSubtext}>MP3, WAV, FLAC (max. 100MB)</p>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Portada del Álbum (opcional)</label>
              <input
                type="file"
                id="coverFile"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleCoverFileChange}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="coverFile"
                style={styles.uploadArea}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(91, 192, 222, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(74, 159, 184, 0.3)'}
              >
                <Upload style={{ width: '48px', height: '48px', color: '#5BC0DE', margin: '0 auto' }} />
                <p style={styles.uploadText}>
                  {coverFileName || 'Arrastra tu imagen aquí o haz clic para seleccionar'}
                </p>
                <p style={styles.uploadSubtext}>JPG, PNG (min. 1000x1000px)</p>
              </label>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => {
                  setUploadMode(false);
                  setFormData({
                    title: '',
                    album: '',
                    genre: '',
                    audioFile: null,
                    coverFile: null,
                  });
                  setAudioFileName('');
                  setCoverFileName('');
                }}
                style={styles.buttonOutline}
                disabled={isUploading}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                style={{
                  ...styles.button,
                  opacity: isUploading ? 0.6 : 1,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isUploading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #5BC0DE 0%, #6DD0F0 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(91, 192, 222, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUploading) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4A9FB8 0%, #5BC0DE 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 159, 184, 0.3)';
                  }
                }}
              >
                {isUploading ? 'Subiendo...' : 'Subir Canción'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Canciones del artista */}
      <div style={styles.card}>
        <div style={{ marginBottom: '20px' }}>
          <div style={styles.cardTitle}>Mis Canciones</div>
          <div style={styles.cardDescription}>Gestiona tu catálogo musical</div>
        </div>

        <div>
          {songs.length === 0 && (
            <div style={{ padding: '12px', color: '#B8D4E8', fontSize: 14 }}>
              Todavía no has subido canciones.
            </div>
          )}
          {songs.slice(0, 5).map((song) => {
            const cover = song.coverUrl || '/images/placeholder-cover.png';
            const titulo = song.title;
            const album = song.albumName || 'Single';
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
                  <div style={styles.songDetails}>{album}</div>
                </div>
              </div>
              <div style={styles.songStats}>
                <div style={styles.songStat}>
                  <BarChart style={{ width: '16px', height: '16px', color: '#5BC0DE' }} />
                  <span>{(playsLive / 1000000).toFixed(1)}M</span>
                </div>
                <button
                  onClick={() => handleDeleteSong(song.id)}
                  style={{
                    ...styles.buttonSmall,
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.color = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                  Eliminar
                </button>
              </div>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
}
