// ==========================================
// CONFERÊNCIA PREMMIA
// app.js
//
// CONTROLE GERAL DA APLICAÇÃO
//
// IMPORTANTE:
// - Não faz a conferência
// - Não duplica renderização da tabela
// - Não altera a regra dos 10 minutos
// - conferencia.js é responsável pelos resultados
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


    esconderResultado();


    console.log(
        "Sistema pronto."
    );

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
// ESCONDER RESULTADOS
// ==========================================

function esconderResultado() {

    const resultado =
        document.getElementById(
            "resultado"
        );


    if (resultado) {

        resultado.style.display =
            "none";

    }


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );


    if (tabela) {

        tabela.style.display =
            "none";

    }

}


// ==========================================
// MOSTRAR RESULTADOS
//
// Compatibilidade com outros arquivos.
// A renderização real é feita pelo
// conferencia.js.
// ==========================================

function mostrarResultadosTela(
    lista
) {

    const resultados =
        Array.isArray(lista)
            ? lista
            : (
                window.resultadosConferencia ||
                []
            );


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


    // Atualiza resumo usando
    // conferencia.js

    if (
        typeof window.atualizarResumo ===
        "function"
    ) {

        window.atualizarResumo();

    }


    // Renderiza usando
    // conferencia.js

    if (
        typeof window.renderizarTabela ===
        "function"
    ) {

        window.renderizarTabela(
            resultados
        );

    }


    atualizarStatusSistema(
        "Conferência finalizada."
    );


    console.log(
        "Resultados exibidos:",
        resultados.length
    );

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


    const contador =
        document.getElementById(
            "contadorDados"
        );


    if (contador) {

        contador.innerHTML =

            "Premmia: <strong>" +
            quantidadePremmia +
            "</strong> registros" +

            " &nbsp; | &nbsp; " +

            "Interno: <strong>" +
            quantidadeInterno +
            "</strong> registros";

    }


    console.log(
        "Contador atualizado:",
        {
            premmia:
                quantidadePremmia,

            interno:
                quantidadeInterno
        }
    );

}


// ==========================================
// ATUALIZAR BOTÃO CONFERIR
//
// Só libera quando as duas planilhas
// possuem registros.
// ==========================================

function atualizarBotaoConferir() {

    const btnConferir =
        document.getElementById(
            "btnConferir"
        );


    if (!btnConferir) {

        return;

    }


    const possuiPremmia =
        Array.isArray(
            window.dadosPremmia
        ) &&
        window.dadosPremmia.length > 0;


    const possuiInterno =
        Array.isArray(
            window.dadosInterno
        ) &&
        window.dadosInterno.length > 0;


    btnConferir.disabled =
        !(
            possuiPremmia &&
            possuiInterno
        );


    console.log(
        "Botão Conferir:",
        btnConferir.disabled
            ? "DESABILITADO"
            : "HABILITADO"
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
    // LIMPAR ARQUIVO PREMMIA
    // ======================================

    const arquivoPremmia =
        document.getElementById(
            "arquivoPremmia"
        );


    if (arquivoPremmia) {

        arquivoPremmia.value =
            "";

    }


    // ======================================
    // LIMPAR ARQUIVO INTERNO
    // ======================================

    const arquivoInterno =
        document.getElementById(
            "arquivoInterno"
        );


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


    if (nomePremmia) {

        nomePremmia.textContent =
            "Nenhum arquivo selecionado";

    }


    const nomeInterno =
        document.getElementById(
            "nomeInterno"
        );


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
    // LIMPAR DADOS INTERNOS
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
    // RESETAR RESUMO
    // ======================================

    const camposResumo = [

        "totalPortalPremmia",
        "totalSistemaInterno",
        "diferencaTotais",
        "totalCorretas",
        "valorCorretas",
        "totalCorrespondencias",
        "valorCorrespondencias",
        "totalNaoLancadas",
        "valorNaoLancadas",
        "totalLancadasMais",
        "valorLancadasMais",
        "totalValorErrado",
        "valorValorErrado",
        "totalAutorizacao",
        "valorAutorizacao"

    ];


    camposResumo.forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (!elemento) {

                return;

            }


            if (
                id ===
                "totalPortalPremmia" ||

                id ===
                "totalSistemaInterno" ||

                id ===
                "diferencaTotais" ||

                id ===
                "valorCorretas" ||

                id ===
                "valorCorrespondencias" ||

                id ===
                "valorNaoLancadas" ||

                id ===
                "valorLancadasMais" ||

                id ===
                "valorValorErrado" ||

                id ===
                "valorAutorizacao"
            ) {

                elemento.textContent =
                    "R$ 0,00";

            }
            else {

                elemento.textContent =
                    "0";

            }

        }
    );


    // ======================================
    // RESETAR FILTRO
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


    const filtroTodos =
        document.querySelector(
            '.filtro[data-filtro="TODOS"]'
        );


    if (filtroTodos) {

        filtroTodos.classList.add(
            "ativo"
        );

    }


    // ======================================
    // BOTÃO CONFERIR
    // ======================================

    atualizarBotaoConferir();


    // ======================================
    // CONTADOR
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
// COMPATIBILIDADE
//
// Permite que outros arquivos chamem
// atualizarResumo().
// ==========================================

window.atualizarResumo =
function () {

    if (
        typeof window.atualizarResumoConferencia ===
        "function"
    ) {

        window.atualizarResumoConferencia();

        return;

    }


    console.log(
        "Resumo será atualizado pelo conferencia.js."
    );

};


// ==========================================
// FUNÇÕES GLOBAIS
// ==========================================

window.atualizarStatusSistema =
    atualizarStatusSistema;


window.atualizarContadorArquivos =
    atualizarContadorArquivos;


window.atualizarBotaoConferir =
    atualizarBotaoConferir;


window.limparSistema =
    limparSistema;


window.mostrarResultadosTela =
    mostrarResultadosTela;


window.esconderResultado =
    esconderResultado;


// ==========================================
// NÃO USAR:
//
// window.validarArquivos = validarArquivos;
//
// Essa função não existe mais aqui.
// ==========================================


console.log(
    "app.js completo carregado."
);
