'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Iniciando login...');

    try {
      console.log('Enviando petición al backend...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Respuesta recibida:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!data.token) {
        console.error('No se recibió el token de acceso');
        throw new Error('No se recibió el token de acceso');
      }

      console.log('Guardando token...');
      localStorage.setItem('token', data.token);
      
      console.log('Redirigiendo al dashboard...');
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      console.error('Error en el login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  const handleGoogleLogin = () => {
    console.log('Iniciando Google Login...');

    // Generar un estado aleatorio para prevenir CSRF
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state);

    // Construir la URL de autorización de Google
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || '',
      redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || '',
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });

    console.log('Params:', params.toString());

    // URL directa de Google OAuth
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log('Redirigiendo a:', authUrl);
    window.location.href = authUrl;
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Iniciar Sesión</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Iniciar Sesión
          </button>
        </form>
        <div className={styles.divider}>o</div>
        <div className={styles.oauthContainer}>
          <button onClick={handleGoogleLogin} className={styles.googleButton}>
            <Image 
              src="/google-icon.svg" 
              alt="Google" 
              className={styles.googleIcon}
            />
            Continuar con Google
          </button>
          <Link href="/register" className={styles.oauthButton}>
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
} 