# Pong Multiplayer Game

Este é um jogo PONG multiplayer desenvolvido utilizando JavaScript, HTML, CSS, Node.js e Socket.IO.

## Descrição

Este jogo implementa o clássico PONG em uma versão multiplayer, onde dois jogadores podem competir entre si. Cada jogador controla uma raquete e o objetivo é rebater a bola para marcar pontos no oponente.

## Demonstração

<img src="/assets//demo/20240307_011928-5.gif"  alt="Demonstração do Jogo"  width="80%" height="auto"/>

## Funcionalidades

- Criação de Salas: Os jogadores podem criar salas para jogar, gerando um ID único para cada sala criada.
- Join de Salas: Os jogadores podem ingressar em salas existentes através do ID da sala.
- Controle de Raquete: Cada jogador pode controlar sua raquete utilizando as teclas "w" para mover para cima e "s" para mover para baixo.
- Pontuação e Velocidade: O jogo acompanha a pontuação de cada jogador e aumenta a velocidade da bola à medida que a partida progride.
- Fim de Jogo: O jogo termina quando a bola ultrapassa as raquetes de um dos jogadores, exibindo a pontuação final e reiniciando a partida.

## Instalação e Execução

Clone este repositório em seu ambiente local.
Instale as dependências utilizando npm install.
Inicie o servidor utilizando node express.
Acesse o jogo através de um navegador web, acessando o endereço local.

## Tecnologias Utilizadas

Express.js: Utilizado para a criação do servidor web.
Socket.IO: Biblioteca para comunicação em tempo real entre servidor e cliente.
HTML/CSS/JavaScript: Utilizados para a estrutura, estilo e interatividade do jogo.
Node.js: Ambiente de execução do código JavaScript no lado do servidor.

## Atualizações
- [x] Versão 1.0 - Implementação básica do jogo com funcionalidades de criar e unir salas.
- [x] Versão 1.1 - Estilização, correção de bugs e adição de mensagens de erro.
- [x] Versão 1.2 - Implementação de velocidade relativa dos raquetas com a barra de score.
- [ ] Versão 2.0 - Implementação de AI para o oponente humano, tornando o jogo mais desafiador.
- [ ] Versão x.x - XXXXXXX

## Autor

Desenvolvido por Simon S. Lopes.

## Licença

Este projeto está sob a licença **MIT**.