// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


let resultadosConferencia = [];


// Mantém disponível para exportação

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


});





// ==========================================
// INICIAR CONFERÊNCIA
// ==========================================

function iniciarConferencia(){



const premmia =
window.dadosPremmia || [];



const interno =
window.dadosInterno || [];




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




const indiceInterno =
criarIndice(
interno
);



const usados =
new Set();





// ==========================================
// COMPARA PORTAL
// ==========================================


premmia.forEach(
(item)=>{


const chave =
normalizar(
item.autorizacao
);



const encontrado =
indiceInterno[chave] || [];





// NÃO ENCONTRADO

if(encontrado.length===0){


resultadosConferencia.push(

criarResultado(

"NAO_LANCADA",

item,

null,

"Venda do Portal Premmia não encontrada no sistema."

)

);


return;

}





let internoEncontrado =
null;



for(let registro of encontrado){


if(
!usados.has(
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

encontrado[0],

"Lançamento duplicado no sistema."

)

);


return;


}





usados.add(
internoEncontrado._id
);





// COMPARA VALOR


const diferenca =
Number(
(
item.valor -
internoEncontrado.valor
)
.toFixed(2)
);





if(
Math.abs(diferenca)<0.01
){


resultadosConferencia.push(

criarResultado(

"CORRETA",

item,

internoEncontrado,

"Venda conferida."

)

);



}
else{


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






// ==========================================
// PROCURA SOBRAS DO SISTEMA
// ==========================================


interno.forEach(
(item)=>{


if(
usados.has(
item._id
)
){

return;

}



resultadosConferencia.push(

criarResultado(

"LANCADA_A_MAIS",

null,

item,

"Existe lançamento no sistema sem venda Premmia."

)

);



}

);





window.resultadosConferencia =
resultadosConferencia;



mostrarResultados();



}





// ==========================================
// CRIA ÍNDICE
// ==========================================

function criarIndice(lista){


const indice={};



lista.forEach(
(item)=>{


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
// RESULTADO
// ==========================================

function criarResultado(

status,

premmia,

interno,

observacao,

diferenca=0

){



return{


status,


cliente:
premmia?.nome || "",


cpf:
premmia?.cpf || "",



data:
"",



autorizacaoPremmia:
premmia?.autorizacao || "",



autorizacaoInterno:
interno?.autorizacao || "",



valorPremmia:
premmia?.valor ?? null,



valorInterno:
interno?.valor ?? null,



pdv:
interno?.pdv || "",



diferenca,



observacao



};



}







// ==========================================
// MOSTRAR RESULTADO
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

resultado.style.display="block";

}



if(tabela){

tabela.style.display="block";

}



if(
typeof renderizarTabela==="function"
){

renderizarTabela(
resultadosConferencia
);

}



atualizarResumo();



}







// ==========================================
// RESUMO
// ==========================================

function atualizarResumo(){


const total={


CORRETA:0,

NAO_LANCADA:0,

LANCADA_A_MAIS:0,

VALOR_DIVERGENTE:0


};



resultadosConferencia.forEach(
(r)=>{


if(total[r.status]!==undefined){

total[r.status]++;

}


});



const ids={


totalCorretas:
total.CORRETA,


totalNaoLancadas:
total.NAO_LANCADA,


totalLancadasMais:
total.LANCADA_A_MAIS,


totalValorErrado:
total.VALOR_DIVERGENTE


};



for(let id in ids){


const el =
document.getElementById(id);



if(el){

el.textContent =
ids[id];

}


}



}







console.log(
"conferencia.js carregado"
);
