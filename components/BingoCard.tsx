import { useState, useEffect } from 'react';
import _ from 'lodash';
import professors, { ProfessorName, IProfessor } from '../lib/professors';
import Cell from './BingoCell';
import bingoMachine, { IBingoContext, IBingoEvent } from '../machines/bingo';
import { StateNode } from 'xstate';
import { useMachine } from '@xstate/react';
import classnames from 'classnames';

export interface IBingoCell {
  image?: string;
  marked?: boolean;
  text?: string;
  win?: boolean;
}

interface IBingoCardProps {
  professorName: ProfessorName;
  size?: number;
}

function generateCells(professor: IProfessor, size: number): IBingoCell[] {
  const centerIndex = Math.floor(size / 2) * size + Math.floor(size / 2);
  const ismsCopy = [...professor.isms];
  const randomIsms: IBingoCell[] = [];

  for (let i = 0; i < size ** 2; i++) {
    if (size % 2 === 1 && i === centerIndex) {
      randomIsms.push({
        image: professor.centerImage,
        marked: true,
      });
      continue;
    }

    const randNum = Math.floor(Math.random() * ismsCopy.length);
    const [randIsm] = ismsCopy.splice(randNum, 1);
    randomIsms.push({
      text: randIsm,
    });
  }

  return randomIsms.slice(0, size ** 2);
}

function BingoCard({ professorName, size = 5 }: IBingoCardProps) {
  if (!professorName) {
    return null;
  }

  const professor = professors[professorName];
  const persistedBingoMachine = bingoMachine.withConfig(
    {},
    {
      cells: generateCells(professor, size),
    },
  );
  const [state, send] = useMachine<IBingoContext, IBingoEvent>(
    persistedBingoMachine,
  );

  const onCellClick = (cellIndex: number) => () =>
    send('CLICK', { index: cellIndex });

  return (
    <div className="bingo-table">
      {/* {state.value === 'WINNER' ? <h1>WINNER</h1> : null} */}
      {_.chunk(state.context.cells, 5).map((row, rowIndex) => (
        <div className="flex" key={`row-${rowIndex}`}>
          {row.map((cell, cellIndex) => (
            <Cell
              className={classnames(
                rowIndex === 0 && cellIndex === 0 && 'rounded-tl-1/5',
                rowIndex === 0 && cellIndex === 4 && 'rounded-tr-1/5',
                rowIndex === 4 && cellIndex === 0 && 'rounded-bl-1/5',
                rowIndex === 4 && cellIndex === 4 && 'rounded-br-1/5',
                cellIndex !== 0 ? 'border-l' : 'border-l-2',
                cellIndex !== 4 ? 'border-r' : 'border-r-2',
                rowIndex !== 0 ? 'border-t' : 'border-t-2',
                rowIndex !== 4 ? 'border-b' : 'border-b-2',
                state.value === 'WINNER' && 'cursor-not-allowed',
              )}
              key={`cell-${rowIndex}-${cellIndex}`}
              image={cell.image}
              marked={cell.marked}
              onClick={onCellClick(rowIndex * size + cellIndex)}
              text={cell.text}
              win={cell.win}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default BingoCard;