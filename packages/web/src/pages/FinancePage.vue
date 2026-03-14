<template>
  <div class="finance-page">
    <PageHeader :title="t('finance.title')" />
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ t(tab.label) }}
      </button>
    </div>

    <!-- Summary Stats -->
    <div v-if="activeTab === 'transactions'" class="stats">
      <StatCard 
        :label="t('finance.income')" 
        :value="`${currency}${summary.income.toFixed(2)}`"
        :trend="summary.income > 0 ? 0 : undefined"
      />
      <StatCard 
        :label="t('finance.expense')" 
        :value="`${currency}${summary.expense.toFixed(2)}`"
        :trend="summary.expense > 0 ? -1 : undefined"
      />
      <StatCard 
        :label="t('finance.balance')" 
        :value="`${currency}${summary.balance.toFixed(2)}`"
        :trend="summary.balance >= 0 ? 1 : -1"
      />
    </div>

    <!-- Investment Summary -->
    <div v-if="activeTab === 'investments'" class="stats">
      <StatCard 
        :label="t('finance.totalValue')" 
        :value="`${currency}${investmentSummary.totalValue.toFixed(2)}`"
      />
      <StatCard 
        :label="t('finance.gainLoss')" 
        :value="`${investmentSummary.totalGainLoss >= 0 ? '+' : ''}${currency}${investmentSummary.totalGainLoss.toFixed(2)}`"
        :trend="investmentSummary.totalGainLoss >= 0 ? 1 : -1"
      />
      <StatCard 
        :label="t('finance.percentChange')" 
        :value="`${investmentSummary.percentChange >= 0 ? '+' : ''}${investmentSummary.percentChange.toFixed(2)}%`"
        :trend="investmentSummary.percentChange >= 0 ? 1 : -1"
      />
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      
      <!-- Transactions Tab -->
      <div v-if="activeTab === 'transactions'" class="tab-pane">
        <Card variant="form">
          <template #header>
            <h2>{{ t('finance.addTransaction') }}</h2>
          </template>
          <form @submit.prevent="addTransaction" class="form">
            <div class="form-row">
              <select v-model="newTx.type" required>
                <option value="expense">{{ t('finance.expense') }}</option>
                <option value="income">{{ t('finance.income') }}</option>
              </select>
              <input v-model.number="newTx.amount" type="number" step="0.01" :placeholder="t('finance.amount')" required />
            </div>
            <div class="form-row">
              <select v-model="newTx.category_id">
                <option value="">{{ t('finance.selectCategory') }}</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
              <input v-model="newTx.date" type="date" required />
            </div>
            <input v-model="newTx.description" type="text" :placeholder="t('finance.description') + ' (' + t('finance.selectCategory') + ')'" />
            <button type="submit" class="btn-primary">{{ t('finance.addTransaction') }}</button>
          </form>
        </Card>

        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.recentTransactions') }}</h2>
          </template>
          <div class="transaction-list">
            <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
              <div class="tx-info">
                <span class="tx-icon">{{ getCategoryIcon(tx.category_id) }}</span>
                <span class="tx-desc">{{ tx.description || '-' }}</span>
                <span class="tx-date">{{ formatDate(tx.date) }}</span>
              </div>
              <div class="tx-amount" :class="tx.type">
                {{ tx.type === 'income' ? '+' : '-' }}{{ currency }}{{ tx.amount.toFixed(2) }}
              </div>
            </div>
            <EmptyState 
              v-if="transactions.length === 0"
              icon="💳"
              :title="t('finance.noTransactions')"
            />
          </div>
        </Card>
      </div>

      <!-- Budgets Tab -->
      <div v-if="activeTab === 'budgets'" class="tab-pane">
        <Card variant="form">
          <template #header>
            <h2>{{ t('finance.createBudget') }}</h2>
          </template>
          <form @submit.prevent="createBudget" class="form">
            <div class="form-row">
              <select v-model="newBudget.category_id">
                <option value="">{{ t('finance.allCategories') }}</option>
                <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
              <input v-model.number="newBudget.amount" type="number" step="0.01" :placeholder="t('finance.amount')" required />
            </div>
            <select v-model="newBudget.period" required>
              <option value="weekly">{{ t('finance.weekly') }}</option>
              <option value="monthly">{{ t('finance.monthly') }}</option>
              <option value="yearly">{{ t('finance.yearly') }}</option>
            </select>
            <button type="submit" class="btn-primary">{{ t('finance.createBudget') }}</button>
          </form>
        </Card>

        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.budgetProgress') }}</h2>
          </template>
          <div class="budget-list">
            <div v-for="budget in budgets" :key="budget.id" class="budget-item">
              <div class="budget-header">
                <span class="budget-name">{{ budget.category_id ? getCategoryName(budget.category_id) : t('finance.allCategories') }}</span>
                <span class="budget-amount">{{ currency }}{{ budget.spent.toFixed(2) }} / {{ currency }}{{ budget.amount.toFixed(2) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: Math.min((budget.spent / budget.amount) * 100, 100) + '%' }" :class="{ over: budget.spent > budget.amount }"></div>
              </div>
              <div class="budget-actions">
                <button @click="deleteBudget(budget.id)" class="btn-delete">{{ t('finance.delete') }}</button>
              </div>
            </div>
            <EmptyState 
              v-if="budgets.length === 0"
              icon="📊"
              :title="t('finance.noBudgets')"
            />
          </div>
        </Card>
      </div>

      <!-- Investments Tab -->
      <div v-if="activeTab === 'investments'" class="tab-pane">
        <Card variant="form">
          <template #header>
            <h2>{{ t('finance.addInvestment') }}</h2>
          </template>
          <form @submit.prevent="createInvestment" class="form">
            <div class="form-row">
              <input v-model="newInvestment.name" type="text" :placeholder="t('finance.investmentName')" required />
              <select v-model="newInvestment.type" required>
                <option value="stock">{{ t('finance.stock') }}</option>
                <option value="fund">{{ t('finance.fund') }}</option>
                <option value="bond">{{ t('finance.bond') }}</option>
                <option value="crypto">{{ t('finance.crypto') }}</option>
                <option value="other">{{ t('finance.other') }}</option>
              </select>
            </div>
            <div class="form-row">
              <input v-model.number="newInvestment.purchase_price" type="number" step="0.01" :placeholder="t('finance.purchasePrice')" required />
              <input v-model.number="newInvestment.current_price" type="number" step="0.01" :placeholder="t('finance.currentPrice')" required />
            </div>
            <div class="form-row">
              <input v-model.number="newInvestment.quantity" type="number" step="0.0001" :placeholder="t('finance.quantity')" required />
              <input v-model="newInvestment.purchase_date" type="date" required />
            </div>
            <input v-model="newInvestment.notes" type="text" :placeholder="t('finance.notes')" />
            <button type="submit" class="btn-primary">{{ t('finance.addInvestment') }}</button>
          </form>
        </Card>

        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.myInvestments') }}</h2>
          </template>
          <div class="investment-list">
            <div v-for="inv in investments" :key="inv.id" class="investment-item">
              <div class="inv-info">
                <span class="inv-name">{{ inv.name }}</span>
                <span class="inv-type">{{ t('finance.' + inv.type) }}</span>
              </div>
              <div class="inv-values">
                <div class="inv-value">
                  <span class="label">{{ t('finance.currentValue') }}:</span>
                  <span class="value">{{ currency }}{{ (inv.current_price * inv.quantity).toFixed(2) }}</span>
                </div>
                <div class="inv-value" :class="inv.gain_loss >= 0 ? 'positive' : 'negative'">
                  <span class="label">{{ t('finance.gainLoss') }}:</span>
                  <span class="value">{{ inv.gain_loss >= 0 ? '+' : '' }}{{ currency }}{{ inv.gain_loss.toFixed(2) }} ({{ inv.percent_change.toFixed(2) }}%)</span>
                </div>
              </div>
              <div class="inv-actions">
                <button @click="updateInvestmentPrice(inv)" class="btn-small">{{ t('finance.updatePrice') }}</button>
                <button @click="deleteInvestment(inv.id)" class="btn-delete">{{ t('finance.delete') }}</button>
              </div>
            </div>
            <EmptyState 
              v-if="investments.length === 0"
              icon="📈"
              :title="t('finance.noInvestments')"
            />
          </div>
        </Card>
      </div>

      <!-- Bills Tab -->
      <div v-if="activeTab === 'bills'" class="tab-pane">
        <Card variant="form">
          <template #header>
            <h2>{{ t('finance.addBill') }}</h2>
          </template>
          <form @submit.prevent="createBill" class="form">
            <div class="form-row">
              <input v-model="newBill.name" type="text" :placeholder="t('finance.billName')" required />
              <input v-model.number="newBill.amount" type="number" step="0.01" :placeholder="t('finance.amount')" required />
            </div>
            <div class="form-row">
              <input v-model.number="newBill.due_day" type="number" min="1" max="31" :placeholder="t('finance.dueDay')" required />
              <select v-model="newBill.payment_method">
                <option value="">{{ t('finance.paymentMethod') }}</option>
                <option value="bank">{{ t('finance.bankTransfer') }}</option>
                <option value="credit">{{ t('finance.creditCard') }}</option>
                <option value="alipay">{{ t('finance.alipay') }}</option>
                <option value="wechat">{{ t('finance.wechat') }}</option>
                <option value="cash">{{ t('finance.cash') }}</option>
              </select>
            </div>
            <button type="submit" class="btn-primary">{{ t('finance.addBill') }}</button>
          </form>
        </Card>

        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.upcomingBills') }}</h2>
          </template>
          <div class="bill-list">
            <div v-for="bill in upcomingBills" :key="bill.id" class="bill-item">
              <div class="bill-info">
                <span class="bill-name">{{ bill.name }}</span>
                <span class="bill-due">{{ t('finance.dueOn') }} {{ bill.due_date }}</span>
              </div>
              <div class="bill-amount">
                {{ currency }}{{ bill.amount.toFixed(2) }}
              </div>
              <div class="bill-actions">
                <button @click="markBillPaid(bill.id)" class="btn-small btn-paid">{{ t('finance.markPaid') }}</button>
                <button @click="deleteBill(bill.id)" class="btn-delete">{{ t('finance.delete') }}</button>
              </div>
            </div>
            <EmptyState 
              v-if="upcomingBills.length === 0"
              icon="📄"
              :title="t('finance.noUpcomingBills')"
            />
          </div>
        </Card>

        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.allBills') }}</h2>
          </template>
          <div class="bill-list">
            <div v-for="bill in bills" :key="bill.id" class="bill-item">
              <div class="bill-info">
                <span class="bill-name">{{ bill.name }}</span>
                <span class="bill-status" :class="{ inactive: !bill.is_active }">
                  {{ bill.is_active ? t('finance.active') : t('finance.inactive') }}
                </span>
              </div>
              <div class="bill-amount">
                {{ currency }}{{ bill.amount.toFixed(2) }}/{{ t('finance.' + (bill.due_day <= 28 ? 'monthly' : 'yearly')) }}
              </div>
              <div class="bill-actions">
                <button @click="deleteBill(bill.id)" class="btn-delete">{{ t('finance.delete') }}</button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="tab-pane">
        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.monthlyReport') }}</h2>
          </template>
          <div class="report-filters">
            <select v-model="reportYear">
              <option v-for="y in [2023,2024,2025,2026]" :key="y" :value="y">{{ y }}</option>
            </select>
            <select v-model="reportMonth">
              <option v-for="m in 12" :key="m" :value="m">{{ t('finance.month'+m) }}</option>
            </select>
            <button @click="loadMonthlyReport" class="btn-primary">{{ t('finance.generateReport') }}</button>
          </div>
          
          <div v-if="monthlyReport" class="report-content">
            <div class="report-summary">
              <div class="report-item">
                <span class="label">{{ t('finance.income') }}:</span>
                <span class="value positive">{{ currency }}{{ monthlyReport.income.toFixed(2) }}</span>
              </div>
              <div class="report-item">
                <span class="label">{{ t('finance.expense') }}:</span>
                <span class="value negative">{{ currency }}{{ monthlyReport.expense.toFixed(2) }}</span>
              </div>
              <div class="report-item">
                <span class="label">{{ t('finance.balance') }}:</span>
                <span class="value" :class="monthlyReport.balance >= 0 ? 'positive' : 'negative'">
                  {{ currency }}{{ monthlyReport.balance.toFixed(2) }}
                </span>
              </div>
            </div>
            
            <h3>{{ t('finance.expenseByCategory') }}</h3>
            <div class="category-breakdown">
              <div v-for="cat in monthlyReport.byCategory" :key="cat.category_id" class="category-item">
                <span class="cat-name">{{ getCategoryName(cat.category_id) || t('finance.other') }}</span>
                <span class="cat-amount">{{ currency }}{{ cat.total.toFixed(2) }} ({{ cat.percent.toFixed(1) }}%)</span>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="content">
          <template #header>
            <h2>{{ t('finance.exportData') }}</h2>
          </template>
          <div class="export-form">
            <input v-model="exportStartDate" type="date" />
            <span>→</span>
            <input v-model="exportEndDate" type="date" />
            <button @click="exportCSV" class="btn-primary">{{ t('finance.exportCSV') }}</button>
          </div>
        </Card>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import PageHeader from '../components/PageHeader.vue';
import Card from '../components/Card.vue';
import StatCard from '../components/StatCard.vue';
import EmptyState from '../components/EmptyState.vue';

const { t, initLocale, currency } = useI18n();

const tabs = [
  { id: 'transactions', label: 'finance.transactions', icon: '💳' },
  { id: 'budgets', label: 'finance.budgets', icon: '📊' },
  { id: 'investments', label: 'finance.investments', icon: '📈' },
  { id: 'bills', label: 'finance.bills', icon: '📄' },
  { id: 'reports', label: 'finance.reports', icon: '📋' },
];

const activeTab = ref('transactions');

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
}

interface Budget {
  id: string;
  category_id: string | null;
  amount: number;
  period: string;
  spent: number;
}

interface Investment {
  id: string;
  name: string;
  type: string;
  purchase_price: number;
  current_price: number;
  quantity: number;
  purchase_date: string;
  notes: string | null;
  gain_loss: number;
  percent_change: number;
}

interface Bill {
  id: string;
  name: string;
  category_id: string | null;
  amount: number;
  due_day: number;
  payment_method: string | null;
  is_active: boolean;
  due_date?: string;
}

const categories = ref<Category[]>([]);
const transactions = ref<Transaction[]>([]);
const summary = ref({ income: 0, expense: 0, balance: 0, byCategory: [] as any[] });

const budgets = ref<Budget[]>([]);
const investments = ref<Investment[]>([]);
const investmentSummary = ref({ totalValue: 0, totalGainLoss: 0, percentChange: 0 });
const bills = ref<Bill[]>([]);
const upcomingBills = ref<any[]>([]);
const monthlyReport = ref<any>(null);

const reportYear = ref(new Date().getFullYear());
const reportMonth = ref(new Date().getMonth() + 1);
const exportStartDate = ref('');
const exportEndDate = ref('');

const newTx = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  category_id: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
});

const newBudget = reactive({
  category_id: '',
  amount: 0,
  period: 'monthly',
});

const newInvestment = reactive({
  name: '',
  type: 'stock',
  purchase_price: 0,
  current_price: 0,
  quantity: 0,
  purchase_date: new Date().toISOString().split('T')[0],
  notes: '',
});

const newBill = reactive({
  name: '',
  amount: 0,
  due_day: 1,
  payment_method: '',
});

const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'));

onMounted(() => {
  initLocale();
  loadCategories();
  loadTransactions();
  loadSummary();
  loadBudgets();
  loadInvestments();
  loadInvestmentSummary();
  loadBills();
  loadUpcomingBills();
});

async function loadCategories() {
  try {
    const res = await fetch('/api/finance/categories');
    categories.value = await res.json();
    if (categories.value.length > 0) {
      newTx.category_id = categories.value[0].id;
    }
  } catch (e) {
    console.error('Failed to load categories');
  }
}

async function loadTransactions() {
  try {
    const res = await fetch('/api/finance/transactions?limit=20');
    transactions.value = await res.json();
  } catch (e) {
    console.error('Failed to load transactions');
  }
}

async function loadSummary() {
  try {
    const res = await fetch('/api/finance/summary');
    summary.value = await res.json();
  } catch (e) {
    console.error('Failed to load summary');
  }
}

async function addTransaction() {
  if (!newTx.amount || !newTx.date) return;
  try {
    await fetch('/api/finance/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    });
    newTx.amount = 0;
    newTx.description = '';
    await loadTransactions();
    await loadSummary();
  } catch (e) {
    console.error('Failed to add transaction');
  }
}

async function loadBudgets() {
  try {
    const [budgetsRes, progressRes] = await Promise.all([
      fetch('/api/finance/budgets'),
      fetch('/api/finance/budgets/progress?period=monthly'),
    ]);
    const budgetList = await budgetsRes.json();
    const progress = await progressRes.json();
    
    budgets.value = budgetList.map((b: any) => ({
      ...b,
      spent: progress.find((p: any) => p.category_id === b.category_id)?.spent || 0,
    }));
  } catch (e) {
    console.error('Failed to load budgets');
  }
}

async function createBudget() {
  if (!newBudget.amount || !newBudget.period) return;
  try {
    await fetch('/api/finance/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBudget),
    });
    newBudget.amount = 0;
    newBudget.category_id = '';
    await loadBudgets();
  } catch (e) {
    console.error('Failed to create budget');
  }
}

async function deleteBudget(id: string) {
  try {
    await fetch(`/api/finance/budgets/${id}`, { method: 'DELETE' });
    await loadBudgets();
  } catch (e) {
    console.error('Failed to delete budget');
  }
}

async function loadInvestments() {
  try {
    const res = await fetch('/api/finance/investments');
    investments.value = await res.json();
  } catch (e) {
    console.error('Failed to load investments');
  }
}

async function loadInvestmentSummary() {
  try {
    const res = await fetch('/api/finance/investments/summary');
    investmentSummary.value = await res.json();
  } catch (e) {
    console.error('Failed to load investment summary');
  }
}

async function createInvestment() {
  if (!newInvestment.name || !newInvestment.purchase_price || !newInvestment.current_price || !newInvestment.quantity) return;
  try {
    await fetch('/api/finance/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newInvestment, current_price: newInvestment.purchase_price }),
    });
    newInvestment.name = '';
    newInvestment.amount = 0;
    newInvestment.notes = '';
    await loadInvestments();
    await loadInvestmentSummary();
  } catch (e) {
    console.error('Failed to create investment');
  }
}

async function updateInvestmentPrice(inv: Investment) {
  const newPrice = prompt(t('finance.enterNewPrice'), String(inv.current_price));
  if (!newPrice) return;
  try {
    await fetch(`/api/finance/investments/${inv.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_price: parseFloat(newPrice) }),
    });
    await loadInvestments();
    await loadInvestmentSummary();
  } catch (e) {
    console.error('Failed to update investment');
  }
}

async function deleteInvestment(id: string) {
  try {
    await fetch(`/api/finance/investments/${id}`, { method: 'DELETE' });
    await loadInvestments();
    await loadInvestmentSummary();
  } catch (e) {
    console.error('Failed to delete investment');
  }
}

async function loadBills() {
  try {
    const res = await fetch('/api/finance/bills');
    bills.value = await res.json();
  } catch (e) {
    console.error('Failed to load bills');
  }
}

async function loadUpcomingBills() {
  try {
    const res = await fetch('/api/finance/bills/upcoming?days=30');
    upcomingBills.value = await res.json();
  } catch (e) {
    console.error('Failed to load upcoming bills');
  }
}

async function createBill() {
  if (!newBill.name || !newBill.amount || !newBill.due_day) return;
  try {
    await fetch('/api/finance/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBill),
    });
    newBill.name = '';
    newBill.amount = 0;
    await loadBills();
    await loadUpcomingBills();
  } catch (e) {
    console.error('Failed to create bill');
  }
}

async function markBillPaid(id: string) {
  try {
    await fetch(`/api/finance/bills/${id}/paid`, { method: 'POST' });
    await loadUpcomingBills();
  } catch (e) {
    console.error('Failed to mark bill as paid');
  }
}

async function deleteBill(id: string) {
  try {
    await fetch(`/api/finance/bills/${id}`, { method: 'DELETE' });
    await loadBills();
    await loadUpcomingBills();
  } catch (e) {
    console.error('Failed to delete bill');
  }
}

async function loadMonthlyReport() {
  try {
    const res = await fetch(`/api/finance/reports/monthly?year=${reportYear.value}&month=${reportMonth.value}`);
    monthlyReport.value = await res.json();
  } catch (e) {
    console.error('Failed to load monthly report');
  }
}

async function exportCSV() {
  if (!exportStartDate.value || !exportEndDate.value) return;
  try {
    const res = await fetch(`/api/finance/reports/export?startDate=${exportStartDate.value}&endDate=${exportEndDate.value}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  } catch (e) {
    console.error('Failed to export CSV');
  }
}

function getCategoryIcon(categoryId: string): string {
  const cat = categories.value.find(c => c.id === categoryId);
  return cat?.icon || '💰';
}

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return '';
  const cat = categories.value.find(c => c.id === categoryId);
  return cat?.name || '';
}

function formatDate(date: string): string {
  return date?.split('-').slice(1).join('/') || '';
}
</script>

<style scoped>
.finance-page {
  padding: var(--space-lg);
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-secondary);
}

h3 {
  margin: var(--space-lg) 0 var(--space-sm);
  font-size: var(--font-md);
  color: var(--text-tertiary);
}

.tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.tab {
  padding: 10px 16px;
  font-size: var(--font-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab.active {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

input, select {
  padding: var(--space-sm);
  font-size: var(--font-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  outline: none;
}

input:focus, select:focus {
  border-color: var(--accent-primary);
}

.btn-primary {
  padding: var(--space-sm);
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.btn-small {
  padding: 6px 12px;
  font-size: var(--font-xs);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn-delete {
  padding: 6px 12px;
  font-size: var(--font-xs);
  background: transparent;
  color: var(--accent-danger);
  border: 1px solid var(--accent-danger);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn-paid {
  background: var(--accent-success);
  color: var(--bg-primary);
}

/* Transaction List */
.transaction-list, .budget-list, .investment-list, .bill-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.transaction-item, .bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.tx-info, .bill-info, .inv-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.tx-icon { font-size: 18px; }
.tx-desc, .bill-name, .inv-name { color: var(--text-primary); font-size: var(--font-sm); }
.tx-date, .bill-due, .inv-type { color: var(--text-tertiary); font-size: var(--font-xs); margin-left: var(--space-xs); }

.tx-amount, .bill-amount {
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
}
.tx-amount.income { color: var(--accent-success); }
.tx-amount.expense { color: var(--accent-danger); }

.bill-status {
  font-size: var(--font-xs);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--accent-success);
  color: var(--bg-primary);
}
.bill-status.inactive { background: var(--text-tertiary); }

.bill-actions, .inv-actions {
  display: flex;
  gap: var(--space-xs);
}

/* Budget */
.budget-item {
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.budget-name { color: var(--text-primary); font-size: var(--font-sm); }
.budget-amount { color: var(--text-secondary); font-size: var(--font-sm); }

.progress-bar {
  height: 8px;
  background: var(--border-primary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-info), var(--accent-success));
  transition: width var(--transition-base);
}

.progress.over { background: var(--accent-danger); }

.budget-actions {
  margin-top: var(--space-xs);
}

/* Investment */
.investment-item {
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
}

.inv-values {
  margin-top: var(--space-xs);
}

.inv-value {
  display: flex;
  gap: var(--space-xs);
  font-size: var(--font-sm);
}

.inv-value .label { color: var(--text-secondary); }
.inv-value .value { color: var(--text-primary); }
.inv-value.positive .value { color: var(--accent-success); }
.inv-value.negative .value { color: var(--accent-danger); }

/* Report */
.report-filters {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-lg);
}

.report-content {
  margin-top: var(--space-lg);
}

.report-summary {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.report-item {
  display: flex;
  gap: var(--space-xs);
}

.report-item .label { color: var(--text-secondary); }
.report-item .value { font-weight: var(--weight-semibold); }
.report-item .value.positive { color: var(--accent-success); }
.report-item .value.negative { color: var(--accent-danger); }

.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.cat-name { color: var(--text-primary); }
.cat-amount { color: var(--text-secondary); }

.export-form {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .report-summary {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
</style>
