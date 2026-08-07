// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


let resultadosConferencia = [];



Object.defineProperty(
window,
"resultadosConferencia",
{
get:function(){

    return resultadosConferencia;

}

});




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



});




// ==========================================
// INICIAR
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
premmia.length===0 ||
interno.length===0
){

alert(
"Carregue as duas planilhas antes de conferir."
);

return;

}



resultadosConferencia=[];



const utilizados =
new Set();



premmia.forEach(
venda=>{



let encontrado = null;



// ======================================
// 1 - TENTA POR AUTORIZAÇÃO
// ======================================


if(
venda.autorizacao
){


encontrado =
interno.find(item=>{


return (

normalizarAutorizacao(
item.autorizacao
)

===

normalizarAutorizacao(
venda.autorizacao
)

&&

!utilizados.has(item)

);



});



}





// ======================================
// 2 - VALE / DESCONTO
// PROCURA PELO VALOR
// ======================================


if(
!encontrado &&

(
venda.operacao.includes("VALE")

||

venda.operacao.includes("DESCONTO")

)

){



encontrado =
interno.find(item=>{


return (

!utilizados.has(item)

&&

mesmoValor(
venda.valor,
item.valor
)

);



});



}





// ======================================
// NÃO ACHOU
// ======================================


if(!encontrado){


resultadosConferencia.push(

criarResultado(

"NAO_LANCADA",

venda,

null,

"Venda não localizada."

)

);


return;


}




utilizados.add(
encontrado
);




// ======================================
// COMPARA VALOR
// ======================================


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

"Venda conferida."

)

);



}else{


resultadosConferencia.push(

criarResultado(

"VALOR_DIVERGENTE",

venda,

encontrado,

"Valor diferente."

)

);



}



});





// ======================================
// VERIFICA SOBRAS INTERNAS
// ======================================


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

"Lançamento interno sem correspondência."

)

);



});





mostrarResultados();



}






// ==========================================
// COMPARAÇÃO VALOR
// ==========================================

function mesmoValor(a,b){


return (

Number(a || 0)
.toFixed(2)

===

Number(b || 0)
.toFixed(2)

);


}





// ==========================================
// NORMALIZA AUTORIZAÇÃO
// ==========================================

function normalizarAutorizacao(valor){


if(
valor===null ||
valor===undefined
){

return "";

}



return String(valor)

.trim()

.toUpperCase()

.replace(/\s/g,"")

.replace(/\.0$/,"")

.replace(/[^\w]/g,"");


}






// ==========================================
// RESULTADO
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
// MOSTRAR
// ==========================================

function mostrarResultados(){



if(
typeof atualizarResumo==="function"
){

atualizarResumo();

}



if(
typeof renderizarTabela==="function"
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


let total={


CORRETA:0,

NAO_LANCADA:0,

LANCADA_A_MAIS:0,

VALOR_DIVERGENTE:0,

AUTORIZACAO_DIVERGENTE:0


};



resultadosConferencia.forEach(item=>{


if(total[item.status]!==undefined){

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
total.VALOR_DIVERGENTE
);



alterarTexto(
"totalAutorizacao",
total.AUTORIZACAO_DIVERGENTE
);



}




function alterarTexto(id,valor){


const el =
document.getElementById(id);



if(el){

el.textContent =
valor;

}


}





// ==========================================
// MOEDA
// ==========================================

function formatarMoeda(valor){


if(valor===null || valor===undefined){

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
// TABELA
// ==========================================

function renderizarTabela(lista){



const corpo =
document.getElementById(
"corpoTabela"
);



if(!corpo)
return;



corpo.innerHTML="";



lista.forEach(item=>{


const tr =
document.createElement("tr");



tr.innerHTML=`

<td>${item.status}</td>

<td>${item.cliente || "-"}</td>

<td>${item.autorizacaoPremmia || "-"}</td>

<td>${item.autorizacaoInterno || "-"}</td>

<td>${formatarMoeda(item.valorPremmia)}</td>

<td>${formatarMoeda(item.valorInterno)}</td>

<td>${item.operador || item.filial || "-"}</td>

`;



corpo.appendChild(tr);



});


}





console.log(
"conferencia.js carregado"
);
// ==========================================
// ATIVA BOTÃO CONFERIR
// ==========================================

function ativarBotaoConferir(){


    const btn =
    document.getElementById(
        "btnConferir"
    );



    if(!btn){

        console.log(
            "Botão conferir não encontrado"
        );

        return;

    }



    // remove eventos antigos

    btn.onclick = null;



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





// ==========================================
// INICIALIZAÇÃO
// ==========================================


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





console.log(
"conferencia.js pronto"
);




// ==========================================
// INICIALIZAÇÃO
// ==========================================


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





console.log(
"conferencia.js pronto"
);
