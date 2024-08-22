import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import JQUERY from '@salesforce/resourceUrl/jquery';
import CHESSBOARD_JS from '@salesforce/resourceUrl/chessboardjs';
import CHESSBOARD_CSS from '@salesforce/resourceUrl/chessboardcss';
import CHESS_PIECE_IMAGES from '@salesforce/resourceUrl/chesspieceimages';

export default class ChessBoard extends LightningElement {
    board1;
    isChessboardJsInitialized = false;
    jqueryJsLoaded = false;

    async renderedCallback() {
        if (this.isChessboardJsInitialized) {
            return;
        }

        try {
            await this.loadResources();
            this.createBoardElement();
            this.createControlButtons();
            this.initializeChessBoard();

            this.isChessboardJsInitialized = true;
        } catch (error) {
            console.error('Error loading resources or initializing Chessboard:', error);
        }
    }

    async loadResources() {
        try {
            await loadScript(this, JQUERY);
            this.jqueryJsLoaded = true;
            await loadScript(this, CHESSBOARD_JS);
            await loadStyle(this, CHESSBOARD_CSS);
        } catch (error) {
            console.error('Error loading resources', error);
            throw error;
        }
    }

    createBoardElement() {
        const boardContainer = this.template.querySelector('lightning-card');

        if (boardContainer) {
            const boardElement = document.createElement('div');
            boardElement.id = 'board1';
            boardElement.style.width = '600px';
            boardElement.style.height = '600px';
            boardElement.style.margin = '20px auto';
            boardElement.style.border = '1px solid #000';

            boardContainer.appendChild(boardElement);
        } else {
            console.error('Cannot find lightning-card container');
        }
    }

    createControlButtons() {
        const boardContainer = this.template.querySelector('lightning-card');
        
        if (boardContainer) {
            // Create Clear Board Instant Button
            const clearBoardBtn = document.createElement('button');
            clearBoardBtn.id = 'clearBoardInstantBtn';
            clearBoardBtn.innerText = 'Clear Board Instant';
            clearBoardBtn.style.margin = '10px';
            clearBoardBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.clear(false);
                }
            });
            boardContainer.appendChild(clearBoardBtn);

            // Create Start Position Button
            const startPositionBtn = document.createElement('button');
            startPositionBtn.id = 'startPositionBtn';
            startPositionBtn.innerText = 'Start Position';
            startPositionBtn.style.margin = '10px';
            startPositionBtn.addEventListener('click', () => {
                if (this.board1) {
                    this.board1.start();
                }
            });
            boardContainer.appendChild(startPositionBtn);
        } else {
            console.error('Cannot find lightning-card container');
        }
    }

    initializeChessBoard() {
        if (!this.jqueryJsLoaded || typeof Chessboard === 'undefined') {
            console.error('jQuery or Chessboard.js is not available globally');
            return;
        }

        const pieceThemeUrl = `${CHESS_PIECE_IMAGES}/img/chesspieces/wikipedia/{piece}.png`;

        try {
            const boardElement = this.template.querySelector('#board1');
            if (!boardElement) {
                console.error('DOM element #board1 not found');
                return;
            }

            this.board1 = Chessboard(boardElement, {
                position: 'start',
                pieceTheme: pieceThemeUrl,
                draggable: true,
                dropOffBoard: 'snapback',
                sparePieces: false,
                moveSpeed: 'slow',
                snapbackSpeed: 500,
                snapSpeed: 100,
                onDragMove: this.onDragMove,
                onChange: this.onChange

            });

            console.log('Chessboard initialized successfully');
        } catch (error) {
            console.error('Error initializing Chessboard:', error);
        }
    }

     onChange (oldPos, newPos) {
            console.log('Position changed:')
            console.log('Old position: ' + Chessboard.objToFen(oldPos))
            console.log('New position: ' + Chessboard.objToFen(newPos))
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
     }
}
