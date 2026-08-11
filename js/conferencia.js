
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

function iniciarSistemaConferencia() {

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


// ======================================================
// ATIVAR BOTÃO CONFERIR
// ======================================================

function ativarBotaoConferir() {

    const btn =
        document.getElementById("btnConferir");


    if (!btn) {

        console.warn(
            "Botão #btnConferir ainda não encontrado."
        );

        return;

    }


    // Evita duplicar eventos

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

            event.stopPropagation();

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

        }
    );


    console.log(
        "Botão Conferir conectado com sucesso."
    );

}


// ======================================================
// CASO O SCRIPT CARREGUE ANTES DO HTML
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarSistemaConferencia
    );

} else {

    iniciarSistemaConferencia();

}


// ======================================================
// INICIAR CONFERÊNCIA
// ======================================================

function iniciarConferencia() {

    console.log(
        "INICIANDO CONFERÊNCIA..."
    );


    const premmia =
        window.dadosPremmia || [];


    const internoOriginal =
        window.dadosInterno || [];


    console.log(
        "Portal:",
        premmia.length
    );


    console.log(
        "Sistema:",
        internoOriginal.length
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
        "Interno válido:",
        interno.length
    );


    // ==================================================
    // LIMPA RESULTADOS
    // ==================================================

    resultadosConferencia = [];


    // ==================================================
    // CONTROLE DE LANÇAMENTOS USADOS
    // ==================================================

    const utilizados =
        new Set();


    // ==================================================
    // PERCORRE PORTAL
    // ==================================================

    premmia.forEach(
        function (venda, indice) {

            console.log(
                "Analisando:",
                indice + 1,
                venda
            );


            const encontrado =
                encontrarPorValorEHorario(
                    venda,
                    interno,
                    utilizados
                );


            // ==================================================
            // NÃO ENCONTRADO
            // ==================================================

            if (
                !encontrado
            ) {

                resultadosConferencia.push(

                    criarResultado(

                        "NAO_LANCADA",

                        venda,

                        null,

                        "Transação do Portal não localizada pelo valor e horário aproximado."

                    )

                );

                return;

            }


            // ==================================================
            // MARCA UTILIZADO
            // ==================================================

            utilizados.add(
                encontrado.item
            );


            // ==================================================
            // CORRETA
            // ==================================================

            resultadosConferencia.push(

                criarResultado(

                    "CORRETA",

                    venda,

                    encontrado.item,

                    "Valor localizado. Diferença de horário: " +
                    formatarDiferencaHorario(
                        encontrado.diferencaSegundos
                    )

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

                    "Lançamento interno sem correspondência no Portal."

                )

            );

        }
    );


    // ======================================================
    // MOSTRAR
    // ======================================================

    console.log(
        "================================"
    );

    console.log(
        "CONFERÊNCIA FINALIZADA"
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
// LINHA DE TOTAL
// ======================================================

function ehLinhaTotal(item) {

    if (!item) {
        return false;
    }


    const administradora =
        String(
            item.administradora || ""
        )
        .trim();


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


    return (

        administradora === "" &&

        hora === "" &&

        movimento === "" &&

        autorizacao === "" &&

        valor === 666541

    );

}


// ======================================================
// ENCONTRAR POR VALOR + HORÁRIO
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


    const TOLERANCIA =
        5 * 60;


    let melhor =
        null;


    interno.forEach(
        function (item) {

            if (
                utilizados.has(item)
            ) {

                return;

            }


            const valorInterno =
                converterValor(
                    item.valor
                );


            if (
                valorInterno === null
            ) {

                return;

            }


            // ==================================================
            // VALOR TEM QUE SER IGUAL
            // ==================================================

            if (
                valorPortal !==
                valorInterno
            ) {

                return;

            }


            // ==================================================
            // HORÁRIO
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


                if (
                    diferenca >
                    TOLERANCIA
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


    return melhor;

}


// ======================================================
// OBTER DATA/HORA
// ======================================================

function obterDataHora(item) {

    if (!item) {
        return null;
    }


    const data =
        item.data ||
        item.Data ||
        item.DATA ||
        "";


    const hora =
        item.hora ||
        item.Hora ||
        item.HORA ||
        "";


    if (
        !data &&
        !hora
    ) {

        return null;

    }


    const textoData =
        String(data).trim();


    const textoHora =
        String(hora).trim();


    // ==================================================
    // SE DATA JÁ CONTÉM HORA
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
    // DD/MM/AAAA HH:MM:SS
    // ==================================================

    const match =
        texto.match(
            /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/
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


        const h =
            Number(match[4]);


        const m =
            Number(match[5]);


        const s =
            Number(match[6] || 0);


        return new Date(
            ano,
            mes,
            dia,
            h,
            m,
            s
        ).getTime();

    }


    // ==================================================
    // SOMENTE HORA
    // ==================================================

    const horaMatch =
        textoHora.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );


    if (
        horaMatch
    ) {

        const h =
            Number(
                horaMatch[1]
            );


        const m =
            Number(
                horaMatch[2]
            );


        const s =
            Number(
                horaMatch[3] || 0
            );


        return (

            h * 3600000 +

            m * 60000 +

            s * 1000

        );

    }


    // ==================================================
    // ÚLTIMA TENTATIVA
    // ==================================================

    const tentativa =
        new Date(texto);


    if (
        !isNaN(
            tentativa.getTime()
        )
    ) {

        return tentativa.getTime();

    }


    return null;

}


// ======================================================
// DIFERENÇA DE HORÁRIO
// ======================================================

function formatarDiferencaHorario(
    segundos
) {

    if (
        !isFinite(segundos)
    ) {

        return "não disponível";

    }


    const total =
        Math.round(
            segundos
        );


    if (
        total < 60
    ) {

        return (
            total +
            " segundos"
        );

    }


    const minutos =
        Math.floor(
            total / 60
        );


    const segundosRestantes =
        total % 60;


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

function converterValor(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;

    }


    if (
        typeof valor === "number"
    ) {

        return isNaN(valor)
            ? null
            : Math.round(
                valor * 100
            );

    }


    let texto =
        String(
            valor
        ).trim();


    if (
        texto === ""
    ) {

        return null;

    }


    texto =
        texto
        .replace(
            /R\$/gi,
            ""
        )
        .trim();


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
// CRIAR RESULTADO
// ======================================================

function criarResultado(
    status,
    premmia,
    interno,
    observacao
) {

    let diferenca =
        0;


    if (
        premmia &&
        interno
    ) {

        const valorA =
            converterValor(
                premmia.valor
            ) || 0;


        const valorB =
            converterValor(
                interno.valor
            ) || 0;


        diferenca =
            Math.abs(
                valorA - valorB
            ) / 100;

    }


    return {

        status: status,

        data:
            premmia?.data ||
            interno?.data ||
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
            interno?.tipo ||
            "",

        tipo:
            premmia?.operacao ||
            interno?.tipo ||
            "",

        // Apenas exibição.
        // NÃO PARTICIPAM DA CONFERÊNCIA.

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

        diferenca:
            diferenca,

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

        LANCADA_A_MAIS: 0

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

    alterarTexto(
        "valorCorretas",
        formatarMoeda(
            somarResultados(
                "CORRETA",
                "valorPremmia"
            )
        )
    );


    alterarTexto(
        "valorNaoLancadas",
        formatarMoeda(
            somarResultados(
                "NAO_LANCADA",
                "valorPremmia"
            )
        )
    );


    alterarTexto(
        "valorLancadasMais",
        formatarMoeda(
            somarResultados(
                "LANCADA_A_MAIS",
                "valorInterno"
            )
        )
    );


    // ==================================================
    // TOTAIS DOS ARQUIVOS
    // ==================================================

    const totalPortal =
        somarArquivo(
            window.dadosPremmia || []
        );


    const totalSistema =
        somarArquivo(

            (window.dadosInterno || [])
                .filter(
                    function (item) {

                        return !ehLinhaTotal(
                            item
                        );

                    }
                )

        );


    const diferenca =
        Math.round(
            (
                totalPortal -
                totalSistema
            ) * 100
        ) / 100;


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
// SOMAR RESULTADOS
// ======================================================

function somarResultados(
    status,
    campo
) {

    let total =
        0;


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

                total +=
                    valor;

            }

        }
    );


    return total / 100;

}


// ======================================================
// SOMAR ARQUIVO
// ======================================================

function somarArquivo(
    lista
) {

    let total =
        0;


    lista.forEach(
        function (item) {

            const valor =
                converterValor(
                    item.valor
                );


            if (
                valor !== null
            ) {

                total +=
                    valor;

            }

        }
    );


    return total / 100;

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


    if (
        status === "CORRETA"
    ) {

        linha.classList.add(
            "correta"
        );

    }


    if (
        status === "NAO_LANCADA"
    ) {

        linha.classList.add(
            "nao-lancada"
        );

    }


    if (
        status === "LANCADA_A_MAIS"
    ) {

        linha.classList.add(
            "lancada-a-mais"
        );

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

window.converterValor =
    converterValor;

window.mesmoValor =
    function (a, b) {

        return (
            converterValor(a) ===
            converterValor(b)
        );

    };


console.log(
    "conferencia.js carregado."
);
```
