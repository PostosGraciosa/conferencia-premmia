```javascript
// ======================================================
// SISTEMA DE CONFERÊNCIA PREMMIA
// conferencia.js
// ======================================================

let resultadosConferencia = [];


// ======================================================
// CONFIGURAÇÃO
// ======================================================

// Tolerância máxima entre os horários.
//
// Exemplo:
// Portal:   19:11:53
// Sistema:  19:13:20
//
// Diferença = 87 segundos
// Portanto será considerada a mesma transação.
//
// 5 minutos = 300 segundos.
const TOLERANCIA_HORARIO_SEGUNDOS = 300;


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

        console.log("================================");
        console.log("conferencia.js iniciado");
        console.log("================================");

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

    btn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

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
        internoOriginal.filter(
            function (item) {

                return !ehLinhaTotal(item);

            }
        );


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
    // ORDENAR PORTAL POR DATA/HORA
    //
    // Isso ajuda a manter a associação
    // consistente.
    // ==================================================

    const portalOrdenado =
        [...premmia].sort(
            function (a, b) {

                const dataA =
                    obterDataHora(
                        a
                    );

                const dataB =
                    obterDataHora(
                        b
                    );

                if (
                    dataA === null &&
                    dataB === null
                ) {

                    return 0;

                }

                if (
                    dataA === null
                ) {

                    return 1;

                }

                if (
                    dataB === null
                ) {

                    return -1;

                }

                return dataA - dataB;

            }
        );


    // ==================================================
    // PERCORRE PORTAL
    // ==================================================

    portalOrdenado.forEach(
        function (venda, indice) {

            console.log(
                "--------------------------------"
            );


            console.log(
                "Analisando Portal:",
                indice + 1,
                venda
            );


            // ==================================================
            // PROCURA A MELHOR CORRESPONDÊNCIA
            //
            // PRIMEIRO:
            // mesmo valor
            //
            // SEGUNDO:
            // horário mais próximo
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

                console.warn(
                    "NÃO LANÇADA:",
                    venda
                );


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
            // MARCA COMO UTILIZADO
            // ==================================================

            utilizados.add(
                encontrado.item
            );


            console.log(
                "CORRESPONDÊNCIA ENCONTRADA"
            );


            console.log(
                "Portal:",
                venda
            );


            console.log(
                "Sistema:",
                encontrado.item
            );


            console.log(
                "Diferença de horário:",
                encontrado.diferencaSegundos,
                "segundos"
            );


            // ==================================================
            // RESULTADO CORRETO
            // ==================================================

            resultadosConferencia.push(

                criarResultado(

                    "CORRETA",

                    venda,

                    encontrado.item,

                    "Valor e horário compatíveis. Diferença de horário: " +
                    formatarDiferencaHorario(
                        encontrado.diferencaSegundos
                    )

                )

            );

        }
    );


    // ======================================================
    // LANÇAMENTOS A MAIS
    //
    // Depois de tentar associar TODAS as transações
    // do Portal pela combinação valor + horário,
    // o que realmente sobrar no sistema é considerado
    // lançamento a mais.
    // ======================================================

    interno.forEach(
        function (item) {

            if (
                utilizados.has(item)
            ) {

                return;

            }


            console.warn(
                "LANÇAMENTO A MAIS:",
                item
            );


            resultadosConferencia.push(

                criarResultado(

                    "LANCADA_A_MAIS",

                    null,

                    item,

                    "Lançamento existente no sistema interno sem correspondência no Portal pelo valor e horário."

                )

            );

        }
    );


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


    console.log(
        "Total:",
        resultadosConferencia.length
    );


    // ==================================================
    // MOSTRAR
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
        converterValor(
            item.valor
        );


    // ==================================================
    // LINHA DE TOTAL CONHECIDA
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
// ENCONTRAR MELHOR CORRESPONDÊNCIA
// ======================================================
//
// REGRA:
//
// 1. Mesmo valor
// 2. Não utilizado
// 3. Horário mais próximo
// 4. Máximo de 5 minutos
//
// AUTORIZAÇÃO NÃO É UTILIZADA.
//
// OPERADOR NÃO É UTILIZADO.
//
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


    const dataHoraPortal =
        obterDataHora(
            venda
        );


    let melhor =
        null;


    // ==================================================
    // PROCURA ENTRE TODOS OS LANÇAMENTOS
    // ==================================================

    interno.forEach(
        function (item) {

            // ------------------------------------------
            // JÁ UTILIZADO
            // ------------------------------------------

            if (
                utilizados.has(item)
            ) {

                return;

            }


            // ------------------------------------------
            // VALOR
            // ------------------------------------------

            const valorInterno =
                converterValor(
                    item.valor
                );


            if (
                valorInterno === null
            ) {

                return;

            }


            // ------------------------------------------
            // VALOR DIFERENTE
            // ------------------------------------------

            if (
                valorPortal !==
                valorInterno
            ) {

                return;

            }


            // ------------------------------------------
            // HORÁRIO
            // ------------------------------------------

            const dataHoraInterno =
                obterDataHora(
                    item
                );


            // ==================================================
            // SE NÃO HOUVER HORÁRIO
            //
            // Não vamos associar automaticamente.
            //
            // A conferência precisa de horário para
            // diferenciar transações de mesmo valor.
            // ==================================================

            if (
                dataHoraPortal === null ||
                dataHoraInterno === null
            ) {

                return;

            }


            // ------------------------------------------
            // DIFERENÇA EM SEGUNDOS
            // ------------------------------------------

            const diferenca =
                Math.abs(
                    dataHoraPortal -
                    dataHoraInterno
                ) / 1000;


            // ------------------------------------------
            // FORA DA TOLERÂNCIA
            // ------------------------------------------

            if (
                diferenca >
                TOLERANCIA_HORARIO_SEGUNDOS
            ) {

                return;

            }


            // ==================================================
            // PRIMEIRA CORRESPONDÊNCIA
            // ==================================================

            if (
                melhor === null
            ) {

                melhor = {

                    item:
                        item,

                    diferencaSegundos:
                        diferenca

                };

                return;

            }


            // ==================================================
            // COMPARA COM A MELHOR ATUAL
            // ==================================================

            if (
                diferenca <
                melhor.diferencaSegundos
            ) {

                melhor = {

                    item:
                        item,

                    diferencaSegundos:
                        diferenca

                };

            }

        }
    );


    return melhor;

}


// ======================================================
// OBTER DATA + HORA
// ======================================================
//
// Tenta trabalhar com:
//
// data
// hora
// movimento
//
// Exemplos:
//
// 09/08/2026
// 19:11:53
//
// ou:
//
// 09/08/2026 19:11:53
//
// ======================================================

function obterDataHora(item) {

    if (!item) {

        return null;

    }


    let data =
        item.data;


    let hora =
        item.hora;


    // ==================================================
    // CASO O CAMPO MOVIMENTO TENHA A DATA/HORA
    // ==================================================

    if (
        (!data || String(data).trim() === "") &&
        item.movimento
    ) {

        const movimento =
            String(
                item.movimento
            )
            .trim();


        const resultado =
            extrairDataHoraTexto(
                movimento
            );


        if (
            resultado !== null
        ) {

            return resultado;

        }

    }


    // ==================================================
    // DATA/HORA DIRETA
    // ==================================================

    if (
        data &&
        hora
    ) {

        const resultado =
            converterDataHora(
                data,
                hora
            );


        if (
            resultado !== null
        ) {

            return resultado;

        }

    }


    // ==================================================
    // SOMENTE DATA COM HORÁRIO DENTRO
    // ==================================================

    if (
        data
    ) {

        const textoData =
            String(
                data
            )
            .trim();


        const resultado =
            extrairDataHoraTexto(
                textoData
            );


        if (
            resultado !== null
        ) {

            return resultado;

        }

    }


    // ==================================================
    // SOMENTE HORA
    //
    // Não conseguimos saber o dia.
    // Para evitar associações erradas,
    // não usamos somente a hora.
    // ==================================================

    return null;

}


// ======================================================
// CONVERTER DATA + HORA
// ======================================================

function converterDataHora(
    data,
    hora
) {

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


    // ==================================================
    // DATA BRASILEIRA
    //
    // 09/08/2026
    // ==================================================

    const matchData =
        textoData.match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
        );


    if (
        matchData
    ) {

        const dia =
            Number(
                matchData[1]
            );


        const mes =
            Number(
                matchData[2]
            );


        const ano =
            Number(
                matchData[3]
            );


        const matchHora =
            textoHora.match(
                /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
            );


        const horas =
            matchHora
                ? Number(matchHora[1])
                : 0;


        const minutos =
            matchHora
                ? Number(matchHora[2])
                : 0;


        const segundos =
            matchHora &&
            matchHora[3]
                ? Number(matchHora[3])
                : 0;


        const resultado =
            new Date(
                ano,
                mes - 1,
                dia,
                horas,
                minutos,
                segundos
            );


        if (
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado.getTime();

        }

    }


    // ==================================================
    // DATA ISO
    //
    // 2026-08-09
    // ==================================================

    const matchISO =
        textoData.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


    if (
        matchISO
    ) {

        const ano =
            Number(
                matchISO[1]
            );


        const mes =
            Number(
                matchISO[2]
            );


        const dia =
            Number(
                matchISO[3]
            );


        const matchHora =
            textoHora.match(
                /^(\d{1,2}):(\d{2})(?::(\d{2}))?/
            );


        const horas =
            matchHora
                ? Number(matchHora[1])
                : 0;


        const minutos =
            matchHora
                ? Number(matchHora[2])
                : 0;


        const segundos =
            matchHora &&
            matchHora[3]
                ? Number(matchHora[3])
                : 0;


        const resultado =
            new Date(
                ano,
                mes - 1,
                dia,
                horas,
                minutos,
                segundos
            );


        if (
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado.getTime();

        }

    }


    return null;

}


// ======================================================
// EXTRAIR DATA/HORA DE UM TEXTO
// ======================================================

function extrairDataHoraTexto(
    texto
) {

    if (!texto) {

        return null;

    }


    const valor =
        String(
            texto
        )
        .trim();


    // ==================================================
    // BRASILEIRO
    //
    // 09/08/2026 19:11:53
    // ==================================================

    let match =
        valor.match(
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        match
    ) {

        const dia =
            Number(match[1]);


        const mes =
            Number(match[2]);


        const ano =
            Number(match[3]);


        const horas =
            Number(match[4]);


        const minutos =
            Number(match[5]);


        const segundos =
            match[6]
                ? Number(match[6])
                : 0;


        const resultado =
            new Date(
                ano,
                mes - 1,
                dia,
                horas,
                minutos,
                segundos
            );


        return resultado.getTime();

    }


    // ==================================================
    // ISO
    //
    // 2026-08-09 19:11:53
    // ==================================================

    match =
        valor.match(
            /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );


    if (
        match
    ) {

        const ano =
            Number(match[1]);


        const mes =
            Number(match[2]);


        const dia =
            Number(match[3]);


        const horas =
            Number(match[4]);


        const minutos =
            Number(match[5]);


        const segundos =
            match[6]
                ? Number(match[6])
                : 0;


        const resultado =
            new Date(
                ano,
                mes - 1,
                dia,
                horas,
                minutos,
                segundos
            );


        return resultado.getTime();

    }


    return null;

}


// ======================================================
// FORMATAR DIFERENÇA DE HORÁRIO
// ======================================================

function formatarDiferencaHorario(
    segundos
) {

    if (
        segundos === null ||
        segundos === undefined
    ) {

        return "horário não disponível";

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
            " segundo(s)"
        );

    }


    const minutos =
        Math.floor(
            total / 60
        );


    const resto =
        total % 60;


    return (
        minutos +
        " min " +
        resto +
        " s"
    );

}


// ======================================================
// CONVERTER VALOR
// ======================================================
//
// Trabalhamos em CENTAVOS.
// ======================================================

function converterValor(
    valor
) {

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
        String(
            valor
        )
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
        texto
        .replace(
            /R\$/gi,
            ""
        )
        .trim();


    // ==================================================
    // FORMATO BRASILEIRO
    //
    // 1.234,56
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

function mesmoValor(
    a,
    b
) {

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
        valorA ===
        valorB
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

        status:

            status,


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


        // ==============================================
        // AUTORIZAÇÕES
        //
        // SOMENTE EXIBIÇÃO.
        //
        // NÃO PARTICIPAM DA CONFERÊNCIA.
        // ==============================================

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


    if (
        resultado
    ) {

        setTimeout(
            function () {

                resultado.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

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

        CORRETA:
            0,

        NAO_LANCADA:
            0,

        LANCADA_A_MAIS:
            0,

        VALOR_DIVERGENTE:
            0,

        AUTORIZACAO_DIVERGENTE:
            0

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
    // Não utilizado.
    // ==================================================

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
                .filter(
                    function (item) {

                        return !ehLinhaTotal(
                            item
                        );

                    }
                )

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


    // ==================================================
    // CAMPOS OPCIONAIS
    // ==================================================

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


    let mensagem =
        "";


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

    let totalCentavos =
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
// SOMAR VALORES DOS ARQUIVOS
// ======================================================

function somarValoresArquivo(
    lista
) {

    let totalCentavos =
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
    ).toLocaleString(
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
            "ERRO: #corpoTabela não encontrado no HTML."
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
    "conferencia.js completo carregado"
);
```
