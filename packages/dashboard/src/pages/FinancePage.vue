<template>
  <div class="finance-page">
    <h1>{{ t('finance.title') }}</h1>
    
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
      <div class="stat-card income">
        <div class="stat-value">{{ currency }}{{ summary.income.toFixed(2) }}</div>
        <div class="stat-label">{{ t('finance.income') }}</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-value">{{ currency }}{{ summary.expense.toFixed(2) }}</div>
        <div class="stat-label">{{ t('finance.expense') }}</div>
      </div>
      <div class="stat-card" :class="summary.balance >= 0 ? 'income' : 'expense'">
        <div class="stat-value">{{ currency }}{{ summary.balance.toFixed(2) }}</div>
        <div class="stat-label">{{ t('finance.balance') }}</div>
      </div>
    </div>

    <!-- Investment Summary -->
    <div v-if="activeTab === 'investments'" class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ currency }}{{ investmentSummary.totalValue.toFixed(2) }}</div>
        <div class="stat-label">{{ t('finance.totalValue') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="investmentSummary.totalGainLoss >= 0 ? 'positive' : 'negative'">
          {{ investmentSummary.totalGainLoss >= 0 ? '+' : '' }}{{ currency }}{{ investmentSummary.totalGainLoss.toFixed(2) }}
        </div>
        <div class="stat-label">{{ t('finance.gainLoss') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="investmentSummary.percentChange >= 0 ? 'positive' : 'negative'">
          {{ investmentSummary.percentChange >= 0 ? '+' : '' }}{{ investmentSummary.percentChange.toFixed(2) }}%
        </div>
        <div class="stat-label">{{ t('finance.percentChange') }}</div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      
      <!-- Transactions Tab -->
      <div v-if="activeTab === 'transactions'" class="tab-pane">
        <div class="card">
          <h2>{{ t('finance.addTransaction') }}</h2>
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
        </div>

        <div class="card">
          <h2>{{ t('finance.recentTransactions') }}</h2>
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
            <div v-if="transactions.length === 0" class="empty">
              {{ t('finance.noTransactions') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Budgets Tab -->
      <div v-if="activeTab === 'budgets'" class="tab-pane">
        <div class="card">
          <h2>{{ t('finance.createBudget') }}</h2>
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
        </div>

        <div class="card">
          <h2>{{ t('finance.budgetProgress') }}</h2>
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
            <div v-if="budgets.length === 0" class="empty">
              {{ t('finance.noBudgets') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Investments Tab -->
      <div v-if="activeTab === 'investments'" class="tab-pane">
        <div class="card">
          <h2>{{ t('finance.addInvestment') }}</h2>
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
        </div>

        <div class="card">
          <h2>{{ t('finance.myInvestments') }}</h2>
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
            <div v-if="investments.length === 0" class="empty">
              {{ t('finance.noInvestments') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bills Tab -->
      <div v-if="activeTab === 'bills'" class="tab-pane">
        <div class="card">
          <h2>{{ t('finance.addBill') }}</h2>
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
        </div>

        <div class="card">
          <h2>{{ t('finance.upcomingBills') }}</h2>
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
            <div v-if="upcomingBills.length === 0" class="empty">
              {{ t('finance.noUpcomingBills') }}
            </div>
          </div>
        </div>

        <div class="card">
          <h2>{{ t('finance.allBills') }}</h2>
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
        </div>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="tab-pane">
        <div class="card">
          <h2>{{ t('finance.monthlyReport') }}</h2>
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
        </div>

        <div class="card">
          <h2>{{ t('finance.exportData') }}</h2>
          <div class="export-form">
            <input v-model="exportStartDate" type="date" />
            <span>→</span>
            <input v-model="exportEndDate" type="date" />
            <button @click="exportCSV" class="btn-primary">{{ t('finance.exportCSV') }}</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from '../composables/useI18n';

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
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 24px;
  font-size: 28px;
  color: #f5f5f5;
}

h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #888;
}

h3 {
  margin: 20px 0 12px;
  font-size: 16px;
  color: #aaa;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tab {
  padding: 10px 16px;
  font-size: 14px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: #242424;
  color: #f5f5f5;
}

.tab.active {
  background: #e8a854;
  color: #0f0f0f;
  border-color: #e8a854;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-card.income .stat-value { color: #54e88a; }
.stat-card.expense .stat-value { color: #e85454; }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #e8a854;
  margin-bottom: 4px;
}

.stat-value.positive { color: #54e88a; }
.stat-value.negative { color: #e85454; }

.stat-label {
  font-size: 13px;
  color: #888;
}

.card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

input, select {
  padding: 12px;
  font-size: 14px;
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f5f5f5;
  outline: none;
}

input:focus, select:focus {
  border-color: #e8a854;
}

.btn-primary {
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  background: #e8a854;
  color: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  background: #333;
  color: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-delete {
  padding: 6px 12px;
  font-size: 12px;
  background: transparent;
  color: #e85454;
  border: 1px solid #e85454;
  border-radius: 6px;
  cursor: pointer;
}

.btn-paid {
  background: #54e88a;
  color: #0f0f0f;
}

/* Transaction List */
.transaction-list, .budget-list, .investment-list, .bill-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-item, .bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #242424;
  border-radius: 8px;
}

.tx-info, .bill-info, .inv-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tx-icon { font-size: 18px; }
.tx-desc, .bill-name, .inv-name { color: #f5f5f5; font-size: 14px; }
.tx-date, .bill-due, .inv-type { color: #666; font-size: 12px; margin-left: 8px; }

.tx-amount, .bill-amount {
  font-size: 14px;
  font-weight: 600;
}
.tx-amount.income { color: #54e88a; }
.tx-amount.expense { color: #e85454; }

.bill-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #54e88a;
  color: #0f0f0f;
}
.bill-status.inactive { background: #666; }

.bill-actions, .inv-actions {
  display: flex;
  gap: 8px;
}

/* Budget */
.budget-item {
  padding: 16px;
  background: #242424;
  border-radius: 8px;
  margin-bottom: 12px;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.budget-name { color: #f5f5f5; font-size: 14px; }
.budget-amount { color: #888; font-size: 13px; }

.progress-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #54a8e8, #54e88a);
  transition: width 0.3s;
}

.progress.over { background: #e85454; }

.budget-actions {
  margin-top: 8px;
}

/* Investment */
.inv-values {
  margin-top: 8px;
}

.inv-value {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.inv-value .label { color: #888; }
.inv-value .value { color: #f5f5f5; }
.inv-value.positive .value { color: #54e88a; }
.inv-value.negative .value { color: #e85454; }

/* Report */
.report-filters {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.report-content {
  margin-top: 20px;
}

.report-summary {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #242424;
  border-radius: 8px;
  margin-bottom: 20px;
}

.report-item {
  display: flex;
  gap: 8px;
}

.report-item .label { color: #888; }
.report-item .value { font-weight: 600; }
.report-item .value.positive { color: #54e88a; }
.report-item .value.negative { color: #e85454; }

.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #242424;
  border-radius: 6px;
}

.cat-name { color: #f5f5f5; }
.cat-amount { color: #888; }

.export-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.empty {
  text-align: center;
  padding: 32px;
  color: #666;
}
</style>
