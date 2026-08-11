// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


let resultadosConferencia = [];


// mantém atualizado para exportar

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
    ()=>{


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



    console.log(
        "Conferindo:",
        premmia.length,
        interno.length
    );
    
console.log(
    "PRIMEIRA PREMMIA:",
    premmia[0]
);


console.log(
    "PRIMEIRO INTERNO:",
    interno[0]
);


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
        venda=>{


            const chave =
                normalizar(
                    venda.autorizacao
                );



            if(!chave){

                resultadosConferencia.push(

                    criarResultado(

                        "AUTORIZACAO_DIVERGENTE",

                        venda,

                        null,

                        "Venda sem código de transação."

                    )

                );


                return;

            }




            const encontrados =
                indiceInterno[chave] || [];





            // NÃO ENCONTROU NO INTERNO

            if(
                encontrados.length === 0
            ){

                resultadosConferencia.push(

                    criarResultado(

                        "NAO_LANCADA",

                        venda,

                        null,

                        "Venda Premmia não localizada no sistema interno."

                    )

                );


                return;

            }





            let internoEncontrado =
                null;




            encontrados.forEach(
                item=>{


                    if(
                        internoEncontrado === null &&
                        !utilizados.has(item._id)
                    ){

                        internoEncontrado =
                            item;

                    }


                }
            );





            if(!internoEncontrado){

                return;

            }



            utilizados.add(
                internoEncontrado._id
            );




            const valorPremmia =
                Number(
                    venda.valor || 0
                );



            const valorInterno =
                Number(
                    internoEncontrado.valor || 0
                );



            const diferenca =
                Number(
                    (
                        valorPremmia -
                        valorInterno
                    )
                    .toFixed(2)
                );



            if(
                Math.abs(diferenca) < 0.01
            ){


                resultadosConferencia.push(

                    criarResultado(

                        "CORRETA",

                        venda,

                        internoEncontrado,

                        "Venda conferida corretamente."

                    )

                );


            }else{


                resultadosConferencia.push(

                    criarResultado(

                        "VALOR_DIVERGENTE",

                        venda,

                        internoEncontrado,

                        "Autorização encontrada, porém valor diferente.",

                        diferenca

                    )

                );


            }



        }

    );

// ======================================
// VERIFICA LANÇAMENTOS INTERNOS
// QUE NÃO EXISTEM NO PREMMIA
// ======================================


interno.forEach(
    item=>{


        if(
            utilizados.has(item._id)
        ){

            return;

        }



        const chave =
            normalizar(
                item.autorizacao
            );



        if(!chave){

            return;

        }




        const existePremmia =
            premmia.some(
                venda=>

                    normalizar(
                        venda.autorizacao
                    ) === chave

            );




        // Se existe no Premmia,
        // já foi conferido.
        // Não considerar erro.

        if(existePremmia){

            return;

        }




        resultadosConferencia.push(

            criarResultado(

                "LANCADA_A_MAIS",

                null,

                item,

                "Lançamento encontrado somente no sistema interno."

            )

        );



    }

);





// ======================================
// MOSTRA RESULTADO
// ======================================


mostrarResultados();





}





// ==========================================
// CRIA ÍNDICE POR AUTORIZAÇÃO
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
// NORMALIZAR AUTORIZAÇÃO
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
// CRIAR RESULTADO
// ==========================================


function criarResultado(
    status,
    premmia,
    interno,
    observacao,
    diferenca = 0
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

            premmia?.valor ??
            null,




        valorInterno:

            interno?.valor ??
            null,




        diferenca,




        operador:

            interno?.operador ||
            "",




        filial:

            interno?.filial ||
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



    if(resultado){

        resultado.style.display =
            "block";

    }



    if(tabela){

        tabela.style.display =
            "block";

    }



    atualizarResumo();



    if(
        typeof renderizarTabela === "function"
    ){

        renderizarTabela(
            resultadosConferencia
        );

    }



    if(resultado){

        resultado.scrollIntoView({
            behavior:"smooth"
        });

    }


}






// ==========================================
// ATUALIZAR RESUMO
// ==========================================


function atualizarResumo(){


    const total = {


        CORRETA:0,

        NAO_LANCADA:0,

        LANCADA_A_MAIS:0,

        VALOR_DIVERGENTE:0,

        AUTORIZACAO_DIVERGENTE:0


    };




    resultadosConferencia.forEach(
        resultado=>{


            if(
                total[resultado.status]
                !== undefined
            ){

                total[resultado.status]++;

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



}






function alterarTexto(
    id,
    valor
){


    const elemento =
        document.getElementById(
            id
        );



    if(elemento){

        elemento.textContent =
            valor;

    }


}







// ==========================================
// RENDERIZAR TABELA
// ==========================================


function renderizarTabela(
    lista
){


    const corpo =
        document.getElementById(
            "corpoTabela"
        );



    if(!corpo){

        return;

    }



    corpo.innerHTML = "";





    lista.forEach(
        item=>{


            const linha =
                document.createElement(
                    "tr"
                );



            linha.innerHTML = `



<td>

${nomeStatus(item.status)}

</td>


<td>

${item.data || ""}

</td>


<td>

${item.hora || ""}

</td>



<td>

${item.autorizacaoPremmia || "-"}

</td>



<td>

${item.autorizacaoInterno || "-"}

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
    item.diferenca
)}

</td>





<td>

${item.operador || item.filial || "-"}

</td>



            `;



            corpo.appendChild(
                linha
            );


        }

    );


}






// ==========================================
// NOME STATUS
// ==========================================


function nomeStatus(status){


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
// FORMATAR MOEDA
// ==========================================


function formatarMoeda(valor){


    if(
        valor === null ||
        valor === undefined ||
        valor === ""
    ){

        return "R$ 0,00";

    }



    return Number(valor)
    .toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );


}







// ==========================================
// FILTROS
// ==========================================


document
.querySelectorAll(".filtro")
.forEach(
    botao=>{


        botao.addEventListener(
            "click",
            ()=>{


                const filtro =
                    botao.dataset.filtro;



                if(
                    filtro === "TODOS"
                ){

                    renderizarTabela(
                        resultadosConferencia
                    );

                    return;

                }



                renderizarTabela(

                    resultadosConferencia.filter(

                        item=>

                        item.status === filtro

                    )

                );



            }

        );


    }

);





console.log(
    "conferencia.js carregado"
);
