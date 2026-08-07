// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================


const arquivoPremmia =
document.getElementById("arquivoPremmia");


const arquivoInterno =
document.getElementById("arquivoInterno");


const nomePremmia =
document.getElementById("nomePremmia");


const nomeInterno =
document.getElementById("nomeInterno");



let dadosPremmia = [];

let dadosInterno = [];





// ==========================================
// SELEÇÃO PREMMIA
// ==========================================


if(arquivoPremmia){

arquivoPremmia.addEventListener(
"change",
function(){


if(this.files.length){


nomePremmia.textContent =
"Arquivo selecionado: " + this.files[0].name;


lerExcel(
this.files[0],
"premmia"
);


}


});

}





// ==========================================
// SELEÇÃO INTERNO
// ==========================================


if(arquivoInterno){

arquivoInterno.addEventListener(
"change",
function(){


if(this.files.length){


nomeInterno.textContent =
"Arquivo selecionado: " + this.files[0].name;


lerExcel(
this.files[0],
"interno"
);


}


});

}






// ==========================================
// LEITOR EXCEL
// ==========================================


function lerExcel(file,tipo){


const reader =
new FileReader();



reader.onload=function(e){



const dados =
new Uint8Array(
e.target.result
);



const workbook =
XLSX.read(
dados,
{
type:"array"
}
);



const aba =
workbook.SheetNames[0];


const planilha =
workbook.Sheets[aba];



const linhas =
XLSX.utils.sheet_to_json(
planilha,
{
header:1,
defval:""
}
);




if(tipo==="premmia"){


dadosPremmia =
transformarPremmia(
linhas
);


window.dadosPremmia =
dadosPremmia;



console.log(
"Premmia:",
dadosPremmia
);



}else{



dadosInterno =
transformarInterno(
linhas
);



window.dadosInterno =
dadosInterno;



console.log(
"Interno:",
dadosInterno
);



}



atualizarContador();



};



reader.readAsArrayBuffer(file);


}







// ==========================================
// PORTAL PREMMIA
// ==========================================


function transformarPremmia(linhas){


let registros=[];



let cabecalho = {};



for(let i=0;i<linhas.length;i++){


let linha =
linhas[i];



let texto =
linha.map(normalizarTexto)
.join(" ");




// encontra cabeçalho

if(
texto.includes("cpf") &&
texto.includes("nome") &&
texto.includes("codigo")
){


linha.forEach(
(coluna,index)=>{


cabecalho[
normalizarTexto(coluna)
]=index;


});


continue;

}





if(
Object.keys(cabecalho).length===0
){

continue;

}





let registro={



cpf:
linha[
cabecalho.cpf
] || "",



nome:
linha[
cabecalho.nome
] || "",



valor:
converterValor(
linha[
cabecalho["valor liquido"]
]
),



autorizacao:
String(
linha[
cabecalho["codigo transacao"]
] || ""
).trim()



};





if(
registro.autorizacao &&
registro.valor!==null
){


registros.push(
registro
);


}



}



return registros;


}








// ==========================================
// SISTEMA INTERNO
// ==========================================


function transformarInterno(linhas){



let registros=[];



let cabecalho={};



for(let i=0;i<linhas.length;i++){


let linha =
linhas[i];



let texto =
linha.map(normalizarTexto)
.join(" ");




// encontra cabeçalho


if(
texto.includes("administradora") &&
texto.includes("autorizacao")
){


linha.forEach(
(coluna,index)=>{


cabecalho[
normalizarTexto(coluna)
]=index;


});


continue;


}





if(
Object.keys(cabecalho).length===0
){

continue;

}






let registro={



valor:
converterValor(
linha[
cabecalho.valor
]
),



pdv:
linha[
cabecalho.filial
] || "",



autorizacao:
String(
linha[
cabecalho.autorizacao
] || ""
)
.trim()



};





if(
registro.autorizacao &&
registro.valor!==null
){


registros.push(
registro
);


}



}




return registros;


}








// ==========================================
// CONTADOR
// ==========================================


function atualizarContador(){


const campo =
document.getElementById(
"contadorDados"
);



if(campo){


campo.innerHTML =

`
Premmia: ${dadosPremmia.length} registros |
Interno: ${dadosInterno.length} registros
`;

}


}







// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================


function normalizarTexto(valor){


return String(valor ?? "")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.trim();


}





function converterValor(valor){


if(
valor===undefined ||
valor===null ||
valor===""

){

return null;

}



if(typeof valor==="number"){

return Number(
valor.toFixed(2)
);

}



let texto =
String(valor)
.trim();



texto =
texto
.replace(/\./g,"")
.replace(",",".")
;



let numero =
Number(texto);



return isNaN(numero)
?
null
:
Number(
numero.toFixed(2)
);


}



console.log(
"leituraExcel.js completo carregado"
);
