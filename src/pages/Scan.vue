<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 1) 먼저 안전한 목업 바인딩
let uploadReceiptImage: (f: File)=>Promise<any> = async () => ({ receipt_id: 123 })
let getOcrItems: (rid: number)=>Promise<any> = async () => ({
  items: [
    { item_name: '우유', category: '유제품', expiration_date: new Date(Date.now()+7*864e5).toISOString().slice(0,10) },
    { item_name: '달걀', category: '난류' }
  ]
})
let upsertItemsBatch: (arg:{items:any[]})=>Promise<any> = async () => ({ ok:true })

// 2) 화면 상태
type ItemRow = { item_name: string; category: string; basic_expiration_days: number|null; _expiration_date_from_ocr?: string }
const file = ref<File|null>(null)
const receiptId = ref<number|null>(null)
const items = ref<ItemRow[]>([])
const uploading = ref(false)
const loadingItems = ref(false)
const notice = ref('컴포넌트 로드 OK')
const apiReady = ref(false)   // 실제 API 모듈 로딩 여부

// 3) onMounted에서 동적 임포트 (탑레벨 await 금지)
onMounted(async () => {
  try {
    const m = await import('@/api')  // 실패해도 화면은 이미 떠 있음
    if (m.uploadReceiptImage) uploadReceiptImage = m.uploadReceiptImage
    if (m.getOcrItems)        getOcrItems        = m.getOcrItems
    if (m.upsertItemsBatch)   upsertItemsBatch   = m.upsertItemsBatch
    apiReady.value = true
    notice.value = 'API 모듈 로드 완료'
  } catch (e:any) {
    apiReady.value = false
    notice.value = `API 모듈 로드 실패: ${e?.message || e}`
    // 실패해도 목업으로 동작
  }
})

function daysBetween(todayISO: string, futureISO: string) {
  const t = new Date(todayISO).getTime()
  const f = new Date(futureISO).getTime()
  if (Number.isNaN(t) || Number.isNaN(f)) return null
  const d = Math.round((f - t) / 86400000)
  return d >= 0 ? d : null
}

async function saveImage() {
  if (!file.value) { alert('파일 선택해줘'); return }
  uploading.value = true
  try {
    const res = await uploadReceiptImage(file.value)
    receiptId.value = res.receipt_id
    notice.value = `이미지 저장 완료 (receipt_id=${receiptId.value})`
  } catch (e:any) {
    notice.value = e?.message || '이미지 저장 실패'
  } finally {
    uploading.value = false
  }
}

async function fetchExtracted() {
  if (!receiptId.value) { alert('먼저 이미지 저장해 receipt_id 받아와'); return }
  loadingItems.value = true
  try {
    const data = await getOcrItems(receiptId.value)
    const todayISO = new Date().toISOString().slice(0,10)
    items.value = (data.items || []).map((x:any) => ({
      item_name: String(x.item_name || '').trim(),
      category:  String(x.category  || '').trim(),
      basic_expiration_days: x.expiration_date ? daysBetween(todayISO, x.expiration_date) : null,
      _expiration_date_from_ocr: x.expiration_date || undefined
    }))
  } catch (e:any) {
    notice.value = e?.message || '추출값 불러오기 실패'
  } finally {
    loadingItems.value = false
  }
}

async function saveItemsToDB() {
  if (!items.value.length) { alert('저장할 항목 없음'); return }
  const payload = items.value.map(({ item_name, category, basic_expiration_days }) => ({
    item_name, category, basic_expiration_days: basic_expiration_days ?? null
  }))
  try {
    await upsertItemsBatch({ items: payload })
    notice.value = 'items 테이블 저장 완료'
  } catch (e:any) {
    notice.value = e?.message || 'DB 저장 실패'
  }
}
</script>

<template>
  <div class="wrap">
    <div class="banner">
      <b>{{ notice }}</b>
      <span style="margin-left:8px; opacity:.7">[API: {{ apiReady ? 'OK' : 'Mock' }}]</span>
    </div>

    <div class="card">
      <h2>영수증 이미지 저장</h2>
      <div class="row">
        <input type="file" accept="image/*,application/pdf"
               @change="(e:any)=> (file = e.target.files?.[0] || null)" />
        <button class="btn" :disabled="!file || uploading" @click="saveImage">
          {{ uploading ? '저장 중...' : '이미지 저장' }}
        </button>
      </div>
      <p v-if="receiptId" class="hint">receipt_id: <b>{{ receiptId }}</b></p>
    </div>

    <div class="card">
      <h2>추출값 불러오기</h2>
      <button class="btn" :disabled="!receiptId || loadingItems" @click="fetchExtracted">
        {{ loadingItems ? '불러오는 중...' : 'OCR 결과 가져오기' }}
      </button>
    </div>

    <div class="card" v-if="items.length">
      <h2>items 테이블 저장 전 검수</h2>
      <table class="table">
        <thead><tr><th>item_name</th><th>category</th><th>basic_expiration_days</th></tr></thead>
        <tbody>
          <tr v-for="(r,i) in items" :key="i">
            <td><input type="text" v-model.trim="r.item_name" /></td>
            <td><input type="text" v-model.trim="r.category" /></td>
            <td><input type="number" min="0" v-model.number="r.basic_expiration_days" /></td>
          </tr>
        </tbody>
      </table>
      <button class="btn" style="margin-top:12px" @click="saveItemsToDB">DB 저장</button>
    </div>
  </div>
</template>

