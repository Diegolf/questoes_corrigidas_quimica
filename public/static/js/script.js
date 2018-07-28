$(document).ready(function(){

	/* LIST TODO

		- Estruturar as demais perguntas
		- -> Fazer a paginação das perguntas
			* Separar a função de mudar classe, para deixar os dados lidos como globais e criar uma função única para mudar
			* Criar a função dos botões de paginação
		- Adicionar o valor e a classe aos demais botões de temas
		- Adicionar os devidos créditos
		- Revisão visual (fontes, )
		- Procurar por um host gratuito para hospedar
		 
	*/

	let TEMPO_ESPERA = 15000;
	let tempo_atual = TEMPO_ESPERA/1000;
	let local = window.location.href.split('8000')[0]+'8000/';
	let temaAt = {} // Tema atualmente selecionado
	let questaoAt = 0;
	let idTimeOut = 0;
	
	let questao = '<div class="w3-card w3-padding w3-white w3-margin-bottom">'+
      '<h4>#ENUNCIADO</h4>'+

      '<p><input class="w3-radio" type="radio" name="questao" value="a">'+
      '<label><Strong>a)</Strong> #LETRA_A</label></p>'+

      '<p><input class="w3-radio" type="radio" name="questao" value="b">'+
      '<label><Strong>b)</Strong> #LETRA_B</label></p>'+

      '<p><input class="w3-radio" type="radio" name="questao" value="c">'+
      '<label><Strong>c)</Strong> #LETRA_C</label></p>'+

      '<p><input class="w3-radio" type="radio" name="questao" value="d">'+
      '<label><Strong>d)</Strong> #LETRA_D</label></p>'+

      '<p><input class="w3-radio" type="radio" name="questao" value="e">'+
      '<label><Strong>e)</Strong> #LETRA_E</label></p>'+

      '<div class="w3-panel w3-blue-gray">'+
        '<button class="w3-button mostrar-resposta" disabled><strong>Resposta</strong> <span class="" id="tempo_restante"></span></button>'+
        '<div class="w3-dropdown-content w3-bar-block w3-animate-top w3-blue-gray">'+
          '<p> A resposta correta é a letra <span class="w3-tag w3-white">#LETRA_RESPOSTA</span></p>'+
          '<div class="w3-panel w3-leftbar w3-light-grey">#EXPLICACAO_RESPOSTA</div>'+
        '</div>'+
      '</div>'+
    '</div>'
    let paginacao = '<a href="#" class="w3-button pg">#NUM</a>'

	// Seta o tempo selecionado
	$('#tempo-espera').html(TEMPO_ESPERA/1000);

	function contagem_regressiva(){
		if (tempo_atual <= 0){
			$('.mostrar-resposta').removeAttr("disabled");
			$('#tempo_restante').html('');
			return;
		}
		$('#tempo_restante').html(tempo_atual);
		tempo_atual = tempo_atual -1;

		idTimeOut = setTimeout(contagem_regressiva, 1000);
	}

	//* Pega os dados do servidor
	function muda_tema(tm){
		let tema = tm.attr('value');
		$.ajax({
			url: local+'teste',
			// Corrigir erro de parse no firefox
			beforeSend: function(xhr){
    			if (xhr.overrideMimeType){
      				xhr.overrideMimeType("application/json");
    			}
  			},
			success: function (d) {
				let dados = d;
				if (dados.erro){
					alert('Ocorreu algum erro na leitura do arquivo.');
					tm.addClass('desabilitado w3-dark-grey');
					return;
				}
				dados = JSON.parse(dados.data);
				
				// Setar o tema
				$('#tema_s').html(dados['tema']);

				temaAt = dados;

				// Paginação
				let pagi = '<a href="#" class="w3-bar-item w3-button" id="anterior">&laquo;</a>';
				for (x in dados['questoes']){
					pagi = pagi + paginacao.replace('#NUM',parseInt(x)+1);
				}
				pagi = pagi + '<a href="#" class="w3-button" id="proximo">&raquo;</a>';
				$('#paginacao').html(pagi);

				$('#anterior').click(function(){seleciona_questao(questaoAt-1)});
				$('#proximo').click(function(){seleciona_questao(questaoAt+1)});

				$('.pg').click(function(){
					seleciona_questao($(this).html());
				});
				
				$('.muda_tema').removeClass('w3-blue');
				tm.addClass('w3-blue');
				seleciona_questao(1);
				
			},
			error: function (e) {
				console.log(e);
				tm.attr('disabled');
			},
			type: 'POST',
			data: JSON.stringify({'dados':tema}),
			contentType: 'application/json;charset=UTF-8',
			cache: false,
			processData: false
		});
	};

	function seleciona_questao(numero){
		let num = parseInt(numero)-1;
		if(num == -1){
			num = temaAt['questoes'].length - 1; 
		}else if (num == temaAt['questoes'].length){
			num = 0;
		}
		
		if (typeof temaAt['questoes'][num] === 'undefined'){
			$('.pg:eq('+num+')').addClass('desabilitado w3-dark-grey');
			alert('Não foi possível mudar para a questão '+(num+1));
			return;
		}
		let qst = questao.replace('#ENUNCIADO',temaAt['questoes'][num]['enunciado']);
		qst = qst.replace('#LETRA_A',temaAt['questoes'][num]['a']);
		qst = qst.replace('#LETRA_B',temaAt['questoes'][num]['b']);
		qst = qst.replace('#LETRA_C',temaAt['questoes'][num]['c']);
		qst = qst.replace('#LETRA_D',temaAt['questoes'][num]['d']);
		qst = qst.replace('#LETRA_E',temaAt['questoes'][num]['e']);
		qst = qst.replace('#LETRA_RESPOSTA',temaAt['questoes'][num]['letra_resposta']);
		qst = qst.replace('#EXPLICACAO_RESPOSTA',temaAt['questoes'][num]['explicacao_resposta']);
		$('#questoes').html(qst);

		// Insere a função de mostrar a resposta ao botão
		$('.mostrar-resposta').click(function mostrarResposta() {
		   	$(this).next().toggleClass('w3-show');
		});

		// TODO cor da paginação
		$('.pg').removeClass('w3-green');
		$('.pg:eq('+num+')').toggleClass('w3-green');

		questaoAt = num+1;

		// Termina a execução do TimeOut caso tenha alguma
		window.clearTimeout(idTimeOut);

		// (Re)Inicia a contagem regressiva 
		tempo_atual = TEMPO_ESPERA/1000;
		idTimeOut = setTimeout(contagem_regressiva, 1000);			
	}

	$('.muda_tema').click(function(){
		muda_tema($(this));
	});

	muda_tema($('.muda_tema[value="introducao_quimica.js"]'));

});

// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
    if (mySidebar.style.display === 'block') {
        mySidebar.style.display = 'none';
        overlayBg.style.display = "none";
    } else {
        mySidebar.style.display = 'block';
        overlayBg.style.display = "block";
    }
}

// Close the sidebar with the close button
function w3_close() {
    mySidebar.style.display = "none";
    overlayBg.style.display = "none";
}