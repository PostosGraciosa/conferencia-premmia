// ======================================================
// SISTEMA DE CONFERÊNCIA PREMMIA
// conferencia.js
// ======================================================

let resultadosConferencia = [];

// ======================================================
// RESULTADOS GLOBALMENTE
// ======================================================

Object.defineProperty(window, "resultadosConferencia", {

    configurable: true,

    get: function () {
        return resultadosConferencia;
    },

    set: function (valor) {
        resultadosConferencia =
            Array.isArray(valor) ? valor : [];
    }

});

// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("================================");
    console.log("conferencia.js iniciado");
    console.log("================================");

    ativarBotaoConferir();
    ativarFiltros();

});

// ======================================================
// BOTÃO CONFERIR
// ======================================================

function ativarBotaoConferir() {

    const btn =
        document.getElementById("btnConferir");

    if (!btn) {

        console.error(
            "ERRO: botão #btnConferir não encontrado."
        );

        return;
    }

    btn.addEventListener("click", function (event) {

        event.preventDefault();

        iniciarConferencia();

    });

}

// ======================================================
// INICIAR CONFERÊNCIA
// ======================================================

function iniciarConferencia() {

    const premmia =
        window.dadosPremmia || [];

    const internoOriginal =
        window.dadosInterno || [];

    console.log("================================");
    console.log("INICIANDO CONFERÊNCIA");
    console.log("================================");

    console.log(
        "Portal Premmia:",
        premmia.length
    );

    console.log(
        "Sistema interno:",
        internoOriginal.length
    );

    // ==================================================
    // VALIDAÇÕES
    // ==================================================

    if (premmia.length === 0) {

        alert(
            "Carregue a planilha do Portal Premmia."
        );

        return;
    }

    if (internoOriginal.length === 0) {

        alert(
            "Carregue a planilha do sistema interno."
        );

        return;
    }

    // ==================================================
    // REMOVE LINHAS DE TOTAL
    // ==================================================

    const interno =
        internoOriginal.filter(function (item) {

            return !ehLinhaTotal(item);

        });

    console.log(
        "Sistema após remover totais:",
        interno.length
    );

    // ==================================================
    // LIMPA RESULTADOS ANTERIORES
    // ==================================================

    resultadosConferencia = [];

    // ==================================================
    // CONTROLE DOS LANÇAMENTOS INTERNOS UTILIZADOS
    // ==================================================

    const utilizados =
        new Set();

    // ==================================================
    // CONTROLE DE QUANTIDADES
    // ==================================================

    let corretas = 0;
    let naoLancadas = 0;

    // ==================================================
    // PERCORRE O PORTAL
    // ==================================================

    premmia.forEach(function (venda, indice) {

        console.log(
            "--------------------------------"
        );

        console.log(
            "Portal:",
            indice + 1,
            venda
        );

        // ==================================================
        // PROCURA SOMENTE PELO VALOR
        // ==================================================

        const encontrado =
            encontrarPorValor(
                venda,
                interno,
                utilizados
            );

        // ==================================================
        // NÃO ENCONTRADO
        // ==================================================

        if (!encontrado) {

            naoLancadas++;

            resultadosConferencia.push(

                criarResultado(
                    "NAO_LANCADA",
                    venda,
                    null,
                    "Valor do Portal não localizado no sistema interno."
                )

            );

            return;
        }

        // ==================================================
        // ENCONTRADO
        // ==================================================

        utilizados.add(encontrado);

        corretas++;

        resultadosConferencia.push(

            criarResultado(
                "CORRETA",
                venda,
                encontrado,
                "Valor localizado no sistema interno."
            )

        );

    });

    // ======================================================
    // LANÇAMENTOS A MAIS
    //
    // TUDO QUE SOBROU NO SISTEMA INTERNO
    // NÃO FOI ENCONTRADO NO PORTAL.
    // ======================================================

    let lancadasAMais = 0;

    interno.forEach(function (item) {

        if (
            utilizados.has(item)
        ) {

            return;
        }

        lancadasAMais++;

        resultadosConferencia.push(

            criarResultado(
                "LANCADA_A_MAIS",
                null,
                item,
                "Valor existente no sistema interno sem correspondência no Portal."
            )

        );

    });

    // ======================================================
    // FINAL
    // ======================================================

    console.log("================================");
    console.log("CONFERÊNCIA FINALIZADA");
    console.log("================================");

    console.log(
        "Corretas:",
        corretas
    );

    console.log(
        "Não lançadas:",
        naoLancadas
    );

    console.log(
        "Lançadas a mais:",
        lancadasAMais
    );

    console.log(
        "Total resultados:",
        resultadosConferencia.length
    );

    console.log(
        "Resultados:",
        resultadosConferencia
    );

    // ==================================================
    // MOSTRAR RESULTADOS
    // ==================================================

    mostrarResultados();

}

// ======================================================
// IDENTIFICAR LINHA DE TOTAL
// ======================================================

function ehLinhaTotal(item) {

    if (!item) {
        return false;
    }

    const administradora =
        String(
            item.administradora || ""
        )
        .trim()
        .toUpperCase();

    const hora =
        String(
            item.hora || ""
        )
        .trim();

    const movimento =
        String(
            item.movimento || ""
        )
        .trim();

    const autorizacao =
        String(
            item.autorizacao || ""
        )
        .trim();

    const valor =
        Number(item.valor);

    // ==================================================
    // LINHA DE TOTAL CONHECIDA
    // ==================================================

    if (
        administradora === "" &&
        hora === "" &&
        movimento === "" &&
        autorizacao === "" &&
        Math.round(valor * 100) === 666541
    ) {

        console.log(
            "Linha de TOTAL ignorada:",
            item
        );

        return true;
    }

    return false;

}

// ======================================================
// ENCONTRAR SOMENTE PELO VALOR
// ======================================================

function encontrarPorValor(
    venda,
    interno,
    utilizados
) {

    const valorPortal =
        converterValor(
            venda.valor
        );

    // ==================================================
    // VALOR INVÁLIDO
    // ==================================================

    if (
        valorPortal === null
    ) {

        console.warn(
            "Valor inválido no Portal:",
            venda
        );

        return null;
    }

    // ==================================================
    // PROCURA PRIMEIRO VALOR IGUAL
    // ==================================================

    for (
        let i = 0;
        i < interno.length;
        i++
    ) {

        const item =
            interno[i];

        // Já utilizado
        if (
            utilizados.has(item)
        ) {

            continue;
        }

        const valorInterno =
            converterValor(
                item.valor
            );

        if (
            valorInterno === null
        ) {

            continue;
        }

        // ==================================================
        // COMPARAÇÃO
        // ==================================================

        if (
            valorPortal ===
            valorInterno
        ) {

            return item;

        }

    }

    return null;

}

// ======================================================
// CONVERTER VALOR
// ======================================================
//
// Trabalhamos sempre em CENTAVOS.
// Isso evita problemas como:
//
// 50.00 !== 49.999999999
//
// ======================================================

function converterValor(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;
    }

    // ==================================================
    // SE JÁ FOR NÚMERO
    // ==================================================

    if (
        typeof valor === "number"
    ) {

        if (
            isNaN(valor)
        ) {

            return null;
        }

        return Math.round(
            valor * 100
        );

    }

    // ==================================================
    // TEXTO
    // ==================================================

    let texto =
        String(valor)
        .trim();

    if (
        texto === ""
    ) {

        return null;
    }

    // ==================================================
    // REMOVE R$
    // ==================================================

    texto =
        texto.replace(
            /R\$/gi,
            ""
        )
        .trim();

    // ==================================================
    // FORMATO BRASILEIRO
    //
    // 1.234,56
    //
    // ==================================================

    if (
        texto.includes(",")
    ) {

        texto =
            texto
            .replace(/\./g, "")
            .replace(",", ".");

    }

    const numero =
        Number(texto);

    if (
        isNaN(numero)
    ) {

        return null;
    }

    return Math.round(
        numero * 100
    );

}

// ======================================================
// COMPARAR VALORES
// ======================================================

function mesmoValor(a, b) {

    const valorA =
        converterValor(a);

    const valorB =
        converterValor(b);

    if (
        valorA === null ||
        valorB === null
    ) {

        return false;
    }

    return (
        valorA === valorB
    );

}

// ======================================================
// CRIAR RESULTADO
// ======================================================

function criarResultado(
    status,
    premmia,
    interno,
    observacao
) {

    return {

        status: status,

        data:
            premmia?.data ||
            interno?.data ||
            interno?.movimento ||
            "",

        hora:
            premmia?.hora ||
            interno?.hora ||
            "",

        cliente:
            premmia?.cliente ||
            "",

        cpf:
            premmia?.cpf ||
            "",

        operacao:
            premmia?.operacao ||
            "",

        tipo:
            premmia?.operacao ||
            interno?.tipo ||
            "",

        // Mantemos as autorizações
        // APENAS PARA EXIBIÇÃO.
        //
        // Elas NÃO PARTICIPAM DA CONFERÊNCIA.

        autorizacaoPremmia:
            premmia?.autorizacao ||
            "",

        autorizacaoInterno:
            interno?.autorizacao ||
            "",

        valorPremmia:
            premmia?.valor ??
            null,

        valorInterno:
            interno?.valor ??
            null,

        operador:
            interno?.operador ||
            "",

        filial:
            interno?.filial ||
            "",

        administradora:
            interno?.administradora ||
            "",

        observacao:
            observacao || ""

    };

}

// ======================================================
// MOSTRAR RESULTADOS
// ======================================================

function mostrarResultados() {

    console.log(
        "Mostrando resultados na tela..."
    );

    console.log(
        "Quantidade:",
        resultadosConferencia.length
    );

    atualizarResumo();

    renderizarTabela(
        resultadosConferencia
    );

    mostrarContainerResultado();

    const resultado =
        document.getElementById(
            "resultado"
        );

    if (resultado) {

        setTimeout(function () {

            resultado.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    }

}

// ======================================================
// MOSTRAR CONTAINER
// ======================================================

function mostrarContainerResultado() {

    const ids = [

        "resultado",
        "resultadoConferencia",
        "areaResultado",
        "painelResultado",
        "tabelaResultado"

    ];

    ids.forEach(function (id) {

        const elemento =
            document.getElementById(id);

        if (elemento) {

            elemento.style.display = "";
            elemento.hidden = false;

        }

    });

}

// ======================================================
// RESUMO
// ======================================================

function atualizarResumo() {

    const total = {

        CORRETA: 0,

        NAO_LANCADA: 0,

        LANCADA_A_MAIS: 0,

        VALOR_DIVERGENTE: 0,

        AUTORIZACAO_DIVERGENTE: 0

    };

    resultadosConferencia.forEach(function (item) {

        if (
            total[item.status] !== undefined
        ) {

            total[item.status]++;

        }

    });

    // ==================================================
    // QUANTIDADES
    // ==================================================

    alterarTexto(
        "totalCorretas",
        total.CORRETA
    );

    alterarTexto(
        "totalNaoLancadas",
        total.NAO_LANCADA
    );

    alterarTexto(
        "totalLancadasMais",
        total.LANCADA_A_MAIS
    );

    alterarTexto(
        "totalValorErrado",
        total.VALOR_DIVERGENTE
    );

    alterarTexto(
        "totalAutorizacao",
        total.AUTORIZACAO_DIVERGENTE
    );

    // ==================================================
    // VALORES
    // ==================================================

    const somaCorretas =
        somarValores(
            "CORRETA",
            "valorPremmia"
        );

    const somaNaoLancadas =
        somarValores(
            "NAO_LANCADA",
            "valorPremmia"
        );

    const somaLancadasMais =
        somarValores(
            "LANCADA_A_MAIS",
            "valorInterno"
        );

    alterarTexto(
        "valorCorretas",
        formatarMoeda(
            somaCorretas
        )
    );

    alterarTexto(
        "valorNaoLancadas",
        formatarMoeda(
            somaNaoLancadas
        )
    );

    alterarTexto(
        "valorLancadasMais",
        formatarMoeda(
            somaLancadasMais
        )
    );

    // ==================================================
    // VALOR DIVERGENTE
    //
    // Não é mais utilizado.
    // ==================================================

    alterarTexto(
        "valorValorErrado",
        formatarMoeda(0)
    );

    // ==================================================
    // DIFERENÇA REAL
    // ==================================================

    const totalPortal =
        somarValoresArquivo(
            window.dadosPremmia || []
        );

    const totalSistema =
        somarValoresArquivo(
            (window.dadosInterno || [])
            .filter(function (item) {

                return !ehLinhaTotal(item);

            })
        );

    const diferenca =
        Math.round(
            (
                totalPortal -
                totalSistema
            ) * 100
        ) / 100;

    console.log(
        "================================"
    );

    console.log(
        "TOTAL PORTAL:",
        formatarMoeda(totalPortal)
    );

    console.log(
        "TOTAL SISTEMA:",
        formatarMoeda(totalSistema)
    );

    console.log(
        "DIFERENÇA:",
        formatarMoeda(diferenca)
    );

    console.log(
        "================================"
    );

    // ==================================================
    // CAMPOS OPCIONAIS DO HTML
    // ==================================================

    alterarTexto(
        "totalPortal",
        formatarMoeda(totalPortal)
    );

    alterarTexto(
        "totalSistema",
        formatarMoeda(totalSistema)
    );

    alterarTexto(
        "diferencaLiquida",
        formatarMoeda(
            Math.abs(diferenca)
        )
    );

    let mensagem = "";

    if (
        diferenca > 0
    ) {

        mensagem =
            "Falta lançar " +
            formatarMoeda(diferenca) +
            " no sistema.";

    } else if (
        diferenca < 0
    ) {

        mensagem =
            "O sistema possui " +
            formatarMoeda(
                Math.abs(diferenca)
            ) +
            " a mais que o Portal.";

    } else {

        mensagem =
            "Portal e Sistema estão iguais.";

    }

    alterarTexto(
        "statusDiferenca",
        mensagem
    );

}

// ======================================================
// SOMAR VALORES DOS RESULTADOS
// ======================================================

function somarValores(
    status,
    campo
) {

    let total = 0;

    resultadosConferencia.forEach(function (item) {

        if (
            item.status !== status
        ) {

            return;
        }

        const valor =
            converterValor(
                item[campo]
            );

        if (
            valor !== null
        ) {

            total += valor;

        }

    });

    return total / 100;

}

// ======================================================
// SOMAR VALORES DO ARQUIVO
// ======================================================

function somarValoresArquivo(
    lista
) {

    let totalCentavos = 0;

    lista.forEach(function (item) {

        const valor =
            converterValor(
                item.valor
            );

        if (
            valor !== null
        ) {

            totalCentavos +=
                valor;

        }

    });

    return (
        totalCentavos / 100
    );

}

// ======================================================
// ALTERAR TEXTO
// ======================================================

function alterarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            valor;

    }

}

// ======================================================
// FORMATAR MOEDA
// ======================================================

function formatarMoeda(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}

// ======================================================
// RENDERIZAR TABELA
// ======================================================

function renderizarTabela(
    lista
) {

    console.log(
        "Renderizando tabela:",
        lista.length
    );

    const corpo =
        document.getElementById(
            "corpoTabela"
        );

    if (!corpo) {

        console.error(
            "ERRO: #corpoTabela não encontrado no HTML."
        );

        return;

    }

    corpo.innerHTML = "";

    lista.forEach(function (item) {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                ${escaparHtml(item.status)}
            </td>

            <td>
                ${escaparHtml(item.data)}
            </td>

            <td>
                ${escaparHtml(item.hora)}
            </td>

            <td>
                ${escaparHtml(item.cliente)}
            </td>

            <td>
                ${escaparHtml(item.operacao)}
            </td>

            <td>
                ${escaparHtml(item.autorizacaoPremmia)}
            </td>

            <td>
                ${escaparHtml(item.autorizacaoInterno)}
            </td>

            <td>
                ${formatarMoeda(item.valorPremmia)}
            </td>

            <td>
                ${formatarMoeda(item.valorInterno)}
            </td>

            <td>
                ${escaparHtml(item.operador)}
            </td>

            <td>
                ${escaparHtml(item.observacao)}
            </td>

        `;

        aplicarClasseStatus(
            tr,
            item.status
        );

        corpo.appendChild(tr);

    });

    const tabela =
        document.getElementById(
            "tabelaResultado"
        );

    if (tabela) {

        tabela.style.display = "table";
        tabela.hidden = false;

    }

}

// ======================================================
// ESCAPAR HTML
// ======================================================

function escaparHtml(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ======================================================
// CLASSE STATUS
// ======================================================

function aplicarClasseStatus(
    linha,
    status
) {

    linha.classList.remove(
        "correta",
        "nao-lancada",
        "lancada-a-mais",
        "valor-divergente",
        "autorizacao-divergente"
    );

    switch (status) {

        case "CORRETA":

            linha.classList.add(
                "correta"
            );

            break;

        case "NAO_LANCADA":

            linha.classList.add(
                "nao-lancada"
            );

            break;

        case "LANCADA_A_MAIS":

            linha.classList.add(
                "lancada-a-mais"
            );

            break;

        case "VALOR_DIVERGENTE":

            linha.classList.add(
                "valor-divergente"
            );

            break;

        case "AUTORIZACAO_DIVERGENTE":

            linha.classList.add(
                "autorizacao-divergente"
            );

            break;

    }

}

// ======================================================
// FILTROS
// ======================================================

function ativarFiltros() {

    const filtros =
        document.querySelectorAll(
            ".filtro"
        );

    filtros.forEach(function (botao) {

        botao.addEventListener(
            "click",
            function () {

                filtros.forEach(function (item) {

                    item.classList.remove(
                        "ativo"
                    );

                });

                botao.classList.add(
                    "ativo"
                );

                const filtro =
                    botao.dataset.filtro;

                if (
                    filtro === "TODOS"
                ) {

                    renderizarTabela(
                        resultadosConferencia
                    );

                    return;

                }

                const filtrados =
                    resultadosConferencia.filter(
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

    });

}

// ======================================================
// DISPONIBILIZAR FUNÇÕES
// ======================================================

window.iniciarConferencia =
    iniciarConferencia;

window.mostrarResultados =
    mostrarResultados;

window.renderizarTabela =
    renderizarTabela;

window.atualizarResumo =
    atualizarResumo;

window.mesmoValor =
    mesmoValor;

window.converterValor =
    converterValor;

console.log(
    "conferencia.js completo carregado"
);
