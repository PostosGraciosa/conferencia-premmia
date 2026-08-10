```javascript
// ======================================================
// SISTEMA DE CONFERÊNCIA PREMMIA
// conferencia.js
// ======================================================

let resultadosConferencia = [];


// ======================================================
// RESULTADOS GLOBAIS
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
            "conferencia.js iniciado"
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
        "Botão Conferir encontrado:",
        btn
    );


    btn.onclick =
        function (event) {

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


// ======================================================
// INICIAR CONFERÊNCIA
// ======================================================

function iniciarConferencia() {

    const premmia =
        window.dadosPremmia || [];


    const interno =
        window.dadosInterno || [];


    console.log(
        "Iniciando conferência..."
    );


    console.log(
        "Premmia:",
        premmia.length
    );


    console.log(
        "Interno:",
        interno.length
    );


    if (premmia.length === 0) {

        alert(
            "Carregue a planilha do Portal Premmia."
        );

        return;

    }


    if (interno.length === 0) {

        alert(
            "Carregue a planilha do sistema interno."
        );

        return;

    }


    resultadosConferencia = [];


    const utilizados =
        new Set();


    // ==================================================
    // PERCORRE PREMMIA
    // ==================================================

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


            const operacao =
                String(
                    venda.operacao || ""
                )
                .trim()
                .toUpperCase();


            // ==================================================
            // IDENTIFICA VALE
            // ==================================================

            const ehVale =
                operacao.includes(
                    "VALE"
                );


            // ==================================================
            // IDENTIFICA DESCONTO
            // ==================================================

            const ehDesconto =
                operacao.includes(
                    "DESCONTO"
                );


            // ==================================================
            // VALE / DESCONTO
            //
            // NÃO COMPARAR AUTORIZAÇÃO
            //
            // COMPARAR SOMENTE VALOR
            // ==================================================

            const comparaSomenteValor =
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
                comparaSomenteValor
            );


            let encontrado = null;


            // ==================================================
            // 1 - VALE / DESCONTO
            // PROCURA SOMENTE PELO VALOR
            // ==================================================

            if (
                comparaSomenteValor
            ) {

                encontrado =
                    encontrarPorValor(
                        venda,
                        interno,
                        utilizados
                    );


                if (encontrado) {

                    console.log(
                        "Vale/Desconto encontrado pelo valor:",
                        encontrado
                    );

                }

            }


            // ==================================================
            // 2 - OPERAÇÕES NORMAIS
            //
            // PRIMEIRO AUTORIZAÇÃO
            // ==================================================

            if (
                !encontrado &&
                !comparaSomenteValor &&
                venda.autorizacao
            ) {

                encontrado =
                    interno.find(
                        function (item) {

                            if (
                                utilizados.has(
                                    item
                                )
                            ) {

                                return false;

                            }


                            if (
                                !item.autorizacao
                            ) {

                                return false;

                            }


                            return (
                                normalizarAutorizacao(
                                    item.autorizacao
                                )
                                ===
                                normalizarAutorizacao(
                                    venda.autorizacao
                                )
                            );

                        }
                    );


                if (encontrado) {

                    console.log(
                        "Premmia encontrada pela autorização:",
                        encontrado
                    );

                }

            }


            // ==================================================
            // 3 - OPERAÇÕES NORMAIS
            //
            // SE NÃO ACHOU PELA AUTORIZAÇÃO,
            // TENTA PELO VALOR
            // ==================================================

            if (
                !encontrado &&
                !comparaSomenteValor
            ) {

                encontrado =
                    encontrarPorValor(
                        venda,
                        interno,
                        utilizados
                    );


                if (encontrado) {

                    console.log(
                        "Encontrada pelo valor:",
                        encontrado
                    );

                }

            }


            // ==================================================
            // NÃO ENCONTRADA
            // ==================================================

            if (!encontrado) {

                resultadosConferencia.push(

                    criarResultado(
                        "NAO_LANCADA",
                        venda,
                        null,
                        comparaSomenteValor
                            ? "Desconto/Vale não localizado pelo valor."
                            : "Venda não localizada no sistema interno."
                    )

                );

                return;

            }


            // ==================================================
            // MARCA INTERNO COMO UTILIZADO
            // ==================================================

            utilizados.add(
                encontrado
            );


            console.log(
                "Valor Premmia:",
                venda.valor
            );


            console.log(
                "Valor Interno:",
                encontrado.valor
            );


            // ==================================================
            // COMPARAÇÃO DO VALOR
            // ==================================================

            if (
                mesmoValor(
                    venda.valor,
                    encontrado.valor
                )
            ) {

                resultadosConferencia.push(

                    criarResultado(
                        "CORRETA",
                        venda,
                        encontrado,
                        comparaSomenteValor
                            ? "Conferida somente pelo valor."
                            : "Conferida pela autorização e valor."
                    )

                );

            }

            else {

                resultadosConferencia.push(

                    criarResultado(
                        "VALOR_DIVERGENTE",
                        venda,
                        encontrado,
                        comparaSomenteValor
                            ? "Desconto/Vale localizado, porém o valor é diferente."
                            : "Autorização localizada, porém o valor é diferente."
                    )

                );

            }

        }
    );


    // ==================================================
    // LANÇAMENTOS A MAIS
    // ==================================================
    //
    // IMPORTANTE:
    // Linhas de TOTAL já foram removidas na leitura.
    //
    // ==================================================

    interno.forEach(
        function (item) {

            if (
                utilizados.has(
                    item
                )
            ) {

                return;

            }


            // Segurança extra:
            // nunca considerar linha de total
            if (
                ehLinhaTotal(
                    item
                )
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


    // ==================================================
    // FINAL
    // ==================================================

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
        "Total:",
        resultadosConferencia.length
    );


    console.log(
        "================================"
    );


    // ==================================================
    // MOSTRAR RESULTADOS
    // ==================================================

    mostrarResultados();

}


// ======================================================
// ENCONTRAR PELO VALOR
// ======================================================

function encontrarPorValor(
    venda,
    interno,
    utilizados
) {

    return interno.find(
        function (item) {

            if (
                utilizados.has(
                    item
                )
            ) {

                return false;

            }


            if (
                ehLinhaTotal(
                    item
                )
            ) {

                return false;

            }


            return mesmoValor(
                venda.valor,
                item.valor
            );

        }
    );

}


// ======================================================
// IDENTIFICAR LINHA DE TOTAL
// ======================================================
//
// NÃO CONSIDERAR:
// R$ 6.665,41
// ou qualquer outra linha de TOTAL.
//
// ======================================================

function ehLinhaTotal(
    item
) {

    if (!item) {
        return false;
    }


    const textos = [

        item.administradora,
        item.cliente,
        item.filial,
        item.operador,
        item.tipo,
        item.movimento,
        item.bomPara,
        item.centroCusto

    ];


    const texto =
        textos
            .map(
                function (valor) {

                    return String(
                        valor || ""
                    )
                    .trim()
                    .toUpperCase();

                }
            )
            .join(" ");


    return (
        texto.includes("TOTAL")
        ||
        texto.includes("TOTAIS")
    );

}


// ======================================================
// COMPARAR VALORES
// ======================================================

function mesmoValor(
    a,
    b
) {

    if (
        a === null ||
        a === undefined ||
        b === null ||
        b === undefined
    ) {

        return false;

    }


    const valorA =
        Number(a);


    const valorB =
        Number(b);


    if (
        isNaN(valorA) ||
        isNaN(valorB)
    ) {

        return false;

    }


    return (
        Math.round(
            valorA * 100
        )
        ===
        Math.round(
            valorB * 100
        )
    );

}


// ======================================================
// NORMALIZAR AUTORIZAÇÃO
// ======================================================

function normalizarAutorizacao(
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

        .replace(
            /\s/g,
            ""
        )

        .replace(
            /\.0$/,
            ""
        )

        .replace(
            /[^\w]/g,
            ""
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


    // ==================================================
    // GARANTIA VISUAL
    // ==================================================

    const resultado =
        document.getElementById(
            "resultado"
        );


    if (resultado) {

        resultado.hidden =
            false;

        resultado.style.display =
            "block";

        resultado.style.visibility =
            "visible";

        resultado.style.opacity =
            "1";

    }


    const resultadoConferencia =
        document.getElementById(
            "resultadoConferencia"
        );


    if (resultadoConferencia) {

        resultadoConferencia.hidden =
            false;

        resultadoConferencia.style.display =
            "block";

    }


    // ==================================================
    // ROLAR PARA RESULTADO
    // ==================================================

    setTimeout(
        function () {

            const alvo =
                document.getElementById(
                    "resultado"
                )
                ||
                document.getElementById(
                    "resultadoConferencia"
                );


            if (alvo) {

                alvo.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        },
        100
    );

}


// ======================================================
// MOSTRAR CONTAINER RESULTADO
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


            if (!elemento) {
                return;
            }


            elemento.hidden =
                false;


            elemento.style.display =
                id === "tabelaResultado"
                    ? "table"
                    : "block";


            elemento.style.visibility =
                "visible";


            elemento.style.opacity =
                "1";

        }
    );


    console.log(
        "Container de resultados exibido."
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
    // TOTAIS EM DINHEIRO
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


    const somaValorDivergente =
        somarDiferencas(
            "VALOR_DIVERGENTE"
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
        formatarMoeda(
            somaValorDivergente
        )
    );


    console.log(
        "Resumo atualizado:",
        total
    );

}


// ======================================================
// SOMAR VALORES
// ======================================================

function somarValores(
    status,
    campo
) {

    let total = 0;


    resultadosConferencia.forEach(
        function (item) {

            if (
                item.status !==
                status
            ) {

                return;

            }


            if (
                item[campo] === null ||
                item[campo] === undefined
            ) {

                return;

            }


            total +=
                Number(
                    item[campo]
                ) || 0;

        }
    );


    return total;

}


// ======================================================
// SOMAR DIFERENÇAS
// ======================================================

function somarDiferencas(
    status
) {

    let total = 0;


    resultadosConferencia.forEach(
        function (item) {

            if (
                item.status !==
                status
            ) {

                return;

            }


            const premmia =
                Number(
                    item.valorPremmia
                ) || 0;


            const interno =
                Number(
                    item.valorInterno
                ) || 0;


            total +=
                Math.abs(
                    premmia -
                    interno
                );

        }
    );


    return total;

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


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


// ======================================================
// MOEDA
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


    if (tabela) {

        tabela.hidden =
            false;

        tabela.style.display =
            "table";

        tabela.style.visibility =
            "visible";

        tabela.style.opacity =
            "1";

    }


    console.log(
        "Tabela renderizada."
    );

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


console.log(
    "conferencia.js completo carregado"
);
```
