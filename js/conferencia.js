// ==========================================
// CONFERÊNCIA PREMMIA
// conferencia.js
// ==========================================


let resultadosConferencia = [];



// mantém atualizado para exportação

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





resultadosConferencia=[];





const mapaInterno =
criarMapaInterno(
interno
);





const usados =
new Set();







// ==========================================
// ANALISA PREMMIA
// ==========================================


premmia.forEach(
(venda)=>{



const chave =
normalizar(
venda.autorizacao
);





const encontrados =
mapaInterno[chave] || [];





if(
encontrados.length === 0
){



resultadosConferencia.push(

criarResultado(

"NAO_LANCADA",

venda,

null,

"Venda do Premmia não encontrada no sistema interno."

)

);



return;


}





let encontrado=null;





for(
let item of encontrados
){



if(
!usados.has(
item._id
)
){


encontrado=item;

break;


}



}






if(!encontrado){


resultadosConferencia.push(

criarResultado(

"LANCADA_A_MAIS",

null,

encontrados[0],

"Existe duplicidade no sistema interno."

)

);



return;


}






usados.add(
encontrado._id
);





const valorPremmia =
Number(
venda.valor || 0
);




const valorInterno =
Number(
encontrado.valor || 0
);





const diferenca =
Number(
(
valorPremmia -
valorInterno

).toFixed(2)

);





if(
Math.abs(diferenca)<0.01
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

"Autorização encontrada, porém valor divergente.",

diferenca

)

);



}





}

);

// ==========================================
// PROCURA LANÇAMENTOS INTERNOS A MAIS
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

"Lançamento encontrado no sistema interno sem correspondente no Premmia."

)

);



}

);







// ==========================================
// SALVA RESULTADOS
// ==========================================


window.resultadosConferencia =
resultadosConferencia;





mostrarResultados();




}







// ==========================================
// CRIAR MAPA INTERNO
// ==========================================


function criarMapaInterno(lista){


const mapa={};



lista.forEach(
(item,index)=>{


item._id=index;



const chave =
normalizar(
item.autorizacao
);




if(
!chave
){

return;

}





if(
!mapa[chave]
){

mapa[chave]=[];

}





mapa[chave].push(
item
);



}

);



return mapa;


}







// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================


function normalizar(valor){



if(
valor===null ||
valor===undefined
){

return "";

}





return String(valor)

.trim()

.toUpperCase()

.replace(/\D/g,"")

.replace(/^0+/,"");



}







// ==========================================
// CRIAR RESULTADO
// ==========================================


function criarResultado(

status,

premmia,

interno,

observacao,

diferenca=0

){



return {


status:



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




cpf:


premmia?.cpf ||

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




diferenca:

diferenca,




filial:


interno?.filial ||

"",




funcionario:


interno?.funcionario ||

"",




operador:


interno?.funcionario ||

"",




tipo:


premmia?.produto ||

interno?.tipo ||

"",




pagamento:


premmia?.pagamento ||

"",




observacao:


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

resultado.style.display="block";

}



if(tabela){

tabela.style.display="block";

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



const resumo={


CORRETA:0,

NAO_LANCADA:0,

LANCADA_A_MAIS:0,

VALOR_DIVERGENTE:0,

AUTORIZACAO_DIVERGENTE:0


};





resultadosConferencia.forEach(

(r)=>{


if(
resumo[r.status] !== undefined
){

resumo[r.status]++;

}


}

);






const campos={


totalCorretas:
resumo.CORRETA,


totalNaoLancadas:
resumo.NAO_LANCADA,


totalLancadasMais:
resumo.LANCADA_A_MAIS,


totalValorErrado:
resumo.VALOR_DIVERGENTE,


totalAutorizacao:
resumo.AUTORIZACAO_DIVERGENTE



};






Object.keys(campos)
.forEach(

(id)=>{


const elemento =
document.getElementById(id);



if(elemento){

elemento.innerHTML =
campos[id];

}


}

);



}









// ==========================================
// FORMATAR MOEDA
// ==========================================


function formatarMoeda(valor){


return Number(valor || 0)
.toLocaleString(
"pt-BR",
{
style:"currency",
currency:"BRL"
}
);


}





// ==========================================
// EXPORTAR
// ==========================================


window.resultadosConferencia =
resultadosConferencia;


window.formatarMoeda =
formatarMoeda;



console.log(
"conferencia.js carregado"
);


