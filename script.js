// Add these constants at the top of the file
const TRAY_POSITION = {
    x: 110,  // Aligned with battery
    y: 10,    // Same y as battery
    size: 10 // Same height as battery
};

const CENTER_POSITION = {
    x: 80,
    y: 55,
    size: 30
};

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
function drawWifiStatus(ctx, status, frame, isFullHeight = false) {
    const size = isFullHeight ? CENTER_POSITION.size : TRAY_POSITION.size;
    const x = isFullHeight ? CENTER_POSITION.x - size/2 : TRAY_POSITION.x - size/2;
    const y = isFullHeight ? CENTER_POSITION.y - size/2 : TRAY_POSITION.y - size/2;
    
    ctx.save();
    ctx.translate(x, y);
    
    switch(status) {
        case 'searching':
            // Draw searching animation
            const angle = (frame * 0.1) % (Math.PI * 2);
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2, angle, angle + Math.PI * 1.5);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = isFullHeight ? 2 : 1;
            ctx.stroke();
            break;
            
        case 'connecting':
            // Draw connecting animation (pulsing)
            const scale = 0.8 + Math.sin(frame * 0.1) * 0.2;
            ctx.beginPath();
            ctx.arc(size/2, size/2, (size/2) * scale, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = isFullHeight ? 2 : 1;
            ctx.stroke();
            break;
            
        case 'connected':
            // Draw connected symbol
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = isFullHeight ? 2 : 1;
            ctx.stroke();
            // Draw check mark
            ctx.beginPath();
            ctx.moveTo(size/3, size/2);
            ctx.lineTo(size/2, size * 2/3);
            ctx.lineTo(size * 2/3, size/3);
            ctx.stroke();
            break;
    }
    
    ctx.restore();
}

// Add charger detection
let isChargerConnected = false;
let updateProgress = 0;

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
                const maxWidth = 150; // Leave some margin
                const scale = maxWidth / img.width;
                const width = img.width * scale;
                const height = img.height * scale;
                
                // Center the logo
                const x = (160 - width) / 2;
                const y = ((80 - height) / 2);
                
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
                
                // Calculate transition progress
                const transitionStart = 540; // When connection is established
                const transitionDuration = 30; // 1 second transition
                const transitionProgress = Math.min(1, Math.max(0, (frame - transitionStart) / transitionDuration));
                
                // Draw battery (always in tray position)
                drawBattery(ctx, 85);
                
                // Draw WiFi status with minimizing animation
                if (connectionState === 'connected' && transitionProgress < 1) {
                    // Calculate positions for minimizing animation
                    const startSize = 30;
                    const endSize = TRAY_POSITION.size;
                    
                    // Center positions (accounting for size)
                    const startX = 80 - startSize/2;  // Center of screen
                    const startY = 40 - startSize/2;  // Center of screen
                    const endX = TRAY_POSITION.x - endSize/2;     // Tray position
                    const endY = TRAY_POSITION.y - endSize/2;     // Tray position
                    
                    // Interpolate position and size
                    const currentSize = startSize + (endSize - startSize) * transitionProgress;
                    const currentX = startX + (endX - startX) * transitionProgress;
                    const currentY = startY + (endY - startY) * transitionProgress;
                    
                    // Draw the minimizing animation
                    ctx.save();
                    ctx.translate(currentX, currentY);
                    ctx.scale(currentSize/startSize, currentSize/startSize);
                    
                    // Draw the connected symbol
                    ctx.beginPath();
                    ctx.arc(startSize/2, startSize/2, startSize/2, 0, Math.PI * 2);
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2 * (startSize/currentSize);
                    ctx.stroke();
                    
                    // Draw check mark
                    ctx.beginPath();
                    ctx.moveTo(startSize/3, startSize/2);
                    ctx.lineTo(startSize/2, startSize * 2/3);
                    ctx.lineTo(startSize * 2/3, startSize/3);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    // Draw appropriate version based on state
                    const isFullHeight = connectionState !== 'connected';
                    drawWifiStatus(ctx, connectionState, frame, isFullHeight);
                }

                // Draw subtle status text
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#fff'; // White text
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                
                if (connectionState !== 'connected' || transitionProgress < 1) {
                    // Full height mode text
                    const textOpacity = connectionState === 'connected' ? 1 - transitionProgress : 0.4;
                    ctx.globalAlpha = textOpacity;
                    
                    switch(connectionState) {
                        case 'searching':
                            ctx.fillText('Searching', 10, 15);
                            break;
                        case 'connecting':
                            ctx.fillText('Connecting', 10, 15);
                            break;
                        case 'connected':
                            ctx.fillText('Connected', 10, 15);
                            break;
                    }
                } else {
                    // Tray mode text (when connected)
                    ctx.fillText('Connected', 10, 15);
                }
                ctx.globalAlpha = 1;
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
                            if (frame >= 640) { // Wait for transition to complete
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
            explanation: "Device is ready to be bound to your account.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);

                // Calculate QR height if loaded, else estimate a default height
                let qrHeight = 0;
                if (microQRImgLoaded) {
                    const lcdWidth = 160;
                    const drawWidth = lcdWidth;
                    const scale = drawWidth / microQRImg.width;
                    qrHeight = microQRImg.height * scale;
                } else {
                    // Estimate a default QR height (e.g., 40px) if not loaded
                    qrHeight = 40;
                }
                const serial = '124_DS';
                const availableHeight = 70 - qrHeight;
                let fontSize = Math.floor(availableHeight * 0.6);
                if (fontSize < 16) fontSize = 16;
                ctx.fillStyle = '#fff';
                ctx.font = `${fontSize}px monospace`;
                ctx.textAlign = 'center';
                const textY = Math.floor((availableHeight + fontSize) / 2) - 0;
                ctx.fillText(serial, 80, textY);

                // Draw Micro QR.png pinned to the bottom, full width, if loaded
                if (microQRImgLoaded) {
                    const lcdWidth = 160;
                    const drawWidth = lcdWidth;
                    const scale = drawWidth / microQRImg.width;
                    const drawHeight = microQRImg.height * scale;
                    const x = 0;
                    const y = 80 - drawHeight;
                    ctx.drawImage(microQRImg, x, y, drawWidth, drawHeight);
                }
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                showSerialNumber = false;
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
    firmwareUpdate: [
        {
            title: "Update Ready",
            explanation: "Connect charger before starting firmware update. Once charger is connected we can remove the warnings",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw text on two lines
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Firmware update', 80, 45);
                ctx.font = '10px monospace';  // Smaller font for subtext
                ctx.fillText('connect power', 80, 65);
                
                // First grow to full height (twice as fast), then start breathing with opacity
                const growDuration = 30; // 0.5 seconds for grow animation (twice as fast)
                const breathingDuration = 60; // 1 second for breathing cycle
                
                let height;
                let opacity = 1;
                
                if (frame < growDuration) {
                    // Growing phase (twice as fast)
                    const growProgress = frame / growDuration;
                    height = 44 * growProgress; // Grow from 0 to 44px
                } else {
                    // Breathing phase with opacity
                    height = 44; // Full height
                    const breathingProgress = (frame - growDuration) / breathingDuration;
                    opacity = 0.3 + Math.sin(breathingProgress * Math.PI * 2) * 0.35; // Opacity between 0.3 and 0.65
                }
                
                const y = 28 + (44 - height) / 2; // Center vertically
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fillRect(2, y, 3, height);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                // Check for charger connection
                isChargerConnected = false; // This would be set by actual charger detection
                
                // Create and add power icon
                const powerIcon = document.createElement('img');
                powerIcon.src = 'Lotties/Icons/power lightning.svg';
                powerIcon.style.position = 'absolute';
                powerIcon.style.left = '5%';
                powerIcon.style.bottom = '0%';
                powerIcon.style.transform = 'translateY(-50%)';
                powerIcon.style.width = '16px';
                powerIcon.style.height = '16px';
                powerIcon.style.filter = 'brightness(0) invert(1)'; // Make icon white
                powerIcon.style.opacity = '1'; // Start visible
                
                // Add to the LCD display
                const lcdDisplay = document.querySelector('.lcd-display');
                lcdDisplay.appendChild(powerIcon);
                
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Update Ready") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    } else {
                        // Clean up when state changes
                        if (powerIcon && powerIcon.parentNode) {
                            powerIcon.parentNode.removeChild(powerIcon);
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "Updating",
            explanation: "Firmware update in progress. Do not power off.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw progress bar background
                ctx.fillStyle = '#333';
                ctx.fillRect(20, 30, 120, 10);
                
                // Calculate real progress and time
                const totalDuration = 30; // 30 seconds total
                const elapsedTime = frame / 60; // Convert frames to seconds
                const progress = Math.min(1, elapsedTime / totalDuration);
                updateProgress = progress; // Update global progress
                
                // Animate progress bar
                const barWidth = 120;
                const segmentWidth = 10;
                const segments = Math.floor(barWidth / segmentWidth);
                const activeSegment = Math.floor((frame / 10) % segments);
                
                // Draw progress segments with animation
                for (let i = 0; i < segments; i++) {
                    const x = 20 + (i * segmentWidth);
                    const isActive = i <= (progress * segments) || 
                                   (i === activeSegment && i <= (progress * segments));
                    
                    // Add pulsing effect to active segments
                    const pulseIntensity = isActive ? 
                        Math.sin(frame * 0.1 + i * 0.5) * 0.3 + 0.7 :  // Breathing effect
                        0.2;  // Dim when inactive
                    
                    ctx.fillStyle = `rgba(0, 255, 0, ${pulseIntensity})`;
                    ctx.fillRect(x, 30, segmentWidth - 1, 10);
                }
                
                // Draw percentage with fade effect
                const percentageOpacity = Math.sin(frame * 0.05) * 0.2 + 0.8;  // Subtle pulse
                ctx.fillStyle = `rgba(255, 255, 255, ${percentageOpacity})`;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(progress * 100)}%`, 80, 25);
                
                // Calculate and draw time remaining
                const remainingTime = Math.max(0, totalDuration - elapsedTime);
                const minutes = Math.floor(remainingTime / 60);
                const seconds = Math.floor(remainingTime % 60);
                
                ctx.font = '10px monospace';
                ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')} remaining`, 80, 55);
                
                // Draw warning with pulse
                const warningOpacity = Math.sin(frame * 0.1) * 0.3 + 0.7;  // More noticeable pulse
                ctx.fillStyle = `rgba(255, 255, 255, ${warningOpacity})`;
                ctx.fillText('DO NOT POWER OFF', 80, 70);
                
                // Move to next state when complete
                if (progress >= 1) {
                    currentStateIndex = 2; // Move to Update Complete
                    updateDisplay();
                }
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Updating") {
                        currentState.draw(ctx, frame++);
                        
                        // Simulate charger disconnect after 15 seconds
                        if (frame === 900) { // 15 seconds at 60fps
                            currentStateIndex = 3; // Move to Charger Disconnected state
                            updateDisplay();
                            return;
                        }
                        
                        // Simulate update failure after 20 seconds
                        if (frame === 1200) { // 20 seconds at 60fps
                            currentStateIndex = 4; // Move to Update Failed state
                            updateDisplay();
                            return;
                        }
                        
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Update Complete",
            explanation: "Firmware update completed successfully.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Calculate animation progress
                const circleDuration = 30; // Half second for circle
                const checkDuration = 20;  // Third of a second for checkmark
                const textDuration = 30;   // Half second for text
                const restartDuration = 60; // 1 second for restart message
                
                const circleProgress = Math.min(1, frame / circleDuration);
                const checkProgress = Math.max(0, Math.min(1, (frame - circleDuration) / checkDuration));
                const textProgress = Math.max(0, Math.min(1, (frame - circleDuration - checkDuration) / textDuration));
                const restartProgress = Math.max(0, Math.min(1, (frame - circleDuration - checkDuration - textDuration) / restartDuration));
                
                // Draw animated circle
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2 * circleProgress);
                ctx.stroke();
                
                // Draw animated checkmark
                if (checkProgress > 0) {
                    ctx.beginPath();
                    ctx.moveTo(70, 30);
                    ctx.lineTo(75, 35);
                    ctx.lineTo(90, 25);
                    ctx.stroke();
                }
                
                // Draw text with fade in
                ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Update Complete', 80, 60);
                
                // Draw restart message with fade in
                if (restartProgress > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${restartProgress})`;
                    ctx.font = '10px monospace';
                    ctx.fillText('Device will restart', 80, 75);
                }
                
                // Move to power on state after all animations complete
                if (frame >= circleDuration + checkDuration + textDuration + restartDuration + 30) { // Add 0.5s delay
                    currentFlow = "power";
                    currentStateIndex = 1; // Move to Power On state
                    updateDisplay();
                }
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Update Complete") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Charger Disconnected",
            explanation: "Charger was disconnected during update. Please reconnect and try again.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw X
                ctx.beginPath();
                ctx.moveTo(70, 20);
                ctx.lineTo(90, 40);
                ctx.moveTo(90, 20);
                ctx.lineTo(70, 40);
                ctx.stroke();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Charger', 80, 60);
                ctx.fillText('Disconnected', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Charger Disconnected") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Update Failed",
            explanation: "Firmware update failed. Please try again.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw X
                ctx.beginPath();
                ctx.moveTo(70, 20);
                ctx.lineTo(90, 40);
                ctx.moveTo(90, 20);
                ctx.lineTo(70, 40);
                ctx.stroke();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Update Failed', 80, 60);
                ctx.fillText('Please try again', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Update Failed") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        }
    ],
    errorStates: [
        {
            title: "Charger Disconnected",
            explanation: "Charger was disconnected during update. Please reconnect and try again.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw X
                ctx.beginPath();
                ctx.moveTo(70, 20);
                ctx.lineTo(90, 40);
                ctx.moveTo(90, 20);
                ctx.lineTo(70, 40);
                ctx.stroke();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Charger', 80, 60);
                ctx.fillText('Disconnected', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Charger Disconnected") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Update Failed",
            explanation: "Firmware update failed. Please try again.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw X
                ctx.beginPath();
                ctx.moveTo(70, 20);
                ctx.lineTo(90, 40);
                ctx.moveTo(90, 20);
                ctx.lineTo(70, 40);
                ctx.stroke();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Update Failed', 80, 60);
                ctx.fillText('Please try again', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Update Failed") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "System Error",
            explanation: "A system error has occurred. Please restart the device.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw exclamation mark
                ctx.beginPath();
                ctx.moveTo(80, 20);
                ctx.lineTo(80, 35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(80, 40, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('System Error', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('Restart Required', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "System Error") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Critical Error",
            explanation: "A critical error has occurred. Device will restart automatically.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw X without animation
                ctx.beginPath();
                ctx.moveTo(70, 20);
                ctx.lineTo(90, 40);
                ctx.moveTo(90, 20);
                ctx.lineTo(70, 40);
                ctx.stroke();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Critical Error', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('Auto-Restarting...', 80, 75);
                
                // Simulate restart after 5 seconds
                if (frame >= 300) { // 5 seconds at 60fps
                    currentFlow = "power";
                    currentStateIndex = 1; // Move to Power On state
                    updateDisplay();
                }
            },
            led: { state: 'blink', color: 'red' }, // Critical: hard blinking
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Critical Error") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Error E001",
            explanation: "Hardware initialization error. Please contact support.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error code in top left
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('E001', 10, 15);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw exclamation mark
                ctx.beginPath();
                ctx.moveTo(80, 20);
                ctx.lineTo(80, 35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(80, 40, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Hardware Error', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('Contact Support', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Error E001") {
                                currentState.draw(ctx, frame++);
                                requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Error E002",
            explanation: "Memory corruption detected. Device will restart.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error code in top left
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('E002', 10, 15);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw exclamation mark
                ctx.beginPath();
                ctx.moveTo(80, 20);
                ctx.lineTo(80, 35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(80, 40, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Memory Error', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('Auto-Restarting...', 80, 75);
                
                // Simulate restart after 5 seconds
                if (frame >= 300) { // 5 seconds at 60fps
                    currentFlow = "power";
                    currentStateIndex = 1; // Move to Power On state
                    updateDisplay();
                }
            },
            led: { state: 'blink', color: 'red' }, // Critical: hard blinking
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Error E002") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Error E003",
            explanation: "Sensor calibration error. Please recalibrate.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw error code in top left
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('E003', 10, 15);
                
                // Draw error icon without animation
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw exclamation mark
                ctx.beginPath();
                ctx.moveTo(80, 20);
                ctx.lineTo(80, 35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(80, 40, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Sensor Error', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('Recalibration Needed', 80, 75);
            },
            led: { state: 'breathing', color: 'red' }, // Non-critical: breathing
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Error E003") {
                                currentState.draw(ctx, frame++);
                                requestAnimationFrame(animate);
                            }
                };
                animate();
            }
        }
    ],
    batteryStatus: [
        {
            title: "Battery Normal",
            explanation: "Battery level is normal. Shows in tray position.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery in tray position
                drawBattery(ctx, 85);
                
                // Draw subtle status text
                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.globalAlpha = 0.5;
                ctx.fillText('Battery: 85%', 10, 15);
                ctx.globalAlpha = 1;
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Battery Low",
            explanation: "Battery level is low. Shows warning with percentage.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery in tray position
                drawBattery(ctx, 15);
                
                // Draw warning icon with animation
                const pulseIntensity = Math.sin(frame * 0.1) * 0.3 + 0.7;
                ctx.strokeStyle = `rgba(255, 0, 0, ${pulseIntensity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw exclamation mark
                ctx.beginPath();
                ctx.moveTo(80, 20);
                ctx.lineTo(80, 35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(80, 40, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Low Battery', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('15% Remaining', 80, 75);
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Battery Low") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Battery Critical",
            explanation: "Battery level is critical. Device will shutdown soon.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery in tray position
                drawBattery(ctx, 5);
                
                // Draw warning icon with faster animation
                const pulseIntensity = Math.sin(frame * 0.2) * 0.4 + 0.6; // Faster, more intense
                ctx.strokeStyle = `rgba(255, 0, 0, ${pulseIntensity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(80, 30, 15, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw exclamation mark
                ctx.beginPath();
                ctx.moveTo(80, 20);
                ctx.lineTo(80, 35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(80, 40, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw text without fade
                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Critical Battery', 80, 60);
                ctx.font = '10px monospace';
                ctx.fillText('Shutdown Imminent', 80, 75);
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Battery Critical") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        }
    ],
    testing: [
        {
            title: "Test Screen 1",
            explanation: "This is a test screen for experiments.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#222';
                ctx.fillRect(0, 0, 160, 80);
                ctx.fillStyle = '#0f0';
                ctx.font = '18px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Testing Flow', 80, 40);
                ctx.font = '12px monospace';
                ctx.fillStyle = '#fff';
                ctx.fillText('Add your tests here!', 80, 60);
            },
            led: { state: 'off', color: 'none' }
        },
        {
            title: "Animated Battery",
            explanation: "A large battery animating a charging sequence.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 160, 80);
                // Animate battery level from 0 to 100% in a loop
                const cycle = 2000; // slower animation
                const percent = ((frame % cycle) / (cycle - 1)) * 100;
                // Battery dimensions - reduced size
                const x = 32;
                const y = 5; // Sticky to top
                const width = 90;
                const height = 45; // Reduced height
                const radius = 6; // Slightly reduced radius
                // Draw battery outline with rounded corners
                ctx.save();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
                // Battery tip
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + width, y + height / 4, 8, height / 2);
                // Battery fill with rounded corners
                ctx.save();
                // Fill area padding
                const pad = 6;
                ctx.beginPath();
                ctx.moveTo(x + radius + pad, y + pad);
                ctx.lineTo(x + pad + (width - 2 * pad) * (percent / 100), y + pad);
                ctx.lineTo(x + pad + (width - 2 * pad) * (percent / 100), y + height - pad);
                ctx.lineTo(x + radius + pad, y + height - pad);
                ctx.quadraticCurveTo(x + pad, y + height - pad, x + pad, y + height - pad - radius);
                ctx.lineTo(x + pad, y + pad + radius);
                ctx.quadraticCurveTo(x + pad, y + pad, x + radius + pad, y + pad);
                ctx.closePath();
                ctx.clip();
                // Fill color - now always white
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + pad, y + pad, (width - 2 * pad) * (percent / 100), height - 2 * pad);
                // Shimmer effect
                const shimmerWidth = 25;
                const shimmerX = x + pad + ((frame * 2) % ((width - 2 * pad) + shimmerWidth)) - shimmerWidth;
                const grad = ctx.createLinearGradient(shimmerX, 0, shimmerX + shimmerWidth, 0);
                grad.addColorStop(0, 'rgba(255,255,255,0)');
                grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(x + pad, y + pad, (width - 2 * pad) * (percent / 100), height - 2 * pad);
                ctx.restore();
                // Percentage text - now at bottom
                ctx.fillStyle = '#fff';
                ctx.font = '16px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(percent) + '%', 80, 75); // Positioned at bottom
            },
            led: { state: 'breathing', color: 'white' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Animated Battery") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Animated Battery 2",
            explanation: "A large battery animating a charging sequence.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 160, 80);
                // Animate battery level from 0 to 100% in a loop
                const cycle = 2000; // slower animation
                const percent = ((frame % cycle) / (cycle - 1)) * 100;
                
                // Draw charging indicator on the left
                const indicatorWidth = 4;
                const indicatorHeight = 45;
                const indicatorX = 0;
                const indicatorY = 17;
                
                // Draw vertical rectangle
                ctx.fillStyle = '#fff';
                ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
                
                // Lightning bolt configuration
                const boltConfig = {
                    x: indicatorX + 10,        // X position (distance from left edge)
                    y: indicatorY + 10,       // Y position (distance from top)
                    width: 14,                // Width of the bolt (matching SVG)
                    height: 22,               // Height of the bolt (matching SVG)
                    thickness: 1,             // Thickness of the bolt lines
                    angle: 0,                 // Rotation angle in degrees
                    color: '#fff'             // Color of the bolt
                };
                
                // Draw lightning bolt
                ctx.save();
                ctx.fillStyle = boltConfig.color;
                ctx.translate(boltConfig.x, boltConfig.y);
                ctx.rotate(boltConfig.angle * Math.PI / 180);
                
                // Calculate bolt points based on config
                const w = boltConfig.width;
                const h = boltConfig.height;
                
                ctx.beginPath();
                // Top right point
                ctx.moveTo(w * 0.794, 0);
                // Top left point
                ctx.lineTo(w * 0.308, 0);
                // Left middle point
                ctx.lineTo(0, h * 0.526);
                // Left bottom point
                ctx.lineTo(w * 0.481, h * 0.526);
                // Bottom left point
                ctx.lineTo(w * 0.264, h);
                // Bottom right point
                ctx.lineTo(w, h * 0.383);
                // Right middle point
                ctx.lineTo(w * 0.481, h * 0.383);
                // Close back to top right
                ctx.lineTo(w * 0.794, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                
                // Battery dimensions - 20% smaller and centered
                const width = 72; // 90 * 0.8
                const height = 36; // 45 * 0.8
                const x = (160 - width) / 2; // Center horizontally
                const y = (80 - height) / 2; // Center vertically
                const radius = 5; // Slightly reduced radius
                
                // Draw battery outline with rounded corners
                ctx.save();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.stroke();
                ctx.restore();
                
                // Battery tip
                ctx.fillStyle = '#fff';
                ctx.fillRect(x + width, y + height / 4, 6, height / 2);
                
                // Percentage text inside battery
                ctx.fillStyle = '#fff';
                ctx.font = '18px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.round(percent) + '%', x + width/2, y + height/2);
            },
            led: { state: 'breathing', color: 'white' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Animated Battery 2") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
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

// Add at the top, after other state variables
const microQRImg = new Image();
microQRImg.src = 'Micro QR.png';
let microQRImgLoaded = false;
microQRImg.onload = function() { microQRImgLoaded = true; updateDisplay(); };

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

// Add function to update progress from mobile
function updateFirmwareProgress(progress) {
    updateProgress = progress;
    if (progress >= 1) {
        // Move to complete state
        currentStateIndex = 2;
        updateDisplay();
    }
}

// After flows object and before updateDisplay or any event listeners
function toTitleCase(str) {
    return str.replace(/([A-Z])/g, ' $1')
        .replace(/^./, function(txt){ return txt.toUpperCase(); })
        .replace(/\b\w/g, function(txt){ return txt.toUpperCase(); })
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ');
}

function populateFlowSelect() {
    flowSelect.innerHTML = '';
    Object.keys(flows).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        // Human-friendly label
        option.textContent = toTitleCase(key);
        flowSelect.appendChild(option);
    });
}

populateFlowSelect();

// Initialize the display
updateDisplay(); 