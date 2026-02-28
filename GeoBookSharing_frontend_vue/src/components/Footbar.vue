<template>
    <n-layout-footer class="footer" bordered>
        <div class="contenuto_footer">
            <p class="testo_citazione_footer">
                GeoBookSharing – Leggere è viaggiare senza muoversi
            </p>
            <small class="testo_licenza">© {{ new Date().getFullYear() }} GeoBookshelf – Rilasciato sotto Licenza MIT</small>
        </div>
    </n-layout-footer>
</template>

<style scoped>
.footer {
    /* padding fluido: minimo 1rem, massimo 2rem */
    padding: clamp(1rem, 3vh, 2rem);
    text-align: center;

    /* uso le variabili per i colori se mancano browser usa il fallback*/
    background-color: var(--dark_gray, #5c5b5be0);
    color: var(--text-color-light, #ffffff);

    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* flex container per l'allineamento verticale */
.contenuto_footer {
    /* flexbox per mettere citazione e copyright uno sopra l'altro centrati, column */
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Distanza fissa proporzionale tra i due testi */
    align-items: center;

    /* Il contenuto non si allarga mai oltre i 1400px; 'margin: 0 auto' lo tiene al centro negli schermi molto grandi */
    max-width: var(--container-max-width, 1400px);
    margin: 0 auto;
}

/* Testo della citazione */
.testo_citazione_footer {
    /* font size adattivo*/
    font-size: clamp(0.875rem, 2vw, 1rem);
    font-weight: 500;
    opacity: 0.9; /* leggermente trasparente */
    margin: 0;
    letter-spacing: 0.01em; /* Un minimo di spazio in piu tra le lettere per migliorare la leggibilita */
}

/* testo del copyright */
.testo_licenza {
    /* Font size adattivo tra 11px e 13px non invadente*/
    font-size: clamp(0.7rem, 1.5vw, 0.8125rem);
    opacity: 0.7; /* leggermente piu trasparente delal citazione*/
}

/* Ottimizzazione per mobile (tablet e smartphone) */
@media (max-width: 768px) {
    .footer  {
        padding: 1.25rem 1rem;
    }

    .testo_citazione_footer {
        line-height: 1.4; /* aumenta lo spazio tra le righe se la citazione va a capo */
        max-width: 80%; /* evita che la citazione tocchi i bordi su mobile */
    }
}
</style>