<template>
 <!-- Griglia principale responsiva: 1 colonna su mobile, 2 colonne da medium in su -->
    <n-grid cols="1 m:2" x-gap="16" y-gap="16" responsive="screen" class="griglia_principale">
        <!-- colonna sx, statistiche e analisi -->
        <n-gi>
            <div class="contenitore_statistiche">
                <!-- card media voto  -->
                <n-card class="margine_basso_medio">
                    <n-statistic label="Media Voto Totale" :value="dati_report.media_voto">
                        <template #suffix>
                             / 5
                        </template>
                    </n-statistic>
                    <!-- stelle di valutazione, sola lettura -->
                    <n-rate readonly :allow-half="true" :value="dati_report.media_voto" class="margine_alto_grande" />
                </n-card>
                
                <!-- Sotto-griglia con 2 statistiche riepilogative -->
                <n-grid cols="1 s:2" x-gap="12" y-gap="12" responsive="screen" class="margine_basso_medio">
                    <!-- nr di libri richiesti -->
                    <n-gi>
                        <n-card size="small" class="altezza_piena">
                            <n-statistic label="Libri Richiesti" :value="dati_report.libri_richiesti" />
                         </n-card>
                    </n-gi>
                    <!-- nr di libri prestati -->
                    <n-gi>
                        <n-card size="small" class="altezza_piena">
                            <n-statistic label="Libri Prestati" :value="dati_report.libri_condivisi" />
                        </n-card>
                    </n-gi>
                </n-grid>
                
                <!-- card con analisi delle visualizzazioni dei libri -->
                <n-card title="Analisi Visualizzazioni" size="small" class="altezza_piena">
                    <!-- se non c'è nessuna visualizzazione -->
                    <n-empty v-if="!dati_report.libri_ricercati.length" description="Nessuna Visualizzazione" />
                    <!-- lista TOP e FLOP dei libri più e meno visualizzati -->
                    <n-list hoverable clickable v-else>
                        <n-list-item v-for="(libro, index) in dati_report.libri_ricercati" :key="libro.id">
                            <template #prefix>
                                <n-tag :type="index === 0 ? 'success' : 'error'" size="small" round ghost>
                                    {{ index === 0 ? 'TOP' : 'FLOP' }}
                                </n-tag>
                            </template>
                            <!-- titolo libro -->
                            <n-thing :title="libro.titolo"
                                :description="index === 0 ? 'Il più visualizzato' : 'Il meno visualizzato'" 
                                class="elemento_lista_titolo" />
                            <!-- nr animato di visualizzazioni -->
                            <template #suffix>
                                <div class="suffisso_personalizzato">
                                    <span class="valore_numerico">
                                        <n-number-animation :from="0" :to="libro.visualizzazioni" />
                                    </span>
                                </div>
                            </template>
                        </n-list-item>
                    </n-list>
                </n-card>
            </div>
        </n-gi>

        <n-gi>
            <n-card title="Ultime 10 recensioni ricevute" class="altezza_piena">
                <n-empty v-if="!dati_report.recensioni.length" description="Nessuna recensione ricevuta" />
                <n-list v-else bordered class="lista_scorrimento">
                    <n-list-item v-for="rec in dati_report.recensioni" :key="rec.id">
                        <template #prefix>
                            <n-avatar round size="medium" :src="image_url + '/' + rec.recensore.avatar" />
                        </template>
                        <n-thing :title="rec.recensore?.username || 'Sconosciuto'">
                            <template #description>
                                <div class="allineamento_centro">
                                    <n-rate readonly size="small" :value="rec.voto" />
                                </div>
                            </template>
                            <div class="commento_recensione">"{{ rec.recensione }}"</div>
                            <template #footer>
                                <div class="testo_data">{{ new Date(rec.data_creazione).toLocaleDateString() }}</div>
                            </template>
                        </n-thing>
                    </n-list-item>
                </n-list>
            </n-card>
        </n-gi>

    </n-grid>
</template>

<script setup>
const image_url = import.meta.env.VITE_ROOT_URL

const props = defineProps({
    dati_report: { type: Object, required: true },
})
</script>

<style scoped>
/* Layout e Spaziature */
.griglia_principale {
    padding: 0vw;
}

.margine_basso_medio {
    margin-bottom: 1rem; /* ~16px */
}

.margine_alto_grande {
    margin-top: 2rem; /* ~32px */
}

.altezza_piena {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* Stili Card e Ombre */
.n-card {
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    background-color: var(--pearl-white-bg);
}

/* Tipografia e Liste */
.commento_recensione {
    font-style: italic;
    color: var(--color-text-dark);
    margin-top: 0.25rem;
    font-size: 0.9rem;
    line-height: 1.4;
    opacity: 0.8;
}

.testo_data {
    color: #aaa;
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.allineamento_centro {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.valore_numerico {
    font-size: 1.5rem; /* ~24px */
    font-variant-numeric: tabular-nums;
    font-weight: bold;
    color: var(--btn-primary-color);
}

.suffisso_personalizzato {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 4rem;
}

/* Gestione Overflow Recensioni */
.lista_scorrimento {
    max-height: 31.25rem; /* 500px */
    overflow-y: auto;
    padding-right: 0.5rem;
}

:deep(.n-card__content){
    padding-left: 1vw!important;
    padding-right: 1vw!important;
}

:deep(.n-statistic-value){
    padding-left: 4vw!important;
    padding-right: 4vw!important;
}

:deep(.n-list){
        border-radius: var(--border-radius)!important;
    }

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .griglia_principale {
        padding: 0vw;
    }

    :deep(.n-list-item) {
        padding-left: 4vw!important;
    padding-right: 4vw!important;
    }
    /* Su mobile, lasciamo che il titolo del libro occupi più spazio */
    :deep(.n-thing-main) {
        max-width: 100% !important;
    }

    .valore_numerico {
        font-size: 1.25rem;
    }

    .margine_alto_grande {
        margin-top: 1rem;
        padding-left: 4vw!important;
    }
    :deep(.n-thing .n-thing-main .n-thing-header .n-thing-header__title){
        font-size: 0.85rem!important;
}
}


</style>