<template>
    <n-modal
      :show="show"
      preset="dialog"
      class="modale_conferma"
      :title="titolo"
      :content="messaggio"
      :positive-text="testoConferma"
      :negative-text="testoAnnulla"
      :type="tipo"
      @positive-click="conferma"
      @negative-click="annulla"
      @update:show="chiudi"
    />
</template>


<script setup>
const props = defineProps({
  show: Boolean,
  titolo: { type: String, default: 'Conferma Azione' },
  messaggio: { type: String, default: 'Sei sicuro di voler procedere?' },
  testoConferma: { type: String, default: 'Conferma' },
  testoAnnulla: { type: String, default: 'Annulla' },
  tipo: { type: String, default: 'warning' } // 'warning', 'error', 'info', 'success'
});

const emit = defineEmits(['conferma', 'annulla', 'update:show']);

function conferma() {
  emit('conferma');
}

function annulla() {
  emit('annulla');
  emit('update:show', false);
}

function chiudi(valore) {
  emit('update:show', valore);
}
</script>

<style scoped>

@media (max-width: 748px) {
  :global(.n-modal.modale_conferma .n-dialog__action) {
    display: flex !important;
    flex-direction: column !important; /* forza la colonna */
    gap: 12px !important;
  }

  :global(.n-modal.modale_conferma .n-dialog__action .n-button) {
    margin: 0 !important; /* Rimuove il margine laterale di NaiveUI che sballa il 100% */
    width: 100% !important;
  }
}
</style>