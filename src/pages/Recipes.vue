<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { recommendedRecipes } from '@/api'

type Recipe = {
  recipe_id: number; menu: string; image_url?: string|null;
  usedIngredients: string[]; missingIngredients: string[];
}

const all = ref<Recipe[]>([])
const query = ref('')

onMounted(async () => {
  all.value = await recommendedRecipes()
})

const recipes = computed(() =>
  all.value.filter(r => r.menu.toLowerCase().includes(query.value.toLowerCase()))
)
</script>

<template>
  <div class="card">
    <h2>추천 레시피</h2>
    <div class="row" style="margin:10px 0">
      <input class="input" placeholder="제목 검색..." v-model="query" style="max-width:320px">
    </div>

    <div class="grid grid-3">
      <div v-for="r in recipes" :key="r.recipe_id" class="card">
        <h3 style="margin:0 0 6px 0">{{ r.menu }}</h3>
        <div style="font-size:13px; color:#555">사용 재료: {{ r.usedIngredients.join(', ') || '-' }}</div>
        <div v-if="r.missingIngredients.length === 0" class="badge" style="margin-top:8px">지금 바로 가능</div>
        <div v-else style="margin-top:8px; font-size:13px;">
          <strong>부족:</strong> {{ r.missingIngredients.join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>
