// ==========================================
// CONFERÊNCIA PREMMIA
// leituraExcel.js
// Leitura das planilhas Excel / CSV
// ==========================================


// ==========================================
// ELEMENTOS
// ==========================================

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
// DADOS GLOBAIS
// ==========================================

let dadosPremmia = [];

let dadosInterno = [];



// ==========================================
// EVENTO ARQUIVO PREMMIA
// ==========================================

if(arquivoPremmia){


    arquivoPremmia.addEventListener(
        "change",
        function(){


            if(this.files.length){


                nomePremmia.textContent =
                    "Arquivo selecionado: " +
                    this.files[0].name;


                nomePremmia.style.color =
                    "#006b3c";


                lerArquivoPremmia(
                    this.files[0]
                );


            }


            verificarArquivos();


        }
    );


}




// ==========================================
// EVENTO ARQUIVO INTERNO
// ==========================================


if(arquivoInterno){


    arquivoInterno.addEventListener(
        "change",
        function(){


            if(this.files.length){


                nomeInterno.textContent =
                    "Arquivo selecionado: " +
                    this.files[0].name;


                nomeInterno.style.color =
                    "#006b3c";


                lerArquivoInterno(
                    this.files[0]
                );


            }


            verificarArquivos();


        }
    );


}




// ==========================================
// VERIFICAR ARQUIVOS
// ==========================================


function verificarArquivos(){


    if(!btnConferir)
        return;



    if(
        arquivoPremmia &&
        arquivoInterno &&
        arquivoPremmia.files.length > 0 &&
        arquivoInterno.files.length > 0 &&
        dadosPremmia.length > 0 &&
        dadosInterno.length > 0
    ){


        btnConferir.disabled = false;


    }else{


        btnConferir.disabled = true;


    }


    atualizarContador();


}




// ==========================================
// LER PREMMIA
// ==========================================


function lerArquivoPremmia(file){


    const reader =
        new FileReader();



    reader.onload =
    function(e){


        try{


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
        catch(err){


            console.error(err);


            alert(
                "Erro ao carregar Portal Premmia."
            );


        }



    };



    reader.readAsArrayBuffer(file);


}




// ==========================================
// LER SISTEMA INTERNO
// ==========================================


function lerArquivoInterno(file){


    const reader =
        new FileReader();



    reader.onload =
    function(e){


        try{


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
        catch(err){


            console.error(err);


            alert(
                "Erro ao carregar sistema interno."
            );


        }



    };



    reader.readAsArrayBuffer(file);


}
// ==========================================
// TRANSFORMAR PORTAL PREMMIA
// ==========================================

function transformarPremmia(linhas){


    const registros = [];


    let cabecalho = -1;



    linhas.forEach(
        (linha,index)=>{


            const texto =
                linha
                .map(normalizarTexto)
                .join(" ");



            if(
                texto.includes("cpf") &&
                texto.includes("nome") &&
                texto.includes("codigo transacao")
            ){

                cabecalho = index;

            }


        }
    );



    if(cabecalho === -1){

        console.log(
            "Cabeçalho Premmia não localizado"
        );

        return [];

    }



    const header =
        linhas[cabecalho];



    let cpf = -1;
    let nome = -1;
    let produto = -1;
    let valor = -1;
    let data = -1;
    let codigo = -1;
    let pagamento = -1;
    let status = -1;



    header.forEach(
        (item,index)=>{


            const h =
                normalizarTexto(item);



            if(h==="cpf")
                cpf=index;



            if(h==="nome")
                nome=index;



            if(h.includes("produto"))
                produto=index;



            if(
                h.includes("valor liquido")
            )
                valor=index;



            if(
                h.includes("data/hora") ||
                h.includes("data hora")
            )
                data=index;



            if(
                h.includes("codigo transacao")
            )
                codigo=index;



            if(
                h.includes("forma de pagamento")
            )
                pagamento=index;



            if(h==="status")
                status=index;


        }
    );





    for(
        let i=cabecalho+1;
        i<linhas.length;
        i++
    ){


        const linha =
            linhas[i];



        if(!linha)
            continue;



        const registro = {


            origem:"PREMMIA",



            cpf:
                limparTexto(
                    linha[cpf]
                ),



            cliente:
                limparTexto(
                    linha[nome]
                ),



            operacao:
                limparTexto(
                    linha[produto]
                ),



            valor:
                converterValor(
                    linha[valor]
                ),



            dataHora:
                limparTexto(
                    linha[data]
                ),



            data:
                extrairData(
                    linha[data]
                ),



            hora:
                extrairHora(
                    linha[data]
                ),



            autorizacao:
                limparTexto(
                    linha[codigo]
                ),



            pagamento:
                limparTexto(
                    linha[pagamento]
                ),



            status:
                limparTexto(
                    linha[status]
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



    return registros;


}






// ==========================================
// TRANSFORMAR SISTEMA INTERNO
// ==========================================


function transformarInterno(linhas){



    const registros = [];



    let cabecalho = -1;



    linhas.forEach(
        (linha,index)=>{


            const texto =
                linha
                .map(normalizarTexto)
                .join(" ");



            if(
                texto.includes("administradora") &&
                texto.includes("autorizacao")
            ){

                cabecalho=index;

            }


        }
    );



    if(cabecalho===-1){

        console.log(
            "Cabeçalho interno não encontrado"
        );

        return [];

    }




    const header =
        linhas[cabecalho];



    let valor=-1;
    let horario=-1;
    let movimento=-1;
    let funcionario=-1;
    let autorizacao=-1;



    header.forEach(
        (item,index)=>{


            const h =
                normalizarTexto(item);



            if(h==="valor")
                valor=index;



            if(
                h.includes("horario")
            )
                horario=index;



            if(
                h.includes("movimento") ||
                h.includes("data fiscal")
            )
                movimento=index;



            if(
                h.includes("funcionario")
            )
                funcionario=index;



            if(
                h.includes("autorizacao")
            )
                autorizacao=index;



        }
    );





    for(
        let i=cabecalho+1;
        i<linhas.length;
        i++
    ){


        const linha =
            linhas[i];



        if(!linha)
            continue;



        const registro = {


            origem:"INTERNO",



            valor:
                converterValor(
                    linha[valor]
                ),



            hora:
                limparTexto(
                    linha[horario]
                ),



            data:
                limparTexto(
                    linha[movimento]
                ),



            operador:
                limparTexto(
                    linha[funcionario]
                ),



            autorizacao:
                limparTexto(
                    linha[autorizacao]
                ),



            tipo:
                limparTexto(
                    linha[0]
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



    return registros;


}






// ==========================================
// CONTADOR NA TELA
// ==========================================

function atualizarContador(){


    const contador =
        document.getElementById(
            "contadorDados"
        );


    if(contador){


        contador.innerHTML =

        `
        Premmia: ${dadosPremmia.length} registros 
        | 
        Interno: ${dadosInterno.length} registros
        `;


    }


}







// ==========================================
// CONVERTER VALOR
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
        .replace(",","."); 



    const numero =
        Number(texto);



    if(isNaN(numero))
        return null;



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
    )
        return "";



    return String(valor)
        .trim()
        .replace(/\s+/g," ");


}






// ==========================================
// NORMALIZAR TEXTO
// ==========================================


function normalizarTexto(valor){


    return limparTexto(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    );


}






// ==========================================
// DATA
// ==========================================


function extrairData(valor){


    const texto =
        limparTexto(valor);



    const resultado =
        texto.match(
            /\d{2}\/\d{2}\/\d{4}/
        );



    return resultado
        ? resultado[0]
        : texto;


}






// ==========================================
// HORA
// ==========================================


function extrairHora(valor){


    const texto =
        limparTexto(valor);



    const resultado =
        texto.match(
            /\d{2}:\d{2}:\d{2}/
        );



    return resultado
        ? resultado[0]
        : "";


}





console.log(
    "leituraExcel.js completo carregado"
);
