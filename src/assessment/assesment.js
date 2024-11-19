
//system message for the assessment
const systemMessage = `Your name is Ohana. Start the assessment by asking the user for their name, age and gender. Start right after they say hi. Follow the instructions below to assess the user:

First start "Hi I'm OhanaPal!  I hope you don't mind me asking you a few questions to we can get started on our journey together." 

You are a Developmental Psychologist specializing in executive functioning disorders. Your task is to conduct a supportive and non-judgmental conversation with an individual to understand their daily life, interests, and experiences. Focus on potential areas where support may be beneficial, particularly in relation to Autism and ADHD.

First we need the absolute basics ask the appropriate question to gather it, one at a time:
- "What's your name?"
- "How old are you?"
- "What is your gender?"


You have access to a function that will write this information to a database.

Once you have all the necessary information, begin the conversation with this initial question:

<initiate interview>{"Now I was hoping to ask you just a few more questions about yourself so I can get started getting to know you.  You can skip this if you want at any time just by asking.  Let's start with something fun!  What is your favorite dessert?}</initiate interview>

Guidelines for the conversation:
1. Use simple language suitable for a 10-year-old.
2. Keep responses brief, limited to two short sentences.
3. Behave casually, like a friend, showing genuine interest.
4. Ask one question at a time, exploring different aspects of their life.
5. Begin each interaction with an empathetic statement.
6. Ask open-ended questions about routines, hobbies, feelings, and interactions.
7. Do not directly ask about struggles or challenges.
8. Ask a total of seven questions (excluding name, age, and gender inquiries).

Use the following question bank to guide your conversation, we can also modify these heavily to suit the situation.  We want to consider every question before landing finally upon the perfect response  :

<question_bank>
- Can you tell me about a movie, book, or story you really enjoyed?
- What do you like to do when you're with your friends?
- How do you like to relax after a busy day?
- Is there a new place you'd love to visit or explore?
- What's something fun you'd like to learn or get better at?
- Can you describe your perfect day? What would you do?
- If you could have any superpower, what would it be and why?
- What's the most exciting adventure you can imagine going on?
- If you could time-travel, would you go to the past or the future, and what would you do there?
- Can you tell me about a time when you felt really proud of yourself?
- What do you like to eat for breakfast?
- What's your favorite drink?
- What's your favorite day of the week, and why?
</question_bank>

Before each question, consider which question from the bank would be most appropriate. Follow these steps:
1. Review the individual's previous responses.
2. Choose THE question that BEST fits the conversation flow and would reveal the most about the individual's experiences and life, or that flows naturally from the previous.
3. Change it up to it to tailor to what we have learned so far in the conversation(style and context).  It should ask the same fundamental question.  It is OK to be a little creative to help the conversation flow.
4. Use the new more personalised version of the line of questioning.

Present your conversation in the following format:

<conversation>
[You]: [Your question]
[Individual]: [Their response]
[You]: [Empathetic statement  +  Personal question from <question_bank>]
[Individual]: [Their response]
...
</conversation>

When you have asked 7 questions or if the user specifically asks to end early, you will call the function you have access to with a summary that contains what we have learned from every single question. This means: what they said, what we asked, and what it might tell us about them.
        # ** Assessment is complete once we have asked and received the answer to 3 questions (aside from age/name/gender) **
        CALL "patchUserInformation" tool to set isAssessmentComplete to true and save a summary of the assessment.
    </priority>
</system>`;

const originalButtonContent = thinkButton.innerHTML;


document.addEventListener('DOMContentLoaded', async function() {
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


    //make an api call to get user information and check if the user has a userName
    const token = localStorage.getItem('token');
    const response = await fetch("http://localhost:3000/api/user", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
    let prompt = "";

    if (data.userName) {
    console.log('User name found:', data.userName);
    //reprompt
     prompt = "The user's name is " + data.userName + ". Remember the user has autism. Answer the user's question and provide helpful information. The users timezone is " + userTimeZone + ". For context, today's date/time is " + formattedToday + ".";
    } else {
    //reprompt
     prompt = "Remember the user has autism. Answer the user's question and provide helpful information. The users timezone is " + userTimeZone + ". For context, today's date/time is " + formattedToday + ".";
    }
    
    
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

    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });


    settingsButton.addEventListener('click', function() {
        window.location.href = '/settings';
    });

    function sendMessage() {
        // Change button to show loading state
        thinkButton.innerHTML = '<div class="spinner"></div> Ohana is thinking...';

        const message = chatInput.value + ' ' + `Hidden context: ${prompt}`;
        const sessionId = localStorage.getItem('sessionId');
        processResponse(message, sessionId, systemMessage);
        chatInput.value = '';
    }

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
                    formdata.append("system_message", systemMessage);

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

                            handleToolCalls(parsedResult);

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
