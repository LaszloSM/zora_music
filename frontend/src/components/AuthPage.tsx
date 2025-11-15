import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import logoUrl from '../assets/logo.svg';
import { useAuthStore } from '../stores/auth';

interface AuthPageProps {
  onLogin?: (role: 'listener' | 'artist' | 'admin') => void;
}

type ViewType = 'welcome' | 'login' | 'register-listener';

export function AuthPage({ onLogin }: AuthPageProps) {
  const { login: loginStore, register: registerStore } = useAuthStore();
  const [currentView, setCurrentView] = useState<ViewType>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [nombreArtistico, setNombreArtistico] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<'listener' | 'artist'>('listener');
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaSiteKey = (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) || (import.meta.env.DEV ? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' : '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Intentando login con:', email);
      // Llamar usando la firma correcta (email, password) en lugar de pasar objeto
      await loginStore(email, password);
      console.log('Login exitoso');
      onLogin?.('listener'); // Callback opcional para compatibilidad
    } catch (err: any) {
      console.error('Error en handleLogin:', err);
      setError(err.message || 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent, role: 'listener' | 'artist') => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const siteKey = recaptchaSiteKey || undefined;
      if (siteKey && !captchaToken) {
        setError('Por favor completa el CAPTCHA.');
        setIsLoading(false);
        return;
      }
      console.log('Intentando registro con rol:', role);
      await registerStore({ 
        nombres, 
        apellidos, 
        nombre_artistico: role === 'artist' ? nombreArtistico : undefined,
        email, 
        password, 
        role,
        telefono: telefono || undefined,
        fecha_nacimiento: fechaNacimiento || undefined,
        direccion: direccion || undefined,
        captcha_token: captchaToken || undefined
      });
      console.log('Registro exitoso');
      
      const frontendRole = role === 'artist' ? 'artist' : 'listener';
      onLogin?.(frontendRole); // Callback opcional
    } catch (err: any) {
      console.error('Error en handleRegister:', err);
      if (err.message && err.message.includes('apellidos')) {
        setError('El apellido es obligatorio');
      } else {
        setError(err.message || 'Error al crear la cuenta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0A1628 0%, #1A2B42 50%, #0A1628 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '5rem', left: '2.5rem', width: '24rem', height: '24rem', borderRadius: '9999px', filter: 'blur(80px)', background: 'rgba(74, 159, 184, 0.2)', animation: 'pulse 3s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '5rem', right: '2.5rem', width: '24rem', height: '24rem', borderRadius: '9999px', filter: 'blur(80px)', background: 'rgba(91, 192, 222, 0.15)', animation: 'pulse 3s ease-in-out infinite', animationDelay: '700ms' }}></div>
      </div>

      <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src={logoUrl} alt="Zora Logo" style={{ height: '6rem', margin: '0 auto 1rem auto', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))' }} />
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.5rem' }}>Zora Music</h1>
          <p style={{ color: '#B8D4E8' }}>Tu plataforma de música en streaming</p>
        </div>

        <Card style={{ background: 'rgba(26, 43, 66, 0.95)', border: '2px solid rgba(74, 159, 184, 0.5)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(74, 159, 184, 0.3)' }}>
          {currentView === 'welcome' && (
            <>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <CardTitle style={{ fontSize: '1.875rem', textAlign: 'center', color: '#FFFFFF', fontWeight: '700', marginBottom: '0.5rem' }}>
                  Bienvenido
                </CardTitle>
                <CardDescription style={{ color: '#B8D4E8', textAlign: 'center', fontSize: '1rem' }}>
                  Descubre y disfruta de tu música favorita
                </CardDescription>
              </CardHeader>
              <CardContent style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => setCurrentView('login')}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(74, 159, 184, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #5BC0DE 0%, #6DD0F0 100%)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(91, 192, 222, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 159, 184, 0.4)';
                  }}
                >
                  Iniciar Sesión
                </button>

                <div style={{ position: 'relative', margin: '0.5rem 0' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100%', borderTop: '1px solid #2C5F7D' }}></div>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ padding: '0 1rem', background: 'rgba(26, 43, 66, 0.95)', color: '#B8D4E8', fontSize: '0.875rem' }}>o</span>
                  </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#B8D4E8' }}>¿No tienes cuenta?</p>
                
                <button
                  onClick={() => setCurrentView('register-listener')}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    borderRadius: '0.5rem',
                    border: '2px solid #4A9FB8',
                    background: 'transparent',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(74, 159, 184, 0.2)';
                    e.currentTarget.style.borderColor = '#5BC0DE';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#4A9FB8';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Crear Cuenta Nueva
                </button>
              </CardContent>
            </>
          )}

          {currentView === 'login' && (
            <>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <button
                  onClick={() => setCurrentView('welcome')}
                  style={{
                    width: 'fit-content',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.5rem',
                    marginLeft: '-0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#B8D4E8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(44, 95, 125, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#B8D4E8';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Volver
                </button>
                <CardTitle style={{ fontSize: '1.875rem', color: '#FFFFFF', fontWeight: '700' }}>
                  Iniciar Sesión
                </CardTitle>
                <CardDescription style={{ color: '#B8D4E8', fontSize: '1rem' }}>
                  Ingresa tus credenciales para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {error && (
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      color: '#FCA5A5',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="email" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Correo Electrónico
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          paddingLeft: '2.5rem',
                          height: '3rem',
                          background: '#0F1E30',
                          border: '2px solid #2C5F7D',
                          borderRadius: '0.5rem',
                          color: '#FFFFFF',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A9FB8';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#2C5F7D';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="password" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Contraseña
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          paddingLeft: '2.5rem',
                          height: '3rem',
                          background: '#0F1E30',
                          border: '2px solid #2C5F7D',
                          borderRadius: '0.5rem',
                          color: '#FFFFFF',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A9FB8';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#2C5F7D';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      fontWeight: '700',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: isLoading ? '#4A9FB8' : 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)',
                      color: '#FFFFFF',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 30px rgba(74, 159, 184, 0.4)',
                      transition: 'all 0.3s ease',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #5BC0DE 0%, #6DD0F0 100%)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(91, 192, 222, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 159, 184, 0.4)';
                      }
                    }}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                </form>
              </CardContent>
            </>
          )}

          {currentView === 'register-listener' && (
            <>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <button
                  onClick={() => setCurrentView('welcome')}
                  style={{
                    width: 'fit-content',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.5rem',
                    marginLeft: '-0.5rem',
                    marginBottom: '0.5rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#B8D4E8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(44, 95, 125, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#B8D4E8';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Volver
                </button>
                <CardTitle style={{ fontSize: '1.875rem', color: '#FFFFFF', fontWeight: '700' }}>
                  Crear Cuenta
                </CardTitle>
                <CardDescription style={{ color: '#B8D4E8', fontSize: '1rem' }}>
                  ¡Únete a la comunidad de Zora Music!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleRegister(e, userType)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {error && (
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(248, 113, 113, 0.3)',
                      color: '#FCA5A5',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Label style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '1rem' }}>
                      Tipo de Cuenta
                    </Label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setUserType('listener')}
                        style={{
                          height: '3.5rem',
                          fontWeight: '700',
                          fontSize: '1rem',
                          borderRadius: '0.5rem',
                          border: userType === 'listener' ? 'none' : '2px solid #2C5F7D',
                          background: userType === 'listener' ? 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)' : 'transparent',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: userType === 'listener' ? '0 10px 30px rgba(74, 159, 184, 0.4)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        🎧 Oyente
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('artist')}
                        style={{
                          height: '3.5rem',
                          fontWeight: '700',
                          fontSize: '1rem',
                          borderRadius: '0.5rem',
                          border: userType === 'artist' ? 'none' : '2px solid #2C5F7D',
                          background: userType === 'artist' ? 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)' : 'transparent',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: userType === 'artist' ? '0 10px 30px rgba(74, 159, 184, 0.4)' : 'none',
                          transition: 'all 0.3s'
                        }}
                      >
                        🎤 Artista
                      </button>
                    </div>
                  </div>

                  {userType === 'artist' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Label htmlFor="nombre-artistico" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                        Nombre Artístico <span style={{ color: '#5BC0DE' }}>*</span>
                      </Label>
                      <div style={{ position: 'relative' }}>
                        <UserIcon style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                        <Input
                          id="nombre-artistico"
                          type="text"
                          placeholder="Tu nombre artístico"
                          value={nombreArtistico}
                          onChange={(e) => setNombreArtistico(e.target.value)}
                          required={userType === 'artist'}
                          style={{
                            paddingLeft: '2.5rem',
                            height: '3rem',
                            background: '#0F1E30',
                            border: '2px solid #2C5F7D',
                            borderRadius: '0.5rem',
                            color: '#FFFFFF',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#4A9FB8';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = '#2C5F7D';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#B8D4E8' }}>Este será el nombre que verán tus fans</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="nombres" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Nombres
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <UserIcon style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                      <Input
                        id="nombres"
                        type="text"
                        placeholder="Tus nombres"
                        value={nombres}
                        onChange={(e) => setNombres(e.target.value)}
                        required
                        style={{
                          paddingLeft: '2.5rem',
                          height: '3rem',
                          background: '#0F1E30',
                          border: '2px solid #2C5F7D',
                          borderRadius: '0.5rem',
                          color: '#FFFFFF',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A9FB8';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#2C5F7D';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="apellidos" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Apellidos
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <UserIcon style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                      <Input
                        id="apellidos"
                        type="text"
                        placeholder="Tus apellidos"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        required
                        style={{
                          paddingLeft: '2.5rem',
                          height: '3rem',
                          background: '#0F1E30',
                          border: '2px solid #2C5F7D',
                          borderRadius: '0.5rem',
                          color: '#FFFFFF',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A9FB8';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#2C5F7D';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="telefono" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Teléfono <span style={{ color: '#B8D4E8', fontWeight: '400', fontSize: '0.875rem' }}>(opcional)</span>
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      style={{
                        height: '3rem',
                        background: '#0F1E30',
                        border: '2px solid #2C5F7D',
                        borderRadius: '0.5rem',
                        color: '#FFFFFF',
                        outline: 'none',
                        transition: 'all 0.2s',
                        paddingLeft: '1rem'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A9FB8';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2C5F7D';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="fecha-nacimiento" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Fecha de Nacimiento <span style={{ color: '#B8D4E8', fontWeight: '400', fontSize: '0.875rem' }}>(opcional)</span>
                    </Label>
                    <Input
                      id="fecha-nacimiento"
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      style={{
                        height: '3rem',
                        background: '#0F1E30',
                        border: '2px solid #2C5F7D',
                        borderRadius: '0.5rem',
                        color: '#FFFFFF',
                        outline: 'none',
                        transition: 'all 0.2s',
                        paddingLeft: '1rem'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A9FB8';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2C5F7D';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="direccion" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Dirección <span style={{ color: '#B8D4E8', fontWeight: '400', fontSize: '0.875rem' }}>(opcional)</span>
                    </Label>
                    <Input
                      id="direccion"
                      type="text"
                      placeholder="Tu dirección"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      style={{
                        height: '3rem',
                        background: '#0F1E30',
                        border: '2px solid #2C5F7D',
                        borderRadius: '0.5rem',
                        color: '#FFFFFF',
                        outline: 'none',
                        transition: 'all 0.2s',
                        paddingLeft: '1rem'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#4A9FB8';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#2C5F7D';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="reg-email" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Correo Electrónico
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          paddingLeft: '2.5rem',
                          height: '3rem',
                          background: '#0F1E30',
                          border: '2px solid #2C5F7D',
                          borderRadius: '0.5rem',
                          color: '#FFFFFF',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A9FB8';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#2C5F7D';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Label htmlFor="reg-password" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                      Contraseña
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#B8D4E8' }} />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        style={{
                          paddingLeft: '2.5rem',
                          height: '3rem',
                          background: '#0F1E30',
                          border: '2px solid #2C5F7D',
                          borderRadius: '0.5rem',
                          color: '#FFFFFF',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#4A9FB8';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 159, 184, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#2C5F7D';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#B8D4E8' }}>Mínimo 8 caracteres</p>
                  </div>

                    {recaptchaSiteKey && (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ReCAPTCHA
                          sitekey={recaptchaSiteKey}
                          onChange={(val) => setCaptchaToken(val)}
                          theme="dark"
                          ref={recaptchaRef}
                        />
                      </div>
                    )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '1.5rem',
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: isLoading ? '#4A9FB8' : 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)',
                      color: '#FFFFFF',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 30px rgba(74, 159, 184, 0.4)',
                      transition: 'all 0.3s ease',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #5BC0DE 0%, #6DD0F0 100%)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(91, 192, 222, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #4A9FB8 0%, #5BC0DE 100%)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(74, 159, 184, 0.4)';
                      }
                    }}
                  >
                    {isLoading ? 'Creando cuenta...' : '✨ Crear Mi Cuenta'}
                  </button>

                  <p style={{ fontSize: '0.75rem', textAlign: 'center', color: '#B8D4E8', lineHeight: '1.5' }}>
                    Al registrarte, aceptas nuestros{' '}
                    <span style={{ color: '#5BC0DE', fontWeight: '500', cursor: 'pointer' }}>
                      Términos de Servicio
                    </span>
                    {' '}y{' '}
                    <span style={{ color: '#5BC0DE', fontWeight: '500', cursor: 'pointer' }}>
                      Política de Privacidad
                    </span>
                  </p>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
