
let audioCtx: AudioContext | null = null;

const getContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}

export type SoundType = 'click' | 'predict' | 'success' | 'hover' | 'toggle' | 'plane-start' | 'plane-fly' | 'crash';

let planeOscillator: OscillatorNode | null = null;
let planeGain: GainNode | null = null;

export const playSound = (type: SoundType) => {
    if (typeof window === 'undefined') return;
    
    try {
        const ctx = getContext();
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        switch (type) {
            case 'click':
                // Sharp, clean glass tap
                const oscClick = ctx.createOscillator();
                const gainClick = ctx.createGain();
                oscClick.connect(gainClick);
                gainClick.connect(ctx.destination);
                oscClick.type = 'sine';
                oscClick.frequency.setValueAtTime(800, now);
                oscClick.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gainClick.gain.setValueAtTime(0.05, now);
                gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                oscClick.start(now);
                oscClick.stop(now + 0.1);
                break;

            case 'toggle':
                // Softer toggle sound
                const oscTog = ctx.createOscillator();
                const gainTog = ctx.createGain();
                oscTog.connect(gainTog);
                gainTog.connect(ctx.destination);
                oscTog.type = 'sine';
                oscTog.frequency.setValueAtTime(400, now);
                gainTog.gain.setValueAtTime(0.03, now);
                gainTog.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                oscTog.start(now);
                oscTog.stop(now + 0.1);
                break;

            case 'predict':
                // Futuristic computation sound
                const oscPred = ctx.createOscillator();
                const gainPred = ctx.createGain();
                const filterPred = ctx.createBiquadFilter();
                
                oscPred.connect(filterPred);
                filterPred.connect(gainPred);
                gainPred.connect(ctx.destination);
                
                oscPred.type = 'sawtooth';
                filterPred.type = 'lowpass';
                
                oscPred.frequency.setValueAtTime(200, now);
                oscPred.frequency.linearRampToValueAtTime(800, now + 0.15);
                filterPred.frequency.setValueAtTime(500, now);
                filterPred.frequency.linearRampToValueAtTime(2000, now + 0.15);
                
                gainPred.gain.setValueAtTime(0.05, now);
                gainPred.gain.linearRampToValueAtTime(0, now + 0.15);
                
                oscPred.start(now);
                oscPred.stop(now + 0.2);
                break;

            case 'success':
                // Elegant chord
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
                notes.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.setValueAtTime(freq, now + (i * 0.03));
                    g.gain.setValueAtTime(0, now + (i * 0.03));
                    g.gain.linearRampToValueAtTime(0.05, now + (i * 0.03) + 0.05);
                    g.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.03) + 0.6);
                    o.start(now + (i * 0.03));
                    o.stop(now + (i * 0.03) + 0.7);
                });
                break;
                
            case 'hover':
                // Very subtle high-tech tick
                const oscHov = ctx.createOscillator();
                const gainHov = ctx.createGain();
                oscHov.connect(gainHov);
                gainHov.connect(ctx.destination);
                oscHov.type = 'sine';
                oscHov.frequency.setValueAtTime(2000, now);
                gainHov.gain.setValueAtTime(0.005, now);
                gainHov.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
                oscHov.start(now);
                oscHov.stop(now + 0.02);
                break;

            case 'plane-start':
                if (planeOscillator) {
                    try { planeOscillator.stop(); } catch(e){}
                }
                planeOscillator = ctx.createOscillator();
                planeGain = ctx.createGain();
                const planeFilter = ctx.createBiquadFilter();
                
                planeOscillator.connect(planeFilter);
                planeFilter.connect(planeGain);
                planeGain.connect(ctx.destination);
                
                planeOscillator.type = 'sawtooth';
                planeFilter.type = 'lowpass';
                
                planeOscillator.frequency.setValueAtTime(100, now);
                planeOscillator.frequency.linearRampToValueAtTime(800, now + 5); 
                planeFilter.frequency.setValueAtTime(400, now);
                planeFilter.frequency.linearRampToValueAtTime(2000, now + 5);
                
                planeGain.gain.setValueAtTime(0, now);
                planeGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
                
                planeOscillator.start(now);
                break;

            case 'crash':
                if (planeOscillator && planeGain) {
                    planeOscillator.stop(now);
                    planeOscillator = null;
                }
                
                // Deep impact sound
                const bufSize = ctx.sampleRate * 1.0; 
                const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                
                const noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'lowpass';
                noiseFilter.frequency.setValueAtTime(1000, now);
                noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
                
                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.15, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                
                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start(now);
                break;
        }
    } catch (e) {
        console.warn("Audio error", e);
    }
}
