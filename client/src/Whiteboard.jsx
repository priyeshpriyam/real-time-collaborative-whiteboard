import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const Whiteboard = ({ room }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    const drawLine = (x0, y0, x1, y1, drawColor, size) => {
        const context = canvasRef.current.getContext('2d');
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = drawColor;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.stroke();
        context.closePath();
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleClearCanvas = () => {
        clearCanvas();
        socket.emit('clearCanvas', { room });
    };

    useEffect(() => {
        socket.emit('joinRoom', room);

        const context = canvasRef.current.getContext('2d');
        context.lineCap = 'round';

        socket.on('drawing', (data) => {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.brushSize);
        });

        socket.on('clearCanvas', () => {
            clearCanvas();
        });

        return () => {
            socket.off('drawing');
            socket.off('clearCanvas');
        };
    }, [room]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setLastPosition({ x: offsetX, y: offsetY });
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        
        const { offsetX, offsetY } = nativeEvent;
        
        const lineData = {
            x0: lastPosition.x,
            y0: lastPosition.y,
            x1: offsetX,
            y1: offsetY,
            color: color,
            brushSize: brushSize,
        };
        
        drawLine(lineData.x0, lineData.y0, lineData.x1, lineData.y1, lineData.color, lineData.brushSize);
        socket.emit('drawing', { ...lineData, room });
        setLastPosition({ x: offsetX, y: offsetY });
    };

    return (
        <div>
            <h2>Room: {room}</h2>
            <label htmlFor="color">Color: </label>
            <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />
            <label htmlFor="brushSize"> Brush Size: </label>
            <input
                type="range"
                id="brushSize"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
            />
            <button onClick={handleClearCanvas} style={{ marginLeft: '10px' }}>Clear Canvas</button>

            <canvas
                ref={canvasRef}
                width={window.innerWidth * 0.8}
                height={window.innerHeight * 0.8}
                style={{ border: '1px solid black', marginTop: '10px' }}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing}
                onMouseMove={draw}
            />
        </div>
    );
};

export default Whiteboard;