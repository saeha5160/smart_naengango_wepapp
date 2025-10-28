<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { listInventory, deleteInventory } from '@/api'

type Row = {
  inventory_id: number; item_id: number; item_name: string;
  quantity: number; expiration_date?: string|null; purchased_date?: string|null;
  dday?: number|null; created_at?: string; updated_at?: string;
}

const rows = ref<Row[]>([])
const q = ref('')

async function load() {
  const data = await listInventory()
  rows.value = data
}
onMounted(load)

async function removeItem(id: number) {
  await deleteInventory(id)
  rows.value = rows.value.filter(r => r.inventory_id !== id)
}

const filtered = computed(() => {
  const w = q.value.trim().toLowerCase()
  return rows.value
    .filter(r => !w || r.item_name.toLowerCase().includes(w))
    .sort((a,b) => {
      const ad = a.dday ?? 9e9, bd = b.dday ?? 9e9
      return ad - bd || a.item_name.localeCompare(b.item_name)
    })
})
</script>

<template>
  <div class="card">
    <h2>재고 / 유통기한</h2>
    <div class="row" style="margin:10px 0">
      <input class="input" placeholder="검색..." v-model="q" style="max-width:320px">
      <span class="badge">총 {{ filtered.length }}개 품목</span>
    </div>
    <table class="table">
      <thead><tr><th>품목</th><th>수량</th><th>유통기한</th><th>D-Day</th><th></th></tr></thead>
      <tbody>
        <tr v-for="r in filtered" :key="r.inventory_id">
          <td>{{ r.item_name }}</td>
          <td>{{ r.quantity }}</td>
          <td>{{ r.expiration_date || '-' }}</td>
          <td :style="{ color: r.dday!=null && r.dday<=3 ? '#dc2626' : '#111' }">
            {{ r.dday ?? '-' }}
          </td>
          <td><button class="btn secondary" @click="removeItem(r.inventory_id)">삭제</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
