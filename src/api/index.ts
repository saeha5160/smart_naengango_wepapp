import { http, uploadFormData, apiEnv } from './http'

// 2.1 영수증 업로드 + OCR (백엔드가 다음을 수행: receipts row 생성 → OCR → receipt_items 적재 → 추출 리스트 반환)
export async function ocrReceiptUpload(file: File) {
  const form = new FormData()
  form.append('user_id', String(apiEnv.USER_ID))
  form.append('receipt', file)
  // 백엔드 엔드포인트 예: POST /receipts/ocr
  // 응답: { receipt_id, items: [{ item_name, quantity, expiresAt? }] }
  return uploadFormData(`/receipts/ocr`, form)
}

// 2.2 재고 확정(인식 결과를 실제 재고로 반영)
// INSERT INTO items (없으면 생성) + INSERT INTO inventories (ON DUPLICATE UPDATE)
export async function confirmInventoryBatch(payload: {
  items: { item_name: string; quantity: number; expiration_date?: string }[]
}) {
  return http.post(`/inventories/batch`, {
    user_id: apiEnv.USER_ID,
    items: payload.items,
  })
}

// 2.3 재고 조회 (스키마의 v_inventory_dday 뷰를 쓰거나 inventories JOIN으로 응답)
export async function listInventory(params?: { q?: string }) {
  const q = params?.q ? `&q=${encodeURIComponent(params.q)}` : ''
  return http.get(`/inventories?user_id=${apiEnv.USER_ID}${q}`)
}

// 2.4 재고 삭제
export async function deleteInventory(inventory_id: number) {
  return http.del(`/inventories/${inventory_id}?user_id=${apiEnv.USER_ID}`)
}

// 2.5 레시피 추천 (보유 재료 매칭 결과: used/missing 함께 반환)
export async function recommendedRecipes() {
  return http.get(`/recipes/recommendations?user_id=${apiEnv.USER_ID}`)
}

// 2.6 목표 조회/저장 (user_goals)
export async function getGoals() {
  return http.get(`/users/${apiEnv.USER_ID}/goals`)
}
export async function upsertGoals(daily_calories: number) {
  return http.post(`/users/${apiEnv.USER_ID}/goals`, { daily_calories })
}
