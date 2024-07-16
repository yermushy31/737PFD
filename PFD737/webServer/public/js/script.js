const horizonImage = document.getElementById('horizonImage');


function getData() {
    noData = true;

    const serverAddress = 'ws://192.168.0.103:8080';
    
    // Create a WebSocket instance
    const ws = new WebSocket(serverAddress);
    
    // WebSocket event listeners
    ws.onopen = function() {
        console.log('Connected to WebSocket server');
    };
  
    ws.onmessage = function(event) {
        try {
           
            const data = JSON.parse(event.data);
            speedIndicator.leftSpeed(data.Airspeed, 600, 20);
            markSpeed.speedMarker(data.Airspeed, 600);
            horizon.drawHorizon(-data.Pitch*1.7, -data.Roll);
            altitudeMarker.altitudeMarker(data.Altitude, 90000);
            altitudeIndicator.rightAltitude(data.Altitude, 90000, 100);
            noData = false;

        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    
    ws.onclose = function() {
        console.log('Disconnected from WebSocket server');

        // Reconnect to the WebSocket server
        setTimeout(() => {
            getData();
        }, 3000);
    };
    
    ws.onerror = function(error) {
        console.error('WebSocket error:', error.message);
    };

    if(noData) {
        speedIndicator.leftSpeed(0, 600, 20);
        markSpeed.speedMarker(0, 600);
        horizon.drawHorizon(0, 0);
        altitudeMarker.altitudeMarker(0, 90000);
        altitudeIndicator.rightAltitude(0, 90000, 200);
}
}

class CanvasIndicator {
    #canvas;
    #context;
    #backgroundColor;
    #textColor;
    #font;

    constructor(target, backgroundColor, textColor, font) {
        this.#canvas = target;
        this.#context = target.getContext("2d");
        this.#backgroundColor = backgroundColor;
        this.#textColor = textColor;
        this.#font = font;
    }



    rightAltitude(value, range, graduation) {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height); // Clear the canvas for the new frame
        this.#context.fillStyle = this.#backgroundColor;
        this.#context.fillRect(0, 0, this.#canvas.width*1, this.#canvas.height);
       
 
        this.#context.fillStyle = this.#textColor;
        this.#context.font = this.#font;
    
        const spacing = this.#canvas.height / (range * 0.4 / graduation); // Adjust spacing based on range and graduation
        const centerY = this.#canvas.height / 2.1 + (value % graduation) * (spacing / graduation); // Center based on value
    
        let startValue = 0;
        let endValue = range;
    
        for (let i = startValue; i <= endValue; i += graduation) {
            const yPos = centerY - ((i - value) * spacing) / 2;
            
                this.#context.fillText(i, 20, yPos);             
                this.#context.strokeStyle = this.#textColor;
                this.#context.lineWidth = 2;
                this.#context.beginPath();
                this.#context.moveTo(this.#canvas.width * 0.1, yPos);
                this.#context.lineTo(this.#canvas.width * 0, yPos );
                this.#context.stroke();
            
        }
    }


    leftSpeed(value, range, graduation) {
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height); // Clear the canvas for the new frame
        this.#context.fillStyle = this.#backgroundColor;
        this.#context.fillRect(0, 0, this.#canvas.width*1, this.#canvas.height);
       
        this.#context.beginPath();
        this.#context.moveTo(this.#canvas.width*0.7, 0);
        this.#context.lineTo(this.#canvas.width, 0);
        this.#context.lineTo(this.#canvas.width*0.7, this.#canvas.height);
        this.#context.fill();
    
        this.#context.fillStyle = this.#textColor;
        this.#context.font = this.#font;
    
        const spacing = this.#canvas.height / (range * 2 / graduation); // Adjust spacing based on range and graduation
        const centerY = this.#canvas.height / 2 + (value % graduation) * (spacing / graduation); // Center based on value
    
        let startValue = 0;
        let endValue = range;
    
        for (let i = startValue; i <= endValue; i += graduation) {
            const yPos = centerY - ((i - value) * spacing) / 2;
            
                this.#context.fillText(i, 20, yPos);             
                this.#context.strokeStyle = this.#textColor;
                this.#context.lineWidth = 2;
                this.#context.beginPath();
                this.#context.lineTo(this.#canvas.width * 0.40, yPos);           
                this.#context.lineTo(this.#canvas.width, yPos );
                this.#context.stroke();
            
        }
    }
    
    // speed marker left 
    speedMarker(speed, range) {
        this.#context.fillStyle = this.#backgroundColor;
    
        // Draw the filled rectangle
        this.#context.fillRect(0, 0, this.#canvas.width * 0.7, this.#canvas.height);
    
        // Draw partial stroke line on the left side of the rectangle
        this.#context.strokeStyle = this.#textColor;
        this.#context.lineWidth = 3;
        this.#context.beginPath();
        this.#context.moveTo(0, 0);
        this.#context.lineTo(0, this.#canvas.height);
        this.#context.moveTo(0, this.#canvas.height );
        this.#context.lineTo(this.#canvas.width * 0.69, this.#canvas.height);
        this.#context.lineTo(this.#canvas.width * 0.69, this.#canvas.height / 1.3);
        this.#context.stroke();
    
        // Draw the triangle on the right side
        this.#context.beginPath();
        this.#context.moveTo(this.#canvas.width * 0.7, this.#canvas.height * 0.29);
        this.#context.lineTo(this.#canvas.width / 1.1, this.#canvas.height / 2);
        this.#context.lineTo(this.#canvas.width * 0.7, this.#canvas.height / 1.3);
        this.#context.moveTo(this.#canvas.width * 0.7, this.#canvas.height * 0.29);
        this.#context.lineTo(this.#canvas.width * 0.7, this.#canvas.height * 0);
        this.#context.moveTo(this.#canvas.width * 0.7, this.#canvas.height * 0);
        this.#context.lineTo(this.#canvas.width * 0, this.#canvas.height * 0);
        this.#context.moveTo(this.#canvas.width * 0, this.#canvas.height * 0);
        this.#context.lineTo(this.#canvas.width * 0., this.#canvas.height);
        this.#context.stroke();
        this.#context.closePath();
        this.#context.fill();
    
        // Draw the speed text
        this.#context.fillStyle = this.#textColor;
        this.#context.font = this.#font;
        const centerY = this.#canvas.height / 2;
        speed = speed.toFixed(0);
        this.#context.fillText(speed, this.#canvas.width * 0.1, centerY + 6);
    }
    
    altitudeMarker(altitude, range) {
        this.#context.fillStyle = this.#backgroundColor;
  
    
        this.#context.strokeStyle = this.#textColor;
        this.#context.lineWidth = 3;
        this.#context.fillRect(this.#canvas.width * 0.3, 0, this.#canvas.width * 0.7, this.#canvas.height);
        
        this.#context.beginPath();
        this.#context.moveTo(this.#canvas.width * 0.3, 0);
        this.#context.lineTo(this.#canvas.width * 0.3, this.#canvas.height / 4);
        this.#context.stroke();

        this.#context.beginPath();
        this.#context.moveTo(this.#canvas.width * 0.3, 10);
        this.#context.lineTo(10, this.#canvas.height / 2);
        this.#context.lineTo(this.#canvas.width * 0.3, this.#canvas.height - 10);
        
        this.#context.lineTo(this.#canvas.width * 0.3, this.#canvas.height);
        this.#context.lineTo(this.#canvas.width * 0.3, this.#canvas.height / 1.3);
        this.#context.moveTo(this.#canvas.width * 0.3, this.#canvas.height);
        this.#context.lineTo(this.#canvas.width, this.#canvas.height);
        this.#context.moveTo(this.#canvas.width * 0.98, this.#canvas.height);
        this.#context.lineTo(this.#canvas.width * 0.98, this.#canvas.height * 0.1);
        this.#context.moveTo(this.#canvas.width * 0.98, this.#canvas.height - 39);
        this.#context.lineTo(this.#canvas.width * 0.3, this.#canvas.height - 39);

        this.#context.fill();
    
        this.#context.fillStyle = this.#textColor;
        this.#context.font = this.#font;
    
        const spacing = this.#canvas.height / (2 * range);
        const centerY = this.#canvas.height / 2;
    
        this.#context.strokeStyle = this.#textColor;
        this.#context.lineWidth = 2;
        this.#context.stroke();
    
        altitude = altitude.toFixed(0);
        this.#context.fillText(altitude, this.#canvas.width * 0.29, centerY + 7);
    }

    drawHorizon(pitch, roll) {
        const width = this.#canvas.width;
        const height = this.#canvas.height;
    
        const centerX = width / 2;
        const centerY = height / 2;
    
        this.#context.clearRect(0, 0, width, height); 
        this.#context.save();
        this.#context.translate(centerX, centerY);
        this.#context.rotate(roll * Math.PI / 180);
        this.#context.translate(0, -pitch * (height / 180));
        this.#context.fillStyle = '#2065CC';
        this.#context.fillRect(-centerX, -centerY, width, centerY+2000);
        this.#context.fillStyle = '#653300';
        this.#context.fillRect(-centerX, 0, width, centerY + 2000);
        this.#context.strokeStyle = '#FFF';
        this.#context.lineWidth = 3;
    
        for (let i = 0; i <= 90; i += 10) {
    
          
                
            let y = -i * (height / 150);
            this.#context.beginPath();
            this.#context.moveTo(-50, y);
            this.#context.lineTo(50, y);
            this.#context.stroke();
    
            this.#context.font = '12px Arial';
            this.#context.fillStyle = '#FFF';
            if (i !== 0) {
                this.#context.fillText(i, 60, y + 4);
            }

            if(i === 0){
                //draw the horizon line
                this.#context.strokeStyle = '#FFF';
                this.#context.lineWidth = 3;
                this.#context.beginPath();
                this.#context.moveTo(-400, y);
                this.#context.lineTo(400, y);
                this.#context.stroke();
            }

         
            y = i * (height / 150);
            this.#context.beginPath();
            this.#context.moveTo(-50, y);
            this.#context.lineTo(50, y);
            this.#context.stroke();
    
            if (i !== 0) {
                this.#context.fillText(-i, 60, y + 4);
            }
        }

        this.#context.lineWidth = 2;
    for (let i = 5; i <= 90; i += 10) {
        let y = -i * (height / 150);
        this.#context.beginPath();
        this.#context.moveTo(-30, y);
        this.#context.lineTo(30, y);
        this.#context.stroke();
        y = i * (height / 150);
        this.#context.beginPath();
        this.#context.moveTo(-30, y);
        this.#context.lineTo(30, y);
        this.#context.stroke();
    }
        this.#context.restore();
    }
    
    
}

const altitudeMarker = new CanvasIndicator(
    document.getElementById("altimeterMarker"),
    "rgb(000,000,000)",
    "rgb(255,255,255)",
    "19px Arial"
);

const altitudeIndicator = new CanvasIndicator(
    document.getElementById("Altitude"),
    "rgb(128,128,128)",
    "rgb(255,255,255)",
    "17px Arial"
);

const speedIndicator = new CanvasIndicator(
    document.getElementById("airSpeed"),
    "rgb(128,128,128)",
    "rgb(255,255,255)",
    "17px Arial"
);

const markSpeed = new CanvasIndicator(
    document.getElementById("speedMarker"),
    "rgb(000,000,000)",
    "rgb(255,255,255)",
    "19px Arial"
);

const horizon = new CanvasIndicator(
    document.getElementById("horizon"),
    "rgb(000,000,000)",
    "rgb(255,255,255)",
    "22px Arial"
);


