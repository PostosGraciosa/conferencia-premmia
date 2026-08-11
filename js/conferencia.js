
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

function iniciarEventosConferencia() {

    console.log("================================");
    console.log("conferencia.js iniciado");
    console.log("================================");

    ativarBotaoConferir();
    ativarFiltros();
}

// Funciona tanto se o script carregar antes
// quanto depois do DOM.
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarEventosConferencia
    );

} else {

    iniciarEventosConferencia();

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

    // Evita duplicar eventos
    if (btn.dataset.conferenciaAtiva === "true") {
        return;
    }

    btn.dataset.conferenciaAtiva = "true";

    btn.addEventListener("click", function (event) {

        event.preventDefault();

        console.log(
            "BOTÃO CONFERIR CLICADO"
        );

        iniciarConferencia();

    });

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
    // LANÇAMENTOS INTERNOS UTILIZADOS
    // ==================================================

    const utilizados =
        new Set();

    // ==================================================
    // TOLERÂNCIA DE HORÁRIO
    //
    // Procura primeiro pelo valor.
    // Havendo vários valores iguais,
    // escolhe o horário mais próximo.
    //
    // Tolerância máxima: 30 minutos.
    // ==================================================

    const TOLERANCIA_MINUTOS = 30;

    // ==================================================
    // PERCORRE PORTAL
    // ==================================================

    premmia.forEach(function (venda, indice) {

        console.log(
            "--------------------------------"
        );

        console.log(
            "Analisando Portal:",
            indice + 1,
            venda
        );

        const encontrado =
            encontrarPorValorEHorario(
                venda,
                interno,
                utilizados,
                TOLERANCIA_MINUTOS
            );

        // ==================================================
        // NÃO ENCONTRADO
        // ==================================================

        if (!encontrado) {

            console.log(
                "NÃO LOCALIZADO:",
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
    //
    // O que sobrou no sistema interno
    // não encontrou correspondente no Portal.
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

    console.log(
        "Total:",
        resultadosConferencia.length
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
        converterValor(item.valor);

    // Linha de total conhecida
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

function encontrarPorValorEHorario(
    venda,
    interno,
    utilizados,
    toleranciaMinutos
) {

    const valorPortal =
        converterValor(venda.valor);

    if (valorPortal === null) {
        return null;
    }

    const horarioPortal =
        obterDataHora(venda);

    let melhor = null;
    let menorDiferenca = Infinity;

    // ==================================================
    // PRIMEIRO: VALOR EXATO
    // DEPOIS: HORÁRIO MAIS PRÓXIMO
    // ==================================================

    interno.forEach(function (item) {

        if (utilizados.has(item)) {
            return;
        }

        const valorInterno =
            converterValor(item.valor);

        if (valorInterno === null) {
            return;
        }

        // O VALOR PRECISA SER IGUAL
        if (
            valorPortal !== valorInterno
        ) {
            return;
        }

        const horarioInterno =
            obterDataHora(item);

        // ==================================================
        // SE OS DOIS TIVEREM HORÁRIO
        // ==================================================

        if (
            horarioPortal !== null &&
            horarioInterno !== null
        ) {

            const diferenca =
                Math.abs(
                    horarioPortal -
                    horarioInterno
                );

            const diferencaMinutos =
                diferenca / 60000;

            if (
                diferencaMinutos >
                toleranciaMinutos
            ) {

                return;
            }

            if (
                diferencaMinutos <
                menorDiferenca
            ) {

                menorDiferenca =
                    diferencaMinutos;

                melhor = item;
            }

            return;
        }

        // ==================================================
        // SE NÃO CONSEGUIR COMPARAR HORÁRIO
        // GUARDA COMO POSSIBILIDADE
        // ==================================================

        if (melhor === null) {
            melhor = item;
        }

    });

    return melhor;
}

// ======================================================
// OBTER DATA + HORA
// ======================================================

function obterDataHora(item) {

    if (!item) {
        return null;
    }

    let data =
        item.data ||
        item.movimento ||
        "";

    let hora =
        item.hora ||
        "";

    data =
        String(data).trim();

    hora =
        String(hora).trim();

    if (!data && !hora) {
        return null;
    }

    // ==================================================
    // DATA NO FORMATO:
    // 09/08/2026
    // ==================================================

    let dataMatch =
        data.match(
            /(\d{2})\/(\d{2})\/(\d{4})/
        );

    // ==================================================
    // SE DATA + HORA ESTIVEREM JUNTAS
    // ==================================================

    if (!dataMatch) {

        dataMatch =
            String(data)
            .match(
                /(\d{2})\/(\d{2})\/(\d{4})/
            );
    }

    if (!dataMatch) {

        // Tenta apenas horário
        const horaSomente =
            converterHorario(hora);

        return horaSomente;
    }

    const dia =
        Number(dataMatch[1]);

    const mes =
        Number(dataMatch[2]) - 1;

    const ano =
        Number(dataMatch[3]);

    const minutosHorario =
        converterHorario(hora);

    if (
        minutosHorario === null
    ) {

        return new Date(
            ano,
            mes,
            dia
        ).getTime();
    }

    const horas =
        Math.floor(
            minutosHorario / 60
        );

    const minutos =
        minutosHorario % 60;

    return new Date(
        ano,
        mes,
        dia,
        horas,
        minutos,
        0,
        0
    ).getTime();

}

// ======================================================
// CONVERTER HORÁRIO
// ======================================================

function converterHorario(hora) {

    if (
        hora === null ||
        hora === undefined ||
        hora === ""
    ) {

        return null;
    }

    const texto =
        String(hora).trim();

    const partes =
        texto.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
        );

    if (!partes) {
        return null;
    }

    const horas =
        Number(partes[1]);

    const minutos =
        Number(partes[2]);

    if (
        horas > 23 ||
        minutos > 59
    ) {

        return null;
    }

    return (
        horas * 60 +
        minutos
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
        String(valor)
        .trim();

    if (!texto) {
        return null;
    }

    texto =
        texto
        .replace(/R\$/gi, "")
        .trim();

    // Formato brasileiro
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

        // SOMENTE EXIBIÇÃO
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
    // TOTAL REAL DO PORTAL
    // ==================================================

    const totalPortal =
        somarValoresArquivo(
            window.dadosPremmia || []
        );

    // ==================================================
    // TOTAL REAL DO SISTEMA
    // ==================================================

    const totalSistema =
        somarValoresArquivo(

            (window.dadosInterno || [])
            .filter(function (item) {

                return !ehLinhaTotal(item);

            })

        );

    const diferencaCentavos =
        Math.round(
            totalPortal * 100
        ) -
        Math.round(
            totalSistema * 100
        );

    const diferenca =
        diferencaCentavos / 100;

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
            Math.abs(diferenca)
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

}

// ======================================================
// SOMAR VALORES
// ======================================================

function somarValores(
    status,
    campo
) {

    let totalCentavos = 0;

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

            totalCentavos +=
                valor;

        }

    });

    return (
        totalCentavos / 100
    );
}

// ======================================================
// SOMAR ARQUIVO
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
                    item.valorPremmia !== null &&
                    item.valorInterno !== null
                        ? Math.abs(
                            Number(item.valorPremmia) -
                            Number(item.valorInterno)
                        )
                        : 0
                )}
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
    "conferencia.js carregado com sucesso."
);
```
