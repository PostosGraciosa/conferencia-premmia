// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================


let dadosPremmia = [];
let dadosInterno = [];



const arquivoPremmia =
document.getElementById("arquivoPremmia");


const arquivoInterno =
document.getElementById("arquivoInterno");


const nomePremmia =
document.getElementById("nomePremmia");


const nomeInterno =
document.getElementById("nomeInterno");


const btnConferir =
document.getElementById("btnConferir");




// ==========================================
// EVENTO PREMMIA
// ==========================================

if(arquivoPremmia){

arquivoPremmia.addEventListener(
"change",
function(){


if(this.files.length > 0){


nomePremmia.textContent =
"Arquivo selecionado: "+
this.files[0].name;



lerArquivoPremmia(
this.files[0]
);


}


});

}





// ==========================================
// EVENTO INTERNO
// ==========================================

if(arquivoInterno){


arquivoInterno.addEventListener(
"change",
function(){


if(this.files.length > 0){


nomeInterno.textContent =
"Arquivo selecionado: "+
this.files[0].name;



lerArquivoInterno(
this.files[0]
);


}



});

}





// ==========================================
// ABRIR EXCEL
// ==========================================

function abrirExcel(
file,
callback
){


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
type:"array",
cellDates:true
}
);



const primeiraAba =
workbook.SheetNames[0];



const planilha =
workbook.Sheets[primeiraAba];



const linhas =
XLSX.utils.sheet_to_json(
planilha,
{
header:1,
defval:""
}
);



callback(
linhas
);



};



reader.readAsArrayBuffer(
file
);


}





// ==========================================
// LER PREMMIA
// ==========================================

function lerArquivoPremmia(file){


abrirExcel(
file,
transformarPremmia
);


}




// ==========================================
// LER INTERNO
// ==========================================

function lerArquivoInterno(file){


abrirExcel(
file,
transformarInterno
);


}
// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================

function transformarPremmia(linhas){


dadosPremmia = [];



for(let i=0;i<linhas.length;i++){


const linha =
linhas[i];



if(!linha){

continue;

}




const texto =
linha.join(" ")
.toLowerCase();




// ignora cabeçalho

if(
texto.includes("cpf") &&
texto.includes("nome") &&
texto.includes("produto")
){

continue;

}





const registro = {


origem:
"PREMMIA",



cpf:
limparTexto(
linha[0]
),



cliente:
limparTexto(
linha[1]
),



produto:
limparTexto(
linha[2]
),



valor:
converterValor(
linha[3]
),



dataHora:
limparTexto(
linha[4]
),



data:
extrairData(
linha[4]
),



hora:
extrairHora(
linha[4]
),



autorizacao:
limparTexto(
linha[5]
),



pagamento:
limparTexto(
linha[6]
),



status:
limparTexto(
linha[7]
)



};





if(
registro.autorizacao !== ""
){

dadosPremmia.push(
registro
);


}



}




window.dadosPremmia =
dadosPremmia;



console.log(
"Premmia:",
dadosPremmia
);



atualizarContador();


}




// ==========================================
// TRANSFORMAR SISTEMA INTERNO
// ==========================================


function transformarInterno(linhas){


dadosInterno=[];



for(let i=0;i<linhas.length;i++){


const linha =
linhas[i];



if(!linha){

continue;

}





const texto =
linha.join(" ")
.toLowerCase();




// pula cabeçalho

if(
texto.includes("administradora") &&
texto.includes("autorização")
){

continue;

}





const registro = {


origem:
"INTERNO",



administradora:
limparTexto(
linha[0]
),



valor:
converterValor(
linha[1]
),



hora:
limparTexto(
linha[2]
),



data:
limparTexto(
linha[3]
),



cliente:
limparTexto(
linha[7]
),



filial:
limparTexto(
linha[8]
),



funcionario:
limparTexto(
linha[9]
),



tipo:
limparTexto(
linha[10]
),



centroCusto:
limparTexto(
linha[11]
),



autorizacao:
limparTexto(
linha[12]
)



};






console.log(
"Interno linha:",
registro
);






// aceita somente com autorização

if(
registro.autorizacao !== ""
){

dadosInterno.push(
registro
);


}



}




window.dadosInterno =
dadosInterno;



console.log(
"Interno:",
dadosInterno
);



atualizarContador();


verificarArquivos();


}
// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================

function verificarArquivos(){


if(!btnConferir){

return;

}



if(
dadosPremmia.length > 0 &&
dadosInterno.length > 0
){


btnConferir.disabled = false;



}else{


btnConferir.disabled = true;


}



}



// ==========================================
// CONTADOR NA TELA
// ==========================================


function atualizarContador(){



const contador =
document.getElementById(
"contadorDados"
);



const status =
document.getElementById(
"statusSistema"
);



if(contador){


contador.innerHTML =
`
Premmia: ${dadosPremmia.length} registros 
|
Interno: ${dadosInterno.length} registros
`;

}



if(status){



if(
dadosPremmia.length > 0 &&
dadosInterno.length > 0
){


status.innerHTML =
"Planilhas carregadas. Pronto para conferir.";



}else{


status.innerHTML =
"Aguardando carregamento das planilhas.";



}



}



verificarArquivos();



}






// ==========================================
// CONVERTER VALOR
// ==========================================


function converterValor(valor){



if(
valor === null ||
valor === undefined ||
valor === ""
){

return null;

}



if(
typeof valor === "number"
){

return Number(
valor.toFixed(2)
);

}



let texto =
String(valor)
.trim();



texto =
texto
.replace(/\s/g,"")
.replace("R$","");



if(
texto.includes(",") &&
texto.includes(".")
){


texto =
texto
.replace(/\./g,"")
.replace(",",".");


}else{


texto =
texto.replace(",",".")
}



const numero =
Number(texto);



if(isNaN(numero)){

return null;

}



return Number(
numero.toFixed(2)
);



}





// ==========================================
// LIMPAR TEXTO
// ==========================================


function limparTexto(valor){



if(
valor === null ||
valor === undefined
){

return "";

}



return String(valor)
.trim()
.replace(/\s+/g," ");



}





// ==========================================
// EXTRAIR DATA
// ==========================================


function extrairData(valor){


if(!valor){

return "";

}



const texto =
String(valor);



const retorno =
texto.match(
/\d{2}\/\d{2}\/\d{4}/
);



return retorno
?
retorno[0]
:
texto;



}





// ==========================================
// EXTRAIR HORA
// ==========================================


function extrairHora(valor){



if(!valor){

return "";

}



const texto =
String(valor);



const retorno =
texto.match(
/\d{2}:\d{2}(:\d{2})?/
);



return retorno
?
retorno[0]
:
"";



}





// ==========================================
// INICIALIZA
// ==========================================


window.dadosPremmia =
dadosPremmia;


window.dadosInterno =
dadosInterno;



console.log(
"leituraExcel.js completo carregado"
);
