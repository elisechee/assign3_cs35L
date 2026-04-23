import * as React from 'react'
import { useState } from 'react'
import * as ReactBootstrap from 'react-bootstrap'

const { Badge, Button, Card } = ReactBootstrap

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

export default function Board() {
  const [xisNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const winner = calculateWinner(squares);
  const [numMovesX, setNumMovesX] = useState(0);
  const [numMovesO, setNumMovesO] = useState(0);

  const [pieceToMove, setPieceToMove] = useState(null);
  //const [destination, setDestination] = useState(null);
  const isMovingPhase = numMovesX >= 3 && numMovesO >= 3; // both players done placing
  const [isValidMove, setIsValidMove] = useState(true);
  const [isFirstClick, setIsFirstClick] = useState(true);  

  const playerOwnsCenter = squares[4] === (xisNext ? "X" : "O");

  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (isMovingPhase) {
    status = (isFirstClick ? "Select a piece to move: " : "Select destination: ") + (xisNext ? "X" : "O") +
      (isValidMove ? "" : " - Invalid move! Try again.");
  } else {
    status = "Next player: " + (xisNext ? "X" : "O");
  }

  function handleClick(i) {
    if (winner) return;

    if (!isMovingPhase) {
      first3Moves(i);
    } else {
      post3Moves(i);
    }
  }

  function first3Moves(i) {
    if (squares[i]) {
      return;
    }

    const nextSquares = squares.slice();
    if (xisNext) {
      nextSquares[i] = "X";
      setNumMovesX(numMovesX + 1);
    } else {
      nextSquares[i] = "O";
      setNumMovesO(numMovesO + 1);
    }
    setSquares(nextSquares);
    setXIsNext(!xisNext);
  }

  function post3Moves(i) {
    // be able to click on a square to change it, but only if there is not already a winner, and the square is not already filled
    // move can be up, down, left, right, or diagonal
    // one move is done by 2 licks, the first click selects the piece to move, and the second click selects the destination. 
    // should correclty detect invalid moves and revert back to the original position if the move is invalid.

    // on first click, set the piece to move, and set isFirstClick to false
    if (isFirstClick) {
      // check if the piece to move is the current player's piece, and if it is not null. If it is, set the piece to move, and set isFirstClick to false. If it is not, return.
      if (squares[i] !== (xisNext ? "X" : "O") || squares[i] === null) {
        console.log("Invalid piece selected");
        return;
      }
      setPieceToMove(i);
      setIsFirstClick(false);
      console.log(`Selected piece at index ${i}`);
      return;
    } else {
      // check if the move is valid, and if it is, update the squares array. if it is not, revert back to the original position. Check if move is valid by checking if the destination is in the valid moves array, which is the piece to move +/- 1, +/- 3, +/- 4, or +/- 2. Also check if the destination is not already occupied by another piece. If the move is valid, update the squares array and set isFirstClick back to true. If the move is not valid, set isValidMove to false, and set a timeout to reset it back to true after 1 second, and set isFirstClick back to true. Also this needs to check if the number of the destination i is between 0 and 8, and if the piece to move is not null. Also check if the piece to move is the same as the current player's piece, and if the destination is not the same as the piece to move.
      
      //calculate valid moves based on pieceToMove
      const validMoves = [];
      const row = Math.floor(pieceToMove / 3);
      const col = pieceToMove % 3;
      
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < 3 && c >= 0 && c < 3) {
            validMoves.push(r * 3 + c);
          }
        }
      }

      if (validMoves.includes(i) && squares[i] === null && squares[pieceToMove] === (xisNext ? "X" : "O") && i !== pieceToMove) {
        const nextSquares = squares.slice();
        nextSquares[i] = squares[pieceToMove];
        nextSquares[pieceToMove] = null;
        
        //block move if player owns center, and their next move doesn't win
        if (playerOwnsCenter && pieceToMove !== 4 && calculateWinner(nextSquares) === null) {
          setIsValidMove(false);
          setTimeout(() => {
            setIsValidMove(true);
            setIsFirstClick(true);
          }, 1000);
          setPieceToMove(null);
          return;
        }

        // else move normally
        setSquares(nextSquares);

        setXIsNext(!xisNext);
        console.log(`Moved from ${pieceToMove} to ${i}`);
        setPieceToMove(null);
        setIsFirstClick(true);
      } else {
        setIsValidMove(false);
        setTimeout(() => {
          console.log("Invalid move! Try again.");
          setIsValidMove(true);
          setIsFirstClick(true);
        }, 1000);
      }

      }
    }


  return (
    <>
      <div className="container py-5">
        <div className="center-text">
          <h1>Chorus Lapilli</h1>
        </div>
        <div className="status">{status}</div>
        {/* <div className="piecestatus">{pieceToMove !== null ? `Current Piece: ${squares[pieceToMove]}` : "No piece selected"}</div> */}
        {/* <div className="validmovestatus">{isValid && destination != null ? `Destination: ${destination}` : "Invalid Move"}</div> */}

        <div className="board-row">
          <Square value={squares[0]} onSquareClick={() => (handleClick(0))} />
          <Square value={squares[1]} onSquareClick={() => (handleClick(1))} />
          <Square value={squares[2]} onSquareClick={() => (handleClick(2))} />
        </div>
        <div className="board-row">
          <Square value={squares[3]} onSquareClick={() => (handleClick(3))} />
          <Square value={squares[4]} onSquareClick={() => (handleClick(4))} />
          <Square value={squares[5]} onSquareClick={() => (handleClick(5))} />
        </div>
        <div className="board-row">
          <Square value={squares[6]} onSquareClick={() => (handleClick(6))} />
          <Square value={squares[7]} onSquareClick={() => (handleClick(7))} />
          <Square value={squares[8]} onSquareClick={() => (handleClick(8))} />
        </div>
      </div>
    </>
  );
}

function calculateWinner(squares) {
  // make an array of all the winning combinations
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // winning rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]            // diagonals
  ];

  // loop through the winning combinations, to see if any of them have been achieved
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; //this for loop checks to see if the squares at the winning combination are all the same, and not null. If they are, it returns the value of that square, which is either "X" or "O"
    }
  }
  return null;
}

// export default function App() {
//   const [name, setName] = React.useState('World')

//   return (
//     <div className="container py-4">
//       <Card className="starter-card shadow-sm">
//         <Card.Body className="p-4">
//           <h1 className="greeting display-6 fw-bold">Hello, {name}!</h1>
//           <p className="mb-3 text-secondary">
//             This starter is set up to match the React Essentials notes more closely.
//             For the assignment, build the tic-tac-toe tutorial in this file and leave
//             mounting to <code>src/main.jsx</code>.
//           </p>
//         </Card.Body>
//       </Card>
//       <Board />
//     </div>
//   )
// }
