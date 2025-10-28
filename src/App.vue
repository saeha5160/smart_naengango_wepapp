<template>
  <div>


      <h1 class="container" style="text-align: center;"> Smart Replzerator</h1>

    <main class="container">
      <router-view />
    </main>

    <div  style="margin:12px; height:10vh;">
      <nav class="menurow">
        <a href="/inventory" class="optionmenu">Inventory</a>
        <a href="/scan" class="optionmenu">Scan</a>
        <a href="/recipes" class="optionmenu">Recipes</a>
        <a href="/settings" class="optionmenu">Settings</a>
      </nav>
    </div>

  </div>
</template>
