<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">J</div>
        <h1>{{ t('login.welcomeBack') }}</h1>
        <p>{{ t('login.signIn') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <div class="form-field">
          <label>{{ t('login.username') }}</label>
          <input 
            v-model="username" 
            type="text" 
            :placeholder="t('login.username')"
            required
          />
        </div>

        <div class="form-field">
          <label>{{ t('login.password') }}</label>
          <input 
            v-model="password" 
            type="password" 
            :placeholder="t('login.password')"
            required
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('login.testing') : t('login.signInBtn') }}
        </button>

        <div class="divider">{{ t('login.or') }}</div>

        <button type="button" class="btn-secondary" @click="handleSkip" :disabled="loading">
          {{ t('login.skipLogin') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';

const router = useRouter();
const { t, initLocale } = useI18n();

initLocale();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value, 
        password: password.value 
      }),
    });
    const data = await res.json();

    if (data.success && data.token) {
      localStorage.setItem('privy-jiner-session', data.token);
      router.push('/dashboard');
    } else {
      error.value = data.error || 'Login failed';
    }
  } catch (e) {
    error.value = 'Cannot connect to server';
  } finally {
    loading.value = false;
  }
}

async function handleSkip() {
  loading.value = true;
  
  try {
    const res = await fetch('/api/auth/skip-login', {
      method: 'POST',
    });
    const data = await res.json();
    
    if (data.token) {
      localStorage.setItem('privy-jiner-session', data.token);
    } else {
      localStorage.setItem('privy-jiner-session', 'local-mode');
    }
    router.push('/dashboard');
  } catch {
    localStorage.setItem('privy-jiner-session', 'local-mode');
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f0f;
  background-image: radial-gradient(ellipse at 20% 20%, rgba(232, 168, 84, 0.15) 0%, transparent 50%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
}

.login-header {
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid #333;
}

.logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #e8a854 0%, #d4944a 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #0f0f0f;
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #f5f5f5;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #888;
}

.login-form {
  padding: 24px 32px 32px;
}

.error-message {
  padding: 12px;
  background: rgba(232, 84, 84, 0.1);
  color: #e85454;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
}

.form-field input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  color: #f5f5f5;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
}

.form-field input:focus {
  border-color: #e8a854;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #e8a854 0%, #d4944a 100%);
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f0b866 0%, #e8a854 100%);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  color: #888;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #333;
}

.btn-secondary {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  background: transparent;
  color: #888;
  border: 1px solid #333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #242424;
  color: #f5f5f5;
}
</style>
