// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================

let resultadosConferencia = [];


// ==========================================
// DISPONIBILIZAR RESULTADOS GLOBALMENTE
// ==========================================

Object.defineProperty(
    window,
    "resultadosConferencia",
    {
        configurable: true,

        get: function () {
            return resultadosConferencia;
        }
    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

function configurarBotaoConferir() {

    const btn =
        document.getElementById("btnConferir");

    console.log(
        "Procurando botão:",
        btn
    );

    if (!btn) {

        console.error(
            "ERRO: botão #btnConferir não encontrado."
        );

        return;
    }


    // Remove possíveis eventos anteriores
    btn.onclick = null;


    // Conecta diretamente
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
        "Botão Conferir conectado!"
    );

}


// ==========================================
// GARANTE QUE O BOTÃO SEJA CONECTADO
// ==========================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        configurarBotaoConferir
    );

} else {

    configurarBotaoConferir();

}


// ==========================================
// INICIAR CONFERÊNCIA
// ==========================================

function iniciarConferencia() {

    const premmia =
        Array.isArray(window.dadosPremmia)
            ? window.dadosPremmia
            : [];


    const interno =
        Array.isArray(window.dadosInterno)
            ? window.dadosInterno
            : [];


    console.log(
        "================================"
    );

    console.log(
        "INICIANDO CONFERÊNCIA"
    );

    console.log(
        "Premmia:",
        premmia.length
    );

    console.log(
        "Interno:",
        interno.length
    );

    console.log(
        "================================"
    );


    // ======================================
    // VERIFICAÇÃO
    // ======================================

    if (
        premmia.length === 0
    ) {

        alert(
            "A planilha do Portal Premmia não possui registros."
        );

        return;
    }


    if (
        interno.length === 0
    ) {

        alert(
            "A planilha do sistema interno não possui registros."
        );

        return;
    }


    // Limpa resultado anterior
    resultadosConferencia = [];


    // Guarda quais registros internos
    // já foram utilizados
    const utilizados =
        new Set();


    // ======================================
    // PROCESSAR CADA PREMMIA
    // ======================================

    premmia.forEach(
        function (venda, indice) {

            console.log(
                "--------------------------------"
            );

            console.log(
                "Analisando Premmia:",
                indice + 1,
                venda
            );


            // ==================================
            // IDENTIFICA TIPO
            // ==================================

            const tipoOperacao =
                normalizarTexto(
                    venda.operacao
                );


            const ehVale =
                tipoOperacao.includes("VALE");


            const ehDesconto =
                tipoOperacao.includes("DESCONTO");


            const comparaPorValor =
                ehVale ||
                ehDesconto;


            console.log(
                "Operação:",
                venda.operacao
            );

            console.log(
                "É VALE:",
                ehVale
            );

            console.log(
                "É DESCONTO:",
                ehDesconto
            );

            console.log(
                "Compara somente valor:",
                comparaPorValor
            );


            let encontrado = null;


            // ==================================
            // REGRA 1
            // VALE / DESCONTO
            //
            // NÃO USA AUTORIZAÇÃO
            // COMPARA SOMENTE PELO VALOR
            // ==================================

            if (
                comparaPorValor
            ) {

                encontrado =
                    procurarPorValor(
                        venda,
                        interno,
                        utilizados
                    );


                if (encontrado) {

                    console.log(
                        "VALE/DESCONTO encontrado pelo valor:",
                        encontrado
                    );

                }

            }


            // ==================================
            // REGRA 2
            // PREMMIA NORMAL
            //
            // AUTORIZAÇÃO + VALOR
            // ==================================

            else {

                encontrado =
                    procurarPorAutorizacao(
                        venda,
                        interno,
                        utilizados
                    );


                if (encontrado) {

                    console.log(
                        "Premmia encontrada pela autorização:",
                        encontrado
                    );

                }

            }


            // ==================================
            // NÃO ENCONTRADO
            // ==================================

            if (
                !encontrado
            ) {

                resultadosConferencia.push(
                    criarResultado(
                        "NAO_LANCADA",
                        venda,
                        null,
                        comparaPorValor
                            ? "Vale/Desconto não localizado pelo valor."
                            : "Venda não localizada pela autorização."
                    )
                );

                return;
            }


            // ==================================
            // MARCAR INTERNO COMO UTILIZADO
            // ==================================

            utilizados.add(
                encontrado
            );


            // ==================================
            // COMPARAR VALOR
            // ==================================

            const valorPremmia =
                numeroSeguro(
                    venda.valor
                );


            const valorInterno =
                obterValorInterno(
                    encontrado
                );


            console.log(
                "Valor Premmia:",
                valorPremmia
            );

            console.log(
                "Valor Interno:",
                valorInterno
            );


            // ==================================
            // VALOR IGUAL
            // ==================================

            if (
                valoresIguais(
                    valorPremmia,
                    valorInterno
                )
            ) {

                resultadosConferencia.push(
                    criarResultado(
                        "CORRETA",
                        venda,
                        encontrado,
                        comparaPorValor
                            ? "Vale/Desconto conferido pelo valor."
                            : "Venda conferida por autorização e valor."
                    )
                );

            }


            // ==================================
            // VALOR DIFERENTE
            // ==================================

            else {

                resultadosConferencia.push(
                    criarResultado(
                        "VALOR_DIVERGENTE",
                        venda,
                        encontrado,
                        comparaPorValor
                            ? "Vale/Desconto localizado, mas o valor é diferente."
                            : "Autorização localizada, mas o valor é diferente."
                    )
                );

            }

        }
    );


    // ==========================================
    // PROCURAR SOBRAS DO SISTEMA INTERNO
    // ==========================================

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
                    "Lançamento interno sem correspondência no Portal Premmia."
                )
            );

        }
    );


    // ==========================================
    // MOSTRAR
    // ==========================================

    console.log(
        "================================"
    );

    console.log(
        "CONFERÊNCIA FINALIZADA"
    );

    console.log(
        "Resultados:",
        resultadosConferencia
    );

    console.log(
        "================================"
    );


    mostrarResultados();

}


// ==========================================
// PROCURAR POR AUTORIZAÇÃO
// ==========================================
//
// PREMMIA NORMAL
//
// A autorização precisa bater.
// Depois o valor será conferido.
// ==========================================

function procurarPorAutorizacao(
    venda,
    interno,
    utilizados
) {

    const autorizacaoPremmia =
        normalizarAutorizacao(
            venda.autorizacao
        );


    // Sem autorização não conseguimos
    // usar esta regra
    if (
        !autorizacaoPremmia
    ) {

        return null;
    }


    for (
        let i = 0;
        i < interno.length;
        i++
    ) {

        const item =
            interno[i];


        if (
            utilizados.has(item)
        ) {

            continue;
        }


        const autorizacaoInterno =
            normalizarAutorizacao(
                item.autorizacao
            );


        if (
            !autorizacaoInterno
        ) {

            continue;
        }


        if (
            autorizacaoPremmia ===
            autorizacaoInterno
        ) {

            return item;
        }

    }


    return null;

}


// ==========================================
// PROCURAR POR VALOR
// ==========================================
//
// USADO PARA:
//
// PREMMIA VALE
// PREMMIA DESCONTO
//
// AUTORIZAÇÃO É IGNORADA.
// ==========================================

function procurarPorValor(
    venda,
    interno,
    utilizados
) {

    const valorPremmia =
        numeroSeguro(
            venda.valor
        );


    if (
        valorPremmia === null
    ) {

        return null;
    }


    for (
        let i = 0;
        i < interno.length;
        i++
    ) {

        const item =
            interno[i];


        if (
            utilizados.has(item)
        ) {

            continue;
        }


        const valorInterno =
            obterValorInterno(
                item
            );


        if (
            valorInterno === null
        ) {

            continue;
        }


        if (
            valoresIguais(
                valorPremmia,
                valorInterno
            )
        ) {

            return item;
        }

    }


    return null;

}


// ==========================================
// OBTER VALOR DO INTERNO
// ==========================================
//
// O sistema interno possui:
//
// Valor
// Valor Líquido
//
// A conferência principal utiliza
// a coluna VALOR.
//
// ==========================================

function obterValorInterno(
    item
) {

    if (
        item === null ||
        item === undefined
    ) {

        return null;
    }


    // Primeiro tenta VALOR
    const valor =
        numeroSeguro(
            item.valor
        );


    if (
        valor !== null
    ) {

        return valor;
    }


    // Segurança: tenta Valor Líquido
    const valorLiquido =
        numeroSeguro(
            item.valorLiquido
        );


    if (
        valorLiquido !== null
    ) {

        return valorLiquido;
    }


    return null;

}


// ==========================================
// COMPARAR VALORES
// ==========================================

function valoresIguais(
    a,
    b
) {

    const valorA =
        numeroSeguro(a);


    const valorB =
        numeroSeguro(b);


    if (
        valorA === null ||
        valorB === null
    ) {

        return false;
    }


    return (
        Math.abs(
            valorA - valorB
        ) < 0.005
    );

}


// ==========================================
// CONVERTER PARA NÚMERO
// ==========================================

function numeroSeguro(
    valor
) {

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

        if (
            Number.isNaN(valor)
        ) {

            return null;
        }


        return Number(
            valor.toFixed(2)
        );

    }


    let texto =
        String(valor)
            .trim();


    if (!texto) {

        return null;
    }


    texto =
        texto.replace(
            /R\$/gi,
            ""
        )
        .trim();


    // ======================================
    // FORMATO BRASILEIRO
    //
    // 2,50
    // 25,04
    // 1.250,50
    // ======================================

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

    else {

        texto =
            texto.replace(
                /[^\d.-]/g,
                ""
            );

    }


    const numero =
        Number(texto);


    if (
        Number.isNaN(numero)
    ) {

        return null;
    }


    return Number(
        numero.toFixed(2)
    );

}


// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================

function normalizarAutorizacao(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }


    let texto =
        String(valor)
            .trim()
            .toUpperCase();


    // Remove .0 do Excel
    texto =
        texto.replace(
            /\.0$/,
            ""
        );


    // Remove espaços
    texto =
        texto.replace(
            /\s/g,
            ""
        );


    // Mantém letras e números
    texto =
        texto.replace(
            /[^\w]/g,
            ""
        );


    return texto;

}


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(
    valor
) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }


    return String(valor)
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


// ==========================================
// CRIAR RESULTADO
// ==========================================

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

            interno
                ? obterValorInterno(
                    interno
                )
                : null,


        operador:

            interno?.operador ||
            "",


        funcionario:

            interno?.operador ||
            "",


        filial:

            interno?.filial ||
            "",


        tipo:

            premmia?.operacao ||
            interno?.tipo ||
            "",


        movimento:

            interno?.movimento ||
            "",


        observacao:

            observacao

    };

}


// ==========================================
// MOSTRAR RESULTADOS
// ==========================================

function mostrarResultados() {

    atualizarResumo();


    if (
        typeof window.renderizarTabela ===
        "function"
    ) {

        window.renderizarTabela(
            resultadosConferencia
        );

        return;
    }


    if (
        typeof renderizarTabela ===
        "function"
    ) {

        renderizarTabela(
            resultadosConferencia
        );

    }

}


// ==========================================
// RESUMO
// ==========================================

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


    // Também atualiza valores monetários
    // caso existam esses elementos no HTML

    atualizarValorResumo(
        "valorCorretas",
        "CORRETA"
    );


    atualizarValorResumo(
        "valorNaoLancadas",
        "NAO_LANCADA"
    );


    atualizarValorResumo(
        "valorLancadasMais",
        "LANCADA_A_MAIS"
    );


    atualizarValorResumo(
        "valorValorErrado",
        "VALOR_DIVERGENTE"
    );


    atualizarValorResumo(
        "valorAutorizacao",
        "AUTORIZACAO_DIVERGENTE"
    );

}


// ==========================================
// ATUALIZAR TEXTO
// ==========================================

function alterarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (
        elemento
    ) {

        elemento.textContent =
            valor;

    }

}


// ==========================================
// ATUALIZAR VALOR DO RESUMO
// ==========================================

function atualizarValorResumo(
    id,
    status
) {

    const elemento =
        document.getElementById(id);


    if (
        !elemento
    ) {

        return;
    }


    let total =
        0;


    resultadosConferencia.forEach(
        function (item) {

            if (
                item.status !== status
            ) {

                return;
            }


            if (
                item.valorPremmia !==
                null &&
                item.valorPremmia !==
                undefined
            ) {

                total +=
                    Number(
                        item.valorPremmia
                    );

            }
            else if (
                item.valorInterno !==
                null &&
                item.valorInterno !==
                undefined
            ) {

                total +=
                    Number(
                        item.valorInterno
                    );

            }

        }
    );


    elemento.textContent =
        formatarMoeda(total);

}


// ==========================================
// FORMATAR MOEDA
// ==========================================

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


// ==========================================
// TABELA
// ==========================================
//
// Só será usada se o sistema ainda não
// possuir uma renderização própria.
// ==========================================

function renderizarTabela(lista) {

    const corpo =
        document.getElementById(
            "corpoTabela"
        );


    if (
        !corpo
    ) {

        return;
    }


    corpo.innerHTML = "";


    lista.forEach(
        function (item) {

            const tr =
                document.createElement(
                    "tr"
                );


            const statusTexto =
                traduzirStatus(
                    item.status
                );


            tr.innerHTML =

                "<td>" +
                escaparHTML(
                    statusTexto
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.data || ""
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.hora || ""
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.cliente || ""
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.tipo || ""
                ) +
                "</td>" +

                "<td>" +
                formatarMoeda(
                    item.valorPremmia
                ) +
                "</td>" +

                "<td>" +
                formatarMoeda(
                    item.valorInterno
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.autorizacaoPremmia ||
                    item.autorizacaoInterno ||
                    ""
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.operador || ""
                ) +
                "</td>" +

                "<td>" +
                escaparHTML(
                    item.observacao || ""
                ) +
                "</td>";


            corpo.appendChild(
                tr
            );

        }
    );

}


// ==========================================
// TRADUZIR STATUS
// ==========================================

function traduzirStatus(
    status
) {

    const mapa = {

        CORRETA:
            "CORRETA",

        NAO_LANCADA:
            "NÃO LANÇADA",

        LANCADA_A_MAIS:
            "LANÇADA A MAIS",

        VALOR_DIVERGENTE:
            "VALOR DIVERGENTE",

        AUTORIZACAO_DIVERGENTE:
            "AUTORIZAÇÃO DIVERGENTE"

    };


    return (
        mapa[status] ||
        status ||
        ""
    );

}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
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


// ==========================================
// FILTROS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

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

                            mostrarResultados();

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


                        if (
                            typeof window.renderizarTabela ===
                            "function"
                        ) {

                            window.renderizarTabela(
                                filtrados
                            );

                        }
                        else {

                            renderizarTabela(
                                filtrados
                            );

                        }

                    }
                );

            }
        );

    }
);


// ==========================================
// EXPORTAR PARA OUTROS SCRIPTS
// ==========================================

window.iniciarConferencia =
    iniciarConferencia;


window.mostrarResultados =
    mostrarResultados;


window.atualizarResumo =
    atualizarResumo;


console.log(
    "================================"
);

console.log(
    "conferencia.js completo carregado"
);

console.log(
    "REGRA:"
);

console.log(
    "Premmia normal = AUTORIZAÇÃO + VALOR"
);

console.log(
    "Premmia Vale = SOMENTE VALOR"
);

console.log(
    "Premmia Desconto = SOMENTE VALOR"
);

console.log(
    "================================"
);
