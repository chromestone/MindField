const GRID_X = 15;
const GRID_Y = 9;

const bEMPTY = 0;
const bVISITED = 1;
const bBOMB = 2;
const bCURRENT = 3;
const bFINISH = 4;
const bEXPLODED = 5;

// Constructor
function Foo() {
  // always initialize all instance properties
  this.Board = null;//new Array(GRID_X);
  this.UserMark = null;//new Array(GRID_X); /* User marks; 0 = none, 'M' = mine */
  //this.AdjacencyGroup = new Array(GRID_X);
  //for (let i = 0; i < GRID_X; i++) {
  //  this.Board[i] = new Array(GRID_Y);
  //  this.UserMark[i] = new Array(GRID_Y);
    //this.AdjacencyGroup[i] = new Array(GRID_Y);
  //}
  //this.nNumMines = 25;//TODO change this
  this.UserX = 0;
  this.UserY = 0;
  this.MineCount = 0;
}
// class methods
Foo.prototype.CountMines = function() {//x, y) {
  //let nCount = 0;
  this.MineCount = 0;
  for (let i = -1; i<=1; i++) {
    for (let j = -1; j<=1; j++) {
      if ((this.UserX+i >= 0) && (this.UserY+i < GRID_X) &&
          (this.UserY+j >= 0) && (this.UserY+j < GRID_Y)) {
        if ((this.Board[this.UserX+i][this.UserY+j] == bBOMB) ||
            (this.Board[this.UserX+i][this.UserY+j] == bEXPLODED)) {
          this.MineCount++;
        }
      }
    }
  }
  return this.MineCount;
};

Foo.prototype.SetUpBoard = function(nNumMines) {

  // always initialize all instance properties
  this.Board = new Array(GRID_X);
  this.UserMark = new Array(GRID_X); /* User marks; 0 = none, 'M' = mine */

  /** next, clear out board & user scratchpad **/
  for (let i=0; i<GRID_X; i++) {
    this.Board[i] = new Array(GRID_Y);
    this.UserMark[i] = new Array(GRID_Y);
    for (let j=0; j<GRID_Y; j++) {
      this.Board[i][j] = 0;
      this.UserMark[i][j] = 0;
      //this.AdjacencyGroup[i][j] = new Group();
    }
  }

  for (let nMines=0; nMines<nNumMines; nMines++) {
    let bDone = false;
    let i;
    let j;
    while (!bDone) {
      i = Math.floor(Math.random() * GRID_X);
      j = Math.floor(Math.random() * GRID_Y);
      if ((this.Board[i][j] == bEMPTY) &&
          (!((i <= 1) && (j <= 1))) &&
          (!((i >= GRID_X - 2) && (j >= GRID_Y - 2)))
         ) {
        bDone = true;
      }
    }
    this.Board[i][j] = bBOMB;
  }

  /* Set user at position 0, 0 */
  this.UserX = 0;
  this.UserY = 0;
  this.Board[0][0] = bCURRENT;
  /* Set finish (hq) at position GRID_X, GRID_Y */
  this.Board[GRID_X - 1][GRID_Y - 1] = bFINISH;
};

Foo.prototype.Travel = function(dx, dy) {
  let bAbort = -1;               /* TRUE if user won or lost (abort game) */

  const NewX = this.UserX + dx;
  const NewY = this.UserY + dy;
  let bInvalid = false; /* TRUE if trying to walk off board      */
  let bBombWalk = false; /* TRUE if user tried to walk on a bomb  */
  if ((NewX < 0) || (NewX >= GRID_X)) {
    bInvalid = true;
  }
  if ((NewY < 0) || (NewY >= GRID_Y)) {
    bInvalid = true;
  }
  if ((!bInvalid) && (this.UserMark[NewX][NewY] == 'M')) {
    bInvalid = true;
    bBombWalk = true;
  }
  if (bInvalid) {
    //printf("** INVALID MOVE ** ... press any key...");
    if (bBombWalk) {
      //printf("(You must un-mark it.)");
      bAbort = 0;
    }
    else {
      bAbort = 1;
    }
  } else {
    if (this.Board[NewX][NewY] == bBOMB) {
      bAbort = 2;
      this.Board[this.UserX][this.UserY] = bVISITED;
      this.Board[NewX][NewY] = bEXPLODED;
      //printf("******** YOU HAVE STEPPED ON A BOMB!! ********");
    } else {
      if ((NewX == GRID_X-1) && (NewY == GRID_Y-1)) {
        bAbort = 3;
        this.Board[this.UserX][this.UserY] = bVISITED;
        this.Board[NewX][NewY] = bCURRENT;
        //printf("************* YOU HAVE WON!! *************");
      } else {
        //nothing happens
        bAbort = 4;
       this. Board[this.UserX][this.UserY] = bVISITED;
        this.UserX = NewX;
        this.UserY = NewY;
        this.Board[this.UserX][this.UserY] = bCURRENT;
      }
    }
  }
  //printf("Number of mines around you: %d", CountMines(UserX, UserY));
  return bAbort;
};

Foo.prototype.PlaceUserMark = function(dx, dy) { 
  const NewX = this.UserX + dx;
  const NewY = this.UserY + dy;
  if ((NewX < 0) || (NewX >= GRID_X) || (NewY < 0) || (NewY >= GRID_Y)) {

    //printf("ERROR: Out of bounds!!");
    return 0;
  } else {
    let Ch;
    if (this.UserMark[NewX][NewY] != 0) {
      Ch = 0;
    } else {
      Ch = 'M';
    }
    this.UserMark[NewX][NewY] = Ch;
    return 1;
  }
};

// export the class
module.exports = Foo;
