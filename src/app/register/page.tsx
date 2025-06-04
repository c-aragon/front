'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    console.log('Iniciando registro...');

    try {
      console.log('Enviando petición al backend...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pre-enrollment/request-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          userType: 1,
         }),
      });

      console.log('Respuesta recibida:', response.status);
      
      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: data.message || 'Registro exitoso', 
          type: 'success' 
        });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({ 
          text: 'Error al registrar el email', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Error en el registro:', err);
      setMessage({ 
        text: 'Error al registrar el email', 
        type: 'error' 
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Registro</h1>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
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
          <button type="submit" className={styles.submitButton}>
            Registrarse
          </button>
        </form>
        <div className={styles.divider}>o</div>
        <button 
          onClick={() => router.push('/login')} 
          className={styles.oauthButton}
        >
          Ya tengo una cuenta
        </button>
      </div>
    </div>
  );
} 