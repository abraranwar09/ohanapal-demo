

const originalButtonContent = thinkButton.innerHTML;


document.addEventListener('DOMContentLoaded', function() {
    const thinkButton = document.getElementById('thinkButton');

    const recordButton = document.getElementById('recordButton');
    const visualization = document.getElementById('visualization');
    const chatButton = document.getElementById('chatButton');
    const chatInput = document.getElementById('chatInput');
    let isRecording = false;
    let animationId;
    let startTime;
    const barCount = 32;

    let audioContext;
    let analyser;
    let dataArray;

    let mediaRecorder;
    let audioChunks = [];

    // Create visualization bars
    for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        visualization.appendChild(bar);
    }

    const bars = visualization.querySelectorAll('.bar');


    //initialize a variable for session id
    const sessionId = "session_" + Date.now();
    localStorage.setItem('sessionId', sessionId);


    //get todays date and time and format it        
    const today = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('User Timezone:', userTimeZone);
    const formattedToday = today.toLocaleString('en-US', { timeZone: userTimeZone }).replace(',', '');    

    //reprompt
    const prompt = "Remember the user has autism. Answer the user's question and provide helpful information. The users timezone is " + userTimeZone + ". For context, today's date/time is " + formattedToday + ".";
    
    //record button click function
    recordButton.addEventListener('click', function() {
        isRecording = !isRecording;
        if (isRecording) {
            recordButton.classList.add('recording');
            startAudioProcessing();
            startTimer();
        } else {
            recordButton.classList.remove('recording');
            stopAudioProcessing();
            stopTimer();
        }
    });

    chatButton.addEventListener('click', function() {
        chatInput.classList.toggle('hidden');
        if (!chatInput.classList.contains('hidden')) {
            chatInput.focus();
        }
    });


    //function for audio processing start
    function startAudioProcessing() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 64;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                // Initialize MediaRecorder
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = async () => {
                            // Change button to show loading state
        thinkButton.innerHTML = '<div class="spinner"></div> Ohana is thinking...';

                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Default type
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    // Convert to WAV format using custom function
                    const wavArrayBuffer = audioBufferToWav(audioBuffer);
                    const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

                    // Prepare the form data
                    const formdata = new FormData();
                    formdata.append("audioFile", wavBlob, "testrecord.wav");
                    formdata.append("prompt", prompt);
                    formdata.append("session_id", sessionId);

                    // Set up the headers
                    const myHeaders = new Headers();
                    myHeaders.append("Cookie", "connect.sid=s%3A066rmYVuykdk7zp82ikhqhmhFv7Oemk5.7RfbPxQGjqHMJbAeIRxXo46KGgBUFu6pWv0ih4UdjaU");

                    // Set up the request options
                    const requestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: formdata,
                        redirect: "follow"
                    };

                    // Send the request
                    fetch("http://localhost:3000/api/audio/process", requestOptions)
                        .then(response => response.text())
                        .then(async result => {
                            const parsedResult = JSON.parse(result);
                            console.log(parsedResult);
                            var logoImage = document.getElementById('logoImage');
                            logoImage.classList.add('animate__animated', 'animate__zoomOut');

                            // Check the finish_reason
                            if (parsedResult.finish_reason === 'stop') {
                                // Play the audio from parsedResult.audio
                                if (parsedResult.audio) {
                                    const audioData = parsedResult.audio;
                                    const audio = new Audio(`data:audio/wav;base64,${audioData}`);
                                    
                                    // Show Lottie animation
                                    lottieContainer.style.display = 'block';
                                    lottieAnimation.play();

                                    audio.play();
                                    audio.onended = () => {
                                        // Hide Lottie animation when audio ends
                                        lottieContainer.style.display = 'none';
                                        lottieAnimation.stop();
                                    };
                                }

                                // Display the transcript
                                const transcript = parsedResult.transcript;
                                console.log('Transcript:', transcript);
                                document.getElementById('aiMessage').innerHTML = `<span class="tlt">${transcript}</span>`;

                                $('.tlt').textillate({
                                    in: {
                                        delayScale: 1
                                    }
                                });

                                // Revert button to original state
                                thinkButton.innerHTML = originalButtonContent;
                            } else {
                                 //handle tool calls
                                 console.log(parsedResult.tool_calls[0].function.name);
                                //check for function name and construct function call
                                if (parsedResult.tool_calls[0].function.name === 'openGoogle') {
                                    const args = JSON.parse(parsedResult.tool_calls[0].function.arguments);
                                    await openGoogle(args.query, parsedResult.tool_calls[0].id);
                                };

                                if (parsedResult.tool_calls[0].function.name === 'generateProfile') {
                                    const args = JSON.parse(parsedResult.tool_calls[0].function.arguments);
                                    await generateProfile(args.taskDescription, args.industry, args.additionalRequirements, args.model);
                                };

                                if (parsedResult.tool_calls[0].function.name === 'getCalendarEvents') {
                                    const args = JSON.parse(parsedResult.tool_calls[0].function.arguments);
                                    await getCalendarEvents(args.timePeriod, args.query);
                                };


                                if (parsedResult.tool_calls[0].function.name === 'saveEvent') {
                                    const args = JSON.parse(parsedResult.tool_calls[0].function.arguments);
                                    await saveEvent(args.summary, args.location, args.description, args.start, args.end);
                                };
                               
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);

                            // Revert button to original state even on error
                            thinkButton.innerHTML = originalButtonContent;
                        });
                };
                mediaRecorder.start();

                function animate() {
                    analyser.getByteFrequencyData(dataArray);
                    bars.forEach((bar, index) => {
                        const height = dataArray[index] / 2;
                        bar.style.height = `${height}%`;
                    });
                    animationId = requestAnimationFrame(animate);
                }
                animate();
            })
            .catch(err => console.error('Error accessing audio stream:', err));
    }

    //function for audio processing stop
    function stopAudioProcessing() {
        if (audioContext) {
            audioContext.close();
        }
        cancelAnimationFrame(animationId);
        bars.forEach(bar => {
            bar.style.height = '0%';
        });

        // Stop the MediaRecorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    function startTimer() {
        startTime = Date.now();
        updateTimer();
    }

    //function for timer stop
    function stopTimer() {
        recordButton.setAttribute('data-time', '00:00');
    }
    //function for timer update
    function updateTimer() {
        if (!isRecording) return;

        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        recordButton.setAttribute('data-time', timeString);
        recordButton.style.setProperty('--time', `'${timeString}'`);

        requestAnimationFrame(updateTimer);
    }


    // Load Lottie animation
    const lottieContainer = document.createElement('div');
    lottieContainer.id = 'lottieContainer';
    lottieContainer.style.display = 'none'; // Initially hidden
    visualization.appendChild(lottieContainer);

    const lottieAnimation = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: '../assets/ai-response.json' // Path to your Lottie JSON file
    });
});
