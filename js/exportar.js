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


    if (
        resultados.length === 0
    ) {

        alert(
            "Não existem resultados para exportar."
        );

        return;

    }



    // ======================================
    // MONTAR DADOS DA CONFERÊNCIA
    // ======================================

    const dados =
        resultados.map(
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


                    "FORMA PAGAMENTO":
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
    // CRIAR PLANILHA PRINCIPAL
    // ======================================

    const worksheet =
        XLSX.utils.json_to_sheet(
            dados
        );



    worksheet["!cols"] = [

        { wch: 25 },
        { wch: 12 },
        { wch: 10 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 35 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 50 }

    ];



    // ======================================
    // CRIAR ARQUIVO EXCEL
    // ======================================

    const workbook =
        XLSX.utils.book_new();



    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Conferência"
    );



    // ======================================
    // ABA RESUMO
    // ======================================

    const resumo =
        criarResumoExcel(
            resultados
        );


    const abaResumo =
        XLSX.utils.aoa_to_sheet(
            resumo
        );


    abaResumo["!cols"] = [

        {
            wch:30
        },

        {
            wch:15
        },

        {
            wch:18
        }

    ];



    XLSX.utils.book_append_sheet(
        workbook,
        abaResumo,
        "Resumo"
    );



    // ======================================
    // NOME DO ARQUIVO
    // ======================================

    const hoje =
        new Date();



    const dataArquivo =
        hoje
        .toLocaleDateString(
            "pt-BR"
        )
        .replace(/\//g,"-");



    const nomeArquivo =
        `Conferencia_Premmia_${dataArquivo}.xlsx`;



    // ======================================
    // GERAR DOWNLOAD
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


        CORRETA:{
            quantidade:0,
            valor:0
        },


        NAO_LANCADA:{
            quantidade:0,
            valor:0
        },


        LANCADA_A_MAIS:{
            quantidade:0,
            valor:0
        },


        VALOR_DIVERGENTE:{
            quantidade:0,
            valor:0
        },


        AUTORIZACAO_DIVERGENTE:{
            quantidade:0,
            valor:0
        }


    };



    resultados.forEach(
        resultado => {


            if(
                resumo[resultado.status]
            ){


                resumo[
                    resultado.status
                ]
                .quantidade++;



                let valor =
                    resultado.valorPremmia;



                if(
                    valor === null ||
                    valor === undefined
                ){

                    valor =
                        resultado.valorInterno;

                }



                if(
                    !isNaN(valor)
                ){

                    resumo[
                        resultado.status
                    ]
                    .valor += Number(valor);

                }


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
){

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
){


    if(
        valor === null ||
        valor === undefined ||
        valor === ""
    ){

        return "";

    }



    const numero =
        Number(valor);



    if(
        isNaN(numero)
    ){

        return "";

    }



    return Number(
        numero.toFixed(2)
    );


}
