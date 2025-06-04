'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../login/login.module.css';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setMessage({ text: 'Token no válido', type: 'error' });
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pre-enrollment/verify-email?token=` + token, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          setIsValid(true);
          setEmail(data.email);
          setMessage({ text: 'Email verificado correctamente', type: 'success' });
        } else {
          setMessage({ text: 'Token inválido o expirado', type: 'error' });
        }
      } catch (error) {
        setMessage({ text: 'Error al verificar el email', type: 'error' });
        console.error('Error al verificar el email: ', error);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams]);

  const validatePassword = (pass: string): boolean => {
    const hasMinLength = pass.length >= 8;
    const hasNumber = /\d/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasSpecialChar = /[.,\-;+*\/\\]/.test(pass);

    return hasMinLength && hasNumber && hasLowerCase && hasUpperCase && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, incluyendo un número, una minúscula, una mayúscula y un carácter especial (.,-;+*/)');
      return;
    }

    const token = searchParams.get('token');
    if (!token || !email) {
      setMessage({ text: 'Token o email no válido', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          userType: 1,
          email
        }),
      });

      if (response.ok) {
        setMessage({ text: 'Contraseña registrada correctamente', type: 'success' });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        const data = await response.json();
        setMessage({ 
          text: data.message || 'Error al registrar la contraseña', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error al registrar la contraseña: ', error);
      setMessage({ text: 'Error al registrar la contraseña', type: 'error' });
    }
  };

  if (isValidating) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h2>Verificando email...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1>Verificación de Email</h1>
          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}
          <button 
            onClick={() => router.push('/register')} 
            className={styles.submitButton}
          >
            Volver al registro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1>Registrar Contraseña</h1>
        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
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
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {passwordError && (
            <div className={`${styles.message} ${styles.error}`}>
              {passwordError}
            </div>
          )}
          <button type="submit" className={styles.submitButton}>
            Registrar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h2>Cargando...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 