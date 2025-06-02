'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import Image from 'next/image';

interface UserData {
  email: string;
  name?: string;
  picture?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No hay token, redirigiendo a login...');
        router.replace('/login');
        return;
      }

      try {
        console.log('Verificando autenticación...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          console.log('Error en la autenticación, redirigiendo a login...');
          throw new Error('No autorizado');
        }

        const data = await response.json();
        console.log('Datos del usuario recibidos:', data);
        setUserData(data);
      } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
        setError('Error al cargar los datos del usuario');
        localStorage.removeItem('token');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </nav>
      
      <main className={styles.main}>
        <div className={styles.profileCard}>
          {userData?.picture && (
            <Image 
              src={userData.picture} 
              alt="Foto de perfil" 
              className={styles.profilePicture}
              width={100}
              height={100}
            />
          )}
          <h2>Bienvenido, {userData?.name || userData?.email}</h2>
          <p>Email: {userData?.email}</p>
        </div>
      </main>
    </div>
  );
} 