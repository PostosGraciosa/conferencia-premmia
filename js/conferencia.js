```javascript
// ======================================================
// SISTEMA DE CONFERÊNCIA PREMMIA
// conferencia.js
// ======================================================
//
// REGRA DA CONFERÊNCIA:
//
// 1. AUTORIZAÇÃO NÃO PARTICIPA DA CONFERÊNCIA.
// 2. A comparação é feita por VALOR.
// 3. Se houver valores repetidos, usa o HORÁRIO.
// 4. Aceita diferença de até 5 minutos.
// 5. Escolhe sempre o lançamento mais próximo.
// 6. Cada lançamento interno só pode ser utilizado uma vez.
// 7. Se não encontrar valor + horário compatível,
//    marca como NÃO LANÇADA.
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
            Array.isArray(valor)
                ? valor
                : [];

    }

});


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "================================"
        );

        console.log(
            "CONFERENCIA.JS INICIADO"
        );

        console.log(
            "================================"
        );

        ativarBotaoConferir();

        ativarFiltros();

    }
);


// ======================================================
// BOTÃO CONFERIR
// ======================================================

function ativarBotaoConferir() {

    const btn =
        document.getElementById(
            "btnConferir"
        );

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

    if (
        btn.dataset.conferenciaAtiva === "true"
    ) {

        return;

    }


    btn.dataset.conferenciaAtiva =
        "true";


    btn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            console.log(
                "BOTÃO CONFERIR CLICADO"
            );

            iniciarConferencia();

        }
    );

}


// ======================================================
// INICIAR CONFERÊNCIA
// ======================================================

function iniciarConferencia() {

    const premmia =
        window.dadosPremmia || [];

    const internoOriginal =
        window.dadosInterno || [];


    console.log(
        "================================"
    );

    console.log(
        "INICIANDO CONFERÊNCIA"
    );

    console.log(
        "Portal Premmia:",
        premmia.length
    );

    console.log(
        "Sistema interno:",
        internoOriginal.length
    );

    console.log(
        "================================"
    );


    // ==================================================
    // VALIDAÇÕES
    // ==================================================

    if (
        premmia.length === 0
    ) {

        alert(
            "Carregue a planilha do Portal Premmia."
        );

        return;

    }


    if (
        internoOriginal.length === 0
    ) {

        alert(
            "Carregue a planilha do sistema interno."
        );

        return;

    }


    // ==================================================
    // REMOVE LINHAS DE TOTAL
    // ==================================================

    const interno =
        internoOriginal.filter(
            function (item) {

                return !ehLinhaTotal(item);

            }
        );


    console.log(
        "Interno após remover totais:",
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

    premmia.forEach(
        function (venda, indice) {

            console.log(
                "--------------------------------"
            );

            console.log(
                "Analisando Portal:",
                indice + 1
            );

            console.log(
                venda
            );


            // ==================================================
            // PROCURA POR VALOR + HORÁRIO
            // ==================================================

            const encontrado =
                encontrarPorValorEHorario(
                    venda,
                    interno,
                    utilizados
                );


            // ==================================================
            // NÃO ENCONTRADO
            // ==================================================

            if (!encontrado) {

                console.warn(
                    "NÃO ENCONTRADA:",
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
            // MARCA COMO UTILIZADO
            // ==================================================

            utilizados.add(
                encontrado.item
            );


            console.log(
                "CORRESPONDÊNCIA ENCONTRADA:"
            );

            console.log(
                "Portal:",
                venda
            );

            console.log(
                "Interno:",
                encontrado.item
            );

            console.log(
                "Diferença:",
                encontrado.diferencaSegundos,
                "segundos"
            );


            // ==================================================
            // CORRETA
            // ==================================================

            resultadosConferencia.push(

                criarResultado(

                    "CORRETA",

                    venda,

                    encontrado.item,

                    "Valor e horário compatíveis. Diferença de " +
                    formatarDiferencaHorario(
                        encontrado.diferencaSegundos
                    ) +
                    "."

                )

            );

        }
    );


    // ======================================================
    // LANÇAMENTOS A MAIS
    // ======================================================

    interno.forEach(
        function (item) {

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

        }
    );


    // ======================================================
    // FINAL
    // ======================================================

    console.log(
        "================================"
    );

    console.log(
        "CONFERÊNCIA FINALIZADA"
    );

    console.log(
        "Resultados:",
        resultadosConferencia.length
    );

    console.log(
        resultadosConferencia
    );

    console.log(
        "================================"
    );


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
        converterValor(
            item.valor
        );


    // ==================================================
    // TOTAL CONHECIDO
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
// ENCONTRAR POR VALOR + HORÁRIO
// ======================================================
//
// Primeiro procura pelo VALOR.
//
// Depois, entre os valores iguais,
// escolhe o HORÁRIO MAIS PRÓXIMO.
//
// Tolerância máxima: 5 minutos.
// ======================================================

function encontrarPorValorEHorario(
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


    const horarioPortal =
        obterDataHora(
            venda
        );


    let melhor = null;


    // ==================================================
    // TOLERÂNCIA
    // ==================================================

    const TOLERANCIA_SEGUNDOS =
        5 * 60;


    // ==================================================
    // PERCORRE SISTEMA
    // ==================================================

    interno.forEach(
        function (item) {

            // Já utilizado

            if (
                utilizados.has(item)
            ) {

                return;

            }


            // ==================================================
            // COMPARA VALOR
            // ==================================================

            const valorInterno =
                converterValor(
                    item.valor
                );


            if (
                valorInterno === null
            ) {

                return;

            }


            if (
                valorPortal !==
                valorInterno
            ) {

                return;

            }


            // ==================================================
            // O VALOR É IGUAL
            // ==================================================
            //
            // Agora verificamos o horário.
            // ==================================================


            const horarioInterno =
                obterDataHora(
                    item
                );


            let diferenca =
                Infinity;


            if (
                horarioPortal !== null &&
                horarioInterno !== null
            ) {

                diferenca =
                    Math.abs(
                        horarioPortal -
                        horarioInterno
                    ) / 1000;

            }


            // ==================================================
            // SE OS HORÁRIOS EXISTEM
            // ==================================================

            if (
                diferenca !== Infinity
            ) {

                if (
                    diferenca >
                    TOLERANCIA_SEGUNDOS
                ) {

                    return;

                }

            }


            // ==================================================
            // ESCOLHE O MAIS PRÓXIMO
            // ==================================================

            if (
                !melhor ||
                diferenca <
                melhor.diferencaSegundos
            ) {

                melhor = {

                    item: item,

                    diferencaSegundos:
                        diferenca

                };

            }

        }
    );


    // ==================================================
    // RESULTADO
    // ==================================================

    return melhor;

}


// ======================================================
// OBTER DATA/HORA
// ======================================================
//
// Tenta diferentes nomes de campos,
// porque as planilhas podem mudar.
// ======================================================

function obterDataHora(item) {

    if (!item) {

        return null;

    }


    let data =
        item.data ||
        item.Data ||
        item.DATA ||
        item.movimento ||
        "";


    let hora =
        item.hora ||
        item.Hora ||
        item.HORA ||
        "";


    // ==================================================
    // CASO A DATA JÁ VENHA COM HORÁRIO
    // ==================================================

    const textoData =
        String(
            data || ""
        )
        .trim();


    const textoHora =
        String(
            hora || ""
        )
        .trim();


    if (
        !textoData &&
        !textoHora
    ) {

        return null;

    }


    // ==================================================
    // DATA + HORA
    // ==================================================

    let texto =
        textoData;


    if (
        textoHora
    ) {

        texto +=
            " " +
            textoHora;

    }


    // ==================================================
    // TENTA PARSEAR
    // ==================================================

    let resultado =
        converterDataHora(
            texto
        );


    if (
        resultado !== null
    ) {

        return resultado;

    }


    // ==================================================
    // TENTA SOMENTE HORA
    // ==================================================

    return converterSomenteHora(
        textoHora
    );

}


// ======================================================
// CONVERTER DATA/HORA
// ======================================================

function converterDataHora(texto) {

    if (
        !texto
    ) {

        return null;

    }


    let valor =
        String(
            texto
        )
        .trim();


    // ==================================================
    // REMOVE SEGUNDOS EXTRAS
    // ==================================================

    // Formato:
    // 09/08/2026 19:11:53

    let match =
        valor.match(
            /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
        );


    if (
        match
    ) {

        const dia =
            Number(match[1]);

        const mes =
            Number(match[2]) - 1;

        const ano =
            Number(match[3]);

        const hora =
            Number(match[4]);

        const minuto =
            Number(match[5]);

        const segundo =
            Number(match[6] || 0);


        return new Date(
            ano,
            mes,
            dia,
            hora,
            minuto,
            segundo
        ).getTime();

    }


    // ==================================================
    // FORMATO ISO
    // ==================================================

    const dataISO =
        new Date(
            valor
        );


    if (
        !isNaN(
            dataISO.getTime()
        )
    ) {

        return dataISO.getTime();

    }


    return null;

}


// ======================================================
// CONVERTER SOMENTE HORA
// ======================================================

function converterSomenteHora(texto) {

    if (
        !texto
    ) {

        return null;

    }


    const match =
        String(
            texto
        )
        .trim()
        .match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );


    if (
        !match
    ) {

        return null;

    }


    const hora =
        Number(match[1]);


    const minuto =
        Number(match[2]);


    const segundo =
        Number(match[3] || 0);


    return (

        hora * 3600 * 1000 +

        minuto * 60 * 1000 +

        segundo * 1000

    );

}


// ======================================================
// FORMATAR DIFERENÇA DE HORÁRIO
// ======================================================

function formatarDiferencaHorario(
    segundos
) {

    if (
        !isFinite(segundos)
    ) {

        return "horário não disponível";

    }


    const segundosInteiros =
        Math.round(
            segundos
        );


    if (
        segundosInteiros < 60
    ) {

        return (
            segundosInteiros +
            " segundos"
        );

    }


    const minutos =
        Math.floor(
            segundosInteiros / 60
        );


    const segundosRestantes =
        segundosInteiros % 60;


    return (
        minutos +
        " min " +
        segundosRestantes +
        " s"
    );

}


// ======================================================
// CONVERTER VALOR
// ======================================================
//
// Trabalhamos em CENTAVOS.
// ======================================================

function converterValor(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;

    }


    // Número

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


    let texto =
        String(
            valor
        )
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
    // FORMATO BRASILEIRO
    // ==================================================

    if (
        texto.includes(",")
    ) {

        texto =
            texto
            .replace(
                /\./g,
                ""
            )
            .replace(
                ",",
                "."
            );

    }


    const numero =
        Number(
            texto
        );


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


        // ==================================================
        // AUTORIZAÇÕES
        // ==================================================
        //
        // APENAS EXIBIÇÃO.
        // NÃO PARTICIPAM DA CONFERÊNCIA.
        //

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


        // ==================================================
        // DIFERENÇA
        // ==================================================

        diferenca:

            premmia &&
            interno

                ? Math.abs(
                    (
                        converterValor(
                            premmia.valor
                        ) || 0
                    ) -

                    (
                        converterValor(
                            interno.valor
                        ) || 0
                    )
                ) / 100

                : 0,


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
        "Mostrando resultados..."
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


    if (
        resultado
    ) {

        setTimeout(
            function () {

                resultado.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            },
            100
        );

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


    ids.forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (
                elemento
            ) {

                elemento.style.display =
                    "";

                elemento.hidden =
                    false;

            }

        }
    );

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
    // TOTAIS DOS ARQUIVOS
    // ==================================================

    const totalPortal =
        somarValoresArquivo(
            window.dadosPremmia || []
        );


    const totalSistema =
        somarValoresArquivo(

            (window.dadosInterno || [])
                .filter(
                    function (item) {

                        return !ehLinhaTotal(
                            item
                        );

                    }
                )

        );


    const diferencaCentavos =
        Math.round(
            (
                totalPortal -
                totalSistema
            ) * 100
        );


    const diferenca =
        diferencaCentavos / 100;


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


    let mensagem = "";


    if (
        diferenca > 0
    ) {

        mensagem =
            "Falta lançar " +
            formatarMoeda(
                diferenca
            ) +
            " no sistema.";


    } else if (
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

    let totalCentavos = 0;


    resultadosConferencia.forEach(
        function (item) {

            if (
                item.status !==
                status
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
        totalCentavos / 100
    );

}


// ======================================================
// SOMAR VALORES DO ARQUIVO
// ======================================================

function somarValoresArquivo(
    lista
) {

    let totalCentavos = 0;


    lista.forEach(
        function (item) {

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

        }
    );


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
        document.getElementById(
            id
        );


    if (
        elemento
    ) {

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
    )
    .toLocaleString(
        "pt-BR",
        {

            style:
                "currency",

            currency:
                "BRL"

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


    if (
        !corpo
    ) {

        console.error(
            "ERRO: #corpoTabela não encontrado."
        );

        return;

    }


    corpo.innerHTML =
        "";


    lista.forEach(
        function (item) {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escaparHtml(
                        item.status
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.data
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.hora
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.cliente
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.operacao
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.autorizacaoPremmia
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.autorizacaoInterno
                    )}
                </td>

                <td>
                    ${formatarMoeda(
                        item.valorPremmia
                    )}
                </td>

                <td>
                    ${formatarMoeda(
                        item.valorInterno
                    )}
                </td>

                <td>
                    ${formatarMoeda(
                        item.diferenca
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.operador
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        item.observacao
                    )}
                </td>

            `;


            aplicarClasseStatus(
                tr,
                item.status
            );


            corpo.appendChild(
                tr
            );

        }
    );


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );


    if (
        tabela
    ) {

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


    return String(
        valor
    )
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


    switch (
        status
    ) {

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


    filtros.forEach(
        function (botao) {

            botao.addEventListener(
                "click",
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
                        filtro ===
                        "TODOS"
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

        }
    );

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
    "================================"
);

console.log(
    "conferencia.js completo carregado"
);

console.log(
    "REGRA: VALOR + HORÁRIO"
);

console.log(
    "TOLERÂNCIA: 5 MINUTOS"
);

console.log(
    "AUTORIZAÇÃO: IGNORADA"
);

console.log(
    "================================"
);
```
