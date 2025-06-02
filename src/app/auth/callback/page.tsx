'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (!code) {
        console.error('No se recibió el código de autorización');
        router.push('/login');
        return;
      }

      console.log('Código recibido:', code);
      console.log('State recibido:', state);

      try {
        console.log('Enviando código a backend:', code);
        // Enviar el código al backend para intercambiarlo por un token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code,
            state,
            redirect_uri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI
          }),
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error en la respuesta del backend:', errorData);
          throw new Error('Error al autenticar con Google');
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (!data.access_token) {
          console.error('No se recibió el token de acceso');
          throw new Error('No se recibió el token de acceso');
        }

        // Guardar el token en localStorage
        localStorage.setItem('token', data.access_token);
        
        // Redirigir al dashboard
        console.log('Redirigiendo al dashboard...');
        router.push('/dashboard');
      } catch (error) {
        console.error('Error en el callback:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h2>Procesando autenticación...</h2>
      <div className="spinner"></div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Cargando...</h2>
        <div className="spinner"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
} 