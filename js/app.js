// ==========================================
// CONFERÊNCIA PREMMIA
// app.js
//
// CONTROLE GERAL DA APLICAÇÃO
//
// Responsabilidades:
// - Inicializar sistema
// - Atualizar status
// - Atualizar contador
// - Limpar sistema
// - Controlar botão Conferir
//
// A CONFERÊNCIA DOS DADOS É FEITA PELO
// conferencia.js
// ==========================================


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "================================="
        );

        console.log(
            "Sistema Conferência Premmia iniciado."
        );

        console.log(
            "================================="
        );


        inicializarSistema();

    }
);


// ==========================================
// INICIALIZAR SISTEMA
// ==========================================

function inicializarSistema() {

    atualizarStatusSistema(
        "Aguardando carregamento das planilhas."
    );


    atualizarContadorArquivos();


    configurarBotaoLimpar();


    configurarBotaoConferir();


    esconderResultado();

}


// ==========================================
// STATUS DO SISTEMA
// ==========================================

function atualizarStatusSistema(
    mensagem
) {

    const status =
        document.getElementById(
            "statusSistema"
        );


    if (status) {

        status.textContent =
            mensagem;

    }


    console.log(
        mensagem
    );

}


// ==========================================
// BOTÃO CONFERIR
// ==========================================

function configurarBotaoConferir() {

    const btnConferir =
        document.getElementById(
            "btnConferir"
        );


    if (!btnConferir) {

        console.warn(
            "Botão #btnConferir não encontrado."
        );

        return;

    }


    // O conferencia.js também possui
    // o controle do botão.
    //
    // Portanto não adicionamos outro
    // evento aqui para evitar execução
    // duplicada.

}


// ==========================================
// ATUALIZAR BOTÃO CONFERIR
// ==========================================

function atualizarBotaoConferir() {

    const btnConferir =
        document.getElementById(
            "btnConferir"
        );


    if (!btnConferir) {

        return;

    }


    const temPremmia =
        Array.isArray(
            window.dadosPremmia
        ) &&
        window.dadosPremmia.length > 0;


    const temInterno =
        Array.isArray(
            window.dadosInterno
        ) &&
        window.dadosInterno.length > 0;


    btnConferir.disabled =
        !(
            temPremmia &&
            temInterno
        );


    if (
        temPremmia &&
        temInterno
    ) {

        atualizarStatusSistema(
            "As duas planilhas foram carregadas. Pronto para conferir."
        );

    }
    else if (
        temPremmia
    ) {

        atualizarStatusSistema(
            "Planilha Premmia carregada. Aguardando planilha do sistema interno."
        );

    }
    else if (
        temInterno
    ) {

        atualizarStatusSistema(
            "Planilha interna carregada. Aguardando planilha Premmia."
        );

    }
    else {

        atualizarStatusSistema(
            "Aguardando carregamento das planilhas."
        );

    }

}


// ==========================================
// BOTÃO LIMPAR
// ==========================================

function configurarBotaoLimpar() {

    const btnLimpar =
        document.getElementById(
            "btnLimpar"
        );


    // Atualmente o index.html não possui
    // botão Limpar.
    //
    // Se futuramente adicionar o botão,
    // esta função já estará preparada.

    if (!btnLimpar) {

        return;

    }


    btnLimpar.addEventListener(
        "click",
        limparSistema
    );

}


// ==========================================
// LIMPAR SISTEMA
// ==========================================

function limparSistema() {

    const confirmar =
        confirm(
            "Deseja limpar a conferência atual?"
        );


    if (!confirmar) {

        return;

    }


    // ======================================
    // LIMPAR ARQUIVOS
    // ======================================

    const arquivoPremmia =
        document.getElementById(
            "arquivoPremmia"
        );


    const arquivoInterno =
        document.getElementById(
            "arquivoInterno"
        );


    if (arquivoPremmia) {

        arquivoPremmia.value =
            "";

    }


    if (arquivoInterno) {

        arquivoInterno.value =
            "";

    }


    // ======================================
    // LIMPAR NOMES
    // ======================================

    const nomePremmia =
        document.getElementById(
            "nomePremmia"
        );


    const nomeInterno =
        document.getElementById(
            "nomeInterno"
        );


    if (nomePremmia) {

        nomePremmia.textContent =
            "Nenhum arquivo selecionado";

    }


    if (nomeInterno) {

        nomeInterno.textContent =
            "Nenhum arquivo selecionado";

    }


    // ======================================
    // LIMPAR DADOS PREMMIA
    // ======================================

    window.dadosPremmia =
        [];


    // ======================================
    // LIMPAR DADOS INTERNO
    // ======================================

    window.dadosInterno =
        [];


    // ======================================
    // LIMPAR RESULTADOS
    // ======================================

    window.resultadosConferencia =
        [];


    // ======================================
    // LIMPAR TABELA
    // ======================================

    const corpoTabela =
        document.getElementById(
            "corpoTabela"
        );


    if (corpoTabela) {

        corpoTabela.innerHTML =
            "";

    }


    // ======================================
    // ESCONDER RESULTADOS
    // ======================================

    esconderResultado();


    // ======================================
    // RESETAR BOTÃO
    // ======================================

    const btnConferir =
        document.getElementById(
            "btnConferir"
        );


    if (btnConferir) {

        btnConferir.disabled =
            true;

    }


    // ======================================
    // RESETAR FILTROS
    // ======================================

    document
        .querySelectorAll(
            ".filtro"
        )
        .forEach(
            function (botao) {

                botao.classList.remove(
                    "ativo"
                );

            }
        );


    const primeiroFiltro =
        document.querySelector(
            '.filtro[data-filtro="TODOS"]'
        );


    if (primeiroFiltro) {

        primeiroFiltro.classList.add(
            "ativo"
        );

    }


    // ======================================
    // ATUALIZAR CONTADOR
    // ======================================

    atualizarContadorArquivos();


    // ======================================
    // STATUS
    // ======================================

    atualizarStatusSistema(
        "Sistema limpo. Aguardando novas planilhas."
    );


    console.log(
        "Sistema limpo."
    );

}


// ==========================================
// ESCONDER RESULTADOS
// ==========================================

function esconderResultado() {

    const resultado =
        document.getElementById(
            "resultado"
        );


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );


    if (resultado) {

        resultado.style.display =
            "none";

    }


    if (tabela) {

        tabela.style.display =
            "none";

    }

}


// ==========================================
// ATUALIZAR CONTADOR
// ==========================================

function atualizarContadorArquivos() {

    const quantidadePremmia =
        Array.isArray(
            window.dadosPremmia
        )
            ? window.dadosPremmia.length
            : 0;


    const quantidadeInterno =
        Array.isArray(
            window.dadosInterno
        )
            ? window.dadosInterno.length
            : 0;


    // ======================================
    // NOVOS CAMPOS DO INDEX
    // ======================================

    const contadorPremmia =
        document.getElementById(
            "contadorPremmia"
        );


    const contadorInterno =
        document.getElementById(
            "contadorInterno"
        );


    if (contadorPremmia) {

        contadorPremmia.textContent =
            quantidadePremmia;

    }


    if (contadorInterno) {

        contadorInterno.textContent =
            quantidadeInterno;

    }


    // ======================================
    // COMPATIBILIDADE COM HTML ANTIGO
    // ======================================

    const contador =
        document.getElementById(
            "contadorDados"
        );


    if (
        contador &&
        !contadorPremmia &&
        !contadorInterno
    ) {

        contador.innerHTML =
            `
                Premmia:
                <strong>
                    ${quantidadePremmia}
                </strong>
                registros

                &nbsp; | &nbsp;

                Interno:
                <strong>
                    ${quantidadeInterno}
                </strong>
                registros
            `;

    }


    // ======================================
    // ATUALIZA BOTÃO
    // ======================================

    atualizarBotaoConferir();


    console.log(
        "Contador atualizado:",
        {
            Premmia:
                quantidadePremmia,

            Interno:
                quantidadeInterno
        }
    );

}


// ==========================================
// FUNÇÃO AUXILIAR
//
// Pode ser chamada pelo leituraExcel.js
// depois que uma planilha for carregada.
// ==========================================

function atualizarInterfaceArquivos() {

    atualizarContadorArquivos();

}


// ==========================================
// MOSTRAR RESULTADOS
//
// Esta função é apenas uma ponte.
// A renderização real fica no
// conferencia.js.
// ==========================================

function mostrarResultadosTela(
    lista
) {

    if (
        !Array.isArray(lista)
    ) {

        lista =
            window.resultadosConferencia ||
            [];

    }


    const resultado =
        document.getElementById(
            "resultado"
        );


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );


    if (resultado) {

        resultado.style.display =
            "block";

    }


    if (tabela) {

        tabela.style.display =
            "block";

    }


    // Usa as funções do conferencia.js
    if (
        typeof window.atualizarResumo ===
        "function"
    ) {

        window.atualizarResumo();

    }


    if (
        typeof window.renderizarTabela ===
        "function"
    ) {

        window.renderizarTabela(
            lista
        );

    }


    atualizarStatusSistema(
        "Conferência finalizada."
    );

}


// ==========================================
// DISPONIBILIZAR FUNÇÕES GLOBALMENTE
// ==========================================

window.atualizarStatusSistema =
    atualizarStatusSistema;


window.atualizarContadorArquivos =
    atualizarContadorArquivos;


window.atualizarInterfaceArquivos =
    atualizarInterfaceArquivos;


window.atualizarBotaoConferir =
    atualizarBotaoConferir;


window.limparSistema =
    limparSistema;


window.mostrarResultadosTela =
    mostrarResultadosTela;


window.esconderResultado =
    esconderResultado;


console.log(
    "app.js completo carregado."
);
