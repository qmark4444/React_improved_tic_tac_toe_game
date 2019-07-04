import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

function Square(props){

  return (
    <button className={`${props.winnerStyle} square`} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {

  //if props.winnerSquares is not null and includes i in lines
  renderSquare = (i) =>
    <Square 
      key={i}
      winnerStyle={this.props.winnerSquares && this.props.winnerSquares.includes(i)? 'winner': ''}
      value={this.props.squares[i]}
      onClick={()=>this.props.onClick(i)}
    />

  createBoard() {
    const board = [];
    let num = 0; 
    for(let row = 0; row < 3; row++){
      const boardRow = []; 
      for(let col = 0; col < 3; col++){
        boardRow.push(this.renderSquare(num++));
      }
      board.push(<div className="board-row" key={row}>{boardRow}</div>);
    }
    return board;
  }

  render() {
    return (
      <div>
        {this.createBoard()}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props){
   super(props);
   this.state = {
    history: [{squares: Array(9).fill(null)}]
    , stepNumber: 0
    , xIsNext: true,
   }
  }

  calculateWinner(squares){
    const lines = [
      [0,1,2],
      [0,3,6],
      [0,4,8],
      [1,4,7],
      [2,5,8],
      [2,4,6],
      [3,4,5],
      [6,7,8]
    ]
    for(let i = 0; i < lines.length; i++){
      const [a,b,c] = lines[i];
      if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
        //return squares[a];
        return {winner: squares[a], winnerSquares: lines[i]}
      }
    }
    //return null;
    return {winner: null, winnerSquares: null}
  }

  handleClick(i){ // when click a square, need to start from the pointer "stepNumber" location and truncate rest
  //need to update history and therefore the steps <li>
    var history = this.state.history.slice(0, this.state.stepNumber + 1);

    //Deep clone
    var squares = JSON.parse(JSON.stringify(history[history.length-1].squares));

    if(this.calculateWinner(squares).winner || squares[i]){
      return;
    }

    squares[i] = this.state.xIsNext?'X': 'O' //will this mutate the history.squares? YES if squares reference to the old! 
    //must make squares not reference!!!! need to go back and clone/deep copy

    this.setState({
      history: history.concat([{squares: squares}]) //immuntable, history 
      , stepNumber: history.length
      , xIsNext: !this.state.xIsNext //toggle
    })
  }

  jumpTo(move){ //when click jumpTo, keep the history, don't truncate it. Just update the pointer "stepNumber"
    this.setState({
      stepNumber: move
      , 
      xIsNext: (move % 2 === 0)
    })
  }

  render() {
    let winner = this.calculateWinner(this.state.history[this.state.stepNumber].squares);
    //let status = winner?
    //  'Winner is: ' + winner
    let status = winner.winner?
      'Winner is: ' + winner.winner
      :
      'Next player: ' + (this.state.xIsNext?'X': 'O');

    let moves = this.state.history.map((squares, move)=>{
      return (            
        <li key={move}>
          <button onClick={()=>this.jumpTo(move)}>
            Step number #{move}
          </button>
        </li>                     
      )
    })

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            winnerSquares={winner.winnerSquares}
            squares={this.state.history[this.state.stepNumber].squares}
            onClick={(i)=>this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root') //entry point
);
