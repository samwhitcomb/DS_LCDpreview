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

// Load custom fonts
const barlowFont = new FontFace('Barlow', 'url(fonts/Barlow_600SemiBold.ttf)');
barlowFont.load().then((font) => {
    document.fonts.add(font);
    console.log('Barlow font loaded successfully');
}).catch((error) => {
    console.error('Error loading Barlow font:', error);
});

// Add cable state management
let isCableVisible = false;

// Function to update cable visibility
function updateCableVisibility(visible) {
    const cableElement = document.getElementById('cable');
    if (cableElement) {
        cableElement.style.display = visible ? 'block' : 'none';
    }
    isCableVisible = visible;
}

// Battery drawing function
function drawBattery(ctx, level) {
    const x = 130;  // Position from right
    const y = 5;    // Position from top
    const width = 20;
    const height = 10;
    const radius = 0.5;  // Radius for rounded corners
    
    // Battery outline with rounded corners
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
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
    
    // Battery tip (white rectangle)
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + width, y + 2, 2, height - 4);
    
    // Battery level with rounded corners
    const fillWidth = (width - 2) * (level / 100);
    ctx.fillStyle = level > 20 ? '#fff' : '#ff0000';
    ctx.beginPath();
    ctx.moveTo(x + 1 + radius, y + 1);
    ctx.lineTo(x + 1 + fillWidth - radius, y + 1);
    ctx.quadraticCurveTo(x + 1 + fillWidth, y + 1, x + 1 + fillWidth, y + 1 + radius);
    ctx.lineTo(x + 1 + fillWidth, y + height - 1 - radius);
    ctx.quadraticCurveTo(x + 1 + fillWidth, y + height - 1, x + 1 + fillWidth - radius, y + height - 1);
    ctx.lineTo(x + 1 + radius, y + height - 1);
    ctx.quadraticCurveTo(x + 1, y + height - 1, x + 1, y + height - 1 - radius);
    ctx.lineTo(x + 1, y + 1 + radius);
    ctx.quadraticCurveTo(x + 1, y + 1, x + 1 + radius, y + 1);
    ctx.closePath();
    ctx.fill();
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
            explanation: "Device is powered on. It is automatically searching for a connection. (Additional option found in connection flow)",
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
            explanation: "Press and hold the power button for 5 seconds to initiate shutdown.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                if (!isShuttingDown) {
                    ctx.fillStyle = '#fff';
                    ctx.font = '12px monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText('Press and hold', 10, 30);
                    ctx.fillText('power button', 10, 50);
                    ctx.fillText('to shutdown', 10, 70);
                }
                
                drawBattery(ctx, 85);
                // Only draw the vertical line without the bouncing arrow
                const x = 140;  // Position from right
                const y = 40;   // Center vertically
                const lineHeight = 20;  // Fixed height
                const lineOpacity = Math.abs(Math.sin(frame * 0.02)) * 0.5 + 0.3;
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 5, y - lineHeight/2);
                ctx.lineTo(x + 5, y + lineHeight/2);
                ctx.stroke();
            },
            led: { state: 'on', color: 'white' },
            onEnter: () => {
                let frame = 0;
                let gifContainer = null;
                let initialDelayTimer = null;
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Shutdown") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                
                // Create GIF container when shutdown starts
                const createGifContainer = () => {
                    // Always remove existing container first to restart animation
                    removeGifContainer();
                    
                    // Clear any existing timer
                    if (initialDelayTimer) {
                        clearTimeout(initialDelayTimer);
                    }
                    
                    // Wait 0.3 seconds before showing the GIF
                    initialDelayTimer = setTimeout(() => {
                        // Create new container
                        gifContainer = document.createElement('div');
                        gifContainer.style.position = 'absolute';
                        gifContainer.style.top = canvas.offsetTop + 'px';
                        gifContainer.style.left = canvas.offsetLeft + 'px';
                        gifContainer.style.width = canvas.width + 'px';
                        gifContainer.style.height = canvas.height + 'px';
                        gifContainer.style.zIndex = '10';
                        gifContainer.dataset.gifContainer = 'true';
                        gifContainer.style.opacity = '0'; // Start with 0 opacity
                        gifContainer.style.transition = 'opacity 0.5s ease-in'; // Add fade transition
                        canvas.parentNode.appendChild(gifContainer);

                        // Create new image element
                        const img = document.createElement('img');
                        img.style.width = '70%'; // Make GIF 30% smaller
                        img.style.height = '70%';
                        img.style.objectFit = 'contain';
                        img.style.position = 'absolute';
                        img.style.top = '50%';
                        img.style.left = '50%';
                        img.style.transform = 'translate(-50%, -50%)'; // Center the smaller GIF
                        
                        // Force reload of GIF by adding timestamp
                        const timestamp = new Date().getTime();
                        img.src = `Assets/poweroff.gif?t=${timestamp}`;
                        
                        gifContainer.appendChild(img);
                        
                        // Trigger fade in
                        requestAnimationFrame(() => {
                            gifContainer.style.opacity = '1';
                        });
                    }, 500); // 0.3 second delay
                };
                
                // Remove GIF container
                const removeGifContainer = () => {
                    if (gifContainer) {
                        gifContainer.remove();
                        gifContainer = null;
                    }
                    if (initialDelayTimer) {
                        clearTimeout(initialDelayTimer);
                        initialDelayTimer = null;
                    }
                };
                
                // Start animation
                animate();
                
                // Add event listeners for shutdown state changes
                const originalStartShutdown = startShutdownCountdown;
                startShutdownCountdown = () => {
                    originalStartShutdown();
                    createGifContainer(); // This will now always create a fresh container after delay
                };
                
                const originalCancelShutdown = cancelShutdown;
                cancelShutdown = () => {
                    originalCancelShutdown();
                    removeGifContainer();
                };
            },
            onExit: () => {
                // Remove GIF container when exiting state
                const gifContainer = document.querySelector('[data-gif-container="true"]');
                if (gifContainer) {
                    gifContainer.remove();
                }
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
        },
        {
            title: "Power Button Hold",
            explanation: "Hold the power button for 2 seconds to power off",
            draw: (ctx, frame) => {
                // Clear canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
            },
            led: { state: 'on', color: 'red' },
            onEnter: () => {
                let holdStartTime = null;
                let holdTimer = null;
                let frame = 0;
                
                // Create a container for the GIF
                const gifContainer = document.createElement('div');
                gifContainer.style.position = 'absolute';
                gifContainer.style.top = canvas.offsetTop + 'px';
                gifContainer.style.left = canvas.offsetLeft + 'px';
                gifContainer.style.width = canvas.width + 'px';
                gifContainer.style.height = canvas.height + 'px';
                gifContainer.style.zIndex = '10';
                gifContainer.dataset.gifContainer = 'true';
                canvas.parentNode.appendChild(gifContainer);

                // Create and load the image
                const img = document.createElement('img');
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                gifContainer.appendChild(img);
                img.src = 'Assets/poweroff.gif';
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Power Button Hold") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                
                const handlePowerButton = (isPressed) => {
                    if (isPressed) {
                        powerButtonPressStartTime = Date.now();
                        isPowerButtonPressed = true;
                        startShutdownCountdown();
                        
                        // Set timeout for 5 seconds
                        setTimeout(() => {
                            if (isPowerButtonPressed) {
                                // If still pressed after 5 seconds, proceed to shutdown complete
                                currentStateIndex = 1;
                            }
                        }, SHUTDOWN_HOLD_TIME);
                    } else {
                        isPowerButtonPressed = false;
                        cancelShutdown();
                    }
                };
                
                // Start animation
                animate();
                
                // Add event listeners for power button
                document.addEventListener('powerButtonPress', () => handlePowerButton(true));
                document.addEventListener('powerButtonRelease', () => handlePowerButton(false));
            },
            onExit: () => {
                // Clean up event listeners
                document.removeEventListener('powerButtonPress', () => {});
                document.removeEventListener('powerButtonRelease', () => {});
                
                // Remove GIF container
                const gifContainer = document.querySelector('[data-gif-container="true"]');
                if (gifContainer) {
                    gifContainer.remove();
                }
            }
        },
        {
            title: "Device Off",
            explanation: "Device is powered off",
            draw: (ctx, frame) => {
                // Clear canvas with black (screen is off)
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                // Reset all connection states
                connectionState = 'searching';
            }
        }
    ],
    binding: [
        {
            title: "Linking Ready",
            explanation: "Device is ready to be linked to your account.",
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
                fontSize = Math.floor(fontSize * 1.2); // Increase by 20%
                ctx.fillStyle = '#fff';
                ctx.font = `${fontSize}px Barlow`;
                ctx.fontWeight = '500';
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
                    if (currentState.title === "Linking Ready") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Linking in Progress",
            explanation: "Device is being linked to your account.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw text at the top
                ctx.fillStyle = '#fff';
                ctx.font = '19px Barlow';
                ctx.fontWeight = '400';
                ctx.textAlign = 'center';
                
                // Draw fixed "Linking" text
                ctx.fillText('Linking', 80, 52);  // Changed from 55 to 52
                
                // Draw animated dots separately
                const dots = '.'.repeat(Math.floor(frame / 20) % 4);
                const dotsWidth = ctx.measureText(dots).width;
                const linkingWidth = ctx.measureText('Linking').width;
                const spacing = 3; // Space between text and dots
                ctx.fillText(dots, 80 + (linkingWidth/2) + spacing, 52);  // Changed from 55 to 52
                
                // Draw progress bar at the bottom
                const barWidth = 120;
                const barHeight = 8;
                const barX = (160 - barWidth) / 2;
                const barY = 65;
                const radius = barHeight / 2;
                
                // Calculate progress (0 to 1)
                const progress = Math.min(1, frame / 100); // 5 seconds total
                
                // Draw background bar
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(barX + radius, barY);
                ctx.lineTo(barX + barWidth - radius, barY);
                ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
                ctx.lineTo(barX + barWidth, barY + barHeight - radius);
                ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - radius, barY + barHeight);
                ctx.lineTo(barX + radius, barY + barHeight);
                ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
                ctx.lineTo(barX, barY + radius);
                ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
                ctx.closePath();
                ctx.fill();
                
                // Draw progress fill
                const fillWidth = barWidth * progress;
                if (fillWidth > 0) {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.moveTo(barX + radius, barY);
                    ctx.lineTo(barX + fillWidth - radius, barY);
                    ctx.quadraticCurveTo(barX + fillWidth, barY, barX + fillWidth, barY + radius);
                    ctx.lineTo(barX + fillWidth, barY + barHeight - radius);
                    ctx.quadraticCurveTo(barX + fillWidth, barY + barHeight, barX + fillWidth - radius, barY + barHeight);
                    ctx.lineTo(barX + radius, barY + barHeight);
                    ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
                    ctx.lineTo(barX, barY + radius);
                    ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
                    ctx.closePath();
                    ctx.fill();
                }
                
                drawBattery(ctx, 85);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Linking in Progress") {
                        currentState.draw(ctx, frame++);
                        if (frame < 120) { // 5 seconds
                            requestAnimationFrame(animate);
                        } else {
                            currentStateIndex = 2; // Move to Linking Complete
                            updateDisplay();
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "Linking Complete",
            explanation: "Device has been successfully linked to your account.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                const shouldContinue = drawSuccessAnimationlink(ctx, frame);
                if (!shouldContinue) {
                    // Move to Post Binding state
                    currentStateIndex = 3; // Move to Post Binding state
                    updateDisplay();
                }
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Linking Complete") {
                        currentState.draw(ctx, frame++);
                        if (frame < 270) { // Total duration: 4.5 seconds
                            requestAnimationFrame(animate);
                        }
                    }
                };
                animate();
            }
        }
    ],
    firmwareUpdate: [
        {
            title: "Firmware Update, connect charger",
            explanation: "Connect charger before starting firmware update. Once charger is connected we can remove the warnings",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw vertical rectangle (charging indicator) - sticky to the left
                const indicatorWidth = 4;
                const indicatorHeight = 45;
                const indicatorX = 10; // Moved closer to left edge
                const indicatorY = 17;
                const cornerRadius = 2; // Radius for rounded corners
                
                // Draw vertical rectangle with rounded corners
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(indicatorX + cornerRadius, indicatorY);
                ctx.lineTo(indicatorX + indicatorWidth - cornerRadius, indicatorY);
                ctx.arcTo(indicatorX + indicatorWidth, indicatorY, indicatorX + indicatorWidth, indicatorY + cornerRadius, cornerRadius);
                ctx.lineTo(indicatorX + indicatorWidth, indicatorY + indicatorHeight - cornerRadius);
                ctx.arcTo(indicatorX + indicatorWidth, indicatorY + indicatorHeight, indicatorX + indicatorWidth - cornerRadius, indicatorY + indicatorHeight, cornerRadius);
                ctx.lineTo(indicatorX + cornerRadius, indicatorY + indicatorHeight);
                ctx.arcTo(indicatorX, indicatorY + indicatorHeight, indicatorX, indicatorY + indicatorHeight - cornerRadius, cornerRadius);
                ctx.lineTo(indicatorX, indicatorY + cornerRadius);
                ctx.arcTo(indicatorX, indicatorY, indicatorX + cornerRadius, indicatorY, cornerRadius);
                ctx.closePath();
                ctx.fill();
                
                // Draw larger centered lightning bolt
                const boltConfig = {
                    x: 65, // Center of screen
                    y: 18, // Center of screen
                    width: 30, // Larger size
                    height: 45, // Larger size
                    thickness: 1,
                    angle: 0,
                    color: '#fff'
                };
                
                // Draw lightning bolt
                ctx.save();
                ctx.fillStyle = boltConfig.color;
                ctx.translate(boltConfig.x, boltConfig.y);
                ctx.rotate(boltConfig.angle * Math.PI / 180);
                
                const w = boltConfig.width;
                const h = boltConfig.height;
                
                ctx.beginPath();
                ctx.moveTo(w * 0.794, 0);
                ctx.lineTo(w * 0.308, 0);
                ctx.lineTo(0, h * 0.526);
                ctx.lineTo(w * 0.481, h * 0.526);
                ctx.lineTo(w * 0.264, h);
                ctx.lineTo(w, h * 0.383);
                ctx.lineTo(w * 0.481, h * 0.383);
                ctx.lineTo(w * 0.794, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                
                // Animate arrow gesture
                const arrowX = 30; // Start from center
                const arrowY = 40; // Center vertically
                const arrowLength = 10;
                const gestureDuration = 60; // 1 second for complete gesture
                const gestureProgress = (frame % gestureDuration) / gestureDuration;
                const scaler = 0.7;
                
                // Calculate arrow position with easing
                const easeProgress = Math.sin(gestureProgress * Math.PI);
                const currentArrowX = arrowX - (arrowLength * easeProgress); // Move left instead of right
                
                    // Draw animated arrow as a solid triangle
                ctx.beginPath();
                ctx.moveTo(currentArrowX, arrowY); // Tip of triangle
                ctx.lineTo(currentArrowX + 15 * scaler, arrowY - 10 * scaler); // Top point
                ctx.lineTo(currentArrowX + 15 * scaler, arrowY + 10 * scaler); // Bottom point
                ctx.closePath();
                ctx.fillStyle = '#fff';
                ctx.fill();
                
                // Draw line from center to triangle
                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                //ctx.lineTo(currentArrowX + 15 * scaler, arrowY);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // No cable animation in this step
                updateCableVisibility(false);
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Firmware Update, connect charger") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Update Ready",
            explanation: "Firmware update ready to start",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Calculate animation phases
                const cableAnimationDuration = 30; // 0.5 seconds for cable animation
                const indicatorDelay = 2; // Short delay before showing indicators
                const holdDuration = 20; // 1 second hold after indicators appear
                const fadeDuration = 30; // 0.5 seconds for fade out
                
                // Get the cable element
                const cableElement = document.getElementById('cable');
                if (cableElement) {
                    if (frame === 0) {
                        // Initial state - cable off screen
                        cableElement.style.display = 'block';
                        cableElement.style.transition = 'transform 0.5s ease-out';
                        cableElement.style.transform = 'translateX(-100px)';
                        // Trigger reflow
                        cableElement.offsetHeight;
                        // Animate cable in
                        cableElement.style.transform = 'translateX(0)';
                    }
                }
                
                // Calculate fade out progress for vertical rectangle and lightning bolt
                const fadeStartFrame = cableAnimationDuration + indicatorDelay + holdDuration;
                const fadeProgress = frame >= fadeStartFrame ? 
                    Math.min(1, (frame - fadeStartFrame) / fadeDuration) : 0;
                
                // Draw tray icon during fadeout
                if (fadeProgress > 0) {
                    const trayConfig = {
                        x: 110,  // Aligned with battery
                        y: 10,   // Same y as battery
                        width: 10, // Same height as battery
                        height: 10,
                        color: `rgba(255, 255, 255, ${fadeProgress})` // Fade in as lightning fades out
                    };

                   // Draw empty battery
                drawBattery(ctx, 0);
                
                // Calculate lightning bolt position (centered in battery)
                const x = 130;  // Same x as battery
                const y = 5;    // Same y as battery
                const width = 20;
                const height = 15;
                
                // Calculate pulse effect for lightning bolt
                const pulseIntensity = 0.4;
                const pulseSpeed = 0.1;
                const pulseOffset = Math.sin(frame * pulseSpeed) * pulseIntensity;
                const boltOpacity = 0.7 + pulseOffset;
                
                // Lightning bolt configuration
                const boltConfig = {
                    x: x + width/2 - 7,  // Center the bolt (width is 14)
                    y: y + height/2 - 11, // Center the bolt (height is 22)
                    width: 14,
                    height: 22,
                    thickness: 1,
                    angle: 0,
                    color: `rgba(255, 255, 255, 1)`
                };
                
                // Draw lightning bolt
                ctx.save();
                ctx.fillStyle = boltConfig.color;
                ctx.translate(boltConfig.x, boltConfig.y);
                ctx.rotate(boltConfig.angle * Math.PI / 180);
                
                const w = boltConfig.width;
                const h = boltConfig.height;
                
                ctx.beginPath();
                ctx.moveTo(w * 0.794, 0);
                ctx.lineTo(w * 0.308, 0);
                ctx.lineTo(0, h * 0.526);
                ctx.lineTo(w * 0.481, h * 0.526);
                ctx.lineTo(w * 0.264, h);
                ctx.lineTo(w, h * 0.383);
                ctx.lineTo(w * 0.481, h * 0.383);
                ctx.lineTo(w * 0.794, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                }
                
                // Draw vertical rectangle (charging indicator) with fade out
                const indicatorWidth = 4;
                const indicatorHeight = 45;
                const indicatorX = 10;
                const indicatorY = 17;
                const cornerRadius = 2;
                
                // Draw vertical rectangle with rounded corners and fade out
                ctx.fillStyle = `rgba(255, 255, 255, ${1 - fadeProgress})`;
                ctx.beginPath();
                ctx.moveTo(indicatorX + cornerRadius, indicatorY);
                ctx.lineTo(indicatorX + indicatorWidth - cornerRadius, indicatorY);
                ctx.arcTo(indicatorX + indicatorWidth, indicatorY, indicatorX + indicatorWidth, indicatorY + cornerRadius, cornerRadius);
                ctx.lineTo(indicatorX + indicatorWidth, indicatorY + indicatorHeight - cornerRadius);
                ctx.arcTo(indicatorX + indicatorWidth, indicatorY + indicatorHeight, indicatorX + indicatorWidth - cornerRadius, indicatorY + indicatorHeight, cornerRadius);
                ctx.lineTo(indicatorX + cornerRadius, indicatorY + indicatorHeight);
                ctx.arcTo(indicatorX, indicatorY + indicatorHeight, indicatorX, indicatorY + indicatorHeight - cornerRadius, cornerRadius);
                ctx.lineTo(indicatorX, indicatorY + cornerRadius);
                ctx.arcTo(indicatorX, indicatorY, indicatorX + cornerRadius, indicatorY, cornerRadius);
                ctx.closePath();
                ctx.fill();
                
                // Calculate lightning bolt position and size based on fade progress
                const boltConfig = {
                    x: 65, // Keep centered
                    y: 18, // Keep centered
                    width: 30, // Keep original size
                    height: 45, // Keep original size
                    thickness: 1,
                    angle: 0,
                    color: `rgba(255, 255, 255, ${1 - fadeProgress})` // Fade out opacity
                };
                
                // Draw lightning bolt
                ctx.save();
                ctx.fillStyle = boltConfig.color;
                ctx.translate(boltConfig.x, boltConfig.y);
                ctx.rotate(boltConfig.angle * Math.PI / 180);
                
                const w = boltConfig.width;
                const h = boltConfig.height;
                
                ctx.beginPath();
                ctx.moveTo(w * 0.794, 0);
                ctx.lineTo(w * 0.308, 0);
                ctx.lineTo(0, h * 0.526);
                ctx.lineTo(w * 0.481, h * 0.526);
                ctx.lineTo(w * 0.264, h);
                ctx.lineTo(w, h * 0.383);
                ctx.lineTo(w * 0.481, h * 0.383);
                ctx.lineTo(w * 0.794, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                
                // Show cable during animation
                updateCableVisibility(true);

                // Only show text when the lightning bolt has minimized completely
                if (fadeProgress >= 1) {
                    // Draw text at the top
                    ctx.fillStyle = '#fff';
                    ctx.font = '15px Barlow';
                    ctx.fontWeight = '300';
                    ctx.textAlign = 'center';
                    ctx.fillText('Firmware 1.43', 80, 45);

                    ctx.fillStyle = '#fff';
                    ctx.font = '20px Barlow';
                    ctx.fontWeight = '400';
                    ctx.textAlign = 'center';
                    ctx.fillText('Ready', 80, 66);
                }
            },
            led: { state: 'breathing', color: 'yellow' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Update Ready") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Updating",
            explanation: "Firmware update in progress",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw text at the top
                ctx.fillStyle = '#fff';
                ctx.font = '15px Barlow';
                ctx.fontWeight = '300';
                ctx.textAlign = 'center';
                ctx.fillText('Fw 1.43', 80, 25);
                
                // Calculate progress and time
                const totalDuration = 30; // 30 seconds total
                const elapsedTime = frame / 60; // Convert frames to seconds
                const progress = Math.min(1, elapsedTime / totalDuration);
                updateProgress = progress; // Update global progress
                
                // Calculate remaining time
                const remainingTime = Math.max(0, totalDuration - elapsedTime);
                const minutes = Math.floor(remainingTime / 60);
                const seconds = Math.floor(remainingTime % 60);
                
                // Draw progress bar in the middle (full width)
                const barWidth = 140; // Increased width
                const barHeight = 8;
                const barX = (160 - barWidth) / 2;
                const barY = 47; // Moved up slightly
                const radius = barHeight / 2;
                
                // Draw background bar
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(barX + radius, barY);
                ctx.lineTo(barX + barWidth - radius, barY);
                ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
                ctx.lineTo(barX + barWidth, barY + barHeight - radius);
                ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - radius, barY + barHeight);
                ctx.lineTo(barX + radius, barY + barHeight);
                ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
                ctx.lineTo(barX, barY + radius);
                ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
                ctx.closePath();
                ctx.fill();
                
                // Draw progress fill
                const fillWidth = barWidth * progress;
                if (fillWidth > 0) {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.moveTo(barX + radius, barY);
                    ctx.lineTo(barX + fillWidth - radius, barY);
                    ctx.quadraticCurveTo(barX + fillWidth, barY, barX + fillWidth, barY + radius);
                    ctx.lineTo(barX + fillWidth, barY + barHeight - radius);
                    ctx.quadraticCurveTo(barX + fillWidth, barY + barHeight, barX + fillWidth - radius, barY + barHeight);
                    ctx.lineTo(barX + radius, barY + barHeight);
                    ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
                    ctx.lineTo(barX, barY + radius);
                    ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
                    ctx.closePath();
                    ctx.fill();
                }
                
                // Draw "Remaining:" text at bottom left
                ctx.font = '12px monospace';
                ctx.textAlign = 'left';
                ctx.fillStyle = '#fff';
                ctx.fillText('Remaining:', 10, 75);
                
                // Draw countdown at bottom right
                ctx.textAlign = 'right';
                ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, 150, 75);
                
              // Draw empty battery
              drawBattery(ctx, 0);
                
              // Calculate lightning bolt position (centered in battery)
              const x = 130;  // Same x as battery
              const y = 5;    // Same y as battery
              const width = 20;
              const height = 15;
              
              // Calculate pulse effect for lightning bolt
              const pulseIntensity = 0.4;
              const pulseSpeed = 0.1;
              const pulseOffset = Math.sin(frame * pulseSpeed) * pulseIntensity;
              const boltOpacity = 0.7 + pulseOffset;
              
              // Lightning bolt configuration
              const boltConfig = {
                  x: x + width/2 - 7,  // Center the bolt (width is 14)
                  y: y + height/2 - 11, // Center the bolt (height is 22)
                  width: 14,
                  height: 22,
                  thickness: 1,
                  angle: 0,
                  color: `rgba(255, 255, 255, 1)`
              };
              
              // Draw lightning bolt
              ctx.save();
              ctx.fillStyle = boltConfig.color;
              ctx.translate(boltConfig.x, boltConfig.y);
              ctx.rotate(boltConfig.angle * Math.PI / 180);
              
              const w = boltConfig.width;
              const h = boltConfig.height;
              
              ctx.beginPath();
              ctx.moveTo(w * 0.794, 0);
              ctx.lineTo(w * 0.308, 0);
              ctx.lineTo(0, h * 0.526);
              ctx.lineTo(w * 0.481, h * 0.526);
              ctx.lineTo(w * 0.264, h);
              ctx.lineTo(w, h * 0.383);
              ctx.lineTo(w * 0.481, h * 0.383);
              ctx.lineTo(w * 0.794, 0);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
              
                
                // Move to next state when complete
                if (progress >= 1) {
                    currentStateIndex = 2; // Move to Update Complete
                    updateDisplay();
                }

                updateCableVisibility(true);
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
                const shouldContinue = drawSuccessAnimation(ctx, frame);
                if (!shouldContinue) {
                    // Move to restarting state
                    currentStateIndex = 4; // Move to Restarting state (after Update Complete)
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

                updateCableVisibility(true);
            }
        },
        {
            title: "Restarting",
            explanation: "Device is restarting to apply firmware update.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw text with fade in
                const fadeDuration = 30; // 0.5 seconds
                const textProgress = Math.min(1, frame / fadeDuration);
                
                ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
                ctx.font = '19px Barlow';
                ctx.fontWeight = '300';
                ctx.textAlign = 'center';
                ctx.fillText('Restarting', 80, 40);
                
                // Draw dots animation
                const dots = '.'.repeat(Math.floor(frame / 20) % 4);
                const dotsWidth = ctx.measureText(dots).width;
                const restartingWidth = ctx.measureText('Restarting').width;
                const spacing = 3;
                ctx.fillText(dots, 80 + (restartingWidth/2) + spacing, 40);
                
                // After 2 seconds, transition to power flow
                if (frame >= 120) { // 2 seconds at 60fps
                    currentFlow = 'power';
                    currentStateIndex = 0;
                    updateDisplay();
                }
            },
            led: { state: 'breathing', color: 'blue' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Restarting") {
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
    'cable charging': [
        {
            title: "Connect cable",
            explanation: "Cable is being plugged into the device.",
            draw: (ctx, frame) => {
                // Start with blank screen
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 160, 80);
                
                // Calculate animation phases
                const cableAnimationDuration = 30; // 0.5 seconds for cable animation
                const indicatorDelay = 2; // Short delay before showing indicators
                const holdDuration = 60; // 1 second hold after indicators appear
                
                // Get the cable element
                const cableElement = document.getElementById('cable');
                if (cableElement) {
                    if (frame === 0) {
                        // Initial state - cable off screen
                        cableElement.style.display = 'block';
                        cableElement.style.transition = 'transform 0.5s ease-out';
                        cableElement.style.transform = 'translateX(-100px)';
                        // Trigger reflow
                        cableElement.offsetHeight;
                        // Animate cable in
                        cableElement.style.transform = 'translateX(0)';
                    }
                }
                
                // Only show charging indicators after cable animation
                if (frame >= cableAnimationDuration + indicatorDelay) {
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
                        x: indicatorX + 10,
                        y: indicatorY + 10,
                        width: 14,
                        height: 22,
                        thickness: 1,
                        angle: 0,
                        color: '#fff'
                    };
                    
                    // Draw lightning bolt
                    ctx.save();
                    ctx.fillStyle = boltConfig.color;
                    ctx.translate(boltConfig.x, boltConfig.y);
                    ctx.rotate(boltConfig.angle * Math.PI / 180);
                    
                    const w = boltConfig.width;
                    const h = boltConfig.height;
                    
                    ctx.beginPath();
                    ctx.moveTo(w * 0.794, 0);
                    ctx.lineTo(w * 0.308, 0);
                    ctx.lineTo(0, h * 0.526);
                    ctx.lineTo(w * 0.481, h * 0.526);
                    ctx.lineTo(w * 0.264, h);
                    ctx.lineTo(w, h * 0.383);
                    ctx.lineTo(w * 0.481, h * 0.383);
                    ctx.lineTo(w * 0.794, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                  
                   
                }
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Connect cable") {
                        currentState.draw(ctx, frame++);
                        
                        // Move to next state after cable animation, indicators, and hold duration
                        const cableAnimationDuration = 30; // 0.5 seconds
                        const indicatorDelay = 2; // Short delay
                        const holdDuration = 60; // 1 second hold
                        if (frame >= cableAnimationDuration + indicatorDelay + holdDuration) {
                            currentStateIndex = 1; // Move to Animated Battery 2 state
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
            title: "Animated Battery 2",
            explanation: "A large battery animating a charging sequence.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 160, 80);
                
                // Calculate if battery is fully charged
                const cycle = 2000;
                const percent = ((frame % cycle) / (cycle - 1)) * 100;
                const isFullyCharged = percent >= 99.5; // Consider fully charged at 99.5% or higher
                
                // Only draw charging indicator and lightning bolt if not fully charged
                if (!isFullyCharged) {
                    // Draw charging indicator on the left
                    const indicatorWidth = 4;
                    const indicatorHeight = 45;
                    const indicatorX = 0;
                    const indicatorY = 17;
                    
                    // Draw vertical rectangle
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
                    
                    // Calculate pulse effect for lightning bolt
                    const pulseIntensity = 0.4;
                    const pulseSpeed = 0.1;
                    const pulseOffset = Math.sin(frame * pulseSpeed) * pulseIntensity;
                    const boltOpacity = 0.7 + pulseOffset;
                    
                    // Lightning bolt configuration
                    const boltConfig = {
                        x: indicatorX + 10,
                        y: indicatorY + 10,
                        width: 14,
                        height: 22,
                        thickness: 1,
                        angle: 0,
                        color: `rgba(255, 255, 255, ${boltOpacity})`
                    };
                    
                    // Draw lightning bolt
                    ctx.save();
                    ctx.fillStyle = boltConfig.color;
                    ctx.translate(boltConfig.x, boltConfig.y);
                    ctx.rotate(boltConfig.angle * Math.PI / 180);
                    
                    const w = boltConfig.width;
                    const h = boltConfig.height;
                    
                    ctx.beginPath();
                    ctx.moveTo(w * 0.794, 0);
                    ctx.lineTo(w * 0.308, 0);
                    ctx.lineTo(0, h * 0.526);
                    ctx.lineTo(w * 0.481, h * 0.526);
                    ctx.lineTo(w * 0.264, h);
                    ctx.lineTo(w, h * 0.383);
                    ctx.lineTo(w * 0.481, h * 0.383);
                    ctx.lineTo(w * 0.794, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
                
                // Draw battery with custom options
                drawAnimatedBattery(ctx, frame, {
                    x: isFullyCharged ? 32 : 49,  // Adjust position when fully charged
                    y: 23,  // Vertically centered
                    width: isFullyCharged ? 90 : 62,  // Full width when charged
                    height: 34,
                    radius: 7,
                    showPercentage: true,
                    percentageY: 45,  // Inside battery
                    shimmer: false
                });
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Animated Battery 2") {
                        currentState.draw(ctx, frame++);
                        
                        // Check if battery is fully charged and advance to next state
                        const cycle = 2000;
                        const percent = ((frame % cycle) / (cycle - 1)) * 100;
                        if (percent >= 99.5) {
                            currentStateIndex = 3; // Move to Battery Fully Charged state (index 2)
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
            title: "Battery Fully Charged",
            explanation: "Battery fully charged at 100% whilst still plugged in.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw charging indicator on the left
                const indicatorWidth = 4;
                const indicatorHeight = 45;
                const indicatorX = 0;
                const indicatorY = 17;
                
                // Draw vertical rectangle
                ctx.fillStyle = '#fff';
                ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
                
                // Calculate lightning bolt opacity (fade out over 1 second = 60 frames)
                const fadeDuration = 60;
                const boltOpacity = Math.max(0, 1 - (frame / fadeDuration));
                
                // Lightning bolt configuration
                const boltConfig = {
                    x: indicatorX + 10,
                    y: indicatorY + 10,
                    width: 14,
                    height: 22,
                    thickness: 1,
                    angle: 0,
                    color: `rgba(255, 255, 255, ${boltOpacity})`
                };
                
                // Draw lightning bolt with fade
                ctx.save();
                ctx.fillStyle = boltConfig.color;
                ctx.translate(boltConfig.x, boltConfig.y);
                ctx.rotate(boltConfig.angle * Math.PI / 180);
                
                const w = boltConfig.width;
                const h = boltConfig.height;
                
                ctx.beginPath();
                ctx.moveTo(w * 0.794, 0);
                ctx.lineTo(w * 0.308, 0);
                ctx.lineTo(0, h * 0.526);
                ctx.lineTo(w * 0.481, h * 0.526);
                ctx.lineTo(w * 0.264, h);
                ctx.lineTo(w, h * 0.383);
                ctx.lineTo(w * 0.481, h * 0.383);
                ctx.lineTo(w * 0.794, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                
                // Draw battery at 100%
                drawAnimatedBattery(ctx, 0, {
                    x: 49,  // Keep same position as charging state
                    y: 23,
                    width: 62,  // Keep same width as charging state
                    height: 34,
                    radius: 7,
                    showPercentage: true,
                    percentageY: 45,
                    shimmer: false,
                    forcePercent: 100  // Force 100% display
                });
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Battery Fully Charged") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Cable Disconnect",
            explanation: "Cable is unplugged and battery indicator persists before turning off.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, 160, 80);
                
                // Calculate animation phases
                const batteryPersistDuration = 100; // 5 seconds for battery persistence
                const batteryFadeDuration = 30; // 0.5 seconds for battery fade out
                
                // Calculate battery opacity (fade out at the end)
                const batteryOpacity = frame < batteryPersistDuration ? 1 :
                    frame < batteryPersistDuration + batteryFadeDuration ?
                    1 - ((frame - batteryPersistDuration) / batteryFadeDuration) : 0;
                
                // Draw battery at 100% with fade out
                if (batteryOpacity > 0) {
                    ctx.globalAlpha = batteryOpacity;
                    drawAnimatedBattery(ctx, 0, {
                        x: 49,
                        y: 23,
                        width: 62,
                        height: 34,
                        radius: 7,
                        showPercentage: true,
                        percentageY: 45,
                        shimmer: false,
                        forcePercent: 100
                    });
                    ctx.globalAlpha = 1;
                }
            },
            led: { state: 'off', color: 'none' },
            onEnter: () => {
                let frame = 0;
                
                // Get the cable element
                const cableElement = document.getElementById('cable');
                if (cableElement) {
                    // Add animation class
                    cableElement.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
                    cableElement.style.transform = 'translateX(-100px)';
                    cableElement.style.opacity = '0';
                }
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Cable Disconnect") {
                        currentState.draw(ctx, frame++);
                        if (frame < 330) { // Continue for 5.5 seconds (5s persist + 0.5s fade)
                            requestAnimationFrame(animate);
                        }
                    }
                };
                animate();
            }
        }
    ],
    levelling: [
        {
            title: "Attitude Indicator v4",
            explanation: "Device orientation: graphically show the accelerometer data in an intuitive way to enhance and facilitate levelling outside of the app",
            draw: (ctx, frame) => {
                // Clear the canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Save the context state
                ctx.save();
                
                // Move to center and rotate for roll
                const centerX = 80;
                const centerY = 40;
                ctx.translate(centerX, centerY);
                ctx.rotate((rollDegrees * rollExaggerationFactor) * Math.PI / 180);  // Use global roll exaggeration
                
                // Draw extended sky (black) - make it larger than the LCD
                ctx.fillStyle = '#000000';
                ctx.fillRect(-200, -200, 400, 400);
                
                // Determine if we're within 1 degree margin
                const isLevel = Math.abs(rollDegrees) <= 1 && Math.abs(pitchDegrees) <= 1;
                
                // Draw extended ground with color based on level status
                ctx.fillStyle = isLevel ? '#00FF00' : '#FF0000';
                ctx.fillRect(-200, pitchDegrees * pitchExaggerationFactor, 400, 400);  // Move the ground with pitch
                
                // Restore the context
                ctx.restore();
                
                // Draw the fixed horizon line in white
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 40);  // Fixed at center
                ctx.lineTo(160, 40);
                ctx.stroke();
                
                // Draw the fixed center marker in white
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(70, 40);  // Fixed at center
                ctx.lineTo(90, 40);
                ctx.moveTo(80, 30);
                ctx.lineTo(80, 50);
                ctx.stroke();
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Attitude Indicator v4") {  // Fixed to check for v4
                        // Update LED state based on level status
                        const isLevel = Math.abs(rollDegrees) <= 1 && Math.abs(pitchDegrees) <= 1;
                        currentState.led = isLevel ? 
                            { state: 'on', color: 'green' } : 
                            { state: 'blink', color: 'green' };
                            
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Attitude Indicator v2",
            explanation: "Device orientation: graphically show the accelerometer data in an intuitive way to enhance and facilitate levelling outside of the app",
            draw: (ctx, frame) => {
                // Clear the canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Save the context state
                ctx.save();
                
                // Move to center and rotate for roll
                const centerX = 80;
                const centerY = 40;
                ctx.translate(centerX, centerY);
                ctx.rotate((rollDegrees * rollExaggerationFactor) * Math.PI / 180);  // Use global roll exaggeration
                
                // Draw extended sky (blue) - make it larger than the LCD
                ctx.fillStyle = '#1E90FF';
                ctx.fillRect(-200, -200, 400, 400);
                
                // Draw extended ground (brown) - make it larger than the LCD
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-200, 0, 400, 400);
                
                // Determine if we're within 1 degree margin (using original values for level check)
                const isLevel = Math.abs(rollDegrees) <= 1 && Math.abs(pitchDegrees) <= 1;
                
                // Draw the horizon line with color based on level status
                ctx.strokeStyle = isLevel ? '#00FF00' : '#FF0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-200, pitchDegrees * pitchExaggerationFactor);  // Use global pitch exaggeration
                ctx.lineTo(200, pitchDegrees * pitchExaggerationFactor);
                ctx.stroke();
                
                // Draw the center marker in white
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-10, pitchDegrees * pitchExaggerationFactor);  // Use global pitch exaggeration
                ctx.lineTo(10, pitchDegrees * pitchExaggerationFactor);
                ctx.moveTo(0, (pitchDegrees * pitchExaggerationFactor) - 10);
                ctx.lineTo(0, (pitchDegrees * pitchExaggerationFactor) + 10);
                ctx.stroke();
                
                // Restore the context
                ctx.restore();
                
                // Draw the degree values
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(rollDegrees)}°`, 80, 15);  // Roll at top
                ctx.textAlign = 'left';
                ctx.fillText(`${Math.round(pitchDegrees)}°`, 130, 40);  // Pitch on right
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Attitude Indicator v2") {
                        // Update LED state based on level status
                        const isLevel = Math.abs(rollDegrees) <= 1 && Math.abs(pitchDegrees) <= 1;
                        currentState.led = isLevel ? 
                            { state: 'on', color: 'green' } : 
                            { state: 'blink', color: 'green' };
                            
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Attitude Indicator v3",
            explanation: "Device orientation: graphically show the accelerometer data in an intuitive way to enhance and facilitate levelling outside of the app",
            draw: (ctx, frame) => {
                // Clear the canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Save the context state
                ctx.save();
                
                // Move to center and rotate for roll
                const centerX = 80;
                const centerY = 40;
                ctx.translate(centerX, centerY);
                ctx.rotate((rollDegrees * rollExaggerationFactor) * Math.PI / 180);  // Use global roll exaggeration
                
                // Draw extended sky (black) - make it larger than the LCD
                ctx.fillStyle = '#000000';
                ctx.fillRect(-200, -200, 400, 400);
                
                // Draw extended ground (white) - make it larger than the LCD
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(-200, pitchDegrees * pitchExaggerationFactor, 400, 400);  // Move the ground with pitch
                
                // Restore the context
                ctx.restore();
                
                // Draw the fixed horizon line with color based on level status
                const isLevel = Math.abs(rollDegrees) <= 1 && Math.abs(pitchDegrees) <= 1;
                ctx.strokeStyle = isLevel ? '#00FF00' : '#FF0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, 40);  // Fixed at center
                ctx.lineTo(160, 40);
                ctx.stroke();
                
                // Draw the fixed center marker in white
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(70, 40);  // Fixed at center
                ctx.lineTo(90, 40);
                ctx.moveTo(80, 30);
                ctx.lineTo(80, 50);
                ctx.stroke();
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Attitude Indicator v3") {
                        // Update LED state based on level status
                        const isLevel = Math.abs(rollDegrees) <= 1 && Math.abs(pitchDegrees) <= 1;
                        currentState.led = isLevel ? 
                            { state: 'on', color: 'green' } : 
                            { state: 'blink', color: 'green' };
                            
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
       
    ],
    ShotState: [
        {
            title: "White ready sequence",
            explanation: "A white loading animation that indicates processing or loading state.",
            draw: (ctx, frame) => {
                // Clear the canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);

                // Draw battery and WiFi
                drawBattery(ctx, 85);
                drawWifiStatus(ctx, 'connected', frame, false);
            },
            led: { state: 'breathing', color: 'red' }, // Initial LED state is always white breathing
            onEnter: () => {
                // Reset LED state to white breathing immediately
                ledLight.className = 'led-light';
                ledLight.classList.add('breathing');
                ledLight.classList.add('red');
                
                // Explicitly set the LED state in the current state
                const currentStates = flows[currentFlow];
                const currentState = currentStates[currentStateIndex];
                currentState.led = { state: 'breathing', color: 'red' };
                
                // Create a container for the GIF/PNG
                const gifContainer = document.createElement('div');
                gifContainer.style.position = 'absolute';
                gifContainer.style.top = 30 + 'px';
                gifContainer.style.left = 7 + 'px';
                gifContainer.style.width = canvas.width*1 + 'px';
                gifContainer.style.height = canvas.height*1 + 'px';
                gifContainer.style.zIndex = '0';
                gifContainer.dataset.gifContainer = 'true'; // Add data attribute for easy selection
                canvas.parentNode.appendChild(gifContainer);

                // Create and load the image
                const img = document.createElement('img');
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                gifContainer.appendChild(img);

                // Start the sequence with white loading
                img.src = 'Assets/White_Loading.gif';
                
                let frame = 0;
                let sequenceStage = 0; // 0: Loading, 1: Ready animation, 2: Ready static
                let startTime = Date.now();
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "White ready sequence") {
                        // Calculate elapsed time in milliseconds
                        const elapsedTime = Date.now() - startTime;
                        
                        // State transitions based on time
                        if (sequenceStage === 0 && elapsedTime >= secondsToFrames(4) * (1000/FRAME_RATE)) {
                            // After 2.5 seconds, transition to Ready.gif
                            img.src = 'Assets/Ready.gif';
                            sequenceStage = 1;
                            // Ensure LED stays white breathing
                            currentState.led = { state: 'on', color: 'green' };
                            ledLight.className = 'led-light';
                            ledLight.classList.add('on');
                            ledLight.classList.add('green');
                        } else if (sequenceStage === 1 && elapsedTime >= secondsToFrames(5) * (1000/FRAME_RATE)) {
                            // After 0.425 more seconds (2.925 seconds total), transition to Ready.png
                            img.src = 'Assets/Ready.png';
                            sequenceStage = 2;
                            // Update LED to green
                            currentState.led = { state: 'on', color: 'green' };
                            // Update the LED display immediately
                            ledLight.className = 'led-light';
                            ledLight.classList.add('on');
                            ledLight.classList.add('green');
                        }
                        
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    } else {
                        // Cleanup when switching away
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
                animate();
                
                // Return a cleanup function
                return {
                    destroy: () => {
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
            }
        },
        {
            title: "Blue Loading Animation",
            explanation: "A blue loading animation test which indicates processing or loading state. Unlikely to be used in production.",
            draw: (ctx, frame) => {
                // Clear the canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);

                // Draw battery and WiFi
                drawBattery(ctx, 85);
                drawWifiStatus(ctx, 'connected', frame, false);
            },
            led: { state: 'breathing', color: 'blue' },
            onEnter: () => {
                // Create a container for the GIF
                const gifContainer = document.createElement('div');
                gifContainer.style.position = 'absolute';
                gifContainer.style.top = canvas.offsetTop + 'px';
                gifContainer.style.left = (canvas.offsetLeft + 5) + 'px';  // Move 5px right
                gifContainer.style.width = canvas.width + 'px';
                gifContainer.style.height = canvas.height + 'px';
                gifContainer.style.zIndex = '0';  // Set to background
                canvas.parentNode.appendChild(gifContainer);

                // Create and load the image
                const img = document.createElement('img');
                img.src = 'Assets/Blue_Loading.gif';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                gifContainer.appendChild(img);

                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Blue Loading Animation") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    } else {
                        // Cleanup when switching away
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
                animate();
            }
        },
        {
            title: "White Loading Animation",
            explanation: "A white loading animation that indicates processing or loading state. Clearer and less distracting. Bouce is used in the animation to give a more dynamic feel.",
            draw: (ctx, frame) => {
                // Clear the canvas
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);

                // Draw battery and WiFi
                drawBattery(ctx, 85);
                drawWifiStatus(ctx, 'connected', frame, false);
            },
            led: { state: 'breathing', color: 'white' },
            onEnter: () => {
                // Create a container for the GIF
                const gifContainer = document.createElement('div');
                gifContainer.style.position = 'absolute';
                gifContainer.style.top = 30 + 'px';
                gifContainer.style.left = 25 + 'px';  // Move 5px right
                gifContainer.style.width = canvas.width*0.8 + 'px';
                gifContainer.style.height = canvas.height*0.8 + 'px';
                gifContainer.style.zIndex = '0';  // Set to background
                canvas.parentNode.appendChild(gifContainer);

                // Create and load the image
                const img = document.createElement('img');
                img.src = 'Assets/White_Loading.gif';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                gifContainer.appendChild(img);

                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "White Loading Animation") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    } else {
                        // Cleanup when switching away
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
                animate();
            }
        }
    ],
    "Connection Animations": [
        {
            title: "WiFi Search GIF",
            explanation: "Searching for networks known networks.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
            },
            led: { state: 'breathing', color: 'blue' },
            onEnter: () => {
                let frame = 0;
                
               // Create a container for the GIF
               const gifContainer = document.createElement('div');
               gifContainer.style.position = 'absolute';
               gifContainer.style.top = (canvas.offsetTop + 0) + 'px';  // Add 5px padding from top
               gifContainer.style.left = canvas.offsetLeft + 'px';
               gifContainer.style.width = canvas.width + 'px';
               gifContainer.style.height = canvas.height + 'px';
               gifContainer.style.zIndex = '10';
               gifContainer.dataset.gifContainer = 'true';
               canvas.parentNode.appendChild(gifContainer);

               // Create and load the image
               const img = document.createElement('img');
               img.style.width = '80%';
               img.style.height = '80%';
               img.style.objectFit = 'contain';
               img.style.position = 'absolute';
               img.style.top = '38%';
               img.style.left = '50%';
               img.style.transform = 'translate(-50%, -50%)';
               gifContainer.appendChild(img);
                
                // Force reload of GIF by adding timestamp
                const timestamp = new Date().getTime();
                img.src = `Assets/searching.gif?t=${timestamp}`;
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "WiFi Search GIF") {
                        currentState.draw(ctx, frame++);
                        if (frame >= 180) { // After 3 seconds, move to connecting state
                            currentStateIndex = 1;
                            updateDisplay();
                        } else {
                            requestAnimationFrame(animate);
                        }
                    } else {
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
                
                animate();
                
                return {
                    destroy: () => {
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
            }
        },
        {
            title: "WiFi Search GIF 2/3",
            explanation: "Indicates that a known network is being connected to.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw network name with animated dots
                ctx.fillStyle = '#fff';
                ctx.font = '16px Barlow';
                ctx.textAlign = 'center';
                
                // Draw fixed network name at bottom
                ctx.fillText('Home_32', 80, 75);
                
                // Draw animated dots separately
                const dots = '.'.repeat(Math.floor((frame % 60) / 20) + 1);
                const dotsX = 80 + ctx.measureText('Home_32').width/2 + 2; // Position dots after the text
                ctx.fillText(dots, dotsX, 75);
            },
            led: { state: 'breathing', color: 'blue' },
            onEnter: () => {
                let frame = 0;
                
                // Create a container for the GIF
                const gifContainer = document.createElement('div');
                gifContainer.style.position = 'absolute';
                gifContainer.style.top = (canvas.offsetTop + 0) + 'px';  // Add 5px padding from top
                gifContainer.style.left = canvas.offsetLeft + 'px';
                gifContainer.style.width = canvas.width + 'px';
                gifContainer.style.height = canvas.height + 'px';
                gifContainer.style.zIndex = '10';
                gifContainer.dataset.gifContainer = 'true';
                canvas.parentNode.appendChild(gifContainer);

                // Create and load the image
                const img = document.createElement('img');
                img.style.width = '80%';
                img.style.height = '80%';
                img.style.objectFit = 'contain';
                img.style.position = 'absolute';
                img.style.top = '38%';
                img.style.left = '50%';
                img.style.transform = 'translate(-50%, -50%)';
                gifContainer.appendChild(img);
                
                // Force reload of GIF by adding timestamp
                const timestamp = new Date().getTime();
                img.src = `Assets/searching.gif?t=${timestamp}`;
                
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "WiFi Search GIF 2/3") {
                        currentState.draw(ctx, frame++);
                        if (frame >= 300) { // After 3 seconds, move to connecting state
                            currentStateIndex = 2;
                            updateDisplay();
                        } else {
                            requestAnimationFrame(animate);
                        }
                    } else {
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
                
                animate();
                
                return {
                    destroy: () => {
                        if (gifContainer.parentNode) {
                            gifContainer.parentNode.removeChild(gifContainer);
                        }
                    }
                };
            }
        },
        {
            title: "Connection Success23",
            explanation: "successfully connected to the selected network",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);

                  // Draw network name with animated dots
                  ctx.fillStyle = '#fff';
                  ctx.font = '16px Barlow';
                  ctx.textAlign = 'center';
                  
                  // Draw fixed network name at bottom
                  ctx.fillText('Home_32', 80, 75);
                  
                           
                
                // Draw success animation
                const shouldContinue = drawSuccessAnimationConnect(ctx, frame);
                if (!shouldContinue) {
                    // Move to next state after animation completes
                    currentStateIndex = 3;
                    updateDisplay();
                }
            },
            led: { state: 'on', color: 'green' },
            onEnter: () => {
                let frame = 0;
                const animate = () => {
                    const currentStates = flows[currentFlow];
                    const currentState = currentStates[currentStateIndex];
                    if (currentState.title === "Connection Success23") {
                        currentState.draw(ctx, frame++);
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        },
        {
            title: "Successfully connected to Home_32",
            explanation: "Persistent connection symbol in tray displays connection status and strength.",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery widget in top right
                const x = 130;  // Same x as battery
                const y = 5;    // Same y as battery
                const width = 20;
                const height = 15;
                drawBattery(ctx, 75);  // Show 75% battery level
                
                // Draw connection bars to the left of battery
                const barCount = 3;
                const barWidth = 3;
                const barSpacing = 2;
                const barHeights = [5, 8, 11]; // Heights for each bar
                const trayX = x - (barCount * (barWidth + barSpacing)) - 5; // Position bars to the left of battery
                const trayY = y + 0;  // Moved 1px higher (was y + 2)
                
                // Draw each bar
                for (let i = 0; i < barCount; i++) {
                    ctx.fillStyle = '#ffffff';  // All bars white for full signal
                    ctx.fillRect(
                        trayX + (i * (barWidth + barSpacing)),
                        trayY + (barHeights[barCount - 1] - barHeights[i]),
                        barWidth,
                        barHeights[i]
                    );
                }
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Medium Signal Strength",
            explanation: "Connected with medium signal strength",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery widget in top right
                drawBattery(ctx, 75);
                
                // Draw connection bars with medium strength (2 bars)
                drawSignalBars(ctx, 2);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Low Signal Strength",
            explanation: "Connected with low signal strength",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery widget in top right
                drawBattery(ctx, 75);
                
                // Draw connection bars with low strength (1 bar)
                drawSignalBars(ctx, 1);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Very Low Signal Strength",
            explanation: "Connected with very low signal strength",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery widget in top right
                drawBattery(ctx, 75);
                
                // Draw connection bars with very low strength (0 bars)
                drawSignalBars(ctx, 0);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "No Network Connection",
            explanation: "Unit is not connected to any network",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                // Draw battery widget in top right
                drawBattery(ctx, 75);
                
                // Draw all connection bars at minimal height (2px)
                drawSignalBars(ctx, -1);
            },
            led: { state: 'on', color: 'red' }
        }
    ],
    
    "BatteryWidget": [
        {
            title: "Battery 0%",
            explanation: "Battery completely empty",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawSVGBatteryWidget(ctx, 0);
            },
            led: { state: 'breathing', color: 'red' }
        },
        {
            title: "Battery 25%",
            explanation: "Battery at 25%",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawSVGBatteryWidget(ctx, 25);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Battery 50%",
            explanation: "Battery at 50%",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawSVGBatteryWidget(ctx, 50);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Battery 75%",
            explanation: "Battery at 75%",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawSVGBatteryWidget(ctx, 75);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Battery 100%",
            explanation: "Battery fully charged",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawSVGBatteryWidget(ctx, 100);
            },
            led: { state: 'on', color: 'green' }
        },
        {
            title: "Battery 10% Low",
            explanation: "Battery critically low at 10%",
            draw: (ctx, frame) => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 160, 80);
                
                drawSVGBatteryWidget(ctx, 10);
            },
            led: { state: 'breathing', color: 'red' }
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
const SHUTDOWN_HOLD_TIME = 3300; // 5 seconds in milliseconds
let showSerialNumber = false;
let connectionState = 'searching';

// Add at the top, after other state variables
const microQRImg = new Image();
microQRImg.src = 'Assets/qr.svg';
let microQRImgLoaded = false;
microQRImg.onload = function() { microQRImgLoaded = true; updateDisplay(); };

// Add these variables at the top with other state variables
let rollDegrees = 0;
let pitchDegrees = 0;
let isJoystickActive = false;
let rollExaggerationFactor = 3;  // Global control for roll exaggeration
let pitchExaggerationFactor = 6;  // Global control for pitch exaggeration

// Add the attitude indicator drawing function
function drawAttitudeIndicator(ctx, roll, pitch) {
    // Constants for the attitude indicator
    const centerX = 80;
    const centerY = 40;
    const width = 120;
    const height = 60;
    
    // Save the context state
    ctx.save();
    
    // Move to center and rotate for roll
    ctx.translate(centerX, centerY);
    ctx.rotate(roll * Math.PI / 180);
    
    // Draw the sky (blue)
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(-width/2, -height/2, width, height/2);
    
    // Draw the ground (brown)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-width/2, 0, width, height/2);
    
    // Draw the horizon line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-width/2, pitch);
    ctx.lineTo(width/2, pitch);
    ctx.stroke();
    
    // Draw the center marker
    ctx.beginPath();
    ctx.moveTo(-10, pitch);
    ctx.lineTo(10, pitch);
    ctx.moveTo(0, pitch - 10);
    ctx.lineTo(0, pitch + 10);
    ctx.stroke();
    
    // Restore the context
    ctx.restore();
}

// Add joystick control functions
function initJoystick() {
    const joystickContainer = document.createElement('div');
    joystickContainer.className = 'joystick-container';
    joystickContainer.innerHTML = `
        <div class="joystick-base">
            <div class="joystick-stick"></div>
        </div>
        <div class="joystick-labels">
            <span class="roll-label">Roll: 0°</span>
            <span class="pitch-label">Pitch: 0°</span>
        </div>
    `;
    
    document.querySelector('.panel-content').appendChild(joystickContainer);
    
    const stick = joystickContainer.querySelector('.joystick-stick');
    const base = joystickContainer.querySelector('.joystick-base');
    const rollLabel = joystickContainer.querySelector('.roll-label');
    const pitchLabel = joystickContainer.querySelector('.pitch-label');
    
    let isDragging = false;
    let startX, startY;
    let baseRect;
    
    function updateJoystick(e) {
        if (!isDragging) return;
        
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        
        // Calculate position relative to base center
        const centerX = baseRect.left + baseRect.width / 2;
        const centerY = baseRect.top + baseRect.height / 2;
        
        // Calculate distance from center (limited to base radius)
        const maxDistance = baseRect.width / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
        
        // Calculate angle and position
        const angle = Math.atan2(deltaY, deltaX);
        const stickX = Math.cos(angle) * distance;
        const stickY = Math.sin(angle) * distance;
        
        // Update stick position
        stick.style.transform = `translate(${stickX}px, ${stickY}px)`;
        
        // Update degrees with reduced sensitivity
        rollDegrees = (stickX / maxDistance) * 10; // Max 10 degrees roll
        pitchDegrees = (stickY / maxDistance) * 10; // Max 10 degrees pitch
        
        // Update labels
        rollLabel.textContent = `Roll: ${Math.round(rollDegrees)}°`;
        pitchLabel.textContent = `Pitch: ${Math.round(pitchDegrees)}°`;
        
        // Update explanation text
        const explanationText = document.getElementById('stepExplanation');
        if (explanationText) {
            explanationText.textContent = `Device orientation: Roll: ${Math.round(rollDegrees)}° Pitch: ${Math.round(pitchDegrees)}°`;
        }
        
        // Force redraw
        updateDisplay();
    }
    
    function startDrag(e) {
        isDragging = true;
        baseRect = base.getBoundingClientRect();
        updateJoystick(e);
    }
    
    function stopDrag() {
        isDragging = false;
        stick.style.transform = 'translate(0, 0)';
        rollDegrees = 0;
        pitchDegrees = 0;
        rollLabel.textContent = 'Roll: 0°';
        pitchLabel.textContent = 'Pitch: 0°';
        updateDisplay();
    }
    
    // Add event listeners
    stick.addEventListener('mousedown', startDrag);
    stick.addEventListener('touchstart', startDrag);
    document.addEventListener('mousemove', updateJoystick);
    document.addEventListener('touchmove', updateJoystick);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

// Modify the populateFlowSelect function to include the new flow
function populateFlowSelect() {
    const flowSelect = document.getElementById('flowSelect');
    flowSelect.innerHTML = '';
    
    Object.keys(flows).forEach(flow => {
        const option = document.createElement('option');
        option.value = flow;
        option.textContent = toTitleCase(flow);
        flowSelect.appendChild(option);
    });
    
    // Initialize or remove joystick when levelling flow is selected
    flowSelect.addEventListener('change', (e) => {
        // Remove existing joystick if it exists
        const existingJoystick = document.querySelector('.joystick-container');
        if (existingJoystick) {
            existingJoystick.remove();
        }
        
        // Initialize joystick only for levelling flow
        if (e.target.value === 'levelling') {
            initJoystick();
        }
    });
}

// Function to update the display
function updateDisplay() {
    const currentStates = flows[currentFlow];
    const currentState = currentStates[currentStateIndex];
    
    // Update cable visibility based on flow
    updateCableVisibility(currentFlow === 'cable charging');
    
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
    
    // Remove any existing gif containers
    const existingContainers = document.querySelectorAll('[data-gif-container="true"]');
    existingContainers.forEach(container => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
    
    // Show/hide power arrow based on state
    const powerArrow = document.querySelector('.power-arrow-indicator');
    if (powerArrow) {
        if (currentState.title === "Off" || currentState.title === "Fully On" ) {
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
    // Reset all state variables
    currentFlow = e.target.value;
    currentStateIndex = 0;
    connectionState = 'searching';
    isChargerConnected = false;
    updateProgress = 0;
    showSerialNumber = false;
    isPowerButtonPressed = false;
    powerButtonPressStartTime = 0;
    
    // Reset cable element if it exists
    const cableElement = document.getElementById('cable');
    if (cableElement) {
        cableElement.style.display = 'none';
        cableElement.style.transform = '';
        cableElement.style.transition = '';
        cableElement.style.opacity = '';
    }
    
    // Clean up any existing animations
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
    
    // Update the display with fresh state
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
        const remainingTime = Math.max(0, (SHUTDOWN_HOLD_TIME / 1000) - elapsedTime);
        
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

populateFlowSelect();

// Initialize the display
updateDisplay(); 

// Add this function near the top with other drawing functions
function drawSuccessAnimation(ctx, frame) {
    // Animation phases
    const fullHeightDuration = 60;  // 1 second full height
    const minimizeDuration = 30;    // 0.5 seconds minimize
    const textDuration = 180;       // 3 seconds with text
    const totalDuration = fullHeightDuration + minimizeDuration + textDuration;
    
    // Calculate progress for each phase
    const fullHeightProgress = Math.min(1, frame / fullHeightDuration);
    const minimizeProgress = Math.max(0, Math.min(1, (frame - fullHeightDuration) / minimizeDuration));
    const textProgress = Math.max(0, Math.min(1, (frame - fullHeightDuration - minimizeDuration) / 30));
    
    // Calculate sizes and positions
    const strokeWidth = 3;
    const fullSize = 38;  // (80 - strokeWidth*2)/2 to account for stroke width
    const smallSize = 15; // Increased minimized size
    const currentSize = frame < fullHeightDuration ? fullSize : 
                       fullSize - (fullSize - smallSize) * minimizeProgress;
    
    // Calculate positions - centered in the screen
    const centerX = 80;  // Center of screen (160/2)
    const centerY = 40;  // Center of screen (80/2)
    
    // Calculate final position offset
    const finalX = centerX + 0; // Move right by 50 pixels when minimized
    const finalY = centerY - 10; // Move up by 10 pixels when minimized
    
    // Calculate current position based on animation progress
    const currentX = frame < fullHeightDuration ? centerX : 
                    centerX + ((finalX - centerX) * minimizeProgress);
    const currentY = frame < fullHeightDuration ? centerY : 
                    centerY + ((finalY - centerY) * minimizeProgress);
    
    // Draw animated circle
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(currentX, currentY, currentSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw checkmark (scaled with circle)
    const checkScale = currentSize / fullSize;
    const checkOffset = 16 * checkScale; // Adjusted for new size
    ctx.beginPath();
    ctx.moveTo(currentX - checkOffset, currentY);
    ctx.lineTo(currentX - checkOffset/2, currentY + checkOffset/2);
    ctx.lineTo(currentX + checkOffset, currentY - checkOffset/2);
    ctx.stroke();
    
    // Draw text when minimized
    if (frame >= fullHeightDuration + minimizeDuration) {
        ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
        ctx.font = '20px Barlow';
        ctx.fontWeight = '400';
        ctx.textAlign = 'center';
        ctx.fillText('Update Complete', centerX, 70); // Keep text centered
    }
    
    return frame < totalDuration; // Return true if animation should continue
}
function drawSuccessAnimationlink(ctx, frame) {
    // Animation phases
    const fullHeightDuration = 60;  // 1 second full height
    const minimizeDuration = 30;    // 0.5 seconds minimize
    const textDuration = 180;       // 3 seconds with text
    const totalDuration = fullHeightDuration + minimizeDuration + textDuration;
    
    // Calculate progress for each phase
    const fullHeightProgress = Math.min(1, frame / fullHeightDuration);
    const minimizeProgress = Math.max(0, Math.min(1, (frame - fullHeightDuration) / minimizeDuration));
    const textProgress = Math.max(0, Math.min(1, (frame - fullHeightDuration - minimizeDuration) / 30));
    
    // Calculate sizes and positions
    const strokeWidth = 3;
    const fullSize = 38;  // (80 - strokeWidth*2)/2 to account for stroke width
    const smallSize = 15; // Increased minimized size
    const currentSize = frame < fullHeightDuration ? fullSize : 
                       fullSize - (fullSize - smallSize) * minimizeProgress;
    
    // Calculate positions - centered in the screen
    const centerX = 80;  // Center of screen (160/2)
    const centerY = 40;  // Center of screen (80/2)
    
    // Calculate final position offset
    const finalX = centerX + 0; // Move right by 50 pixels when minimized
    const finalY = centerY - 10; // Move up by 10 pixels when minimized
    
    // Calculate current position based on animation progress
    const currentX = frame < fullHeightDuration ? centerX : 
                    centerX + ((finalX - centerX) * minimizeProgress);
    const currentY = frame < fullHeightDuration ? centerY : 
                    centerY + ((finalY - centerY) * minimizeProgress);
    
    // Draw animated circle
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(currentX, currentY, currentSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw checkmark (scaled with circle)
    const checkScale = currentSize / fullSize;
    const checkOffset = 16 * checkScale; // Adjusted for new size
    ctx.beginPath();
    ctx.moveTo(currentX - checkOffset, currentY);
    ctx.lineTo(currentX - checkOffset/2, currentY + checkOffset/2);
    ctx.lineTo(currentX + checkOffset, currentY - checkOffset/2);
    ctx.stroke();
    
    // Draw text when minimized
    if (frame >= fullHeightDuration + minimizeDuration) {
        ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
        ctx.font = '20px Barlow';
        ctx.fontWeight = '400';
        ctx.textAlign = 'center';
        ctx.fillText('Linking Complete', centerX, 70); // Keep text centered
    }
    
    return frame < totalDuration; // Return true if animation should continue
}
function drawSuccessAnimationConnect(ctx, frame) {
    // Animation phases
    const fullHeightDuration = 60;  // 1 second full height
    const minimizeDuration = 30;    // 0.5 seconds minimize
    const textDuration = 180;       // 3 seconds with text
    const totalDuration = fullHeightDuration + minimizeDuration + textDuration;
    
    // Calculate progress for each phase
    const fullHeightProgress = Math.min(1, frame / fullHeightDuration);
    const minimizeProgress = Math.max(0, Math.min(1, (frame - fullHeightDuration) / minimizeDuration));
    const textProgress = Math.max(0, Math.min(1, (frame - fullHeightDuration - minimizeDuration) / 30));
    
    // Calculate sizes and positions
    const strokeWidth = 3;
    const fullSize = 25;  // (80 - strokeWidth*2)/2 to account for stroke width
    const smallSize = 15; // Increased minimized size
    const currentSize = frame < fullHeightDuration ? fullSize : 
                       fullSize - (fullSize - smallSize) * minimizeProgress;
    
    // Calculate positions - centered in the screen
    const centerX = 80;  // Center of screen (160/2)
    const centerY = 30;  // Center of screen (80/2)
    
    // Calculate final position offset
    const finalX = centerX + 0; // Move right by 50 pixels when minimized
    const finalY = centerY - 10; // Move up by 10 pixels when minimized
    
    // Calculate current position based on animation progress
    const currentX = frame < fullHeightDuration ? centerX : 
                    centerX + ((finalX - centerX) * minimizeProgress);
    const currentY = frame < fullHeightDuration ? centerY : 
                    centerY + ((finalY - centerY) * minimizeProgress);
    
    // Draw animated circle
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(currentX, currentY, currentSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw checkmark (scaled with circle)
    const checkScale = currentSize / fullSize;
    const checkOffset = 16 * checkScale; // Adjusted for new size
    ctx.beginPath();
    ctx.moveTo(currentX - checkOffset, currentY);
    ctx.lineTo(currentX - checkOffset/2, currentY + checkOffset/2);
    ctx.lineTo(currentX + checkOffset, currentY - checkOffset/2);
    ctx.stroke();
    
    // Draw text when minimized
    if (frame >= fullHeightDuration + minimizeDuration) {
        ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
        ctx.font = '20px Barlow';
        ctx.fontWeight = '400';
        ctx.textAlign = 'center';
        ctx.fillText('Connected', centerX, 55); // Keep text centered
    }
    
    return frame < totalDuration; // Return true if animation should continue
}

// Add the new reusable battery animation function
function drawAnimatedBattery(ctx, frame, options = {}) {
    const {
        x = 32,
        y = 5,
        width = 90,
        height = 45,
        radius = 6,
        cycle = 2000,
        showPercentage = true,
        percentageY = null,  // Will be calculated based on battery position
        forcePercent = null,  // New option to force a specific percentage
        shimmer = false      // Option to enable shimmer was unused before
    } = options;

    // Use forced percentage if provided, otherwise calculate from frame
    const percent = forcePercent !== null ? forcePercent : ((frame % cycle) / (cycle - 1)) * 100;
    
    // Draw battery outline with rounded corners
    ctx.save();
    ctx.strokeStyle = percent > 90 ? '#00ff00' : '#fff';  // Green when above 90%
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
    ctx.fillStyle = percent > 90 ? '#00ff00' : '#fff';  // Green when above 90%
    ctx.fillRect(x + width, y + height / 4, 8, height / 2);
    
    // Percentage text if enabled
    if (showPercentage) {
        // Add pulsing effect based on the current percentage value
        // Higher percent values will pulse more subtly
        /*  const pulseIntensity = 0.4; // Decreases from 0.3 to 0.1 as percentage increases
            const pulseSpeed = 0.1;   // Decreases from 0.15 to 0.1 as percentage increases
            const pulseOffset = Math.sin(frame * pulseSpeed) * pulseIntensity;
            const textOpacity = 0.7 + pulseOffset;
        */
        const textOpacity = 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${textOpacity})`;
        ctx.font = '19px Barlow';  // Increased from 16px to 19px (20% larger)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Center text vertically in the battery
        const textY = y + (height / 2);
        ctx.fillText(Math.round(percent) + '%', x + width/2, textY);
    }
} 

// Helper functions for State Transitions animation
function drawLoadingSpinner(ctx, x, y, radius, frame, color) {
    // Draw spinning segments
    const segments = 8;
    const segmentAngle = (Math.PI * 2) / segments;
    const rotationSpeed = 0.05;
    const rotation = frame * rotationSpeed;
    
    for (let i = 0; i < segments; i++) {
        const angle = rotation + i * segmentAngle;
        const opacity = 0.3 + (0.7 * (i / segments));
        
        ctx.strokeStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, angle, angle + segmentAngle * 0.7);
        ctx.stroke();
    }
    
    // Draw center dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawCheckmark(ctx, x, y, radius, color) {
    // Draw circle
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw checkmark
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 3, y + 8);
    ctx.lineTo(x + 12, y - 10);
    ctx.stroke();
}

function drawXmark(ctx, x, y, radius, color) {
    // Draw circle
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw X
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
}

function morphSpinnerToCheckmark(ctx, x, y, radius, frame, progress, fromColor, toColor) {
    // Interpolate color
    const color = interpolateColor(fromColor, toColor, progress);
    
    // Draw circle (common to both)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw fading spinner
    if (progress < 0.5) {
        const spinnerOpacity = 1 - (progress * 2);
        const segments = 8;
        const segmentAngle = (Math.PI * 2) / segments;
        const rotationSpeed = 0.05;
        const rotation = frame * rotationSpeed;
        
        for (let i = 0; i < segments; i++) {
            const angle = rotation + i * segmentAngle;
            const opacity = (0.3 + (0.7 * (i / segments))) * spinnerOpacity;
            
            ctx.strokeStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, radius, angle, angle + segmentAngle * 0.7);
            ctx.stroke();
        }
    }
    
    // Draw emerging checkmark
    if (progress > 0.5) {
        const checkOpacity = (progress - 0.5) * 2;
        
        ctx.strokeStyle = color.replace(')', `, ${checkOpacity})`).replace('rgb', 'rgba');
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x - 10 + 7 * checkOpacity, y + 8 * checkOpacity);
        ctx.lineTo(x - 3 + 15 * checkOpacity, y + 8 - 18 * checkOpacity);
        ctx.stroke();
    }
    
    // Draw center dot that morphs into checkmark start
    const dotSize = 4 * (1 - progress);
    if (dotSize > 0) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function morphCheckmarkToX(ctx, x, y, radius, progress, fromColor, toColor) {
    // Interpolate color
    const color = interpolateColor(fromColor, toColor, progress);
    
    // Draw circle (common to both)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Morph checkmark to X
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    
    if (progress < 0.5) {
        // First half: checkmark fades out
        const checkOpacity = 1 - (progress * 2);
        ctx.globalAlpha = checkOpacity;
        
        // Draw checkmark
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x - 3, y + 8);
        ctx.lineTo(x + 12, y - 10);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    } else {
        // Second half: X fades in
        const xOpacity = (progress - 0.5) * 2;
        ctx.globalAlpha = xOpacity;
        
        // Draw X
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }
}

function morphXToSpinner(ctx, x, y, radius, frame, progress, fromColor, toColor) {
    // Interpolate color
    const color = interpolateColor(fromColor, toColor, progress);
    
    // Draw circle (common to both)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    if (progress < 0.5) {
        // First half: X fades out
        const xOpacity = 1 - (progress * 2);
        ctx.globalAlpha = xOpacity;
        
        // Draw X
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    } else {
        // Second half: spinner fades in
        const spinnerOpacity = (progress - 0.5) * 2;
        const segments = 8;
        const segmentAngle = (Math.PI * 2) / segments;
        const rotationSpeed = 0.05;
        const rotation = frame * rotationSpeed;
        
        for (let i = 0; i < segments; i++) {
            const angle = rotation + i * segmentAngle;
            const opacity = (0.3 + (0.7 * (i / segments))) * spinnerOpacity;
            
            ctx.strokeStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, radius, angle, angle + segmentAngle * 0.7);
            ctx.stroke();
        }
        
        // Draw center dot
        const dotSize = 4 * spinnerOpacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function interpolateColor(color1, color2, ratio) {
    // Extract RGB components
    const r1 = parseInt(color1.slice(1, 3), 16) || parseInt(color1.match(/\d+/g)[0]);
    const g1 = parseInt(color1.slice(3, 5), 16) || parseInt(color1.match(/\d+/g)[1]);
    const b1 = parseInt(color1.slice(5, 7), 16) || parseInt(color1.match(/\d+/g)[2]);
    
    const r2 = parseInt(color2.slice(1, 3), 16) || parseInt(color2.match(/\d+/g)[0]);
    const g2 = parseInt(color2.slice(3, 5), 16) || parseInt(color2.match(/\d+/g)[1]);
    const b2 = parseInt(color2.slice(5, 7), 16) || parseInt(color2.match(/\d+/g)[2]);
    
    // Interpolate
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Additional helper functions for Lottie-Style Loader
function drawLottieLoader(ctx, x, y, frame, color, isTransitioning, transitionProgress, nextStateName) {
    const radius = 30;
    const strokeWidth = 4;
    
    // Draw the main circle outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Calculate the animated segment
    const rotationSpeed = 0.03;
    const baseAngle = frame * rotationSpeed;
    
    // For the main circular loader animation
    if (!isTransitioning) {
        // Draw the spinning arc that grows and shrinks
        const growDuration = 60;
        const shrinkDuration = 60;
        const fullCycleDuration = growDuration + shrinkDuration;
        const cyclePosition = frame % fullCycleDuration;
        
        let arcLength;
        if (cyclePosition < growDuration) {
            // Growing phase
            arcLength = (cyclePosition / growDuration) * Math.PI * 1.75;
        } else {
            // Shrinking phase
            arcLength = (1 - ((cyclePosition - growDuration) / shrinkDuration)) * Math.PI * 1.75;
        }
        
        // Draw the arc
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, radius, baseAngle, baseAngle + arcLength);
        ctx.stroke();
        ctx.lineCap = 'butt'; // Reset cap style
    } 
    // Handle transition to next state
    else {
        if (nextStateName === 'ready') {
            // Transition to checkmark
            const endAngle = baseAngle + Math.PI * 1.5;
            const arcLength = Math.PI * 1.5 * (1 - transitionProgress);
            
            // Draw the transitioning arc
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(x, y, radius, baseAngle, baseAngle + arcLength);
            ctx.stroke();
            
            // Draw emerging checkmark
            if (transitionProgress > 0.3) {
                const checkProgress = (transitionProgress - 0.3) / 0.7; // Rescale to 0-1
                ctx.strokeStyle = color;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                
                // First part of checkmark
                ctx.beginPath();
                const startX = x - 15;
                const startY = y;
                const midX = x - 5;
                const midY = y + 10;
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX + (midX - startX) * checkProgress, 
                           startY + (midY - startY) * checkProgress);
                ctx.stroke();
                
                // Second part of checkmark (only if first part is complete)
                if (checkProgress > 0.5) {
                    const check2Progress = (checkProgress - 0.5) / 0.5; // Rescale to 0-1
                    ctx.beginPath();
                    ctx.moveTo(midX, midY);
                    ctx.lineTo(midX + (x + 15 - midX) * check2Progress, 
                               midY + (y - 15 - midY) * check2Progress);
                    ctx.stroke();
                }
            }
        } else if (nextStateName === 'not-ready') {
            // Transition to X mark
            const arcFadeOut = 1 - transitionProgress;
            
            // Fade out the arc
            if (arcFadeOut > 0) {
                ctx.strokeStyle = color.replace(')', `, ${arcFadeOut})`).replace('rgb', 'rgba');
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(x, y, radius, baseAngle, baseAngle + Math.PI);
                ctx.stroke();
            }
            
            // Draw emerging X
            if (transitionProgress > 0.3) {
                const xProgress = (transitionProgress - 0.3) / 0.7; // Rescale to 0-1
                ctx.strokeStyle = color;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                
                // First diagonal of X
                ctx.beginPath();
                ctx.moveTo(x - 12, y - 12);
                ctx.lineTo(x - 12 + 24 * xProgress, y - 12 + 24 * xProgress);
                ctx.stroke();
                
                // Second diagonal of X (only if first is complete enough)
                if (xProgress > 0.5) {
                    const x2Progress = (xProgress - 0.5) / 0.5; // Rescale to 0-1
                    ctx.beginPath();
                    ctx.moveTo(x + 12, y - 12);
                    ctx.lineTo(x + 12 - 24 * x2Progress, y - 12 + 24 * x2Progress);
                    ctx.stroke();
                }
            }
        }
    }
}

function drawLottieReady(ctx, x, y, color, isTransitioning, transitionProgress) {
    const radius = 30;
    const strokeWidth = 4;
    
    // Draw the main circle outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // If transitioning to not-ready
    if (isTransitioning) {
        // Fade out checkmark
        const checkOpacity = 1 - transitionProgress;
        ctx.strokeStyle = color.replace(')', `, ${checkOpacity})`).replace('rgb', 'rgba');
        
        // Draw fading checkmark
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x - 5, y + 10);
        ctx.lineTo(x + 15, y - 15);
        ctx.stroke();
        
        // Draw emerging X
        if (transitionProgress > 0.3) {
            const xProgress = (transitionProgress - 0.3) / 0.7; // Rescale to 0-1
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            
            // First diagonal of X
            ctx.beginPath();
            ctx.moveTo(x - 12, y - 12);
            ctx.lineTo(x - 12 + 24 * xProgress, y - 12 + 24 * xProgress);
            ctx.stroke();
            
            // Second diagonal of X (only if first is complete enough)
            if (xProgress > 0.5) {
                const x2Progress = (xProgress - 0.5) / 0.5; // Rescale to 0-1
                ctx.beginPath();
                ctx.moveTo(x + 12, y - 12);
                ctx.lineTo(x + 12 - 24 * x2Progress, y - 12 + 24 * x2Progress);
                ctx.stroke();
            }
        }
    } else {
        // Draw static checkmark with subtle pulse
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x - 5, y + 10);
        ctx.lineTo(x + 15, y - 15);
        ctx.stroke();
    }
}

function drawLottieNotReady(ctx, x, y, color, isTransitioning, transitionProgress) {
    const radius = 30;
    const strokeWidth = 4;
    
    // Draw the main circle outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // If transitioning to loading
    if (isTransitioning) {
        // Fade out X
        const xOpacity = 1 - transitionProgress;
        ctx.strokeStyle = color.replace(')', `, ${xOpacity})`).replace('rgb', 'rgba');
        
        // Draw fading X
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 12);
        ctx.lineTo(x + 12, y + 12);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 12, y - 12);
        ctx.lineTo(x - 12, y + 12);
        ctx.stroke();
        
        // Draw emerging spinner
        if (transitionProgress > 0.5) {
            const spinProgress = (transitionProgress - 0.5) / 0.5; // Rescale to 0-1
            
            // Draw emerging arc
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            const startAngle = 0;
            const endAngle = Math.PI * 2 * spinProgress;
            ctx.arc(x, y, radius, startAngle, endAngle);
            ctx.stroke();
        }
    } else {
        // Draw static X with subtle pulse
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 12);
        ctx.lineTo(x + 12, y + 12);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 12, y - 12);
        ctx.lineTo(x - 12, y + 12);
        ctx.stroke();
    }
}

// Helper functions for Lottie Morphing Loader
function drawMorphToSuccess(ctx, progress) {
    const centerX = 80, centerY = 40, radius = 20;
    const fromColor = '#4285F4'; // Blue
    const toColor = '#34A853';   // Green
    const color = interpolateColor(fromColor, toColor, progress);

    // Draw the circle base
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2 * (1 - progress)); // Circle shrinks
    ctx.stroke();

    // Morph to checkmark
    if (progress > 0.3) {
        const checkProgress = (progress - 0.3) / 0.7;
        ctx.lineCap = 'round';

        // First part of check
        const startX = centerX - 10;
        const startY = centerY + 5;
        const midX = centerX - 2;
        const midY = centerY + 13;
        const p1x = startX + (midX - startX) * checkProgress;
        const p1y = startY + (midY - startY) * checkProgress;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(p1x, p1y);
        ctx.stroke();

        // Second part of check
        if (checkProgress > 0.5) {
            const check2Progress = (checkProgress - 0.5) / 0.5;
            const endX = centerX + 15;
            const endY = centerY - 10;
            const p2x = midX + (endX - midX) * check2Progress;
            const p2y = midY + (endY - midY) * check2Progress;
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();
        }
        ctx.lineCap = 'butt';
    }
}

function drawMorphToFail(ctx, progress) {
    const centerX = 80, centerY = 40, radius = 20;
    const fromColor = '#34A853'; // Green
    const toColor = '#EA4335';   // Red
    const color = interpolateColor(fromColor, toColor, progress);

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Reverse morph checkmark to lines
    const checkProgress = 1 - progress;
    const startX1 = centerX - 10, startY1 = centerY + 5;
    const midX = centerX - 2, midY = centerY + 13;
    const endX = centerX + 15, endY = centerY - 10;
    
    // First line of check (disappears)
    ctx.globalAlpha = checkProgress;
    ctx.beginPath();
    ctx.moveTo(startX1, startY1);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    // Second line of check (disappears)
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Morph lines to X
    const p1_start = { x: startX1, y: startY1 };
    const p1_end = { x: midX, y: midY };
    const p2_start = { x: midX, y: midY };
    const p2_end = { x: endX, y: endY };
    
    const x1_target_start = { x: centerX - 12, y: centerY - 12 };
    const x1_target_end = { x: centerX + 12, y: centerY + 12 };
    const x2_target_start = { x: centerX + 12, y: centerY - 12 };
    const x2_target_end = { x: centerX - 12, y: centerY + 12 };

    const lerp = (a, b, t) => a + (b - a) * t;

    // First diagonal of X
    const x1_start = { x: lerp(p1_start.x, x1_target_start.x, progress), y: lerp(p1_start.y, x1_target_start.y, progress) };
    const x1_end = { x: lerp(p1_end.x, x1_target_end.x, progress), y: lerp(p1_end.y, x1_target_end.y, progress) };
    ctx.beginPath();
    ctx.moveTo(x1_start.x, x1_start.y);
    ctx.lineTo(x1_end.x, x1_end.y);
    ctx.stroke();
    
    // Second diagonal of X
    const x2_start = { x: lerp(p2_start.x, x2_target_start.x, progress), y: lerp(p2_start.y, x2_target_start.y, progress) };
    const x2_end = { x: lerp(p2_end.x, x2_target_end.x, progress), y: lerp(p2_end.y, x2_target_end.y, progress) };
    ctx.beginPath();
    ctx.moveTo(x2_start.x, x2_start.y);
    ctx.lineTo(x2_end.x, x2_end.y);
    ctx.stroke();

    ctx.lineCap = 'butt';
}

// Add these constants at the top of the file
const FRAME_RATE = 60; // Expected frame rate
const TIMING_MULTIPLIER = 0.5; // Adjust timing to match actual frame rate

// Helper function to convert seconds to frames
function secondsToFrames(seconds) {
    return Math.floor(seconds * FRAME_RATE * TIMING_MULTIPLIER);
}

// Helper function to convert frames to seconds
function framesToSeconds(frames) {
    return frames / (FRAME_RATE * TIMING_MULTIPLIER);
}

// Add this function after the drawBattery function
function drawSignalBars(ctx, strength) {
    const x = 130;  // Same x as battery
    const y = 5;    // Same y as battery
    const barCount = 3;
    const barWidth = 3;
    const barSpacing = 2;
    const barHeights = strength === -1 ? [2, 2, 2] : [5, 8, 11]; // All bars 2px tall for no connection
    const trayX = x - (barCount * (barWidth + barSpacing)) - 5; // Position bars to the left of battery
    const trayY = y + 0;  // Moved 1px higher (was y + 2)
    
    // Draw each bar
    for (let i = 0; i < barCount; i++) {
        ctx.fillStyle = i < strength ? '#ffffff' : '#333333';  // White for active bars, dark gray for inactive
        ctx.fillRect(
            trayX + (i * (barWidth + barSpacing)),
            trayY + (barHeights[barCount - 1] - barHeights[i]),
            barWidth,
            barHeights[i]
        );
    }
}

// New battery widget drawing function based on React component
function drawNewBatteryWidget(ctx, level, isCharging) {
    // Position the battery widget in the center of the screen
    const centerX = 80;
    const centerY = 40;
    
    // Battery dimensions (scaled from React component)
    const batteryWidth = 42.3;
    const batteryHeight = 23.5;
    const batteryX = centerX - batteryWidth / 2;
    const batteryY = centerY - batteryHeight / 2;
    const borderRadius = 4.18;
    
    // Battery tip dimensions
    const tipWidth = 2.5;
    const tipHeight = 9.2;
    const tipX = batteryX + batteryWidth;
    const tipY = batteryY + (batteryHeight - tipHeight) / 2;
    
    // Draw battery outline (batteryChild)
    ctx.fillStyle = '#767676';  // Gray background
    ctx.beginPath();
    ctx.roundRect(batteryX, batteryY, batteryWidth, batteryHeight, borderRadius);
    ctx.fill();
    
    // Draw battery level fill
    const fillWidth = (batteryWidth - 2) * (level / 100);
    ctx.fillStyle = level > 20 ? '#00ca48' : '#ff0000';  // Green when >20%, red when low
    ctx.beginPath();
    ctx.roundRect(batteryX + 1, batteryY + 1, fillWidth, batteryHeight - 2, borderRadius - 1);
    ctx.fill();
    
    // Draw battery tip (subtractIcon)
    ctx.fillStyle = '#767676';
    ctx.fillRect(tipX, tipY, tipWidth, tipHeight);
    
    // Draw percentage text
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 22.68px Barlow';
    ctx.textAlign = 'left';
    ctx.fillText(level.toString(), batteryX + 3.52, batteryY + 20);
    
    // Draw lightning icon if charging
    if (isCharging) {
        const lightningX = batteryX + 28.52;
        const lightningY = batteryY + 6.9;
        const lightningWidth = 11.4;
        const lightningHeight = 16.2;
        
        // Draw lightning bolt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(lightningX + lightningWidth * 0.5, lightningY);
        ctx.lineTo(lightningX + lightningWidth * 0.3, lightningY + lightningHeight * 0.4);
        ctx.lineTo(lightningX + lightningWidth * 0.7, lightningY + lightningHeight * 0.4);
        ctx.lineTo(lightningX + lightningWidth * 0.4, lightningY + lightningHeight);
        ctx.lineTo(lightningX + lightningWidth * 0.6, lightningY + lightningHeight * 0.6);
        ctx.lineTo(lightningX + lightningWidth * 0.2, lightningY + lightningHeight * 0.6);
        ctx.closePath();
        ctx.fill();
    }
}

// SVG-based battery widget drawing function
function drawSVGBatteryWidget(ctx, level) {
    // Position the battery widget in the top right of the LCD
    const batteryHeight = 15; // Fixed height as requested
    const batteryWidth = (42.2771 / 23.4655) * batteryHeight; // Maintain aspect ratio
    const batteryX = 160 - batteryWidth - 5; // 5px from right edge
    const batteryY = 5; // 5px from top
    const borderRadius = (4.1844 / 23.4655) * batteryHeight; // Scale radius proportionally
    
    // Battery tip dimensions scaled proportionally
    const tipWidth = (2.5 / 23.4655) * batteryHeight;
    const tipHeight = (9.2 / 23.4655) * batteryHeight;
    const tipX = batteryX + batteryWidth;
    const tipY = batteryY + (batteryHeight - tipHeight) / 2;
    
    // Draw battery outline (gray background)
    ctx.fillStyle = '#767676';
    ctx.beginPath();
    ctx.roundRect(batteryX, batteryY, batteryWidth, batteryHeight, borderRadius);
    ctx.fill();
    
    // Draw battery tip
    ctx.fillStyle = '#767676';
    ctx.fillRect(tipX, tipY, tipWidth, tipHeight);
    
    // Draw battery level fill with proper radius on left side, sharp on right
    if (level > 0) {
        const fillWidth = batteryWidth * (level / 100);
        const fillColor = level > 20 ? '#ffffff' : '#ff0000'; // White when >20%, red when low
        
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        
        // Check if fill reaches the right side radius
        const rightRadiusStart = batteryX + batteryWidth - borderRadius;
        
        if (fillWidth >= batteryWidth - borderRadius) {
            // Fill reaches the right side radius - use rounded right edge
            ctx.moveTo(batteryX + borderRadius, batteryY);
            ctx.lineTo(rightRadiusStart, batteryY);
            ctx.quadraticCurveTo(batteryX + batteryWidth, batteryY, batteryX + batteryWidth, batteryY + borderRadius);
            ctx.lineTo(batteryX + batteryWidth, batteryY + batteryHeight - borderRadius);
            ctx.quadraticCurveTo(batteryX + batteryWidth, batteryY + batteryHeight, rightRadiusStart, batteryY + batteryHeight);
            ctx.lineTo(batteryX + borderRadius, batteryY + batteryHeight);
        } else {
            // Fill doesn't reach the right side radius - use sharp right edge
            ctx.moveTo(batteryX + borderRadius, batteryY);
            ctx.lineTo(batteryX + fillWidth, batteryY);
            ctx.lineTo(batteryX + fillWidth, batteryY + batteryHeight);
            ctx.lineTo(batteryX + borderRadius, batteryY + batteryHeight);
        }
        
        // Left edge with radius (always rounded)
        ctx.quadraticCurveTo(batteryX, batteryY + batteryHeight, batteryX, batteryY + batteryHeight - borderRadius);
        ctx.lineTo(batteryX, batteryY + borderRadius);
        ctx.quadraticCurveTo(batteryX, batteryY, batteryX + borderRadius, batteryY);
        
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw percentage text (smaller for top-right position)
    ctx.fillStyle = '#000000';
    ctx.font = '600 14px Barlow, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(level.toString(), batteryX + batteryWidth / 2, batteryY + batteryHeight / 2);
}

// Helper function for rounded rectangles (if not available)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}