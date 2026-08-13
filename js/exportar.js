// ==========================================
// CONFERÊNCIA PREMMIA
// exportar.js
//
// RESPONSABILIDADE:
//
// 1. Exportar os resultados da conferência
// 2. Exportar para Excel (.xlsx)
// 3. Exportar para CSV
// 4. Respeitar os filtros atuais
// 5. Mostrar informações completas
//
// REGRA:
//
// A conferência é feita por:
//
// VALOR
// +
// DATA
// +
// HORÁRIO
//
// A autorização é apenas informativa.
// O operador é apenas informativo.
// ==========================================


// ==========================================
// VERIFICAR XLSX
// ==========================================

function verificarBibliotecaXLSX() {

    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "A biblioteca XLSX não foi carregada.\n\n" +
            "Verifique se o SheetJS está incluído no index.html."
        );

        return false;

    }

    return true;

}


// ==========================================
// OBTER RESULTADOS
// ==========================================

function obterResultadosParaExportacao() {

    if (
        !Array.isArray(
            window.resultadosConferencia
        )
    ) {

        return [];

    }

    return window.resultadosConferencia;

}


// ==========================================
// TRANSFORMAR RESULTADOS
// ==========================================

function prepararDadosExportacao(
    resultados
) {

    return resultados.map(
        resultado => {

            return {

                "Status":
                    nomeStatusExportacao(
                        resultado.status
                    ),

                "Data Premmia":
                    resultado.dataPremmia || "",

                "Hora Premmia":
                    resultado.horaPremmia || "",

                "Data Interno":
                    resultado.dataInterno || "",

                "Hora Interno":
                    resultado.horaInterno || "",

                "Diferença Horário":
                    resultado.diferencaHorario !== null &&
                    resultado.diferencaHorario !== undefined
                        ? formatarHorarioExportacao(
                            resultado.diferencaHorario
                        )
                        : "",

                "Cliente":
                    resultado.cliente || "",

                "Valor Premmia":
                    resultado.valorPremmia !== null &&
                    resultado.valorPremmia !== undefined
                        ? Number(
                            resultado.valorPremmia
                        )
                        : "",

                "Valor Interno":
                    resultado.valorInterno !== null &&
                    resultado.valorInterno !== undefined
                        ? Number(
                            resultado.valorInterno
                        )
                        : "",

                "Diferença":
                    resultado.diferenca !== null &&
                    resultado.diferenca !== undefined
                        ? Number(
                            resultado.diferenca
                        )
                        : "",

                "Autorização Premmia":
                    resultado.autorizacaoPremmia || "",

                "Autorização Interno":
                    resultado.autorizacaoInterno || "",

                "Operador":
                    resultado.operador || "",

                "Forma de Pagamento":
                    resultado.pagamento || "",

                "Tipo":
                    resultado.tipo || "",

                "Observação":
                    resultado.observacao || ""

            };

        }
    );

}


// ==========================================
// NOME DO STATUS
// ==========================================

function nomeStatusExportacao(
    status
) {

    const nomes = {

        CORRETA:
            "CONFERIDA",

        CORRESPONDENCIA_DATA_HORA:
            "CORRESPONDÊNCIA DATA/HORA",

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
// FORMATAR HORÁRIO PARA EXCEL
// ==========================================

function formatarHorarioExportacao(
    minutos
) {

    if (
        minutos === null ||
        minutos === undefined
    ) {

        return "";

    }

    const valor =
        Number(
            minutos
        );


    if (
        isNaN(valor)
    ) {

        return "";

    }


    if (
        Math.abs(valor) < 0.01
    ) {

        return "0 min";

    }


    if (
        valor < 1
    ) {

        return (
            Math.round(
                valor * 60
            )
            +
            " seg"
        );

    }


    return (
        valor.toFixed(1)
        +
        " min"
    );

}


// ==========================================
// GERAR NOME DO ARQUIVO
// ==========================================

function gerarNomeArquivo(
    extensao
) {

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


    return (
        "Conferencia_Premmia_"
        +
        dia
        +
        "-"
        +
        mes
        +
        "-"
        +
        ano
        +
        "_"
        +
        hora
        +
        "-"
        +
        minuto
        +
        "."
        +
        extensao
    );

}


// ==========================================
// EXPORTAR EXCEL
// ==========================================

function exportarExcel() {

    // ======================================
    // VERIFICAR BIBLIOTECA
    // ======================================

    if (
        !verificarBibliotecaXLSX()
    ) {

        return;

    }


    // ======================================
    // OBTER RESULTADOS
    // ======================================

    const resultados =
        obterResultadosParaExportacao();


    if (
        resultados.length === 0
    ) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    // ======================================
    // PREPARAR DADOS
    // ======================================

    const dados =
        prepararDadosExportacao(
            resultados
        );


    // ======================================
    // CRIAR PLANILHA
    // ======================================

    const planilha =
        XLSX.utils.json_to_sheet(
            dados
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
            wch: 16
        },

        {
            wch: 16
        },

        {
            wch: 14
        },

        {
            wch: 38
        },

        {
            wch: 38
        },

        {
            wch: 22
        },

        {
            wch: 22
        },

        {
            wch: 25
        },

        {
            wch: 70
        }

    ];


    // ======================================
    // CRIAR ARQUIVO
    // ======================================

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        planilha,
        "Conferência"
    );


    // ======================================
    // EXPORTAR
    // ======================================

    XLSX.writeFile(
        workbook,
        gerarNomeArquivo(
            "xlsx"
        )
    );

}


// ==========================================
// EXPORTAR CSV
// ==========================================

function exportarCSV() {

    // ======================================
    // VERIFICAR BIBLIOTECA
    // ======================================

    if (
        !verificarBibliotecaXLSX()
    ) {

        return;

    }


    // ======================================
    // OBTER RESULTADOS
    // ======================================

    const resultados =
        obterResultadosParaExportacao();


    if (
        resultados.length === 0
    ) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    // ======================================
    // PREPARAR DADOS
    // ======================================

    const dados =
        prepararDadosExportacao(
            resultados
        );


    // ======================================
    // CRIAR PLANILHA
    // ======================================

    const planilha =
        XLSX.utils.json_to_sheet(
            dados
        );


    // ======================================
    // GERAR CSV
    // ======================================

    const csv =
        XLSX.utils.sheet_to_csv(
            planilha,
            {
                FS: ";"
            }
        );


    // ======================================
    // BOM UTF-8
    //
    // Importante para abrir corretamente
    // caracteres como:
    //
    // NÃO
    // LANÇADA
    // DIFERENÇA
    // AUTORIZAÇÃO
    // ======================================

    const blob =
        new Blob(
            [
                "\uFEFF",
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    // ======================================
    // DOWNLOAD
    // ======================================

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        gerarNomeArquivo(
            "csv"
        );


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// ==========================================
// EXPORTAR RESULTADOS FILTRADOS
// ==========================================
//
// Caso a tela esteja mostrando somente
// determinado status, esta função pode
// receber os resultados filtrados.
//
// Exemplo:
//
// exportarResultados(
//     resultadosFiltrados
// );
//
// ==========================================

function exportarResultados(
    resultados
) {

    if (
        !verificarBibliotecaXLSX()
    ) {

        return;

    }


    if (
        !Array.isArray(
            resultados
        ) ||
        resultados.length === 0
    ) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    const dados =
        prepararDadosExportacao(
            resultados
        );


    const planilha =
        XLSX.utils.json_to_sheet(
            dados
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        planilha,
        "Conferência"
    );


    XLSX.writeFile(
        workbook,
        gerarNomeArquivo(
            "xlsx"
        )
    );

}


// ==========================================
// EXPORTAR APENAS UM STATUS
// ==========================================

function exportarStatus(
    status
) {

    const resultados =
        obterResultadosParaExportacao();


    const filtrados =
        resultados.filter(
            resultado =>
                resultado.status ===
                status
        );


    exportarResultados(
        filtrados
    );

}


// ==========================================
// EXPORTAR RELATÓRIO COMPLETO
// ==========================================
//
// Esta versão gera uma planilha com:
//
// 1. Resumo
// 2. Resultados
//
// ==========================================

function exportarRelatorioCompleto() {

    if (
        !verificarBibliotecaXLSX()
    ) {

        return;

    }


    const resultados =
        obterResultadosParaExportacao();


    if (
        resultados.length === 0
    ) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    // ======================================
    // RESUMO
    // ======================================

    const resumo = [

        {
            "Indicador":
                "Total Portal Premmia",

            "Quantidade":
                window.dadosPremmia
                    ? window.dadosPremmia.length
                    : 0,

            "Valor":
                calcularTotalExportacao(
                    window.dadosPremmia
                )

        },

        {
            "Indicador":
                "Total Sistema Interno",

            "Quantidade":
                window.dadosInterno
                    ? window.dadosInterno.length
                    : 0,

            "Valor":
                calcularTotalExportacao(
                    window.dadosInterno
                )

        },

        {
            "Indicador":
                "Diferença dos Totais",

            "Quantidade":
                "",

            "Valor":
                calcularTotalExportacao(
                    window.dadosInterno
                )
                -
                calcularTotalExportacao(
                    window.dadosPremmia
                )

        },

        {
            "Indicador":
                "Conferidas",

            "Quantidade":
                contarStatus(
                    "CORRETA"
                ),

            "Valor":
                calcularValorStatus(
                    "CORRETA"
                )

        },

        {
            "Indicador":
                "Correspondência Data/Hora",

            "Quantidade":
                contarStatus(
                    "CORRESPONDENCIA_DATA_HORA"
                ),

            "Valor":
                calcularValorStatus(
                    "CORRESPONDENCIA_DATA_HORA"
                )

        },

        {
            "Indicador":
                "Não Lançadas",

            "Quantidade":
                contarStatus(
                    "NAO_LANCADA"
                ),

            "Valor":
                calcularValorStatus(
                    "NAO_LANCADA"
                )

        },

        {
            "Indicador":
                "Lançadas a Mais",

            "Quantidade":
                contarStatus(
                    "LANCADA_A_MAIS"
                ),

            "Valor":
                calcularValorStatus(
                    "LANCADA_A_MAIS"
                )

        },

        {
            "Indicador":
                "Valor Divergente",

            "Quantidade":
                contarStatus(
                    "VALOR_DIVERGENTE"
                ),

            "Valor":
                calcularValorStatus(
                    "VALOR_DIVERGENTE"
                )

        }

    ];


    // ======================================
    // PLANILHAS
    // ======================================

    const planilhaResumo =
        XLSX.utils.json_to_sheet(
            resumo
        );


    const planilhaResultados =
        XLSX.utils.json_to_sheet(
            prepararDadosExportacao(
                resultados
            )
        );


    // ======================================
    // LARGURA RESUMO
    // ======================================

    planilhaResumo["!cols"] = [

        {
            wch: 32
        },

        {
            wch: 15
        },

        {
            wch: 18
        }

    ];


    // ======================================
    // LARGURA RESULTADOS
    // ======================================

    planilhaResultados["!cols"] = [

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
            wch: 16
        },

        {
            wch: 16
        },

        {
            wch: 14
        },

        {
            wch: 38
        },

        {
            wch: 38
        },

        {
            wch: 22
        },

        {
            wch: 22
        },

        {
            wch: 25
        },

        {
            wch: 70
        }

    ];


    // ======================================
    // CRIAR WORKBOOK
    // ======================================

    const workbook =
        XLSX.utils.book_new();


    // ======================================
    // ADICIONAR RESUMO
    // ======================================

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaResumo,
        "Resumo"
    );


    // ======================================
    // ADICIONAR RESULTADOS
    // ======================================

    XLSX.utils.book_append_sheet(
        workbook,
        planilhaResultados,
        "Resultados"
    );


    // ======================================
    // EXPORTAR
    // ======================================

    XLSX.writeFile(
        workbook,
        gerarNomeArquivo(
            "xlsx"
        )
    );

}


// ==========================================
// CONTAR STATUS
// ==========================================

function contarStatus(
    status
) {

    const resultados =
        obterResultadosParaExportacao();


    return resultados.filter(
        resultado =>
            resultado.status ===
            status
    ).length;

}


// ==========================================
// CALCULAR VALOR POR STATUS
// ==========================================

function calcularValorStatus(
    status
) {

    const resultados =
        obterResultadosParaExportacao();


    let total =
        0;


    resultados.forEach(
        resultado => {

            if (
                resultado.status !==
                status
            ) {

                return;

            }


            let valor =
                resultado.valorPremmia;


            if (
                valor === null ||
                valor === undefined
            ) {

                valor =
                    resultado.valorInterno;

            }


            total +=
                Number(
                    valor || 0
                );

        }
    );


    return Number(
        total.toFixed(2)
    );

}


// ==========================================
// CALCULAR TOTAL DE UMA PLANILHA
// ==========================================

function calcularTotalExportacao(
    registros
) {

    if (
        !Array.isArray(
            registros
        )
    ) {

        return 0;

    }


    let total =
        0;


    registros.forEach(
        registro => {

            total +=
                Number(
                    registro?.valor || 0
                );

        }
    );


    return Number(
        total.toFixed(2)
    );

}


// ==========================================
// BOTÕES DA TELA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ==================================
        // BOTÃO EXCEL
        // ==================================

        const btnExcel =
            document.getElementById(
                "btnExportarExcel"
            );


        if (
            btnExcel
        ) {

            btnExcel.addEventListener(
                "click",
                exportarExcel
            );

        }


        // ==================================
        // BOTÃO CSV
        // ==================================

        const btnCSV =
            document.getElementById(
                "btnExportarCSV"
            );


        if (
            btnCSV
        ) {

            btnCSV.addEventListener(
                "click",
                exportarCSV
            );

        }


        // ==================================
        // BOTÃO RELATÓRIO COMPLETO
        // ==================================

        const btnRelatorio =
            document.getElementById(
                "btnExportarRelatorio"
            );


        if (
            btnRelatorio
        ) {

            btnRelatorio.addEventListener(
                "click",
                exportarRelatorioCompleto
            );

        }

    }
);


// ==========================================
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.exportarExcel =
    exportarExcel;


window.exportarCSV =
    exportarCSV;


window.exportarResultados =
    exportarResultados;


window.exportarStatus =
    exportarStatus;


window.exportarRelatorioCompleto =
    exportarRelatorioCompleto;


window.prepararDadosExportacao =
    prepararDadosExportacao;


console.log(
    "================================="
);

console.log(
    "exportar.js iniciado"
);

console.log(
    "Exportação Excel / CSV disponível"
);

console.log(
    "================================="
);
