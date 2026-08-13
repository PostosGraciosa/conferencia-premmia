// ============================================================
// EXPORTAÇÃO DA CONFERÊNCIA
// ============================================================

console.log("================================");
console.log("exportar.js iniciado");
console.log("================================");


function exportarConferenciaExcel() {

    const resultados =
        window.resultadosConferencia || [];


    if (!resultados.length) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }


    const dados =
        resultados.map(
            resultado => {

                const portal =
                    resultado.portal || {};

                const interno =
                    resultado.interno || {};


                return {

                    "STATUS":
                        resultado.status,

                    "PORTAL - DATA":
                        window.formatarData
                            ? window.formatarData(
                                portal.data
                            )
                            : portal.data || "",

                    "PORTAL - HORÁRIO":
                        portal.hora || "",

                    "PORTAL - VALOR":
                        portal.valor || 0,

                    "PORTAL - FORMA PAGAMENTO":
                        portal.formaPagamento || "",

                    "PORTAL - CÓDIGO TRANSAÇÃO":
                        portal.codigoTransacao || "",

                    "PORTAL - LINHA":
                        resultado.linhaPortal || "",

                    "SISTEMA - DATA":
                        window.formatarData
                            ? window.formatarData(
                                interno.data
                            )
                            : interno.data || "",

                    "SISTEMA - HORÁRIO":
                        interno.hora || "",

                    "SISTEMA - VALOR":
                        interno.valor || 0,

                    "SISTEMA - TIPO CARTÃO":
                        interno.tipoCartao || "",

                    "SISTEMA - TRANSAÇÃO":
                        interno.codigoTransacao || "",

                    "SISTEMA - AUTORIZAÇÃO":
                        interno.autorizacao || "",

                    "SISTEMA - NSU":
                        interno.nsu || "",

                    "SISTEMA - LINHA":
                        resultado.linhaInterno || "",

                    "DIFERENÇA VALOR":
                        resultado.diferencaValor || 0,

                    "DIFERENÇA HORÁRIO":
                        resultado.diferencaHorario !== null &&
                        resultado.diferencaHorario !== undefined
                            ? `${Math.floor(
                                resultado.diferencaHorario / 60
                            )} min`
                            : ""

                };

            }
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            dados
        );


    worksheet["!cols"] = [

        { wch: 28 },
        { wch: 14 },
        { wch: 12 },
        { wch: 15 },
        { wch: 25 },
        { wch: 25 },
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 15 },
        { wch: 22 },
        { wch: 22 },
        { wch: 25 },
        { wch: 18 },
        { wch: 12 },
        { wch: 18 },
        { wch: 20 }

    ];


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Conciliação"
    );


    // ========================================================
    // RESUMO
    // ========================================================

    const resumo =
        window.resumoConferencia || {};


    const dadosResumo = [

        ["RESUMO DA CONCILIAÇÃO", ""],

        [
            "Conferidas",
            resumo.conferidas || 0
        ],

        [
            "Não lançadas",
            resumo.naoLancadas || 0
        ],

        [
            "Lançadas a mais",
            resumo.lancadasAMais || 0
        ],

        [
            "Valor divergente",
            resumo.valorDivergente || 0
        ],

        [
            "Data divergente",
            resumo.dataDivergente || 0
        ],

        [
            "Tipo de pagamento divergente",
            resumo.cartaoDivergente || 0
        ],

        [
            "Total Portal",
            resumo.valorPortal || 0
        ],

        [
            "Total Sistema",
            resumo.valorSistema || 0
        ],

        [
            "Diferença total",
            resumo.diferencaValor || 0
        ]

    ];


    const worksheetResumo =
        XLSX.utils.aoa_to_sheet(
            dadosResumo
        );


    worksheetResumo["!cols"] = [

        { wch: 35 },
        { wch: 20 }

    ];


    XLSX.utils.book_append_sheet(
        workbook,
        worksheetResumo,
        "Resumo"
    );


    XLSX.writeFile(
        workbook,
        "conciliacao_premmia.xlsx"
    );

}


window.exportarConferenciaExcel =
    exportarConferenciaExcel;


console.log("================================");
console.log("exportar.js carregado");
console.log("================================");
