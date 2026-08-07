// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


// ==========================================
// VARIÁVEL PRINCIPAL
// ==========================================

let resultadosConferencia = [];


// Mantém sempre atualizado para exportar
Object.defineProperty(
    window,
    "resultadosConferencia",
    {
        get:function(){
            return resultadosConferencia;
        }
    }
);


// ==========================================
// BOTÃO CONFERIR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const btn =
            document.getElementById(
                "btnConferir"
            );


        if(btn){

            btn.addEventListener(
                "click",
                iniciarConferencia
            );

        }

    }
);



// ==========================================
// INICIAR CONFERÊNCIA
// ==========================================

function iniciarConferencia(){


    const premmia =
        window.dadosPremmia || [];


    const interno =
        window.dadosInterno || [];



    if(
        premmia.length === 0 ||
        interno.length === 0
    ){

        alert(
            "Carregue as duas planilhas antes de conferir."
        );

        return;

    }



    resultadosConferencia = [];



    const indiceInterno =
        criarIndice(
            interno
        );



    const utilizados =
        new Set();



    // ======================================
    // ANALISA PREMMIA
    // ======================================


    premmia.forEach(
        item => {


            const chave =
                normalizar(
                    item.autorizacao
                );



            if(!chave){

                resultadosConferencia.push(

                    criarResultado(
                        "AUTORIZACAO_DIVERGENTE",
                        item,
                        null,
                        "Premmia sem autorização."
                    )

                );

                return;

            }



            const encontrados =
                indiceInterno[chave] || [];



            if(
                encontrados.length === 0
            ){

                resultadosConferencia.push(

                    criarResultado(
                        "NAO_LANCADA",
                        item,
                        null,
                        "Venda não encontrada no sistema interno."
                    )

                );


                return;

            }



            let internoEncontrado =
                null;



            for(
                let registro of encontrados
            ){

                if(
                    !utilizados.has(
                        registro._id
                    )
                ){

                    internoEncontrado =
                        registro;

                    break;

                }

            }



            if(!internoEncontrado){


                resultadosConferencia.push(

                    criarResultado(
                        "LANCADA_A_MAIS",
                        null,
                        encontrados[0],
                        "Existe lançamento duplicado no sistema interno."
                    )

                );


                return;

            }



            utilizados.add(
                internoEncontrado._id
            );



            const valorPremmia =
                Number(item.valor || 0);



            const valorInterno =
                Number(internoEncontrado.valor || 0);



            const diferenca =
                Number(
                    (
                        valorPremmia -
                        valorInterno
                    ).toFixed(2)
                );



            if(
                Math.abs(diferenca) < 0.01
            ){


                resultadosConferencia.push(

                    criarResultado(
                        "CORRETA",
                        item,
                        internoEncontrado,
                        "Venda conferida corretamente."
                    )

                );


            }else{


                resultadosConferencia.push(

                    criarResultado(
                        "VALOR_DIVERGENTE",
                        item,
                        internoEncontrado,
                        "Autorização encontrada, porém valor diferente.",
                        diferenca
                    )

                );


            }


        }

    );




    // ======================================
    // PROCURA LANÇAMENTOS A MAIS
    // ======================================


    interno.forEach(

        item=>{


            if(
                utilizados.has(item._id)
            ){

                return;

            }



            resultadosConferencia.push(

                criarResultado(
                    "LANCADA_A_MAIS",
                    null,
                    item,
                    "Existe lançamento no sistema interno sem venda Premmia."
                )

            );


        }

    );



    mostrarResultados();


}




// ==========================================
// CRIA ÍNDICE
// ==========================================

function criarIndice(lista){


    const indice = {};



    lista.forEach(

        (item,index)=>{


            item._id =
                index;



            const chave =
                normalizar(
                    item.autorizacao
                );



            if(!chave){

                return;

            }



            if(
                !indice[chave]
            ){

                indice[chave]=[];

            }



            indice[chave].push(
                item
            );


        }

    );


    return indice;

}




// ==========================================
// NORMALIZA AUTORIZAÇÃO
// ==========================================

function normalizar(valor){


    return String(
        valor || ""
    )
    .trim()
    .toUpperCase()
    .replace(/\s/g,"");


}





// ==========================================
// CRIA RESULTADO
// ==========================================

function criarResultado(
    status,
    premmia,
    interno,
    observacao,
    diferenca=0
){


    return {


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



        autorizacaoPremmia:
            premmia?.autorizacao ||
            "",



        autorizacaoInterno:
            interno?.autorizacao ||
            "",



        valorPremmia:
            premmia?.valor ?? null,



        valorInterno:
            interno?.valor ?? null,



        diferenca,



        operador:
            interno?.operador ||
            "",



        tipo:
            premmia?.operacao ||
            interno?.tipo ||
            "",



        pagamento:
            premmia?.pagamento ||
            "",



        observacao


    };


}





// ==========================================
// MOSTRAR RESULTADOS
// ==========================================

function mostrarResultados(){


    const resultado =
        document.getElementById(
            "resultado"
        );


    const tabela =
        document.getElementById(
            "tabelaResultado"
        );



    if(resultado)
        resultado.style.display="block";


    if(tabela)
        tabela.style.display="block";



    atualizarResumo();


    if(
        typeof renderizarTabela === "function"
    ){

        renderizarTabela(
            resultadosConferencia
        );

    }


}






// ==========================================
// RESUMO
// ==========================================

function atualizarResumo(){


    const total={

        CORRETA:0,
        NAO_LANCADA:0,
        LANCADA_A_MAIS:0,
        VALOR_DIVERGENTE:0,
        AUTORIZACAO_DIVERGENTE:0

    };



    resultadosConferencia.forEach(

        r=>{

            if(total[r.status]!==undefined){

                total[r.status]++;

            }

        }

    );



    document.getElementById("totalCorretas").innerHTML =
        total.CORRETA;


    document.getElementById("totalNaoLancadas").innerHTML =
        total.NAO_LANCADA;


    document.getElementById("totalLancadasMais").innerHTML =
        total.LANCADA_A_MAIS;


    document.getElementById("totalValorErrado").innerHTML =
        total.VALOR_DIVERGENTE;


    document.getElementById("totalAutorizacao").innerHTML =
        total.AUTORIZACAO_DIVERGENTE;



}
