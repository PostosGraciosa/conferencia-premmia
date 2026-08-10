```javascript
// ==========================================
// CONFERÊNCIA PREMMIA
// app.js
// Controle geral da aplicação
// ==========================================


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Sistema Conferência Premmia iniciado."
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

    configurarBotaoLimpar();

    configurarFiltros();

    esconderResultado();

}


// ==========================================
// STATUS DO SISTEMA
// ==========================================

function atualizarStatusSistema(mensagem) {

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
// BOTÃO LIMPAR
// ==========================================

function configurarBotaoLimpar() {

    const btnLimpar =
        document.getElementById(
            "btnLimpar"
        );

    if (!btnLimpar) {

        console.warn(
            "Botão Limpar não encontrado."
        );

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
    // LIMPA ARQUIVOS
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

        arquivoPremmia.value = "";

    }


    if (arquivoInterno) {

        arquivoInterno.value = "";

    }


    // ======================================
    // LIMPA NOMES
    // ======================================

    const nomes = [

        "nomePremmia",
        "nomeInterno"

    ];


    nomes.forEach(
        function (id) {

            const elemento =
                document.getElementById(id);

            if (elemento) {

                elemento.textContent =
                    "Nenhum arquivo selecionado";

            }

        }
    );


    // ======================================
    // LIMPA DADOS
    // ======================================

    if (
        Array.isArray(
            window.dadosPremmia
        )
    ) {

        window.dadosPremmia.length = 0;

    }

    if (
        Array.isArray(
            window.dadosInterno
        )
    ) {

        window.dadosInterno.length = 0;

    }


    // ======================================
    // LIMPA RESULTADOS
    // ======================================

    if (
        Array.isArray(
            window.resultadosConferencia
        )
    ) {

        window.resultadosConferencia.length = 0;

    }


    // ======================================
    // LIMPA TABELA
    // ======================================

    const corpoTabela =
        document.getElementById(
            "corpoTabela"
        );

    if (corpoTabela) {

        corpoTabela.innerHTML = "";

    }


    // ======================================
    // ESCONDE RESULTADO
    // ======================================

    esconderResultado();


    // ======================================
    // DESABILITA CONFERIR
    // ======================================

    const btnConferir =
        document.getElementById(
            "btnConferir"
        );

    if (btnConferir) {

        btnConferir.disabled = true;

    }


    // ======================================
    // CONTADOR
    // ======================================

    atualizarContadorArquivos();


    atualizarStatusSistema(
        "Sistema limpo. Aguardando novas planilhas."
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
// ==========================================

function mostrarResultadosTela(lista) {

    console.log(
        "================================"
    );

    console.log(
        "MOSTRANDO RESULTADOS NA TELA"
    );

    console.log(
        "Quantidade:",
        lista.length
    );


    // ======================================
    // MOSTRA BLOCO DE RESULTADO
    // ======================================

    const resultado =
        document.getElementById(
            "resultado"
        );

    if (resultado) {

        resultado.style.display =
            "";

    }


    // ======================================
    // MOSTRA TABELA
    // ======================================

    const tabela =
        document.getElementById(
            "tabelaResultado"
        );

    if (tabela) {

        tabela.style.display =
            "";

    }


    // ======================================
    // ATUALIZA RESUMO
    // ======================================

    atualizarResumoTela(lista);


    // ======================================
    // DESENHA TABELA
    // ======================================

    renderizarTabela(lista);


    atualizarStatusSistema(
        "Conferência finalizada."
    );

}


// ==========================================
// RESUMO
// ==========================================

function atualizarResumoTela(lista) {

    const resumo = {

        CORRETA: 0,

        NAO_LANCADA: 0,

        LANCADA_A_MAIS: 0,

        VALOR_DIVERGENTE: 0,

        AUTORIZACAO_DIVERGENTE: 0

    };


    lista.forEach(
        function (item) {

            if (
                resumo[item.status] !== undefined
            ) {

                resumo[item.status]++;

            }

        }
    );


    alterarTexto(
        "totalCorretas",
        resumo.CORRETA
    );


    alterarTexto(
        "totalNaoLancadas",
        resumo.NAO_LANCADA
    );


    alterarTexto(
        "totalLancadasMais",
        resumo.LANCADA_A_MAIS
    );


    alterarTexto(
        "totalValorErrado",
        resumo.VALOR_DIVERGENTE
    );


    alterarTexto(
        "totalAutorizacao",
        resumo.AUTORIZACAO_DIVERGENTE
    );


    console.log(
        "RESUMO:",
        resumo
    );

}


// ==========================================
// ALTERAR TEXTO
// ==========================================

function alterarTexto(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            valor;

    }

}


// ==========================================
// MOEDA
// ==========================================

function formatarMoeda(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "R$ 0,00";

    }


    const numero =
        Number(valor);


    if (
        Number.isNaN(numero)
    ) {

        return "R$ 0,00";

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarTabela(lista) {

    const corpoTabela =
        document.getElementById(
            "corpoTabela"
        );


    if (!corpoTabela) {

        console.error(
            "Elemento #corpoTabela não encontrado."
        );

        return;

    }


    corpoTabela.innerHTML = "";


    lista.forEach(
        function (item, index) {

            const tr =
                document.createElement(
                    "tr"
                );


            // ==================================
            // STATUS
            // ==================================

            const tdStatus =
                document.createElement(
                    "td"
                );

            tdStatus.textContent =
                traduzirStatus(
                    item.status
                );


            tdStatus.className =
                "status-" +
                String(
                    item.status || ""
                )
                .toLowerCase();


            // ==================================
            // DATA
            // ==================================

            const tdData =
                document.createElement(
                    "td"
                );

            tdData.textContent =
                item.data || "";


            // ==================================
            // HORA
            // ==================================

            const tdHora =
                document.createElement(
                    "td"
                );

            tdHora.textContent =
                item.hora || "";


            // ==================================
            // CLIENTE
            // ==================================

            const tdCliente =
                document.createElement(
                    "td"
                );

            tdCliente.textContent =
                item.cliente || "";


            // ==================================
            // AUTORIZAÇÃO PREMMIA
            // ==================================

            const tdAutPremmia =
                document.createElement(
                    "td"
                );

            tdAutPremmia.textContent =
                item.autorizacaoPremmia || "-";


            // ==================================
            // AUTORIZAÇÃO INTERNO
            // ==================================

            const tdAutInterno =
                document.createElement(
                    "td"
                );

            tdAutInterno.textContent =
                item.autorizacaoInterno || "-";


            // ==================================
            // VALOR PREMMIA
            // ==================================

            const tdValorPremmia =
                document.createElement(
                    "td"
                );

            tdValorPremmia.textContent =
                formatarMoeda(
                    item.valorPremmia
                );


            // ==================================
            // VALOR INTERNO
            // ==================================

            const tdValorInterno =
                document.createElement(
                    "td"
                );

            tdValorInterno.textContent =
                formatarMoeda(
                    item.valorInterno
                );


            // ==================================
            // OPERADOR
            // ==================================

            const tdOperador =
                document.createElement(
                    "td"
                );

            tdOperador.textContent =
                item.operador || "";


            // ==================================
            // FILIAL
            // ==================================

            const tdFilial =
                document.createElement(
                    "td"
                );

            tdFilial.textContent =
                item.filial || "";


            // ==================================
            // TIPO
            // ==================================

            const tdTipo =
                document.createElement(
                    "td"
                );

            tdTipo.textContent =
                item.tipo || "";


            // ==================================
            // OBSERVAÇÃO
            // ==================================

            const tdObservacao =
                document.createElement(
                    "td"
                );

            tdObservacao.textContent =
                item.observacao || "";


            // ==================================
            // ADICIONA COLUNAS
            // ==================================

            tr.appendChild(tdStatus);

            tr.appendChild(tdData);

            tr.appendChild(tdHora);

            tr.appendChild(tdCliente);

            tr.appendChild(tdAutPremmia);

            tr.appendChild(tdAutInterno);

            tr.appendChild(tdValorPremmia);

            tr.appendChild(tdValorInterno);

            tr.appendChild(tdOperador);

            tr.appendChild(tdFilial);

            tr.appendChild(tdTipo);

            tr.appendChild(tdObservacao);


            corpoTabela.appendChild(tr);

        }
    );


    console.log(
        "Tabela renderizada:",
        lista.length,
        "linhas"
    );

}


// ==========================================
// TRADUZIR STATUS
// ==========================================

function traduzirStatus(status) {

    switch (status) {

        case "CORRETA":

            return "✓ CORRETA";


        case "NAO_LANCADA":

            return "✗ NÃO LANÇADA";


        case "LANCADA_A_MAIS":

            return "⚠ LANÇADA A MAIS";


        case "VALOR_DIVERGENTE":

            return "⚠ VALOR DIVERGENTE";


        case "AUTORIZACAO_DIVERGENTE":

            return "⚠ AUTORIZAÇÃO DIVERGENTE";


        default:

            return status || "";

    }

}


// ==========================================
// FILTROS
// ==========================================

function configurarFiltros() {

    const botoes =
        document.querySelectorAll(
            ".filtro"
        );


    botoes.forEach(
        function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    botoes.forEach(
                        function (item) {

                            item.classList.remove(
                                "ativo"
                            );

                        }
                    );


                    botao.classList.add(
                        "ativo"
                    );


                    const filtro =
                        botao.dataset.filtro;


                    const resultados =
                        window.resultadosConferencia ||
                        [];


                    if (
                        filtro === "TODOS"
                    ) {

                        renderizarTabela(
                            resultados
                        );

                        return;

                    }


                    const filtrados =
                        resultados.filter(
                            function (item) {

                                return (
                                    item.status ===
                                    filtro
                                );

                            }
                        );


                    renderizarTabela(
                        filtrados
                    );

                }
            );

        }
    );

}


// ==========================================
// FUNÇÃO CHAMADA PELO CONFERENCIA.JS
// ==========================================

window.atualizarResumo =
function () {

    const resultados =
        window.resultadosConferencia ||
        [];


    atualizarResumoTela(
        resultados
    );

};


// ==========================================
// FUNÇÃO CHAMADA PELO CONFERENCIA.JS
// ==========================================

window.renderizarTabela =
function (lista) {

    if (
        !Array.isArray(lista)
    ) {

        lista =
            window.resultadosConferencia ||
            [];

    }


    // ======================================
    // MOSTRA RESULTADO
    // ======================================

    const resultado =
        document.getElementById(
            "resultado"
        );


    if (resultado) {

        resultado.style.display =
            "";

    }


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );


    if (tabela) {

        tabela.style.display =
            "";

    }


    renderizarTabelaInterna(
        lista
    );

};


// ==========================================
// RENDERIZAÇÃO INTERNA
// ==========================================

function renderizarTabelaInterna(lista) {

    const corpoTabela =
        document.getElementById(
            "corpoTabela"
        );


    if (!corpoTabela) {

        console.error(
            "ERRO: #corpoTabela não existe no HTML."
        );

        return;

    }


    corpoTabela.innerHTML = "";


    lista.forEach(
        function (item) {

            const tr =
                document.createElement(
                    "tr"
                );


            const valores = [

                traduzirStatus(
                    item.status
                ),

                item.data || "",

                item.hora || "",

                item.cliente || "",

                item.autorizacaoPremmia || "-",

                item.autorizacaoInterno || "-",

                formatarMoeda(
                    item.valorPremmia
                ),

                formatarMoeda(
                    item.valorInterno
                ),

                item.operador || "",

                item.filial || "",

                item.tipo || "",

                item.observacao || ""

            ];


            valores.forEach(
                function (valor) {

                    const td =
                        document.createElement(
                            "td"
                        );

                    td.textContent =
                        valor;

                    tr.appendChild(td);

                }
            );


            corpoTabela.appendChild(tr);

        }
    );


    console.log(
        "RESULTADOS EXIBIDOS NA TELA:",
        lista.length
    );

}


// ==========================================
// MONITORAMENTO DOS DADOS
// ==========================================

function atualizarContadorArquivos() {

    const quantidadePremmia =
        window.dadosPremmia?.length || 0;


    const quantidadeInterno =
        window.dadosInterno?.length || 0;


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

}


// ==========================================
// DISPONIBILIZA FUNÇÕES
// ==========================================

window.atualizarStatusSistema =
    atualizarStatusSistema;


window.validarArquivos =
    validarArquivos;


window.atualizarContadorArquivos =
    atualizarContadorArquivos;


window.limparSistema =
    limparSistema;


window.mostrarResultadosTela =
    mostrarResultadosTela;


console.log(
    "app.js completo carregado."
);
```
