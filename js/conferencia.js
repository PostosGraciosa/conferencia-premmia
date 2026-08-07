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


