// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================


// ELEMENTOS

const arquivoPremmia = document.getElementById("arquivoPremmia");
const arquivoInterno = document.getElementById("arquivoInterno");

const nomePremmia = document.getElementById("nomePremmia");
const nomeInterno = document.getElementById("nomeInterno");

const btnConferir = document.getElementById("btnConferir");

const statusSistema = document.getElementById("statusSistema");

const contadorDados = document.getElementById("contadorDados");



// DADOS GLOBAIS

window.dadosPremmia = [];
window.dadosInterno = [];




// ==========================================
// EVENTOS
// ==========================================


arquivoPremmia.addEventListener(
"change",
function(){

    nomePremmia.textContent =
    "Arquivo selecionado: " + this.files[0].name;


    lerArquivo(
        this.files[0],
        "PREMMIA"
    );


});





arquivoInterno.addEventListener(
"change",
function(){

    nomeInterno.textContent =
    "Arquivo selecionado: " + this.files[0].name;


    lerArquivo(
        this.files[0],
        "INTERNO"
    );


});





// ==========================================
// LEITURA DO EXCEL
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



console.log(
tipo,
linhas.slice(0,5)
);



if(tipo==="PREMMIA"){


window.dadosPremmia =
transformarPremmia(linhas);


}



if(tipo==="INTERNO"){


window.dadosInterno =
transformarInterno(linhas);


}




atualizarStatus();


verificarArquivos();



};


reader.readAsArrayBuffer(file);


}






// ==========================================
// VERIFICA BOTÃO
// ==========================================


function verificarArquivos(){


if(

window.dadosPremmia.length > 0
&&
window.dadosInterno.length > 0

){

btnConferir.disabled=false;


statusSistema.innerHTML =
"✅ Planilhas carregadas. Clique em conferir vendas.";


}

else{


btnConferir.disabled=true;


}



}




function atualizarStatus(){


contadorDados.innerHTML =

`
Premmia: ${window.dadosPremmia.length}
registros |
Interno: ${window.dadosInterno.length}
registros
`;



}







// ==========================================
// PREMMIA
// ==========================================


function transformarPremmia(linhas){


let resultado=[];


linhas.forEach((linha,index)=>{


if(index===0)
return;



let item={


cpf:
limpar(linha[0]),


cliente:
limpar(linha[1]),


operacao:
limpar(linha[2]),


valor:
converterValor(linha[3]),


dataHora:
limpar(linha[4]),


data:
extrairData(linha[4]),


hora:
extrairHora(linha[4]),


autorizacao:
limpar(linha[5]),


pagamento:
limpar(linha[6])


};



if(
item.autorizacao &&
item.valor!==null
){

resultado.push(item);

}



});


return resultado;


}







// ==========================================
// INTERNO AUTOMÁTICO
// ==========================================


function transformarInterno(linhas){



if(!linhas.length)
return [];



let cabecalho =
linhas[0]
.map(normalizar);



console.log(
"COLUNAS INTERNAS:",
cabecalho
);



function coluna(possiveis){


for(let nome of possiveis){


let index =
cabecalho.indexOf(
normalizar(nome)
);



if(index!==-1)
return index;


}


return -1;


}




const colValor =
coluna([
"valor",
"valor bruto",
"valor total"
]);



const colData =
coluna([
"data",
"data venda"
]);



const colHora =
coluna([
"hora"
]);



const colOperador =
coluna([
"operador",
"usuario"
]);



const colAutorizacao =
coluna([
"autorizacao",
"autorização",
"identificador",
"nsu"
]);




console.log(
"COLUNA VALOR:",
colValor,
"COLUNA AUT:",
colAutorizacao
);



let resultado=[];



for(
let i=1;
i<linhas.length;
i++
){


let linha =
linhas[i];



let item={



valor:

colValor>=0
?
converterValor(linha[colValor])
:
null,



data:

colData>=0
?
limpar(linha[colData])
:
"",



hora:

colHora>=0
?
limpar(linha[colHora])
:
"",



operador:

colOperador>=0
?
limpar(linha[colOperador])
:
"",




autorizacao:

colAutorizacao>=0
?
limpar(linha[colAutorizacao])
:
""


};





if(

item.autorizacao
&&
item.valor!==null

){

resultado.push(item);

}



}



return resultado;


}








// ==========================================
// FUNÇÕES
// ==========================================


function limpar(valor){


if(valor===undefined||valor===null)
return "";


return String(valor)
.trim();


}




function normalizar(valor){


return limpar(valor)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"");


}





function converterValor(valor){


if(valor===null||valor===undefined||valor==="")
return null;



if(typeof valor==="number")
return Number(valor.toFixed(2));



let texto =
String(valor)
.replace(/\./g,"")
.replace(",", ".");



let numero =
Number(texto);



return isNaN(numero)
?
null
:
Number(numero.toFixed(2));


}




function extrairData(valor){


let texto =
limpar(valor);



let r =
texto.match(
/\d{2}\/\d{2}\/\d{4}/
);



return r?r[0]:"";


}





function extrairHora(valor){


let texto =
limpar(valor);



let r =
texto.match(
/\d{2}:\d{2}:\d{2}/
);



return r?r[0]:"";


}





console.log(
"leituraExcel.js carregado"
);
