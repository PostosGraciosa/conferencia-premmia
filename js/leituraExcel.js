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


// DADOS

window.dadosPremmia = [];
window.dadosInterno = [];




// ==========================================
// EVENTOS
// ==========================================


if(arquivoPremmia){

arquivoPremmia.addEventListener("change",function(){

    if(this.files.length){

        nomePremmia.textContent =
        "Arquivo selecionado: " + this.files[0].name;

        lerArquivo(
            this.files[0],
            "PREMMIA"
        );

    }

});

}




if(arquivoInterno){

arquivoInterno.addEventListener("change",function(){

    if(this.files.length){

        nomeInterno.textContent =
        "Arquivo selecionado: " + this.files[0].name;


        lerArquivo(
            this.files[0],
            "INTERNO"
        );

    }

});

}




// ==========================================
// LEITURA EXCEL
// ==========================================


function lerArquivo(file,tipo){


const reader = new FileReader();



reader.onload=function(e){


try{


const dados =
new Uint8Array(e.target.result);



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



if(tipo==="PREMMIA"){


window.dadosPremmia =
transformarPremmia(linhas);


console.log(
"Premmia:",
window.dadosPremmia
);


}



if(tipo==="INTERNO"){


window.dadosInterno =
transformarInterno(linhas);


console.log(
"Interno:",
window.dadosInterno
);


}



atualizarTela();


verificarArquivos();



}
catch(err){

console.error(err);

alert(
"Erro ao abrir planilha " + tipo
);

}



};



reader.readAsArrayBuffer(file);


}





// ==========================================
// LIBERAR BOTÃO
// ==========================================


function verificarArquivos(){


if(!btnConferir)
return;



if(

window.dadosPremmia.length > 0
&&
window.dadosInterno.length > 0

){

btnConferir.disabled=false;

statusSistema.textContent =
"Planilhas carregadas. Clique em conferir vendas.";


}

else{


btnConferir.disabled=true;


}


}




function atualizarTela(){


if(contadorDados){


contadorDados.textContent =

"Premmia: "
+
window.dadosPremmia.length
+
" registros | Interno: "
+
window.dadosInterno.length
+
" registros";


}


}






// ==========================================
// PREMMIA
// ==========================================


function transformarPremmia(linhas){


let lista=[];


linhas.forEach(linha=>{


if(!Array.isArray(linha))
return;



let texto =
linha.map(normalizarTexto).join(" ");



if(

texto.includes("cpf")
||
texto.includes("cliente")
||
texto.includes("autorizacao")

)
return;



let item={


cpf:
limparTexto(linha[0]),


cliente:
limparTexto(linha[1]),


operacao:
limparTexto(linha[2]),


valor:
converterValor(linha[3]),


dataHora:
limparTexto(linha[4]),


data:
extrairData(linha[4]),


hora:
extrairHora(linha[4]),


autorizacao:
limparTexto(linha[5]),


pagamento:
limparTexto(linha[6])

};



if(

item.autorizacao
&&
item.valor!==null

){

lista.push(item);

}


});


return lista;


}






// ==========================================
// INTERNO
// ==========================================


function transformarInterno(linhas){


let lista=[];


linhas.forEach(linha=>{


if(!Array.isArray(linha))
return;



let item={


tipo:
limparTexto(linha[0]),


valor:
converterValor(linha[1]),


hora:
limparTexto(linha[2]),


data:
limparTexto(linha[3]),


operador:
limparTexto(linha[9]),


identificador:
limparTexto(linha[12]),


autorizacao:
limparTexto(linha[13])
||
limparTexto(linha[12])


};



if(

item.autorizacao
&&
item.valor!==null

){

lista.push(item);

}



});


return lista;


}





// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================


function converterValor(valor){


if(valor===null||valor===undefined||valor==="")
return null;



if(typeof valor==="number")
return Number(valor.toFixed(2));



let texto =
String(valor)
.trim()
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





function limparTexto(valor){


if(valor===undefined||valor===null)
return "";


return String(valor)
.trim()
.replace(/\s+/g," ");


}




function normalizarTexto(valor){


return limparTexto(valor)
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"");


}





function extrairData(valor){


let texto=limparTexto(valor);


let r =
texto.match(
/\d{2}\/\d{2}\/\d{4}/
);


return r ? r[0] : texto;


}




function extrairHora(valor){


let texto=limparTexto(valor);


let r =
texto.match(
/\d{2}:\d{2}:\d{2}/
);


return r ? r[0] : "";


}





console.log(
"leituraExcel.js carregado"
);
