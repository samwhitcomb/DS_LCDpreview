// Battery drawing function
function drawBattery(ctx, level) {
    const x = 130;  // Position from right
    const y = 5;    // Position from top
    const width = 20;
    const height = 10;
    
    // Battery outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Battery tip
    ctx.fillRect(x + width, y + 2, 2, height - 4);
    
    // Battery level
    const fillWidth = (width - 2) * (level / 100);
    ctx.fillStyle = level > 20 ? '#fff' : '#ff0000';
    ctx.fillRect(x + 1, y + 1, fillWidth, height - 2);
}

// Power button animation function
function drawPowerButtonAnimation(ctx, frame, isOff = false) {
    const x = 140;  // Position from right
    const y = 40;   // Center vertically
    const arrowLength = 15;
    const arrowWidth = 2;
    const lineHeight = 20;  // Fixed height
    
    // Calculate breathing effect for the line opacity only
    const lineOpacity = Math.abs(Math.sin(frame * 0.02)) * 0.5 + 0.3;
    
    // Calculate bouncing effect for the arrow - much slower
    const bounceOffset = Math.abs(Math.sin(frame * 0.05)) * 10; // Reduced speed
    const arrowOpacity = 0.8;
    
    // Set color based on device state
    const color = isOff ? '#ff0000' : '#ffffff';
    
    // Draw vertical line (power button) with fixed height
    ctx.strokeStyle = `rgba(${isOff ? '255, 0, 0' : '255, 255, 255'}, ${lineOpacity})`;
    ctx.lineWidth = arrowWidth;
    ctx.beginPath();
    ctx.moveTo(x + 5, y - lineHeight/2);
    ctx.lineTo(x + 5, y + lineHeight/2);
    ctx.stroke();
    
    // Draw bouncing arrow
    ctx.strokeStyle = `rgba(${isOff ? '255, 0, 0' : '255, 255, 255'}, ${arrowOpacity})`;
    ctx.beginPath();
    // Start position of arrow (further left)
    const startX = x - arrowLength - 20;
    // Current position with bounce
    const currentX = startX + bounceOffset;
    
    ctx.moveTo(currentX, y);
    ctx.lineTo(currentX + arrowLength, y);
    ctx.lineTo(currentX + arrowLength - 5, y - 5);
    ctx.moveTo(currentX + arrowLength, y);
    ctx.lineTo(currentX + arrowLength - 5, y + 5);
    ctx.stroke();
}

// Shutdown countdown animation
function drawShutdownCountdown(ctx, remainingTime) {
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Shutting down', 10, 30);
    ctx.fillText(Math.ceil(remainingTime), 10, 50);
}

// WiFi status drawing function
function drawWifiStatus(ctx, status, frame) {
    const x = 100;  // Position from right (next to battery)
    const y = 5;    // Position from top
    const size = 10; // Same size as battery
    
    ctx.save();
    
    switch(status) {
        case 'searching':
            // Draw searching animation
            const angle = (frame * 0.1) % (Math.PI * 2);
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, angle, angle + Math.PI * 1.5);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
            
        case 'connecting':
            // Draw connecting animation (pulsing)
            const scale = 0.8 + Math.sin(frame * 0.1) * 0.2;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, (size/2) * scale, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
            
        case 'connected':
            // Draw connected symbol
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Draw check mark
            ctx.beginPath();
            ctx.moveTo(x + size/3, y + size/2);
            ctx.lineTo(x + size/2, y + size * 2/3);
            ctx.lineTo(x + size * 2/3, y + size/3);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

// Flow definitions
const flows = {
    power: [
        {
            title: "Off",
            explanation: "Device is powered off. Press the power button to turn on.",
            draw: (ctx, frame) => {
                // Clear canvas with black (screen is off)
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                // Reset all connection states
                connectionState = 'searching';
                
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Off") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Power On",
            explanation: "Device is powering on with logo fade in.",
            draw: (ctx, frame) => {
                // Calculate fade in opacity
                const fadeDuration = 240; // 4 seconds at 60fps
                const opacity = Math.min(1, frame / fadeDuration);
                
                // Clear canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw DS logo with fading opacity
                const img = new Image();
                img.src = 'DS LOGO.png';
                
                // Calculate dimensions to maintain aspect ratio
                const maxWidth = 120; // Leave some margin
                const scale = maxWidth / img.width;
                const width = img.width * scale;
                const height = img.height * scale;
                
                // Center the logo
                const x = (160 - width) / 2;
                const y = (80 - height) / 2;
                
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, x, y, width, height);
                ctx.globalAlpha = 1;
            },
            led: { state: 'on', color: 'white' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Power On") {
                        currentState.draw(ctx, frame++);
                        if (frame < 240) { // Continue animation until fade is complete (4 seconds)
                            requestAnimationFrame(animate);
                        } else {
                            // After fade in completes, move to On state
                            currentStateIndex = 2; // Move to On state
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "On",
            explanation: "Device is powered on. It is automatically searching for a connection.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                
                // Draw status message based on connection state
                if (connectionState === 'searching') {
                    ctx.fillText('Searching for', 80, 35+5);
                    ctx.fillText('connection...', 80, 55+5);
                } else if (connectionState === 'connecting') {
                    ctx.fillText('Connecting to', 80, 35+5);
                    ctx.fillText('network...', 80, 55+5);
                } else if (connectionState === 'connected') {
                    // Calculate fade out opacity for connected message
                    const fadeStart = 600; // When connection is established
                    const fadeDuration = 100; // 1 second fade
                    const opacity = Math.max(0, 1 - ((frame - fadeStart) / fadeDuration));
                    
                    if (opacity > 0) {
                        ctx.globalAlpha = opacity;
                        ctx.fillText('Connected to', 80, 35+5);
                        ctx.fillText('network', 80, 55+5);
                        ctx.globalAlpha = 1;
                    }
                }
                
                drawBattery(ctx, 85);
                drawWifiStatus(ctx, connectionState || 'searching', frame);
            },
            led: { state: 'breathing', color: 'blue' },
            onEnter: () => {
                let frame = 0;
                connectionState = 'searching';
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "On") {
                        currentState.draw(ctx, frame++);
                        
                        // Update LED state based on connection state and frame
                        if (connectionState === 'searching' || connectionState === 'connecting') {
                            currentState.led = { state: 'breathing', color: 'blue' };
                        } else if (connectionState === 'connected') {
                            if (frame >= 700) { // Wait for fade out to complete (800 + 200 frames)
                                // Transition to Fully On state
                                currentStateIndex = 3; // Move to Fully On state
                                updateDisplay();
                                return;
                            } else {
                                currentState.led = { state: 'on', color: 'green' };
                            }
                        }
                        
                        // Update the LED display
                        ledLight.className = 'led-light';
                        ledLight.classList.add(currentState.led.state);
                        ledLight.classList.add(currentState.led.color);
                        if (currentState.led.state === 'on') {
                            ledLight.classList.add('on');
                        }
                        
                        // Simulate connection process
                        if (frame === 200) { // After 2 seconds
                            connectionState = 'connecting';
                        } else if (frame === 540) { // After 4 seconds
                            connectionState = 'connected';
                        }
                        
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Fully On",
            explanation: "Device is fully powered on and connected.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawBattery(ctx, 85);
                drawWifiStatus(ctx, 'connected', frame);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Shutdown",
            explanation: "Press and hold the power button to initiate shutdown.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                
                if (isShuttingDown) {
                    const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
                    const remainingTime = Math.max(0, 2 - elapsedTime);
                    
                    ctx.fillText('Shutting down', 10, 30);
                    ctx.fillText(Math.ceil(remainingTime), 10, 50);
                } else {
                    ctx.fillText('Press and hold', 10, 30);
                    ctx.fillText('power button', 10, 50);
                    ctx.fillText('to shutdown', 10, 70);
                }
                
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame);
            },
            led: { state: 'on', color: 'white' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Shutdown") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Shutdown Complete",
            explanation: "Device has been powered off.",
            draw: (ctx, frame) => {
                // Calculate fade out opacity
                const fadeDuration = 30; // frames for fade out
                const opacity = Math.max(0, 1 - (frame / fadeDuration));
                
                // Clear canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw text with fading opacity
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Device', 80, 30);
                ctx.fillText('Powered Off', 80, 50);
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Shutdown Complete") {
                        currentState.draw(ctx, frame++);
                        if (frame < 30) { // Continue animation until fade is complete
                            requestAnimationFrame(animate);
                        } else {
                            // Return to off state
                            isPoweredOff = true;
                            currentStateIndex = 0;
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        }
    ],
    binding: [
        {
            title: "Binding Ready",
            explanation: "Device is ready to be bound to your account. Press power button to toggle between QR code and serial number.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                if (showSerialNumber) {
                    // Draw serial number
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('Serial Number:', 80, 30);
                    ctx.fillText('DS-2024-1234', 80, 50);
                } else {
                    // Draw full screen QR code
                    const qr = qrcode(0, 'M');
                    qr.addData('https://example.com/bind/device123');
                    qr.make();
                    
                    const qrSize = 70; // Larger QR code
                    const qrX = (160 - qrSize) / 2;
                    const qrY = (80 - qrSize) / 2;
                    
                    const qrData = qr.createDataURL(4);
                    const qrImg = new Image();
                    qrImg.src = qrData;
                    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
                }
                
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                showSerialNumber = false; // Initialize to show QR code
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Binding Ready") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Binding in Progress",
            explanation: "Device is being bound to your account.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                
                // Animated dots
                const dots = '.'.repeat(Math.floor(frame / 20) % 4);
                ctx.fillText('Binding' + dots, 80, 40);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Binding in Progress") {
                        currentState.draw(ctx, frame++);
                        if (frame < 300) { // 5 seconds
                            requestAnimationFrame(animate);
                        } else {
                            currentStateIndex = 2; // Move to Binding Complete
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "Binding Complete",
            explanation: "Device has been successfully bound to your account.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Binding', 80, 30);
                ctx.fillText('Complete!', 80, 50);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'green' }
        }
    ],
    calibration: [
        {
            title: "Calibration Start",
            explanation: "Device is ready to begin calibration.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Calibration', 80, 30);
                ctx.fillText('Starting...', 80, 50);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Calibration Start") {
                        currentState.draw(ctx, frame++);
                        if (frame < 60) { // 1 second
                            requestAnimationFrame(animate);
                        } else {
                            currentStateIndex = 1; // Move to Calibrating
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "Calibrating",
            explanation: "Device is calibrating sensors and alignment.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw calibration animation
                const centerX = 80;
                const centerY = 40;
                const radius = 20;
                const angle = (frame * 0.1) % (Math.PI * 2);
                
                // Draw rotating line
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angle) * radius,
                    centerY + Math.sin(angle) * radius
                );
                ctx.stroke();
                
                // Draw progress circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw progress text
                const progress = Math.min(100, Math.floor((frame / 180) * 100));
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${progress}%`, 80, 70);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Calibrating") {
                        currentState.draw(ctx, frame++);
                        if (frame < 180) { // 3 seconds
                            requestAnimationFrame(animate);
                        } else {
                            currentStateIndex = 2; // Move to Calibration Complete
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "Calibration Complete",
            explanation: "Device calibration has been completed successfully.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Calibration', 80, 30);
                ctx.fillText('Complete!', 80, 50);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'on', color: 'green' }
        }
    ],
    error: [
        {
            title: "Error: Connection",
            explanation: "Failed to establish connection. Error code: E001",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Error: Connection', 10, 20);
                ctx.fillText('Code: E001', 10, 35);
                ctx.fillText('Check network', 10, 50);
                ctx.fillText('and try again', 10, 65);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Error: Sensor",
            explanation: "Sensor calibration failed. Error code: E002",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Error: Sensor', 10, 20);
                ctx.fillText('Code: E002', 10, 35);
                ctx.fillText('Try recalibrating', 10, 50);
                ctx.fillText('or reset device', 10, 65);
                
                drawBattery(ctx, 85);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Error: System",
            explanation: "System error detected. Error code: E003",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Error: System', 10, 20);
                ctx.fillText('Code: E003', 10, 35);
                ctx.fillText('Reset required', 10, 50);
                ctx.fillText('Hold power 5s', 10, 65);
                
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame, true);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Error: Memory",
            explanation: "Memory error detected. Error code: E004",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Error: Memory', 10, 20);
                ctx.fillText('Code: E004', 10, 35);
                ctx.fillText('Reset required', 10, 50);
                ctx.fillText('Hold power 5s', 10, 65);
                
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame, true);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Error: Battery",
            explanation: "Critical battery error. Error code: E005",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Error: Battery', 10, 20);
                ctx.fillText('Code: E005', 10, 35);
                ctx.fillText('Connect power', 10, 50);
                ctx.fillText('immediately', 10, 65);
                
                drawBattery(ctx, 5);
            },
            led: { state: 'blink', color: 'red' }
        },
        {
            title: "Reset Required",
            explanation: "Device needs to be reset to resolve errors.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                
                // Animated countdown
                const countdown = Math.max(0, 5 - Math.floor(frame / 60));
                ctx.fillText('Reset in:', 10, 20);
                ctx.fillText(`${countdown}s`, 10, 35);
                ctx.fillText('Hold power', 10, 50);
                ctx.fillText('to cancel', 10, 65);
                
                drawBattery(ctx, 85);
                drawPowerButtonAnimation(ctx, frame, true);
            },
            led: { state: 'blink', color: 'red' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Reset Required") {
                        currentState.draw(ctx, frame++);
                        if (frame < 300) { // 5 seconds
                            requestAnimationFrame(animate);
                        } else {
                            // Reset to initial state
                            currentFlow = 'power';
                            currentStateIndex = 0;
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        }
    ]
};

// Initialize canvas
const canvas = document.getElementById('lcdCanvas');
const ctx = canvas.getContext('2d');
let currentStateIndex = 0;
let currentFlow = 'power'; // Set initial flow to power
let currentAnimation = null;

// Navigation elements
const prevButton = document.getElementById('prevStep');
const nextButton = document.getElementById('nextStep');
const explanationText = document.getElementById('stepExplanation');
const currentStepSpan = document.getElementById('currentStep');
const totalStepsSpan = document.getElementById('totalSteps');
const flowSelect = document.getElementById('flowSelect');
const ledLight = document.getElementById('ledLight');

// Add these variables at the top with other state variables
let powerButtonPressStartTime = 0;
let isPowerButtonPressed = false;
const SHUTDOWN_HOLD_TIME = 2000; // 2 seconds in milliseconds
let showSerialNumber = false;
let connectionState = 'searching';

// Function to update the display
function updateDisplay() {
    const currentStates = flows[currentFlow];
    const currentState = currentStates[currentStateIndex];
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle animation cleanup
    if (currentAnimation) {
        if (typeof currentAnimation === 'object' && currentAnimation.animation) {
            currentAnimation.animation.stop();
            currentAnimation.animation.destroy();
            if (currentAnimation.container && currentAnimation.container.parentNode) {
                currentAnimation.container.parentNode.removeChild(currentAnimation.container);
            }
        } else if (currentAnimation.destroy) {
            currentAnimation.destroy();
        }
        currentAnimation = null;
    }
    
    // Show/hide power arrow based on state
    const powerArrow = document.querySelector('.power-arrow-indicator');
    if (powerArrow) {
        if (currentState.title === "Off" || currentState.title === "Fully On" || 
            (currentFlow === 'binding' && currentStateIndex === 0)) {
            powerArrow.style.display = 'block';
        } else {
            powerArrow.style.display = 'none';
        }
    }
    
    // Handle animation setup
    if (currentState.onEnter) {
        currentAnimation = currentState.onEnter();
    } else {
        // Draw current state if no animation
        currentState.draw(ctx);
    }
    
    // Update LED state
    ledLight.className = 'led-light';
    if (currentState.led) {
        ledLight.classList.add(currentState.led.state);
        ledLight.classList.add(currentState.led.color);
        if (currentState.led.state === 'on') {
            ledLight.classList.add('on');
        }
    }
    
    // Update explanation
    explanationText.textContent = currentState.explanation;
    
    // Update step indicator
    currentStepSpan.textContent = currentStateIndex + 1;
    totalStepsSpan.textContent = currentStates.length;
    
    // Update button states
    prevButton.disabled = currentStateIndex === 0;
    nextButton.disabled = currentStateIndex === currentStates.length - 1;
}

// Event listeners for navigation
prevButton.addEventListener('click', () => {
    if (currentStateIndex > 0) {
        currentStateIndex--;
        updateDisplay();
    }
});

nextButton.addEventListener('click', () => {
    if (currentStateIndex < flows[currentFlow].length - 1) {
        currentStateIndex++;
        updateDisplay();
    }
});

// Event listener for flow selection
flowSelect.addEventListener('change', (e) => {
    currentFlow = e.target.value;
    currentStateIndex = 0;
    updateDisplay();
});

// Add power button event listeners
const powerButton = document.getElementById('powerButton');
let powerPressTimeout = null;
let isShuttingDown = false;
let shutdownStartTime = 0;
let countdownInterval = null;
let isPoweredOff = true; // Track power state

function startPowerOn() {
    if (!isPoweredOff) return; // Only power on if currently off
    
    isPoweredOff = false;
    currentFlow = 'power';
    currentStateIndex = 1; // Move to power on animation state
    updateDisplay();
}

function startShutdownCountdown() {
    if (isShuttingDown) return; // Prevent multiple triggers
    
    isShuttingDown = true;
    shutdownStartTime = Date.now();
    
    // Switch to shutdown state
    currentFlow = 'power';
    currentStateIndex = 4; // Move to shutdown state
    updateDisplay();
    
    // Start countdown animation
    countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - shutdownStartTime) / 1000;
        const remainingTime = Math.max(0, 2 - elapsedTime);
        
        if (remainingTime <= 0) {
            // Complete shutdown
            clearInterval(countdownInterval);
            currentStateIndex = 5; // Move to shutdown complete state
            updateDisplay();
            isPoweredOff = true; // Set power state to off
        }
    }, 50); // Update every 50ms for smooth animation
}

function cancelShutdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    isShuttingDown = false;
    
    // Return to Fully On state
    currentStateIndex = 3; // Move to Fully On state
    updateDisplay();
}

// Modify the power button event handlers
powerButton.addEventListener('mousedown', () => {
    if (currentFlow === 'binding' && currentStateIndex === 0) {
        // Toggle between QR code and serial number in binding ready state
        showSerialNumber = !showSerialNumber;
        const currentStates = flows[currentFlow];
        const currentState = currentStates[currentStateIndex];
        currentState.draw(ctx, 0); // Force immediate redraw
    } else if (isPoweredOff) {
        startPowerOn();
    } else if (currentFlow === 'power') {
        // Start tracking power button press
        powerButtonPressStartTime = Date.now();
        isPowerButtonPressed = true;
        
        // Start shutdown countdown
        startShutdownCountdown();
    }
});

// Update touch events similarly
powerButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentFlow === 'binding' && currentStateIndex === 0) {
        // Toggle between QR code and serial number in binding ready state
        showSerialNumber = !showSerialNumber;
        const currentStates = flows[currentFlow];
        const currentState = currentStates[currentStateIndex];
        currentState.draw(ctx, 0); // Force immediate redraw
    } else if (isPoweredOff) {
        startPowerOn();
    } else if (currentFlow === 'power') {
        // Start tracking power button press
        powerButtonPressStartTime = Date.now();
        isPowerButtonPressed = true;
        
        // Start shutdown countdown
        startShutdownCountdown();
    }
});

// Also update mouseup and touchend to prevent shutdown in binding flow
powerButton.addEventListener('mouseup', () => {
    if (isPowerButtonPressed && currentFlow === 'power') {
        const pressDuration = Date.now() - powerButtonPressStartTime;
        if (pressDuration < SHUTDOWN_HOLD_TIME) {
            // If not held long enough, cancel shutdown
            cancelShutdown();
        }
        isPowerButtonPressed = false;
    }
});

powerButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isPowerButtonPressed && currentFlow === 'power') {
        const pressDuration = Date.now() - powerButtonPressStartTime;
        if (pressDuration < SHUTDOWN_HOLD_TIME) {
            // If not held long enough, cancel shutdown
            cancelShutdown();
        }
        isPowerButtonPressed = false;
    }
});

powerButton.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    if (isPowerButtonPressed && currentFlow === 'power') {
        const pressDuration = Date.now() - powerButtonPressStartTime;
        if (pressDuration < SHUTDOWN_HOLD_TIME) {
            // If not held long enough, cancel shutdown
            cancelShutdown();
        }
        isPowerButtonPressed = false;
    }
});

// Initialize the display
updateDisplay(); 