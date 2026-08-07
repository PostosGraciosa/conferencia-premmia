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
// PREMMIA
// ==========================================


if(arquivoPremmia){


arquivoPremmia.addEventListener(
"change",
function(){


if(this.files.length){


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
// INTERNO
// ==========================================


if(arquivoInterno){


arquivoInterno.addEventListener(
"change",
function(){


if(this.files.length){


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
// LER EXCEL
// ==========================================


function abrirExcel(file, callback){


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



callback(linhas);



};



reader.readAsArrayBuffer(file);


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



if(!linhas || !linhas.length){

    return;

}




// procura cabeçalho automaticamente

let cabecalho = -1;



for(let i=0;i<linhas.length;i++){


    const texto =
    linhas[i]
    .join(" ")
    .toLowerCase();



    if(
        texto.includes("cpf") &&
        texto.includes("nome") &&
        texto.includes("código")
    ){

        cabecalho=i;
        break;

    }


}



if(cabecalho === -1){

    cabecalho=0;

}




for(
let i=cabecalho+1;
i<linhas.length;
i++
){


const linha =
linhas[i];



if(!linha || linha.length<6){

    continue;

}



const registro={


origem:"PREMMIA",


// CPF

cpf:
limparTexto(
linha[0]
),



// NOME

cliente:
limparTexto(
linha[1]
),



// PRODUTO

produto:
limparTexto(
linha[2]
),



// VALOR LIQUIDO

valor:
converterValor(
linha[3]
),



// DATA HORA

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



// CODIGO TRANSACAO

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
registro.autorizacao &&
registro.valor !== null
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



if(!linhas || !linhas.length){

return;

}




let cabecalho=-1;



for(let i=0;i<linhas.length;i++){


const texto =
linhas[i]
.join(" ")
.toLowerCase();



if(
texto.includes("administradora") &&
texto.includes("autorização")
){

cabecalho=i;
break;

}


}



if(cabecalho===-1){

cabecalho=0;

}




for(
let i=cabecalho+1;
i<linhas.length;
i++
){


const linha =
linhas[i];



if(!linha || linha.length<10){

continue;

}





const registro={


origem:"INTERNO",


// VALOR

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



autorizacao:
limparTexto(
linha[12]
)



};





if(
registro.autorizacao &&
registro.valor !== null
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


if(
btnConferir &&
dadosPremmia.length>0 &&
dadosInterno.length>0
){

btnConferir.disabled=false;


}else{


if(btnConferir){

btnConferir.disabled=true;

}


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
dadosPremmia.length>0 &&
dadosInterno.length>0
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
// CONVERSÃO VALOR
// ==========================================


function converterValor(valor){


if(
valor===null ||
valor===undefined ||
valor===""

){

return null;

}



if(
typeof valor==="number"
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
.replace(/\./g,"")
.replace(",",".")
.replace(/[^\d.-]/g,"");



let numero =
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
valor===null ||
valor===undefined
){

return "";

}



return String(valor)
.trim()
.replace(/\s+/g," ");


}




// ==========================================
// DATA
// ==========================================


function extrairData(valor){


if(!valor){

return "";

}



const texto =
String(valor);



const resultado =
texto.match(
/\d{2}\/\d{2}\/\d{4}/
);



return resultado
?
resultado[0]
:
texto;


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
/\d{2}:\d{2}(:\d{2})?/
);



return resultado
?
resultado[0]
:
"";


}




console.log(
"leituraExcel.js completo carregado"
);
