<template>
  <div class="contacts-page">
    <h1>{{ t('contacts.title') }}</h1>

    <div class="toolbar">
      <input v-model="search" type="text" :placeholder="t('contacts.search')" class="search-input" @input="loadContacts" />
      <button @click="showAddModal = true" class="btn-primary">{{ t('contacts.addContact') }}</button>
    </div>

    <div class="card" v-if="upcomingBirthdays.length > 0">
      <h2>{{ t('contacts.upcomingBirthdays') }}</h2>
      <div class="birthday-list">
        <div v-for="c in upcomingBirthdays" :key="c.id" class="birthday-item">
          <span class="bday-icon">🎂</span>
          <span class="bday-name">{{ c.name }}</span>
          <span class="bday-date">{{ c.birthday }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="contact-list">
        <div v-for="contact in contacts" :key="contact.id" class="contact-item">
          <div class="contact-info">
            <span class="contact-name">{{ contact.name }}</span>
            <span class="contact-details">{{ contact.phone || contact.email || '' }}</span>
          </div>
          <div class="contact-actions">
            <button @click="editContact(contact)" class="btn-small">✏️</button>
            <button @click="deleteContact(contact.id)" class="btn-delete">✕</button>
          </div>
        </div>
        <div v-if="contacts.length === 0" class="empty">{{ t('contacts.noContacts') }}</div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>{{ editingContact ? t('contacts.editContact') : t('contacts.addContact') }}</h3>
        <form @submit.prevent="saveContact" class="form">
          <input v-model="form.name" type="text" :placeholder="t('contacts.name')" required />
          <input v-model="form.phone" type="tel" :placeholder="t('contacts.phone')" />
          <input v-model="form.email" type="email" :placeholder="t('contacts.email')" />
          <input v-model="form.birthday" type="date" :placeholder="t('contacts.birthday')" />
          <input v-model="form.company" type="text" :placeholder="t('contacts.company')" />
          <textarea v-model="form.notes" :placeholder="t('contacts.notes')" rows="2"></textarea>
          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn-cancel">{{ t('common.cancel') }}</button>
            <button type="submit" class="btn-primary">{{ t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t, initLocale } = useI18n();

const contacts = ref<any[]>([]);
const upcomingBirthdays = ref<any[]>([]);
const search = ref('');
const showAddModal = ref(false);
const editingContact = ref<any>(null);

const form = reactive({
  name: '',
  phone: '',
  email: '',
  birthday: '',
  company: '',
  notes: '',
});

onMounted(() => {
  initLocale();
  loadContacts();
  loadBirthdays();
});

async function loadContacts() {
  try {
    const url = search.value ? `/api/contacts/contacts?search=${encodeURIComponent(search.value)}` : '/api/contacts/contacts';
    contacts.value = await (await fetch(url)).json();
  } catch (e) {
    console.error('Failed to load contacts');
  }
}

async function loadBirthdays() {
  try {
    upcomingBirthdays.value = await (await fetch('/api/contacts/contacts/birthdays/upcoming?days=30')).json();
  } catch (e) {
    console.error('Failed to load birthdays');
  }
}

function editContact(contact: any) {
  editingContact.value = contact;
  form.name = contact.name;
  form.phone = contact.phone || '';
  form.email = contact.email || '';
  form.birthday = contact.birthday || '';
  form.company = contact.company || '';
  form.notes = contact.notes || '';
  showAddModal.value = true;
}

async function saveContact() {
  try {
    if (editingContact.value) {
      await fetch(`/api/contacts/contacts/${editingContact.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/contacts/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    showAddModal.value = false;
    editingContact.value = null;
    Object.assign(form, { name: '', phone: '', email: '', birthday: '', company: '', notes: '' });
    loadContacts();
  } catch (e) {
    console.error('Failed to save contact');
  }
}

async function deleteContact(id: string) {
  if (!confirm('Delete this contact?')) return;
  try {
    await fetch(`/api/contacts/contacts/${id}`, { method: 'DELETE' });
    loadContacts();
  } catch (e) {
    console.error('Failed to delete contact');
  }
}
</script>

<style scoped>
.contacts-page {
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #f5f5f5;
}

h2, h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #888;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
}

.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.contact-list, .birthday-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #242424;
  border-radius: 8px;
}

.contact-name {
  color: #f5f5f5;
  font-weight: 500;
}

.contact-details {
  color: #888;
  font-size: 13px;
  margin-left: 8px;
}

.contact-actions {
  display: flex;
  gap: 8px;
}

.btn-small, .btn-delete {
  padding: 6px 10px;
  font-size: 12px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 6px;
  cursor: pointer;
  color: #888;
}

.btn-delete {
  color: #e85454;
  border-color: #e85454;
}

.btn-primary {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  background: #e8a854;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.birthday-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #242424;
  border-radius: 8px;
}

.bday-icon { font-size: 18px; }
.bday-name { color: #f5f5f5; }
.bday-date { color: #888; margin-left: auto; }

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form input, .form textarea {
  padding: 12px;
  font-size: 14px;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  background: #333;
  color: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 32px;
  color: #666;
}
</style>
