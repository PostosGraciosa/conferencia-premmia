// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================


let dadosPremmia = [];

let dadosInterno = [];




// ==========================================
// ELEMENTOS
// ==========================================


function getElemento(id){

    return document.getElementById(id);

}






// ==========================================
// ARQUIVO PREMMIA
// ==========================================


document.addEventListener(
"DOMContentLoaded",
()=>{


const arquivoPremmia =
getElemento(
"arquivoPremmia"
);



const arquivoInterno =
getElemento(
"arquivoInterno"
);




if(arquivoPremmia){


arquivoPremmia.addEventListener(
"change",
function(){


const file =
this.files[0];



if(!file)
return;



const nome =
getElemento(
"nomePremmia"
);



if(nome){

nome.textContent =
file.name;

}



lerPremmia(file);



}

);


}





if(arquivoInterno){


arquivoInterno.addEventListener(
"change",
function(){


const file =
this.files[0];



if(!file)
return;



const nome =
getElemento(
"nomeInterno"
);



if(nome){

nome.textContent =
file.name;

}



lerInterno(file);



}

);



}




});









// ==========================================
// ABRIR EXCEL
// ==========================================


function abrirExcel(
file,
callback
){



const reader =
new FileReader();



reader.onload =
function(e){



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



const primeira =
workbook.SheetNames[0];



const planilha =
workbook.Sheets[primeira];



const linhas =
XLSX.utils.sheet_to_json(
planilha,
{
header:1,
defval:""
}
);



callback(linhas);



};



reader.readAsArrayBuffer(
file
);



}







// ==========================================
// PREMMIA
// ==========================================


function lerPremmia(file){


abrirExcel(
file,
linhas=>{


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



verificarArquivos();



}

);


}






// ==========================================
// INTERNO
// ==========================================


function lerInterno(file){


abrirExcel(
file,
linhas=>{


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



verificarArquivos();



}

);


}






// ==========================================
// LIBERA BOTÃO
// ==========================================


function verificarArquivos(){



const btn =
getElemento(
"btnConferir"
);



console.log(
"Verificando:",
dadosPremmia.length,
dadosInterno.length
);





if(
btn &&
dadosPremmia.length > 0 &&
dadosInterno.length > 0
){



btn.disabled = false;



console.log(
"Botão Conferir liberado"
);



}else{


console.log(
"Aguardando planilhas"
);



}



}



// continua PARTE 2/2
// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================


function transformarPremmia(linhas){


const registros = [];



linhas.forEach(
(linha,index)=>{


// pula cabeçalho

if(index === 0){

return;

}



if(
!linha ||
linha.length < 6
){

return;

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



operacao:
limparTexto(
linha[2]
),



valor:
converterValor(
linha[3]
),



dataHora:
linha[4],



data:
extrairData(
linha[4]
),



hora:
extrairHora(
linha[4]
),



autorizacao:
normalizarAutorizacao(
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
registro.valor !== null
){


registros.push(
registro
);


}



}

);



return registros;


}








// ==========================================
// TRANSFORMAR INTERNO
// ==========================================


function transformarInterno(linhas){



const registros = [];



linhas.forEach(
(linha,index)=>{



if(index === 0){

return;

}



if(
!Array.isArray(linha)
){

return;

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



movimento:
limparTexto(
linha[3]
),



data:
limparTexto(
linha[4]
),



cliente:
limparTexto(
linha[7]
),



filial:
limparTexto(
linha[8]
),



operador:
limparTexto(
linha[9]
),



tipo:
limparTexto(
linha[10]
),



autorizacao:
normalizarAutorizacao(
linha[12]
)



};




console.log(
"Linha interna:",
registro
);





// aceita mesmo sem autorização
// pois vale/desconto usa valor


if(
registro.valor !== null
){


registros.push(
registro
);


}



}

);



return registros;



}








// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================


function normalizarAutorizacao(valor){


if(
valor === null ||
valor === undefined
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
.replace("R$","")
.replace(/\./g,"")
.replace(",",".")
.trim();





const numero =
Number(texto);



if(
isNaN(numero)
){

return null;

}



return Number(
numero.toFixed(2)
);



}








// ==========================================
// TEXTO
// ==========================================


function limparTexto(valor){


if(
valor === null ||
valor === undefined
){

return "";

}



return String(valor)
.trim();


}








// ==========================================
// DATA
// ==========================================


function extrairData(valor){


if(!valor){

return "";

}



if(
valor instanceof Date
){

return valor.toLocaleDateString(
"pt-BR"
);

}



return String(valor);


}








// ==========================================
// HORA
// ==========================================


function extrairHora(valor){



if(!valor){

return "";

}



const texto =
String(valor);



const resultado =
texto.match(
/\d{2}:\d{2}/
);



return resultado
?
resultado[0]
:
"";


}







// ==========================================
// DISPONIBILIZA
// ==========================================


window.dadosPremmia =
dadosPremmia;



window.dadosInterno =
dadosInterno;




console.log(
"leituraExcel.js completo carregado"
);
