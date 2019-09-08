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
  renderSquare = (r,c) =>
    <Square 
      key={`${r}-${c}`}
      winnerStyle={this.props.winnerSquares && this.props.winnerSquares.find(sq => sq[0] === r && sq[1] === c)? 'winner': ''}
      value={this.props.squares[r][c]}
      onClick={()=>this.props.onClick(r,c)}
    />

  createBoard(w,h) {
    const board = [];
    for(let row = 0; row < h; row++){
      const boardRow = []; 
      for(let col = 0; col < w; col++){
        boardRow.push(this.renderSquare(row, col));
      }
      board.push(<div className="board-row" key={row}>{boardRow}</div>);
    }
    return board;
  }

  render() {
    return (
      <div>
        {this.createBoard(this.props.height,this.props.width)}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props){
   super(props);
   this.state = {
    history: [{squares: Array(props.height).fill(Array(props.width).fill(null))}]
    , stepNumber: 0
    , xIsNext: true,
   }
  }

  winnerSquares(squares, r, c, target, line){
    let winning = true;
    let winnerSquares = [];
    for(let i = 0; i < target; i++){
      let ri = r+i*line[0];
      let ci = c+i*line[1];
      let square = squares[ri]? squares[ri][ci] : null;
      if(!square) return null;      
      winning &= squares[r][c] === square;
      if(winning){
        winnerSquares.push([ri, ci]);
      }
      else{
        return null;
      }
    }
    return winnerSquares.length? winnerSquares: null;
  }

  calculateWinner(squares, target){
    const lines = [[1,0], [0,1], [1,1], [1,-1]]; //[vertical, horizontal, right diagonal, left diagonal]
    for(let r = 0; r < this.props.height; r++){
      for(let c = 0; c < this.props.width; c++){
        for(let n = 0; n < lines.length; n++){
          if(this.winnerSquares(squares, r, c, target, lines[n])){
            return {winner: squares[r][c], winnerSquares: this.winnerSquares(squares, r, c, target, lines[n])}
          }
        }
      }
    }
    return {winner: null, winnerSquares: null}
  }

  handleClick(r,c){ // when click a square, need to start from the pointer "stepNumber" location and truncate rest
  //need to update history and therefore the steps <li>
    var history = this.state.history.slice(0, this.state.stepNumber + 1);

    //Deep clone
    var squares = JSON.parse(JSON.stringify(history[history.length-1].squares));

    if(this.calculateWinner(squares, this.props.target).winner || squares[r][c]){
      return;
    }

    squares[r][c] = this.state.xIsNext?'X': 'O' 
    // squares[i] = this.state.xIsNext?'X': 'O' 

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
    let winner = this.calculateWinner(this.state.history[this.state.stepNumber].squares, this.props.target);
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
            onClick={(r,c)=>this.handleClick(r,c)}
            height={this.props.height}
            width={this.props.width}
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
  <Game target={4} height={6} width={6}/>,
  document.getElementById('root') 
);
