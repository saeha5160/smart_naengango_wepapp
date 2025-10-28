<!-- src/views/Settings.vue -->
<script setup>
import { reactive } from 'vue'

/* 입력값 보관용 (스크립트 변수) */
const health = reactive({
  height: '',        // cm
  weight: '',        // kg
  age: '',           // years
  sex: '',           // 'female' | 'male' | 'nonbinary' | 'na'
  calorieGoal: ''    // kcal/day
})

/* DB 넣기 직전 payload 생성 (숫자/NULL 캐스팅) */
function buildHealthPayload() {
  const toNum = v => (v === '' ? null : Number(v))
  const payload = {
    height_cm: toNum(health.height),
    weight_kg: toNum(health.weight),
    age_years: toNum(health.age),
    sex: health.sex || null,
    calorie_goal_kcal_per_day: toNum(health.calorieGoal)
  }
  console.log('health payload →', payload)
  return payload
}

/* 선택: 폼 초기화 */
function resetHealth() {
  health.height = ''
  health.weight = ''
  health.age = ''
  health.sex = ''
  health.calorieGoal = ''
}
</script>

<template>

    <div class="card">
      <h3 style="margin:0 0 12px;">Health Profile</h3>

      <form class="grid grid-2" @submit.prevent="buildHealthPayload">
        <div>
          <label for="height" style="display:block; margin-bottom:6px;">키 (cm)</label>
          <input id="height" class="input" type="number" v-model="health.height"
                 placeholder="예: 172.5" min="50" max="250" step="0.1">
        </div>

        <div>
          <label for="weight" style="display:block; margin-bottom:6px;">몸무게 (kg)</label>
          <input id="weight" class="input" type="number" v-model="health.weight"
                 placeholder="예: 63.2" min="20" max="300" step="0.1">
        </div>

        <div>
          <label for="age" style="display:block; margin-bottom:6px;">나이 (세)</label>
          <input id="age" class="input" type="number" v-model="health.age"
                 placeholder="예: 24" min="5" max="120" step="1">
        </div>

        <div>
          <label for="sex" style="display:block; margin-bottom:6px;">성별</label>
          <select id="sex" class="input" v-model="health.sex">
            <option value="" disabled>선택</option>
            <option value="female">여성</option>
            <option value="male">남성</option>
            <option value="na">응답 안 함</option>
          </select>
        </div>

        <div>
          <label for="calorieGoal" style="display:block; margin-bottom:6px;">칼로리 목표 (kcal/일)</label>
          <input id="calorieGoal" class="input" type="number" v-model="health.calorieGoal"
                 placeholder="예: 2000" min="800" max="6000" step="10">
        </div>

        <div class="row" style="margin-top:6px;">
          <button type="submit" class="btn">콘솔로 확인</button>
          <button type="button" class="btn secondary" @click="resetHealth">초기화</button>
        </div>
      </form>
    </div>

</template>
