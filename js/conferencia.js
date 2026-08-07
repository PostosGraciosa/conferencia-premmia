```javascript
// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


// ==========================================
// RESULTADOS DA CONFERÊNCIA
// ==========================================

let resultadosConferencia = [];


// ==========================================
// BOTÃO CONFERIR
// ==========================================

const btnConferir =
    document.getElementById("btnConferir");


if (btnConferir) {

    btnConferir.addEventListener(
        "click",
        iniciarConferencia
    );

}


// ==========================================
// INICIAR CONFERÊNCIA
// ==========================================

function iniciarConferencia() {

    if (
        !window.dadosPremmia ||
        !window.dadosInterno
    ) {

        alert(
            "As duas planilhas precisam ser carregadas."
        );

        return;

    }


    if (
        window.dadosPremmia.length === 0 ||
        window.dadosInterno.length === 0
    ) {

        alert(
            "Não foram encontrados registros suficientes para realizar a conferência."
        );

        return;

    }


    resultadosConferencia = [];


    // ======================================
    // CRIA ÍNDICES DAS TRANSAÇÕES
    // ======================================

    const indiceInterno =
        criarIndicePorAutorizacao(
            window.dadosInterno
        );


    const indicePremmia =
        criarIndicePorAutorizacao(
            window.dadosPremmia
        );


    // ======================================
    // CONTROLE DOS REGISTROS INTERNOS
    // ======================================

    const internosUtilizados =
        new Set();


    // ======================================
    // 1. ANALISAR TODAS AS VENDAS PREMMIA
    // ======================================

    window.dadosPremmia.forEach(
        (premmia, indicePremmiaOriginal) => {

            const chave =
                normalizarAutorizacao(
                    premmia.autorizacao
                );


            // --------------------------------
            // AUTORIZAÇÃO VAZIA
            // --------------------------------

            if (!chave) {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "AUTORIZACAO_DIVERGENTE",

                        premmia:
                            premmia,

                        interno:
                            null,

                        observacao:
                            "Transação do Premmia sem autorização válida."

                    })

                );

                return;

            }


            // --------------------------------
            // PROCURA NO INTERNO
            // --------------------------------

            const candidatos =
                indiceInterno.get(chave) || [];


            // --------------------------------
            // NÃO ENCONTRADA
            // --------------------------------

            if (candidatos.length === 0) {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "NAO_LANCADA",

                        premmia:
                            premmia,

                        interno:
                            null,

                        observacao:
                            "Venda do Premmia não encontrada no sistema interno."

                    })

                );

                return;

            }


            // --------------------------------
            // PROCURA UM LANÇAMENTO AINDA
            // NÃO UTILIZADO
            // --------------------------------

            let internoEncontrado = null;

            let indiceInternoEncontrado = -1;


            for (
                let i = 0;
                i < candidatos.length;
                i++
            ) {

                const candidato =
                    candidatos[i];


                if (
                    !internosUtilizados.has(
                        candidato._indiceOriginal
                    )
                ) {

                    internoEncontrado =
                        candidato;

                    indiceInternoEncontrado =
                        candidato._indiceOriginal;

                    break;

                }

            }


            // --------------------------------
            // TODOS OS REGISTROS JÁ FORAM
            // UTILIZADOS
            // --------------------------------

            if (!internoEncontrado) {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "LANCADA_A_MAIS",

                        premmia:
                            null,

                        interno:
                            candidatos[0],

                        observacao:
                            "Existe mais de um lançamento interno para esta autorização."

                    })

                );

                return;

            }


            internosUtilizados.add(
                indiceInternoEncontrado
            );


            // =================================
            // COMPARAR VALORES
            // =================================

            const valorPremmia =
                normalizarValor(
                    premmia.valor
                );


            const valorInterno =
                normalizarValor(
                    internoEncontrado.valor
                );


            const diferenca =
                arredondar(
                    valorPremmia -
                    valorInterno
                );


            // --------------------------------
            // VALOR IGUAL
            // --------------------------------

            if (
                Math.abs(diferenca) < 0.01
            ) {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "CORRETA",

                        premmia:
                            premmia,

                        interno:
                            internoEncontrado,

                        diferenca:
                            0,

                        observacao:
                            "Venda conferida corretamente."

                    })

                );

            }


            // --------------------------------
            // VALOR DIFERENTE
            // --------------------------------

            else {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "VALOR_DIVERGENTE",

                        premmia:
                            premmia,

                        interno:
                            internoEncontrado,

                        diferenca:
                            diferenca,

                        observacao:
                            "A autorização foi encontrada, porém o valor é diferente."

                    })

                );

            }

        }
    );


    // =========================================
    // 2. PROCURAR LANÇAMENTOS INTERNOS
    // QUE NÃO EXISTEM NO PREMMIA
    // =========================================

    window.dadosInterno.forEach(
        (interno) => {

            if (
                internosUtilizados.has(
                    interno._indiceOriginal
                )
            ) {

                return;

            }


            const chave =
                normalizarAutorizacao(
                    interno.autorizacao
                );


            if (!chave) {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "AUTORIZACAO_DIVERGENTE",

                        premmia:
                            null,

                        interno:
                            interno,

                        observacao:
                            "Lançamento interno sem autorização válida."

                    })

                );

                return;

            }


            const candidatosPremmia =
                indicePremmia.get(chave) || [];


            // --------------------------------
            // NÃO EXISTE NO PREMMIA
            // --------------------------------

            if (
                candidatosPremmia.length === 0
            ) {

                resultadosConferencia.push(

                    criarResultado({

                        status:
                            "LANCADA_A_MAIS",

                        premmia:
                            null,

                        interno:
                            interno,

                        observacao:
                            "Lançamento encontrado no sistema interno, mas não encontrado no Premmia."

                    })

                );

                return;

            }


            // --------------------------------
            // CASO A AUTORIZAÇÃO EXISTA,
            // MAS O REGISTRO NÃO TENHA SIDO
            // ASSOCIADO
            // --------------------------------

            resultadosConferencia.push(

                criarResultado({

                    status:
                        "LANCADA_A_MAIS",

                    premmia:
                        candidatosPremmia[0],

                    interno:
                        interno,

                    observacao:
                        "Existe uma transação correspondente no Premmia, porém o lançamento interno não foi associado."

                })

            );

        }
    );


    // =========================================
    // SALVAR RESULTADO GLOBAL
    // =========================================

    window.resultadosConferencia =
        resultadosConferencia;


    // =========================================
    // MOSTRAR RESULTADO
    // =========================================

    mostrarResultados();


}


// ==========================================
// CRIAR ÍNDICE POR AUTORIZAÇÃO
// ==========================================

function criarIndicePorAutorizacao(registros) {

    const indice =
        new Map();


    registros.forEach(
        (registro, indiceOriginal) => {

            // Guarda a posição original.
            // Isso permite controlar duplicidades.

            registro._indiceOriginal =
                indiceOriginal;


            const chave =
                normalizarAutorizacao(
                    registro.autorizacao
                );


            if (!chave) {
                return;
            }


            if (
                !indice.has(chave)
            ) {

                indice.set(
                    chave,
                    []
                );

            }


            indice
                .get(chave)
                .push(registro);

        }
    );


    return indice;

}


// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================

function normalizarAutorizacao(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");

}


// ==========================================
// NORMALIZAR VALOR
// ==========================================

function normalizarValor(valor) {

    const numero =
        Number(valor);


    if (isNaN(numero)) {
        return 0;
    }


    return arredondar(numero);

}


// ==========================================
// ARREDONDAR
// ==========================================

function arredondar(valor) {

    return Number(
        Number(valor).toFixed(2)
    );

}


// ==========================================
// CRIAR RESULTADO
// ==========================================

function criarResultado({
    status,
    premmia,
    interno,
    diferenca = 0,
    observacao = ""
}) {

    return {

        status:
            status,

        premmia:
            premmia,

        interno:
            interno,

        data:
            premmia?.data ||
            interno?.data ||
            "",

        hora:
            premmia?.hora ||
            interno?.hora ||
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

        diferenca:
            arredondar(diferenca),

        operador:
            interno?.operador ||
            "",

        cliente:
            premmia?.cliente ||
            "",

        pagamento:
            premmia?.pagamento ||
            "",

        tipo:
            premmia?.operacao ||
            interno?.tipo ||
            "",

        observacao:
            observacao

    };

}


// ==========================================
// MOSTRAR RESULTADOS
// ==========================================

function mostrarResultados() {

    const resultado =
        document.getElementById(
            "resultado"
        );


    const tabelaResultado =
        document.getElementById(
            "tabelaResultado"
        );


    if (resultado) {

        resultado.style.display =
            "block";

    }


    if (tabelaResultado) {

        tabelaResultado.style.display =
            "block";

    }


    atualizarResumo();


    renderizarTabela(
        resultadosConferencia
    );


    // Rola até o resultado

    if (resultado) {

        resultado.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    const resumo = {

        CORRETA: {
            quantidade: 0,
            valor: 0
        },

        NAO_LANCADA: {
            quantidade: 0,
            valor: 0
        },

        LANCADA_A_MAIS: {
            quantidade: 0,
            valor: 0
        },

        VALOR_DIVERGENTE: {
            quantidade: 0,
            valor: 0
        },

        AUTORIZACAO_DIVERGENTE: {
            quantidade: 0,
            valor: 0
        }

    };


    resultadosConferencia.forEach(
        resultado => {

            if (
                !resumo[
                    resultado.status
                ]
            ) {

                return;

            }


            resumo[
                resultado.status
            ].quantidade++;


            // Para o resumo usamos o valor
            // do Premmia quando existir.
            // Caso contrário usamos o interno.

            const valor =
                resultado.valorPremmia !== null
                    ? resultado.valorPremmia
                    : resultado.valorInterno;


            if (
                valor !== null &&
                !isNaN(valor)
            ) {

                resumo[
                    resultado.status
                ].valor += Number(valor);

            }

        }
    );


    // ======================================
    // PREENCHER TELA
    // ======================================

    preencherResumo(
        "totalCorretas",
        "valorCorretas",
        resumo.CORRETA
    );


    preencherResumo(
        "totalNaoLancadas",
        "valorNaoLancadas",
        resumo.NAO_LANCADA
    );


    preencherResumo(
        "totalLancadasMais",
        "valorLancadasMais",
        resumo.LANCADA_A_MAIS
    );


    preencherResumo(
        "totalValorErrado",
        "valorValorErrado",
        resumo.VALOR_DIVERGENTE
    );


    preencherResumo(
        "totalAutorizacao",
        "valorAutorizacao",
        resumo.AUTORIZACAO_DIVERGENTE
    );

}


// ==========================================
// PREENCHER UM ITEM DO RESUMO
// ==========================================

function preencherResumo(
    idQuantidade,
    idValor,
    dados
) {

    const quantidade =
        document.getElementById(
            idQuantidade
        );


    const valor =
        document.getElementById(
            idValor
        );


    if (quantidade) {

        quantidade.textContent =
            dados.quantidade;

    }


    if (valor) {

        valor.textContent =
            formatarMoeda(
                dados.valor
            );

    }

}


// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarTabela(
    resultados
) {

    const corpo =
        document.getElementById(
            "corpoTabela"
        );


    if (!corpo) {
        return;
    }


    corpo.innerHTML = "";


    if (
        !resultados ||
        resultados.length === 0
    ) {

        corpo.innerHTML = `

            <tr>

                <td colspan="9"
                    style="text-align:center; padding:30px;">

                    Nenhum resultado encontrado.

                </td>

            </tr>

        `;

        return;

    }


    resultados.forEach(
        resultado => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${criarBadgeStatus(
                        resultado.status
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.data
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.hora
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.autorizacaoPremmia ||
                        "—"
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.autorizacaoInterno ||
                        "—"
                    )}
                </td>

                <td class="valor">
                    ${
                        resultado.valorPremmia !== null
                            ? formatarMoeda(
                                resultado.valorPremmia
                            )
                            : "—"
                    }
                </td>

                <td class="valor">
                    ${
                        resultado.valorInterno !== null
                            ? formatarMoeda(
                                resultado.valorInterno
                            )
                            : "—"
                    }
                </td>

                <td>
                    ${formatarDiferenca(
                        resultado.diferenca
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        resultado.operador ||
                        "—"
                    )}
                </td>

            `;


            corpo.appendChild(tr);

        }
    );

}


// ==========================================
// CRIAR BADGE DO STATUS
// ==========================================

function criarBadgeStatus(status) {

    const nomes = {

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


    const classes = {

        CORRETA:
            "status-correta",

        NAO_LANCADA:
            "status-nao-lancada",

        LANCADA_A_MAIS:
            "status-lancada-mais",

        VALOR_DIVERGENTE:
            "status-valor-divergente",

        AUTORIZACAO_DIVERGENTE:
            "status-autorizacao-divergente"

    };


    return `

        <span class="status ${classes[status] || ""}">

            ${nomes[status] || status}

        </span>

    `;

}


// ==========================================
// FORMATAR DIFERENÇA
// ==========================================

function formatarDiferenca(
    valor
) {

    const numero =
        Number(valor || 0);


    if (
        Math.abs(numero) < 0.01
    ) {

        return `
            <span class="diferenca-zero">
                R$ 0,00
            </span>
        `;

    }


    if (numero > 0) {

        return `
            <span class="diferenca-positiva">
                ${formatarMoeda(numero)}
            </span>
        `;

    }


    return `
        <span class="diferenca-negativa">
            ${formatarMoeda(numero)}
        </span>
    `;

}


// ==========================================
// FORMATAR MOEDA
// ==========================================

function formatarMoeda(
    valor
) {

    const numero =
        Number(valor || 0);


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// FILTROS DA TABELA
// ==========================================

document.querySelectorAll(
    ".filtro"
).forEach(
    botao => {

        botao.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".filtro")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "ativo"
                            )
                    );


                this.classList.add(
                    "ativo"
                );


                const filtro =
                    this.dataset.filtro;


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
                        resultado =>
                            resultado.status ===
                            filtro
                    );


                renderizarTabela(
                    filtrados
                );

            }
        );

    }
);


// ==========================================
// EXPORTAR RESULTADOS PARA OUTROS ARQUIVOS
// ==========================================

window.resultadosConferencia =
    resultadosConferencia;

window.formatarMoeda =
    formatarMoeda;

window.renderizarTabela =
    renderizarTabela;
```
