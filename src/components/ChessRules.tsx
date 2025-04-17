
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChessRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChessRules: React.FC<ChessRulesProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Regras do Xadrez</DialogTitle>
          <DialogDescription>
            Guia básico das regras e movimentos das peças de xadrez
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="font-bold text-lg mb-2">Objetivo do Jogo</h3>
              <p>O objetivo do xadrez é dar xeque-mate ao rei adversário. Isso acontece quando o rei está ameaçado (em xeque) e não há movimento legal que possa remover a ameaça.</p>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">O Tabuleiro</h3>
              <p>O tabuleiro de xadrez é formado por 64 casas alternadamente claras e escuras, dispostas em 8 linhas e 8 colunas. No início do jogo, as peças são dispostas sempre da mesma maneira.</p>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">Movimentos das Peças</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Peão (♙ ♟)</h4>
                  <ul className="list-disc pl-5">
                    <li>Move-se apenas para frente, uma casa por vez</li>
                    <li>No primeiro movimento, pode avançar duas casas</li>
                    <li>Captura peças em diagonal (uma casa)</li>
                    <li>Pode ser promovido ao atingir a última linha do tabuleiro</li>
                    <li>Possui regra especial: captura "en passant"</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Torre (♖ ♜)</h4>
                  <ul className="list-disc pl-5">
                    <li>Move-se em linhas retas - horizontais e verticais</li>
                    <li>Pode se mover quantas casas quiser até encontrar obstáculo</li>
                    <li>Participa do movimento especial chamado "roque"</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Cavalo (♘ ♞)</h4>
                  <ul className="list-disc pl-5">
                    <li>Move-se em forma de "L": duas casas em uma direção e uma casa em direção perpendicular</li>
                    <li>Única peça que pode "pular" outras peças</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Bispo (♗ ♝)</h4>
                  <ul className="list-disc pl-5">
                    <li>Move-se em diagonais</li>
                    <li>Pode se mover quantas casas quiser até encontrar obstáculo</li>
                    <li>Permanece sempre nas casas da mesma cor</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Rainha (♕ ♛)</h4>
                  <ul className="list-disc pl-5">
                    <li>Combina os movimentos da torre e do bispo</li>
                    <li>Move-se em linhas retas (horizontais, verticais e diagonais)</li>
                    <li>Peça mais poderosa do jogo</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Rei (♔ ♚)</h4>
                  <ul className="list-disc pl-5">
                    <li>Move-se uma casa em qualquer direção</li>
                    <li>Não pode se mover para uma casa ameaçada</li>
                    <li>Participa do movimento especial chamado "roque"</li>
                  </ul>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">Regras Especiais</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Roque</h4>
                  <p>Movimento especial que envolve o rei e uma torre. O rei move-se duas casas em direção à torre, e a torre salta sobre o rei, posicionando-se ao seu lado. Só pode ser realizado se:</p>
                  <ul className="list-disc pl-5">
                    <li>Nem o rei nem a torre tenham sido movidos antes</li>
                    <li>Não houver peças entre o rei e a torre</li>
                    <li>O rei não estiver em xeque</li>
                    <li>O rei não passar por casas ameaçadas</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">En Passant</h4>
                  <p>Quando um peão avança duas casas a partir de sua posição inicial e para ao lado de um peão adversário, este pode capturá-lo como se o peão tivesse avançado apenas uma casa. Esta captura só pode ser feita imediatamente após o movimento do peão.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Promoção</h4>
                  <p>Quando um peão alcança a última fileira do tabuleiro, ele é promovido e deve ser substituído por uma rainha, torre, bispo ou cavalo da mesma cor, à escolha do jogador.</p>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">Fim do Jogo</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Xeque-mate</h4>
                  <p>Ocorre quando o rei está em xeque e não há movimento legal para escapar da ameaça. O jogador que dá xeque-mate vence a partida.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Empate</h4>
                  <p>A partida pode terminar em empate em vários casos:</p>
                  <ul className="list-disc pl-5">
                    <li>Rei afogado: quando um jogador não tem movimentos legais e seu rei não está em xeque</li>
                    <li>Insuficiência material: quando não há material suficiente para dar xeque-mate</li>
                    <li>Regra dos 50 movimentos: após 50 movimentos sem captura ou movimento de peão</li>
                    <li>Repetição tripla: quando a mesma posição ocorre três vezes</li>
                    <li>Acordo mútuo entre jogadores</li>
                  </ul>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="font-bold text-lg mb-2">Notação de Xadrez</h3>
              <p>Para registrar movimentos, cada casa tem uma coordenada composta por uma letra (a-h) indicando a coluna e um número (1-8) indicando a linha. Exemplos:</p>
              <ul className="list-disc pl-5">
                <li>e4: peão move para a casa e4</li>
                <li>Cf3: cavalo move para f3</li>
                <li>O-O: roque pequeno (kingside)</li>
                <li>O-O-O: roque grande (queenside)</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChessRules;
