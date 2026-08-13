// ==========================================
// CONFERÊNCIA PREMMIA
// exportar.js
//
// RESPONSABILIDADE:
//
// 1. Exportar os resultados da conferência
// 2. Gerar arquivo Excel (.xlsx)
// 3. Exportar todos os resultados
// 4. Respeitar os dados produzidos pelo
//    conferencia.js
//
// NÃO faz nova conferência.
// NÃO altera os resultados.
// ==========================================


// ==========================================
// BOTÃO EXPORTAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const btnExportar =
            document.getElementById(
                "btnExportar"
            );


        if (!btnExportar) {

            console.warn(
                "Botão btnExportar não encontrado."
            );

            return;

        }


        btnExportar.addEventListener(
            "click",
            exportarExcel
        );

    }
);


// ==========================================
// EXPORTAR EXCEL
// ==========================================

function exportarExcel() {

    // ======================================
    // VERIFICAR BIBLIOTECA XLSX
    // ======================================

    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "A biblioteca Excel não foi carregada."
        );

        return;

    }


    // ======================================
    // VERIFICAR RESULTADOS
    // ======================================

    const resultados =
        window.resultadosConferencia;


    if (
        !Array.isArray(resultados) ||
        resultados.length === 0
    ) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    // ======================================
    // CONFIRMAÇÃO
    // ======================================

    console.log(
        "================================="
    );

    console.log(
        "EXPORTAÇÃO EXCEL"
    );

    console.log(
        "Resultados:",
        resultados.length
    );

    console.log(
        "================================="
    );


    // ======================================
    // PREPARAR DADOS
    // ======================================

    const dadosExcel = [];


    // ======================================
    // CABEÇALHO
    // ======================================

    dadosExcel.push([

        "Status",

        "Data Premmia",

        "Hora Premmia",

        "Data Interno",

        "Hora Interno",

        "Diferença Horário",

        "Cliente",

        "Autorização Premmia",

        "Autorização Interno",

        "Valor Premmia",

        "Valor Interno",

        "Diferença",

        "Operador",

        "Pagamento",

        "Tipo",

        "Observação"

    ]);


    // ======================================
    // RESULTADOS
    // ======================================

    resultados.forEach(
        resultado => {

            dadosExcel.push([

                traduzirStatus(
                    resultado.status
                ),

                resultado.dataPremmia ||
                    "",

                resultado.horaPremmia ||
                    "",

                resultado.dataInterno ||
                    "",

                resultado.horaInterno ||
                    "",

                resultado.diferencaHorario !== null &&
                resultado.diferencaHorario !== undefined
                    ? Number(
                        resultado.diferencaHorario
                    )
                    : "",

                resultado.cliente ||
                    "",

                resultado.autorizacaoPremmia ||
                    "",

                resultado.autorizacaoInterno ||
                    "",

                resultado.valorPremmia !== null &&
                resultado.valorPremmia !== undefined
                    ? Number(
                        resultado.valorPremmia
                    )
                    : "",

                resultado.valorInterno !== null &&
                resultado.valorInterno !== undefined
                    ? Number(
                        resultado.valorInterno
                    )
                    : "",

                resultado.diferenca !== null &&
                resultado.diferenca !== undefined
                    ? Number(
                        resultado.diferenca
                    )
                    : "",

                resultado.operador ||
                    "",

                resultado.pagamento ||
                    "",

                resultado.tipo ||
                    "",

                resultado.observacao ||
                    ""

            ]);

        }
    );


    // ======================================
    // CRIAR PLANILHA
    // ======================================

    const planilha =
        XLSX.utils.aoa_to_sheet(
            dadosExcel
        );


    // ======================================
    // LARGURA DAS COLUNAS
    // ======================================

    planilha["!cols"] = [

        {
            wch: 25
        },

        {
            wch: 14
        },

        {
            wch: 12
        },

        {
            wch: 14
        },

        {
            wch: 12
        },

        {
            wch: 18
        },

        {
            wch: 30
        },

        {
            wch: 40
        },

        {
            wch: 40
        },

        {
            wch: 16
        },

        {
            wch: 16
        },

        {
            wch: 16
        },

        {
            wch: 25
        },

        {
            wch: 20
        },

        {
            wch: 25
        },

        {
            wch: 60
        }

    ];


    // ======================================
    // FORMATAR VALORES COMO MOEDA
    // ======================================

    aplicarFormatoMoeda(
        planilha,
        dadosExcel
    );


    // ======================================
    // CRIAR WORKBOOK
    // ======================================

    const workbook =
        XLSX.utils.book_new();


    // ======================================
    // ADICIONAR PLANILHA
    // ======================================

    XLSX.utils.book_append_sheet(
        workbook,
        planilha,
        "Conferência"
    );


    // ======================================
    // CRIAR NOME DO ARQUIVO
    // ======================================

    const agora =
        new Date();


    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const ano =
        agora.getFullYear();


    const hora =
        String(
            agora.getHours()
        ).padStart(
            2,
            "0"
        );


    const minuto =
        String(
            agora.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const nomeArquivo =
        `Conferencia_Premmia_${dia}-${mes}-${ano}_${hora}-${minuto}.xlsx`;


    // ======================================
    // DOWNLOAD
    // ======================================

    XLSX.writeFile(
        workbook,
        nomeArquivo
    );


    // ======================================
    // MENSAGEM
    // ======================================

    console.log(
        "Arquivo exportado:",
        nomeArquivo
    );

}


// ==========================================
// TRADUZIR STATUS
// ==========================================

function traduzirStatus(
    status
) {

    const nomes = {

        CORRETA:
            "CONFERIDA",

        CORRESPONDENCIA_DATA_HORA:
            "DATA/HORA",

        NAO_LANCADA:
            "NÃO LANÇADA",

        LANCADA_A_MAIS:
            "LANÇADA A MAIS",

        VALOR_DIVERGENTE:
            "VALOR DIVERGENTE"

    };


    return (
        nomes[status] ||
        status ||
        ""
    );

}


// ==========================================
// FORMATO DE MOEDA
// ==========================================

function aplicarFormatoMoeda(
    planilha,
    dados
) {

    // ======================================
    // COLUNAS
    //
    // J = Valor Premmia
    // K = Valor Interno
    // L = Diferença
    // ======================================

    const colunasMoeda = [
        9,
        10,
        11
    ];


    // ======================================
    // PERCORRER LINHAS
    // ======================================

    for (
        let linha = 1;
        linha < dados.length;
        linha++
    ) {

        colunasMoeda.forEach(
            coluna => {

                const celula =
                    XLSX.utils.encode_cell({

                        r:
                            linha,

                        c:
                            coluna

                    });


                if (
                    planilha[celula]
                ) {

                    planilha[celula].z =
                        'R$ #,##0.00';

                }

            }
        );

    }

}


// ==========================================
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.exportarExcel =
    exportarExcel;


console.log(
    "================================="
);

console.log(
    "exportar.js iniciado"
);

console.log(
    "Botão de exportação preparado"
);

console.log(
    "================================="
);
