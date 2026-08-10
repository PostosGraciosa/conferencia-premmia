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

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarSistemaConferencia
    );

} else {

    iniciarSistemaConferencia();

}


// ======================================================
// INICIAR SISTEMA
// ======================================================

function iniciarSistemaConferencia() {

    console.log("================================");
    console.log("CONFERENCIA.JS INICIADO");
    console.log("================================");

    ativarBotaoConferir();
    ativarFiltros();

}


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

    console.log(
        "Botão Conferir encontrado."
    );

    // Evita adicionar o evento duas vezes
    btn.onclick = function (event) {

        event.preventDefault();

        console.log(
            "================================"
        );

        console.log(
            "BOTÃO CONFERIR CLICADO"
        );

        console.log(
            "================================"
        );

        iniciarConferencia();

    };

    console.log(
        "Evento do botão Conferir conectado."
    );

}


// ======================================================
// INICIAR CONFERÊNCIA
// ======================================================

function iniciarConferencia() {

    console.log("================================");
    console.log("INICIANDO CONFERÊNCIA");
    console.log("================================");


    const premmia =
        Array.isArray(window.dadosPremmia)
            ? window.dadosPremmia
            : [];


    const internoOriginal =
        Array.isArray(window.dadosInterno)
            ? window.dadosInterno
            : [];


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
    // LIMPA RESULTADOS
    // ==================================================

    resultadosConferencia = [];


    // ==================================================
    // CONTROLE DOS LANÇAMENTOS UTILIZADOS
    // ==================================================

    const utilizados =
        new Set();


    // ==================================================
    // PERCORRE PORTAL
    // ==================================================

    premmia.forEach(function (venda, indice) {

        console.log("--------------------------------");

        console.log(
            "Analisando Portal:",
            indice + 1,
            venda
        );


        // ==================================================
        // PROCURA PELO VALOR + HORÁRIO
        // ==================================================

        const encontrado =
            encontrarMelhorCorrespondencia(
                venda,
                interno,
                utilizados
            );


        // ==================================================
        // NÃO ENCONTRADO
        // ==================================================

        if (!encontrado) {

            console.log(
                "NÃO ENCONTRADO:",
                venda
            );


            resultadosConferencia.push(

                criarResultado(
                    "NAO_LANCADA",
                    venda,
                    null,
                    "Transação do Portal não localizada no sistema pelo valor e horário aproximado."
                )

            );

            return;
        }


        // ==================================================
        // ENCONTRADO
        // ==================================================

        utilizados.add(encontrado);


        console.log(
            "CORRESPONDÊNCIA ENCONTRADA:",
            encontrado
        );


        resultadosConferencia.push(

            criarResultado(
                "CORRETA",
                venda,
                encontrado,
                "Transação localizada pelo valor e horário aproximado."
            )

        );

    });


    // ======================================================
    // LANÇAMENTOS A MAIS
    // ======================================================

    interno.forEach(function (item) {

        if (
            utilizados.has(item)
        ) {

            return;
        }


        resultadosConferencia.push(

            criarResultado(
                "LANCADA_A_MAIS",
                null,
                item,
                "Lançamento existente no sistema interno sem correspondência no Portal."
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
        "Resultados:",
        resultadosConferencia
    );


    // ==================================================
    // MOSTRAR RESULTADOS
    // ==================================================

    mostrarResultados();

}


// ======================================================
// ENCONTRAR MELHOR CORRESPONDÊNCIA
// ======================================================
//
// REGRA:
//
// 1. Mesmo valor
// 2. Entre os valores iguais, escolhe o horário
//    mais próximo
//
// Não considera autorização.
// Não considera operador.
// ======================================================

function encontrarMelhorCorrespondencia(
    venda,
    interno,
    utilizados
) {

    const valorPortal =
        converterValor(
            venda.valor
        );


    if (
        valorPortal === null
    ) {

        return null;
    }


    const horaPortal =
        obterDataHora(
            venda
        );


    let melhor =
        null;

    let menorDiferenca =
        Infinity;


    interno.forEach(function (item) {

        // Já utilizado
        if (
            utilizados.has(item)
        ) {

            return;
        }


        const valorInterno =
            converterValor(
                item.valor
            );


        // Valor diferente
        if (
            valorInterno !== valorPortal
        ) {

            return;
        }


        // ==================================================
        // HORÁRIO
        // ==================================================

        const horaInterno =
            obterDataHora(
                item
            );


        // ==================================================
        // SE NÃO CONSEGUIR LER HORÁRIO
        // ==================================================
        //
        // Ainda permite encontrar pelo valor.
        // ==================================================

        if (
            horaPortal === null ||
            horaInterno === null
        ) {

            if (!melhor) {

                melhor = item;
                menorDiferenca = 0;

            }

            return;
        }


        // ==================================================
        // DIFERENÇA EM MILISSEGUNDOS
        // ==================================================

        const diferenca =
            Math.abs(
                horaPortal -
                horaInterno
            );


        // ==================================================
        // GUARDA O MAIS PRÓXIMO
        // ==================================================

        if (
            diferenca <
            menorDiferenca
        ) {

            menorDiferenca =
                diferenca;

            melhor =
                item;

        }

    });


    return melhor;

}


// ======================================================
// OBTER DATA/HORA
// ======================================================

function obterDataHora(item) {

    if (!item) {

        return null;
    }


    // ==================================================
    // DATA
    // ==================================================

    let data =
        item.data ||
        item.movimento ||
        "";


    // ==================================================
    // HORA
    // ==================================================

    let hora =
        item.hora ||
        "";


    data =
        String(data).trim();


    hora =
        String(hora).trim();


    // ==================================================
    // SE NÃO TEM NADA
    // ==================================================

    if (
        !data &&
        !hora
    ) {

        return null;
    }


    // ==================================================
    // TENTA CONVERTER DATA/HORA
    // ==================================================

    let texto =
        data;


    if (hora) {

        texto +=
            " " + hora;

    }


    // ==================================================
    // DATA NO FORMATO DD/MM/YYYY
    // ==================================================

    const partesData =
        texto.match(
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
        );


    const partesHora =
        texto.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        partesData
    ) {

        const dia =
            Number(
                partesData[1]
            );

        const mes =
            Number(
                partesData[2]
            );

        const ano =
            Number(
                partesData[3]
            );


        const h =
            partesHora
                ? Number(partesHora[1])
                : 0;


        const min =
            partesHora
                ? Number(partesHora[2])
                : 0;


        const seg =
            partesHora &&
            partesHora[3]
                ? Number(partesHora[3])
                : 0;


        const dataFinal =
            new Date(
                ano,
                mes - 1,
                dia,
                h,
                min,
                seg
            );


        if (
            !isNaN(
                dataFinal.getTime()
            )
        ) {

            return dataFinal.getTime();

        }

    }


    // ==================================================
    // TENTA DATA NATIVA
    // ==================================================

    const dataNativa =
        new Date(texto);


    if (
        !isNaN(
            dataNativa.getTime()
        )
    ) {

        return dataNativa.getTime();

    }


    return null;

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
        converterValor(
            item.valor
        );


    // ==================================================
    // LINHA DE TOTAL
    // ==================================================

    if (

        administradora === "" &&

        hora === "" &&

        movimento === "" &&

        autorizacao === "" &&

        valor === 666541

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
// CONVERTER VALOR
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
    // NÚMERO
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


    // Remove R$
    texto =
        texto
        .replace(
            /R\$/gi,
            ""
        )
        .trim();


    // ==================================================
    // BRASILEIRO
    //
    // 1.234,56
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
// MESMO VALOR
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


        // ==================================================
        // AUTORIZAÇÕES
        // ==================================================
        //
        // Apenas para exibição.
        // NÃO participam da conferência.
        // ==================================================

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
            observacao ||
            ""

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


    resultadosConferencia.forEach(
        function (item) {

            if (
                total[item.status] !==
                undefined
            ) {

                total[item.status]++;

            }

        }
    );


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
        0
    );


    alterarTexto(
        "totalAutorizacao",
        0
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


    alterarTexto(
        "valorValorErrado",
        formatarMoeda(0)
    );


    // ==================================================
    // TOTAL PORTAL
    // ==================================================

    const totalPortal =
        somarValoresArquivo(
            window.dadosPremmia || []
        );


    // ==================================================
    // TOTAL SISTEMA
    // ==================================================

    const totalSistema =
        somarValoresArquivo(

            (window.dadosInterno || [])
            .filter(function (item) {

                return !ehLinhaTotal(item);

            })

        );


    // ==================================================
    // DIFERENÇA
    // ==================================================

    const diferencaCentavos =
        Math.round(
            (
                totalPortal -
                totalSistema
            ) * 100
        );


    const diferenca =
        diferencaCentavos /
        100;


    console.log(
        "================================"
    );


    console.log(
        "TOTAL PORTAL:",
        formatarMoeda(
            totalPortal
        )
    );


    console.log(
        "TOTAL SISTEMA:",
        formatarMoeda(
            totalSistema
        )
    );


    console.log(
        "DIFERENÇA:",
        formatarMoeda(
            diferenca
        )
    );


    console.log(
        "================================"
    );


    alterarTexto(
        "totalPortal",
        formatarMoeda(
            totalPortal
        )
    );


    alterarTexto(
        "totalSistema",
        formatarMoeda(
            totalSistema
        )
    );


    alterarTexto(
        "diferencaLiquida",
        formatarMoeda(
            Math.abs(
                diferenca
            )
        )
    );


    let mensagem;


    if (
        diferenca > 0
    ) {

        mensagem =
            "Falta lançar " +
            formatarMoeda(
                diferenca
            ) +
            " no sistema.";

    }

    else if (
        diferenca < 0
    ) {

        mensagem =
            "O sistema possui " +
            formatarMoeda(
                Math.abs(
                    diferenca
                )
            ) +
            " a mais que o Portal.";

    }

    else {

        mensagem =
            "Portal e Sistema estão iguais.";

    }


    alterarTexto(
        "statusDiferenca",
        mensagem
    );

}


// ======================================================
// SOMAR VALORES
// ======================================================

function somarValores(
    status,
    campo
) {

    let totalCentavos = 0;


    resultadosConferencia.forEach(
        function (item) {

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

                totalCentavos +=
                    valor;

            }

        }
    );


    return (
        totalCentavos /
        100
    );

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
        totalCentavos /
        100
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
            "ERRO: #corpoTabela não encontrado."
        );

        return;
    }


    corpo.innerHTML = "";


    lista.forEach(function (item) {

        const tr =
            document.createElement(
                "tr"
            );


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

        tabela.style.display =
            "table";

        tabela.hidden =
            false;

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

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

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

        botao.onclick =
            function () {

                filtros.forEach(
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

            };

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

window.encontrarMelhorCorrespondencia =
    encontrarMelhorCorrespondencia;


console.log(
    "================================"
);

console.log(
    "conferencia.js carregado com sucesso"
);

console.log(
    "================================"
);
