```javascript
// ==========================================
// CONFERÊNCIA PREMMIA
// exportar.js
// Exportação dos resultados para Excel
// ==========================================


// ==========================================
// BOTÃO EXPORTAR
// ==========================================

const btnExportar =
    document.getElementById("btnExportar");


if (btnExportar) {

    btnExportar.addEventListener(
        "click",
        exportarExcel
    );

}


// ==========================================
// EXPORTAR RESULTADOS
// ==========================================

function exportarExcel() {

    const resultados =
        window.resultadosConferencia || [];


    if (resultados.length === 0) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    // ======================================
    // PREPARAR DADOS
    // ======================================

    const dados = resultados.map(
        resultado => {

            return {

                "STATUS":
                    nomeStatus(
                        resultado.status
                    ),

                "DATA":
                    resultado.data || "",

                "HORA":
                    resultado.hora || "",

                "CLIENTE":
                    resultado.cliente || "",

                "CPF":
                    resultado.premmia?.cpf || "",

                "TIPO":
                    resultado.tipo || "",

                "FORMA DE PAGAMENTO":
                    resultado.pagamento || "",

                "AUTORIZAÇÃO PREMMIA":
                    resultado.autorizacaoPremmia || "",

                "AUTORIZAÇÃO INTERNO":
                    resultado.autorizacaoInterno || "",

                "VALOR PREMMIA":
                    valorExcel(
                        resultado.valorPremmia
                    ),

                "VALOR INTERNO":
                    valorExcel(
                        resultado.valorInterno
                    ),

                "DIFERENÇA":
                    valorExcel(
                        resultado.diferenca
                    ),

                "OPERADOR":
                    resultado.operador || "",

                "OBSERVAÇÃO":
                    resultado.observacao || ""

            };

        }
    );


    // ======================================
    // CRIAR PLANILHA
    // ======================================

    const worksheet =
        XLSX.utils.json_to_sheet(
            dados
        );


    // ======================================
    // AJUSTAR LARGURA DAS COLUNAS
    // ======================================

    worksheet["!cols"] = [

        { wch: 23 }, // STATUS
        { wch: 12 }, // DATA
        { wch: 10 }, // HORA
        { wch: 25 }, // CLIENTE
        { wch: 18 }, // CPF
        { wch: 18 }, // TIPO
        { wch: 22 }, // PAGAMENTO
        { wch: 42 }, // AUTORIZAÇÃO PREMMIA
        { wch: 42 }, // AUTORIZAÇÃO INTERNO
        { wch: 16 }, // VALOR PREMMIA
        { wch: 16 }, // VALOR INTERNO
        { wch: 14 }, // DIFERENÇA
        { wch: 20 }, // OPERADOR
        { wch: 55 }  // OBSERVAÇÃO

    ];


    // ======================================
    // CRIAR LIVRO
    // ======================================

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Conferência"
    );


    // ======================================
    // ABA DE RESUMO
    // ======================================

    const resumo =
        criarResumoExcel(
            resultados
        );


    const worksheetResumo =
        XLSX.utils.aoa_to_sheet(
            resumo
        );


    worksheetResumo["!cols"] = [

        { wch: 30 },
        { wch: 15 },
        { wch: 18 }

    ];


    XLSX.utils.book_append_sheet(
        workbook,
        worksheetResumo,
        "Resumo"
    );


    // ======================================
    // NOME DO ARQUIVO
    // ======================================

    const data =
        new Date();


    const dataArquivo =
        data
            .toLocaleDateString(
                "pt-BR"
            )
            .replace(/\//g, "-");


    const nomeArquivo =
        `Conferencia_Premmia_${dataArquivo}.xlsx`;


    // ======================================
    // DOWNLOAD
    // ======================================

    XLSX.writeFile(
        workbook,
        nomeArquivo
    );

}


// ==========================================
// CRIAR RESUMO
// ==========================================

function criarResumoExcel(
    resultados
) {

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


    resultados.forEach(
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


            const valor =
                resultado.valorPremmia !== null &&
                resultado.valorPremmia !== undefined
                    ? resultado.valorPremmia
                    : resultado.valorInterno;


            if (
                valor !== null &&
                valor !== undefined &&
                !isNaN(valor)
            ) {

                resumo[
                    resultado.status
                ].valor +=
                    Number(valor);

            }

        }
    );


    return [

        [
            "CONFERÊNCIA PREMMIA"
        ],

        [
            ""
        ],

        [
            "STATUS",
            "QUANTIDADE",
            "VALOR"
        ],

        [
            "CORRETAS",
            resumo.CORRETA.quantidade,
            valorExcel(
                resumo.CORRETA.valor
            )
        ],

        [
            "NÃO LANÇADAS",
            resumo.NAO_LANCADA.quantidade,
            valorExcel(
                resumo.NAO_LANCADA.valor
            )
        ],

        [
            "LANÇADAS A MAIS",
            resumo.LANCADA_A_MAIS.quantidade,
            valorExcel(
                resumo.LANCADA_A_MAIS.valor
            )
        ],

        [
            "VALOR DIVERGENTE",
            resumo.VALOR_DIVERGENTE.quantidade,
            valorExcel(
                resumo.VALOR_DIVERGENTE.valor
            )
        ],

        [
            "AUTORIZAÇÃO DIVERGENTE",
            resumo.AUTORIZACAO_DIVERGENTE.quantidade,
            valorExcel(
                resumo.AUTORIZACAO_DIVERGENTE.valor
            )
        ]

    ];

}


// ==========================================
// NOME DO STATUS
// ==========================================

function nomeStatus(
    status
) {

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


    return nomes[status] || status;

}


// ==========================================
// VALOR PARA EXCEL
// ==========================================

function valorExcel(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    const numero =
        Number(valor);


    if (isNaN(numero)) {

        return "";

    }


    return Number(
        numero.toFixed(2)
    );

}
```
