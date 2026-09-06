import React from 'react';
import { Board as BoardType, Move, Position, Side } from '../types/chess';
import { FILES, findKing, isInCheck, samePosition } from '../lib/chess/chessRules';
import { Square } from './Square';

interface BoardProps {
  board: BoardType;
  turn: Side;
  selected: Position | null;
  selectedMoves: Position[];
  lastMove: Move | null;
  hint: { from: Position; to: Position } | null;
  boardFlipped: boolean;
  showCoordinates: boolean;
  isThinking: boolean;
  isInteractable: boolean;
  onSquareClick: (position: Position) => void;
}

export const Board: React.FC<BoardProps> = React.memo(
  ({
    board,
    turn,
    selected,
    selectedMoves,
    lastMove,
    hint,
    boardFlipped,
    showCoordinates,
    isThinking,
    isInteractable,
    onSquareClick,
  }) => {
    const ranks = boardFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const files = boardFlipped ? [...FILES].reverse() : FILES;

    const rowIndices = boardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colIndices = boardFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    const whiteKingPos = findKing(board, 'white');
    const blackKingPos = findKing(board, 'black');
    const whiteInCheck = isInCheck(board, 'white');
    const blackInCheck = isInCheck(board, 'black');

    return (
      <div className="relative w-full max-w-[500px] mx-auto select-none rounded-xl overflow-hidden shadow-2xl bg-[#2E241E] p-2 sm:p-3 border-4 border-[#3D3028]">
        {/* Ranks on left */}
        <div className="relative grid grid-cols-8 grid-rows-8 w-full aspect-square rounded-lg overflow-hidden border border-[#534237]">
          {rowIndices.map((r, rowIdx) =>
            colIndices.map((c, colIdx) => {
              const position: Position = { row: r, col: c };
              const piece = board[r][c];
              const isDark = (r + c) % 2 === 1;
              const isSelected = samePosition(selected, position);
              const isLegal = selectedMoves.some((m) => samePosition(m, position));
              const isLast =
                (lastMove && samePosition(lastMove.from, position)) ||
                (lastMove && samePosition(lastMove.to, position)) ||
                false;
              const isHintFrom = hint ? samePosition(hint.from, position) : false;
              const isHintTo = hint ? samePosition(hint.to, position) : false;

              const isKingInCheck =
                (whiteInCheck && samePosition(whiteKingPos, position)) ||
                (blackInCheck && samePosition(blackKingPos, position));

              return (
                <div key={`${r}-${c}`} className="relative aspect-square">
                  <Square
                    position={position}
                    piece={piece}
                    isDark={isDark}
                    isSelected={isSelected}
                    isLegalTarget={isLegal}
                    isLastMove={isLast}
                    isHintFrom={isHintFrom}
                    isHintTo={isHintTo}
                    isInCheckKing={isKingInCheck}
                    disabled={!isInteractable || isThinking}
                    onClick={() => onSquareClick(position)}
                  />

                  {/* Coordinates overlay inside border squares */}
                  {showCoordinates && (
                    <>
                      {/* Rank label on left edge */}
                      {colIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none select-none ${
                            isDark ? 'text-[#F0D9B5]' : 'text-[#B58863]'
                          }`}
                        >
                          {ranks[rowIdx]}
                        </span>
                      )}
                      {/* File label on bottom edge */}
                      {rowIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none select-none ${
                            isDark ? 'text-[#F0D9B5]' : 'text-[#B58863]'
                          }`}
                        >
                          {files[colIdx]}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    );
  },
);
