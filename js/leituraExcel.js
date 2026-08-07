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
// ARQUIVO PREMMIA
// ==========================================


if(arquivoPremmia){


arquivoPremmia.addEventListener(
"change",
function(){


    const file =
    this.files[0];


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


    const file =
    this.files[0];


    if(!file)
        return;



    nomeInterno.textContent =
    file.name;



    lerInterno(file);



});

}








// ==========================================
// LER EXCEL
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



reader.readAsArrayBuffer(file);


}






// ==========================================
// LER PREMMIA
// ==========================================


function lerPremmia(file){


abrirExcel(
file,
function(linhas){


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



});

}






// ==========================================
// LER INTERNO
// ==========================================


function lerInterno(file){


abrirExcel(
file,
function(linhas){


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



});

}






// ==========================================
// LIBERA BOTÃO
// ==========================================


function verificarArquivos(){


if(
btnConferir &&
dadosPremmia.length > 0 &&
dadosInterno.length > 0
){


btnConferir.disabled =
false;


}


}
// ==========================================
// TRANSFORMAR PREMMIA
// ==========================================


function transformarPremmia(
linhas
){


const registros = [];



linhas.forEach(
(linha,index)=>{



// pula cabeçalho

if(index === 0){

return;

}




if(!linha || linha.length < 8){

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




// CÓDIGO TRANSAÇÃO

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
registro.autorizacao &&
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


    linhas.forEach((linha,index)=>{


        if(!Array.isArray(linha)){
            return;
        }


        // pula cabeçalho

        if(index === 0){
            return;
        }



        const registro = {


            origem:"INTERNO",


            administradora:
                limparTexto(linha[0]),


            valor:
                converterValor(linha[1]),


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
            "Linha interna:",
            registro
        );



        // aceita se tiver autorização

        if(
            registro.autorizacao !== ""
        ){

            registros.push(
                registro
            );

        }



    });


    return registros;

}
// ==========================================
// NORMALIZAR AUTORIZAÇÃO
// ==========================================


function normalizarAutorizacao(
valor
){


if(
valor === null ||
valor === undefined
){

return "";

}




return String(valor)

.trim()

.replace(/\s/g,"")

.replace(".0","")

.toUpperCase();



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



    // remove R$
    texto =
        texto.replace("R$","")
             .trim();



    // formato brasileiro:
    // 1.234,56

    if(
        texto.includes(",")
    ){

        texto =
            texto
            .replace(/\./g,"")
            .replace(",", ".");

    }



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


function limparTexto(
valor
){


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


function extrairData(
valor
){


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


function extrairHora(
valor
){


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
// CONTADOR NA TELA
// ==========================================


function atualizarContador(){


const contador =
document.getElementById(
"contadorDados"
);



if(!contador){

return;

}




contador.innerHTML = `

Premmia:
<strong>${dadosPremmia.length}</strong>
registros

|

Interno:
<strong>${dadosInterno.length}</strong>
registros

`;



}







// ==========================================
// ATUALIZA STATUS
// ==========================================


function atualizarStatus(
texto
){



const status =
document.getElementById(
"statusSistema"
);



if(status){

status.textContent =
texto;

}



}







// ==========================================
// SOBRESCREVE VERIFICAR
// ==========================================


function atualizarTela(){


atualizarContador();



if(
dadosPremmia.length > 0 &&
dadosInterno.length > 0
){


atualizarStatus(
"Planilhas carregadas. Pronto para conferir."
);



if(btnConferir){

btnConferir.disabled =
false;

}



}else{



atualizarStatus(
"Aguardando carregamento das planilhas."
);



if(btnConferir){

btnConferir.disabled =
true;

}



}



}






// ==========================================
// ATUALIZA APÓS LEITURA
// ==========================================


// substitui a função antiga

verificarArquivos =
atualizarTela;







// ==========================================
// DISPONIBILIZA PARA O SISTEMA
// ==========================================


window.dadosPremmia =
dadosPremmia;


window.dadosInterno =
dadosInterno;



console.log(
"leituraExcel.js completo carregado"
);
