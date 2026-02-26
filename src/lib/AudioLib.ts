import { dlopen, FFIType, ptr, suffix } from "bun:ffi";
import { existsSync } from "fs";
import { dirname, join } from "path";
import ConvertTOMK_Object from "./BaseLibConverter";
import { toNative } from "./Utils";

const isCompiled = Bun.main === process.execPath;

// Determine the correct library extension based on the platform
const devPath = join(
  import.meta.dir,
  "..",
  "..",
  "lib",
  "bass",
  `bass.${suffix}`,
);
const buildPath = join(
  dirname(process.execPath),
  "lib",
  "bass",
  `bass.${suffix}`,
);

// If compiled, prefer the library bundled with the executable
const libPath = isCompiled
  ? buildPath
  : existsSync(devPath)
    ? devPath
    : buildPath;

if (!existsSync(libPath)) {
  console.error(`\n❌ Native Library Error: Could not find bass.${suffix}`);
  console.error(`   Mode: ${isCompiled ? "Compiled" : "Development"}`);
  console.error(`   Searched Path: ${libPath}`);
  console.error(
    `   Please ensure the 'lib' folder exists next to the ${isCompiled ? "executable" : "source folder"}.\n`,
  );
}

// BASS Constants
const BASS_ATTRIB_FREQ = 1;
const BASS_ATTRIB_VOL = 2;
const BASS_SAMPLE_LOOP = 4;

// Load the BASS library using Bun FFI
const bass = dlopen(libPath, {
  BASS_Init: {
    args: [FFIType.i32, FFIType.u32, FFIType.u32, FFIType.ptr, FFIType.ptr],
    returns: FFIType.i32,
  },
  BASS_StreamCreateFile: {
    args: [FFIType.i32, FFIType.ptr, FFIType.u64, FFIType.u64, FFIType.u32],
    returns: FFIType.u32,
  },
  BASS_ChannelPlay: {
    args: [FFIType.u32, FFIType.i32],
    returns: FFIType.i32,
  },
  BASS_ChannelPause: {
    // <--- Add this
    args: [FFIType.u32],
    returns: FFIType.i32,
  },
  BASS_ChannelStop: {
    args: [FFIType.u32],
    returns: FFIType.i32,
  },
  BASS_ChannelSetAttribute: {
    args: [FFIType.u32, FFIType.u32, FFIType.f32],
    returns: FFIType.i32,
  },
  BASS_ChannelGetAttribute: {
    args: [FFIType.u32, FFIType.u32, FFIType.ptr],
    returns: FFIType.i32,
  },
  BASS_ChannelFlags: {
    args: [FFIType.u32, FFIType.u32, FFIType.u32],
    returns: FFIType.u32,
  },
});

// Initialize BASS on default device (-1), 44100Hz
const initResult = bass.symbols.BASS_Init(-1, 44100, 0, null, null);
if (initResult === 0) {
  // If init fails, we log it but don't throw immediately as it might be already initialized
  console.warn(
    "BASS_Init returned 0. Could be already initialized or audio device error.",
  );
}

export interface PlayOptions {
  volume?: number; // 0.0 - 1.0
  loop?: boolean;
  pitch?: number;
}

class AudioL {
  // Store original frequencies so dynamic pitch changes don't compound
  private originalFreqs = new Map<number, number>();

  load(path: string) {
    const pathBuffer = Buffer.from(path + "\0", "utf-8");
    // mem=0, file=pathBuffer, offset=0, length=0, flags=0
    const handle = bass.symbols.BASS_StreamCreateFile(
      0,
      ptr(pathBuffer),
      0n,
      0n,
      0,
    );

    if (handle === 0) {
      throw new Error(`Failed to load audio stream from path: ${path}`);
    }
    // Save the original frequency immediately after loading
    const freqPtr = new Float32Array(1);
    const success = bass.symbols.BASS_ChannelGetAttribute(
      handle,
      BASS_ATTRIB_FREQ,
      ptr(freqPtr),
    );
    this.originalFreqs.set(handle, success && freqPtr[0] ? freqPtr[0] : 44100);

    return handle as number;
  }

  /**
   * Plays the loaded audio by its ID
   */
  play(audioId: number, options: PlayOptions = {}) {
    // Apply options first using our new method
    this.setOptions(audioId, options);

    // Play the channel (restart=1 to restart if already playing)
    bass.symbols.BASS_ChannelPlay(audioId, 1);
  }

  pause(audioId: number) {
    const result = bass.symbols.BASS_ChannelPause(audioId);
    return result !== 0; // Returns true if successful
  }

  /**
   * Resumes a paused channel without restarting from the beginning.
   */
  resume(audioId: number) {
    // restart = 0 means continue from current position
    const result = bass.symbols.BASS_ChannelPlay(audioId, 0);
    return result !== 0;
  }

  /**
   * Dynamically change options while the audio is playing (or before)
   */
  setOptions(audioId: number, _options: any = {}) {
    // Set volume
    const options = toNative(_options) as PlayOptions;

    if (options.volume != null) {
      bass.symbols.BASS_ChannelSetAttribute(
        audioId,
        BASS_ATTRIB_VOL,
        options.volume,
      );
    }

    // Set looping flag
    if (options.loop != null) {
      bass.symbols.BASS_ChannelFlags(
        audioId,
        options.loop ? BASS_SAMPLE_LOOP : 0,
        BASS_SAMPLE_LOOP,
      );
    }

    // Set pitch based on the ORIGINAL frequency
    if (options.pitch != null) {
      const baseFreq = this.originalFreqs.get(audioId) || 44100;
      bass.symbols.BASS_ChannelSetAttribute(
        audioId,
        BASS_ATTRIB_FREQ,
        baseFreq * options.pitch,
      );
    }
  }

  /**
   * Stops the playing audio by its ID
   */
  stop(audioId: number) {
    bass.symbols.BASS_ChannelStop(audioId);
  }
}

export const AudioLib = ConvertTOMK_Object(new AudioL());
