// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// ==========================================

let dadosPremmia = [];
let dadosInterno = [];

window.dadosPremmia = [];
window.dadosInterno = [];



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
// ARQUIVO PREMMIA
// ==========================================

if(arquivoPremmia){

arquivoPremmia.addEventListener(
"change",
function(){

    const file = this.files[0];

    if(!file)
        return;


    nomePremmia.textContent =
        file.name;


    lerPremmia(file);


});

}



// ==========================================
// ARQUIVO INTERNO
// ==========================================

if(arquivoInterno){

arquivoInterno.addEventListener(
"change",
function(){

    const file = this.files[0];

    if(!file)
        return;


    nomeInterno.textContent =
        file.name;


    lerInterno(file);


});

}



// ==========================================
// ABRIR EXCEL
// ==========================================

function abrirExcel(file, callback){

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



reader.readAsArrayBuffer(file);


}



// ==========================================
// PREMMIA
// ==========================================

function lerPremmia(file){

abrirExcel(
file,
function(linhas){


    dadosPremmia =
    transformarPremmia(linhas);



    window.dadosPremmia =
    dadosPremmia;



    console.log(
        "Premmia:",
        dadosPremmia
    );


    atualizarTela();


});


}



// ==========================================
// INTERNO
// ==========================================

function lerInterno(file){

abrirExcel(
file,
function(linhas){


    dadosInterno =
    transformarInterno(linhas);



    window.dadosInterno =
    dadosInterno;



    console.log(
        "Interno:",
        dadosInterno
    );


    atualizarTela();


});


}



// ==========================================
// TRANSFORMA PREMMIA
// ==========================================

function transformarPremmia(linhas){

const registros=[];



linhas.forEach(
(linha,index)=>{


    if(index===0)
        return;


    if(!linha || linha.length<8)
        return;



    const registro={


        origem:"PREMMIA",


        cpf:
        limparTexto(linha[0]),


        cliente:
        limparTexto(linha[1]),


        operacao:
        limparTexto(linha[2])
        .toUpperCase(),


        valor:
        converterValor(linha[3]),


        dataHora:
        linha[4],


        data:
        extrairData(linha[4]),


        hora:
        extrairHora(linha[4]),


        autorizacao:
        normalizarAutorizacao(linha[5]),


        pagamento:
        limparTexto(linha[6]),


        status:
        limparTexto(linha[7])



    };



    if(
        registro.valor !== null
    ){

        registros.push(registro);

    }


});


return registros;


}



// ==========================================
// TRANSFORMA INTERNO
// ==========================================

function transformarInterno(linhas){

const registros=[];



linhas.forEach(
(linha,index)=>{


    if(index===0)
        return;



    if(!linha)
        return;



    const registro={


        origem:"INTERNO",



        administradora:
        limparTexto(linha[0]),



        // VALOR LÍQUIDO
        // COLUNA G

        valor:
        converterValor(linha[6]),



        hora:
        limparTexto(linha[2]),



        movimento:
        limparTexto(linha[3]),



        data:
        limparTexto(linha[4]),



        cliente:
        limparTexto(linha[7]),



        filial:
        limparTexto(linha[8]),



        operador:
        limparTexto(linha[9]),



        tipo:
        limparTexto(linha[10]),



        centroCusto:
        limparTexto(linha[11]),



        autorizacao:
        normalizarAutorizacao(linha[12])



    };



    console.log(
        "Interno linha:",
        registro
    );



    if(
        registro.valor !== null
    ){

        registros.push(registro);

    }


});


return registros;


}



// ==========================================
// NORMALIZAR AUTORIZAÇÃO
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
// VALOR
// ==========================================

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
.trim();



texto =
texto.replace("R$","")
.trim();



texto =
texto.replace(/\./g,"")
.replace(",",".")
;



let numero =
Number(texto);



if(isNaN(numero))
    return null;



return Number(
numero.toFixed(2)
);


}



// ==========================================
// TEXTO
// ==========================================

function limparTexto(valor){

if(valor===null || valor===undefined)
    return "";


return String(valor).trim();

}



// ==========================================
// DATA
// ==========================================

function extrairData(valor){

if(!valor)
    return "";


if(valor instanceof Date){

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

if(!valor)
return "";


const texto =
String(valor);



const achou =
texto.match(
/\d{2}:\d{2}/
);



return achou
?
achou[0]
:
"";


}



// ==========================================
// TELA
// ==========================================

function atualizarTela(){


const status =
document.getElementById(
"statusSistema"
);



if(
dadosPremmia.length>0 &&
dadosInterno.length>0
){


if(status){

status.textContent =
"Planilhas carregadas. Pronto para conferir.";

}


if(btnConferir){

btnConferir.disabled=false;

}


}else{


if(status){

status.textContent =
"Aguardando carregamento das planilhas.";

}


if(btnConferir){

btnConferir.disabled=true;

}


}



const contador =
document.getElementById(
"contadorDados"
);



if(contador){

contador.innerHTML =
`
Premmia: ${dadosPremmia.length}
|
Interno: ${dadosInterno.length}
`;

}


}



console.log(
"leituraExcel.js completo carregado"
);
