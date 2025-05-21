<template>
  <NuxtLayout name="settings">
    <USeparator label="Change Username" class="mt-4" />

    <USeparator label="Change Email/Password" class="mt-4" />

    <UButton class="mt-6 flex flex-col cursor-pointer" variant="outline" color="error">
      <div class="w-full text-xl text-bold">
        Delete this account
      </div>
      <div class="text-muted">
        Remove your account and all associated data.
      </div>
    </UButton>
  </NuxtLayout>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.bioGroup {
  display: flex;

  height: max-content;
}

.bioInput {
  flex-grow: 1;
}
.bioInput * {
  border-radius: 5px 0px 0px 5px;
  /* border: 1px solid red; */
}
.saveBioBtn {
  flex-grow: 1;
  min-height: 100%;
}

.changePW div {
  padding-left: 0;
  margin-top: 1%;
}
</style>
