// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// Leitura simplificada
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
// PORTAL PREMMIA
// ==========================================

if(arquivoPremmia){

arquivoPremmia.addEventListener(
"change",
function(){

if(this.files.length){

nomePremmia.textContent =
"Arquivo selecionado: " + this.files[0].name;


lerArquivo(
this.files[0],
"premmia"
);

}

});

}




// ==========================================
// SISTEMA INTERNO
// ==========================================

if(arquivoInterno){

arquivoInterno.addEventListener(
"change",
function(){

if(this.files.length){

nomeInterno.textContent =
"Arquivo selecionado: " + this.files[0].name;


lerArquivo(
this.files[0],
"interno"
);

}

});

}




// ==========================================
// LEITURA EXCEL
// ==========================================

function lerArquivo(file,tipo){


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


}
else{


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
// TRANSFORMA PORTAL PREMMIA
// ==========================================

function transformarPremmia(linhas){


let registros=[];


linhas.forEach(
(linha,index)=>{


let texto =
linha
.map(normalizarTexto)
.join(" ");



if(
texto.includes("cpf") &&
texto.includes("nome")
){

return;

}



let registro={


cpf:
limpar(linha[0]),


nome:
limpar(linha[1]),



valor:
converterValor(linha[3]),



autorizacao:
limpar(linha[5])


};



if(
registro.autorizacao &&
registro.valor!==null
){

registro._id=index;

registros.push(
registro
);

}


});


return registros;

}





// ==========================================
// TRANSFORMA SISTEMA INTERNO
// ==========================================

function transformarInterno(linhas){


let registros=[];


linhas.forEach(
(linha,index)=>{


let texto =
linha
.map(normalizarTexto)
.join(" ");



if(
texto.includes("administradora") &&
texto.includes("autorizacao")
){

return;

}



let registro={



valor:
converterValor(
linha[1]
),



pdv:
limpar(
linha[8]
),



autorizacao:
limpar(
linha[12]
)


};



if(
registro.autorizacao &&
registro.valor!==null
){


registro._id=index;


registros.push(
registro
);


}


});


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
// UTILIDADES
// ==========================================

function limpar(valor){

return String(
valor ?? ""
)
.trim();

}



function normalizarTexto(valor){

return limpar(valor)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"");

}



function converterValor(valor){


if(
valor===null ||
valor===undefined ||
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
.replace(/\./g,"")
.replace(",",".")
.trim();



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
"leituraExcel.js carregado"
);
