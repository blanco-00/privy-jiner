<template>
  <div class="contacts-page">
    <PageHeader :title="t('contacts.title')" />

    <div class="toolbar">
      <input v-model="search" type="text" :placeholder="t('contacts.search')" class="search-input" @input="loadContacts" />
      <button @click="showAddModal = true" class="btn-primary">{{ t('contacts.addContact') }}</button>
    </div>

    <Card variant="content" v-if="upcomingBirthdays.length > 0" class="birthday-card">
      <template #header>
        <h2>{{ t('contacts.upcomingBirthdays') }}</h2>
      </template>
      <div class="birthday-list">
        <div v-for="c in upcomingBirthdays" :key="c.id" class="birthday-item">
          <span class="bday-icon">🎂</span>
          <span class="bday-name">{{ c.name }}</span>
          <span class="bday-date">{{ c.birthday }}</span>
        </div>
      </div>
    </Card>

    <Card variant="content" class="contacts-card">
      <div v-if="contacts.length > 0" class="contact-list">
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
      </div>
      <EmptyState
        v-else
        icon="👥"
        :title="t('contacts.noContacts')"
        :action-label="t('contacts.addContact')"
        @action="showAddModal = true"
      />
    </Card>

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
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/Card.vue';
import EmptyState from '../components/EmptyState.vue';

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
  padding: var(--space-lg);
  max-width: 800px;
  margin: 0 auto;
}

.birthday-card {
  margin-bottom: var(--space-lg);
}

.birthday-card h2 {
  margin: 0;
  font-size: var(--font-md);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.contact-list, .birthday-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.contact-name {
  color: var(--text-primary);
  font-weight: var(--weight-medium);
}

.contact-details {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-left: var(--space-sm);
}

.contact-actions {
  display: flex;
  gap: 8px;
}

.btn-small, .btn-delete {
  padding: 6px 10px;
  font-size: var(--font-xs);
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
}

.btn-delete {
  color: var(--color-error);
  border-color: var(--color-error);
}

.btn-primary {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.birthday-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.bday-icon { font-size: var(--font-lg); }
.bday-name { color: var(--text-primary); }
.bday-date { color: var(--text-secondary); margin-left: auto; }

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
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 400px;
  max-width: 90%;
}

.modal-content h3 {
  margin: 0 0 var(--space-md);
  font-size: var(--font-lg);
  color: var(--text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form input, .form textarea {
  padding: var(--space-md);
  font-size: var(--font-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.btn-cancel {
  flex: 1;
  padding: var(--space-md);
  font-size: var(--font-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}
</style>
