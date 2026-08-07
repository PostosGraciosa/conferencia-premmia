// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


let resultadosConferencia = [];



// disponibiliza para exportação

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
// INICIALIZA BOTÃO
// ==========================================


function ativarBotaoConferir(){


    const btn =
        document.getElementById(
            "btnConferir"
        );


    if(!btn){

        console.log(
            "Botão Conferir não encontrado"
        );

        return;

    }



    btn.onclick = function(){


        console.log(
            "Botão Conferir clicado"
        );


        iniciarConferencia();


    };


    console.log(
        "Botão Conferir ativado"
    );


}




if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        ativarBotaoConferir
    );


}else{


    ativarBotaoConferir();


}




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



    const utilizados =
        new Set();






    // ======================================
    // ANALISA PREMMIA
    // ======================================


    premmia.forEach(
        venda=>{


            let encontrado = null;



            const tipoVenda =
                String(
                    venda.operacao || ""
                )
                .toUpperCase();





            const ehValeOuDesconto =
                tipoVenda.includes("VALE")
                ||
                tipoVenda.includes("DESCONTO");






            // ==================================
            // PRIMEIRA TENTATIVA
            // POR AUTORIZAÇÃO
            // ==================================


            if(
                !ehValeOuDesconto
            ){


                encontrado =
                    interno.find(
                        item=>{


                            return (

                                !utilizados.has(item)

                                &&

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


            }






            // ==================================
            // VALE / DESCONTO
            // USA VALOR
            // ==================================


            if(
                !encontrado &&
                ehValeOuDesconto
            ){


                encontrado =
                    interno.find(
                        item=>{


                            return (

                                !utilizados.has(item)

                                &&

                                mesmoValor(
                                    venda.valor,
                                    item.valor
                                )

                            );


                        }
                    );


            }







            // ==================================
            // NÃO ENCONTROU
            // ==================================


            if(!encontrado){


                resultadosConferencia.push(

                    criarResultado(

                        "NAO_LANCADA",

                        venda,

                        null,

                        "Venda não localizada no interno."

                    )

                );


                return;


            }







            utilizados.add(
                encontrado
            );






            // ==================================
            // CONFERE VALOR
            // ==================================


            if(
                mesmoValor(
                    venda.valor,
                    encontrado.valor
                )
            ){



                resultadosConferencia.push(

                    criarResultado(

                        "CORRETA",

                        venda,

                        encontrado,

                        "Venda conferida corretamente."

                    )

                );



            }else{



                resultadosConferencia.push(

                    criarResultado(

                        "VALOR_DIVERGENTE",

                        venda,

                        encontrado,

                        "Autorização encontrada, porém valor diferente."

                    )

                );



            }




        }

    );





    // continua na PARTE 2
// ==========================================
// VERIFICA LANÇAMENTOS INTERNOS SOBRANDO
// ==========================================


    interno.forEach(
        item=>{


            if(
                utilizados.has(item)
            ){

                return;

            }



            resultadosConferencia.push(

                criarResultado(

                    "LANCADA_A_MAIS",

                    null,

                    item,

                    "Lançamento interno sem correspondente no Premmia."

                )

            );


        }

    );





    mostrarResultados();



}






// ==========================================
// COMPARAÇÃO DE VALOR
// ==========================================


function mesmoValor(
    a,
    b
){


    const valorA =
        Number(
            a || 0
        )
        .toFixed(2);



    const valorB =
        Number(
            b || 0
        )
        .toFixed(2);



    return valorA === valorB;


}






// ==========================================
// NORMALIZA AUTORIZAÇÃO
// ==========================================


function normalizarAutorizacao(
    valor
){


    if(
        valor === null ||
        valor === undefined
    ){

        return "";

    }



    return String(valor)

        .trim()

        .toUpperCase()

        // tira espaços
        .replace(/\s/g,"")

        // tira .0 do Excel
        .replace(/\.0$/,"")

        // tira caracteres estranhos
        .replace(/[^\w]/g,"");


}







// ==========================================
// CRIA RESULTADO
// ==========================================


function criarResultado(
    status,
    premmia,
    interno,
    observacao
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




        observacao


    };


}







// ==========================================
// MOSTRA RESULTADOS
// ==========================================


function mostrarResultados(){



    atualizarResumo();



    if(
        typeof renderizarTabela === "function"
    ){


        renderizarTabela(
            resultadosConferencia
        );


    }




    const resultado =
        document.getElementById(
            "resultado"
        );



    if(resultado){

        resultado.style.display =
            "block";

    }



}






// ==========================================
// RESUMO
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

        item=>{


            if(
                total[item.status] !== undefined
            ){

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
// RENDERIZAR TABELA
// ==========================================


function renderizarTabela(lista){



    const corpo =
        document.getElementById(
            "corpoTabela"
        );



    if(!corpo){

        console.log(
            "Tabela não encontrada"
        );

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
${item.data || "-"}
</td>


<td>
${item.hora || "-"}
</td>


<td>
${item.autorizacaoPremmia || "-"}
</td>


<td>
${item.autorizacaoInterno || "-"}
</td>


<td>
${formatarMoeda(item.valorPremmia)}
</td>


<td>
${formatarMoeda(item.valorInterno)}
</td>


<td>
${item.operador || item.filial || "-"}
</td>


<td>
${item.observacao || ""}
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
    "conferencia.js completo carregado"
);
// ==========================================
// FORÇA BOTÃO CONFERIR
// ==========================================

window.addEventListener(
    "load",
    function(){

        const btn =
            document.getElementById(
                "btnConferir"
            );


        console.log(
            "Procurando botão:",
            btn
        );


        if(btn){


            btn.onclick = function(){


                console.log(
                    "CLICOU NO BOTÃO CONFERIR"
                );


                iniciarConferencia();


            };


            console.log(
                "Botão Conferir conectado!"
            );


        }else{


            console.log(
                "ERRO: botão btnConferir não existe no HTML"
            );


        }


    }
);
